/**
 * Service d'extraction de données structurées depuis les sections OCR classifiées
 * Transforme les sections en données CV prêtes à l'importation
 */
import { OCRSection, PersonalInfo, Experience, Education, Skills, StructuredCVData } from './OCRClassificationService';

export interface ExtractionResult {
  data: StructuredCVData;
  confidence: number;
  issues: Array<{
    field: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export class OCRDataExtractor {
  private static readonly EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  private static readonly PHONE_REGEX = /\b(?:\+?33|0)[1-9](?:[\s.-]?\d{2}){4}\b/;
  private static readonly DATE_PATTERNS = [
    /\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})\b/i,
    /\b(\d{4})\s*-\s*(\d{4})\b/,
    /\b(\d{4})\s*\/\s*(\d{4})\b/,
    /\b\d{2}\/\d{4}\b/g,
    /\b\d{4}\b/g
  ];

  /**
   * Extrait les données structurées depuis les sections classifiées
   */
  static async extractStructuredData(sections: OCRSection[]): Promise<ExtractionResult> {
    const result: StructuredCVData = {
      personal: {},
      experience: [],
      education: [],
      skills: {
        technical: [],
        soft: [],
        languages: []
      }
    };

    let totalConfidence = 0;
    const issues: Array<{ field: string; issue: string; severity: 'low' | 'medium' | 'high' }> = [];

    // Traiter chaque section
    for (const section of sections) {
      try {
        switch (section.type) {
          case 'personal': {
            const personalResult = this.extractPersonalInfo([section]);
            result.personal = personalResult.data;
            totalConfidence += personalResult.confidence;
            issues.push(...personalResult.issues);
            break;
          }

          case 'experience': {
            const experienceResult = this.extractExperienceInfo(section);
            result.experience.push(experienceResult.data);
            totalConfidence += experienceResult.confidence;
            issues.push(...experienceResult.issues);
            break;
          }

          case 'education': {
            const educationResult = this.extractEducationInfo(section);
            result.education.push(educationResult.data);
            totalConfidence += educationResult.confidence;
            issues.push(...educationResult.issues);
            break;
          }

          case 'skills': {
            const skillsResult = this.extractSkillsInfo(section);
            result.skills = { ...result.skills, ...skillsResult.data };
            totalConfidence += skillsResult.confidence;
            issues.push(...skillsResult.issues);
            break;
          }

          case 'summary': {
            const summaryResult = this.extractSummaryInfo(section);
            result.summary = summaryResult.data;
            totalConfidence += summaryResult.confidence;
            issues.push(...summaryResult.issues);
            break;
          }

          case 'languages': {
            const languagesResult = this.extractLanguagesInfo(section);
            result.skills.languages = languagesResult.data;
            totalConfidence += languagesResult.confidence;
            issues.push(...languagesResult.issues);
            break;
          }

          case 'projects':
            // Les projets seront traités plus tard
            break;

          case 'certifications':
            // Les certifications seront traitées plus tard
            break;
        }
      } catch (error) {
        issues.push({
          field: section.type,
          issue: `Erreur d'extraction: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
          severity: 'high'
        });
      }
    }

    // Calculer la confiance moyenne
    const averageConfidence = sections.length > 0 ? totalConfidence / sections.length : 0;

    return {
      data: result,
      confidence: Math.min(averageConfidence, 1.0),
      issues
    };
  }

  /**
   * Extrait les informations personnelles
   */
  private static extractPersonalInfo(sections: OCRSection[]): { data: PersonalInfo; confidence: number; issues: Array<{ field: string; issue: string; severity: 'low' | 'medium' | 'high' }> } {
    const data: PersonalInfo = {};
    let confidence = 0;
    const issues: Array<{ field: string; issue: string; severity: 'low' | 'medium' | 'high' }> = [];

    const allLines = sections.flatMap(s => s.rawLines);

    for (const line of allLines) {
      // Email
      const emailMatch = line.match(this.EMAIL_REGEX);
      if (emailMatch && !data.email) {
        data.email = emailMatch[0];
        confidence += 0.3;
      }

      // Téléphone
      const phoneMatch = line.match(this.PHONE_REGEX);
      if (phoneMatch && !data.phone) {
        data.phone = phoneMatch[0];
        confidence += 0.3;
      }

      // LinkedIn
      if (line.toLowerCase().includes('linkedin') && !data.linkedin) {
        data.linkedin = line;
        confidence += 0.2;
      }

      // Site web
      if ((line.toLowerCase().includes('www.') || line.toLowerCase().includes('http')) && !data.website) {
        data.website = line;
        confidence += 0.2;
      }

      // Nom (ligne courte sans chiffres ni email)
      if (!data.name &&
          line.length > 2 &&
          line.length < 50 &&
          !line.includes('@') &&
          !/\d/.test(line) &&
          !line.toLowerCase().includes('rue') &&
          !line.toLowerCase().includes('avenue')) {
        data.name = line.trim();
        confidence += 0.4;
      }

      // Adresse (contient des mots-clés d'adresse)
      const addressKeywords = ['rue', 'avenue', 'boulevard', 'place', 'voie', 'chemin', 'impasse'];
      if (!data.address && addressKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        data.address = line.trim();
        confidence += 0.3;
      }

      // Date de naissance
      const birthdayKeywords = ['naissance', 'né le', 'née le', 'birth'];
      if (!data.birthday && birthdayKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        const dateMatch = this.extractDates(line)[0];
        if (dateMatch) {
          data.birthday = dateMatch;
          confidence += 0.3;
        }
      }
    }

    // Validation
    if (!data.name) {
      issues.push({
        field: 'personal.name',
        issue: 'Nom non détecté',
        severity: 'medium'
      });
    }

    if (!data.email) {
      issues.push({
        field: 'personal.email',
        issue: 'Email non détecté',
        severity: 'low'
      });
    }

    if (!data.phone) {
      issues.push({
        field: 'personal.phone',
        issue: 'Téléphone non détecté',
        severity: 'low'
      });
    }

    return {
      data,
      confidence: Math.min(confidence, 1.0),
      issues
    };
  }

  /**
   * Extrait les informations d'expérience professionnelle
   */
  private static extractExperienceInfo(section: OCRSection): { data: Experience; confidence: number; issues: Array<{ field: string; issue: string; severity: 'low' | 'medium' | 'high' }> } {
    const data: Experience = {
      company: '',
      position: '',
      period: '',
      description: '',
      achievements: [],
      technologies: []
    };

    let confidence = 0;
    const issues: Array<{ field: string; issue: string; severity: 'low' | 'medium' | 'high' }> = [];

    const lines = section.rawLines;
    const content = section.content;

    // Extraire les dates pour déterminer la période
    const dates = this.extractDates(content);
    if (dates.length > 0) {
      data.period = dates.join(' - ');
      confidence += 0.3;
    }

    // Chercher l'entreprise et le poste
    let foundCompany = false;
    let foundPosition = false;

    for (const line of lines) {
      // Poste/position (généralement avant l'entreprise)
      if (!foundPosition) {
        const positionIndicators = ['chef', 'directeur', 'manager', 'développeur', 'ingénieur', 'consultant', 'chargé', 'responsable'];
        if (positionIndicators.some(indicator => line.toLowerCase().includes(indicator))) {
          data.position = line.trim();
          foundPosition = true;
          confidence += 0.4;
          continue;
        }
      }

      // Entreprise (après la mention de poste ou avant les dates)
      if (!foundCompany) {
        const companyIndicators = ['à', 'chez', 'dans', 'pour', 'groupe', 'sa', 'sas', 'sarl', 'ei'];
        const dateBefore = dates.find(d => line.includes(d));
        if (companyIndicators.some(indicator => line.toLowerCase().includes(indicator)) || dateBefore) {
          data.company = line.trim();
          foundCompany = true;
          confidence += 0.3;
          continue;
        }
      }

      // Description (lignes avec bullet points ou indentation)
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || /^\s{2,}/.test(line)) {
        const description = line.replace(/^[\s•-]\s*/, '').trim();
        data.description += description + '\n';
        confidence += 0.1;

        // Détecter les technologies utilisées
        const techKeywords = ['javascript', 'python', 'java', 'php', 'c#', 'c++', 'react', 'vue', 'angular', 'node', 'sql', 'mysql', 'postgresql', 'mongodb', 'git', 'docker', 'aws', 'azure'];
        techKeywords.forEach(tech => {
          if (description.toLowerCase().includes(tech) && !data.technologies!.includes(tech)) {
            data.technologies!.push(tech);
          }
        });
      }
    }

    // Si on n'a pas trouvé de poste spécifique, utiliser le contenu entier comme description
    if (!data.position && content.trim()) {
      data.description = content.trim();
      confidence += 0.2;
    }

    // Validation
    if (!data.position) {
      issues.push({
        field: 'experience.position',
        issue: 'Poste non détecté clairement',
        severity: 'medium'
      });
    }

    if (!data.company) {
      issues.push({
        field: 'experience.company',
        issue: 'Entreprise non détectée',
        severity: 'low'
      });
    }

    if (!data.period) {
      issues.push({
        field: 'experience.period',
        issue: 'Période non détectée',
        severity: 'low'
      });
    }

    return {
      data,
      confidence: Math.min(confidence, 1.0),
      issues
    };
  }

  /**
   * Extrait les informations d'éducation
   */
  private static extractEducationInfo(section: OCRSection): { data: Education; confidence: number; issues: Array<{ field: string; issue: string; severity: 'low' | 'medium' | 'high' }> } {
    const data: Education = {
      institution: '',
      degree: '',
      period: '',
      description: ''
    };

    let confidence = 0;
    const issues: Array<{ field: string; issue: string; severity: 'low' | 'medium' | 'high' }> = [];

    const lines = section.rawLines;
    const content = section.content;

    // Extraire les dates pour déterminer la période
    const dates = this.extractDates(content);
    if (dates.length > 0) {
      data.period = dates.join(' - ');
      confidence += 0.3;
    }

    // Détecter le diplôme/formation
    const degreeKeywords = ['master', 'licence', 'baccalauréat', 'bac', 'bts', 'dut', 'mba', 'doctorat', 'ingénieur', 'développement', 'informatique', 'commerce', 'droit', 'médecine'];
    for (const line of lines) {
      for (const keyword of degreeKeywords) {
        if (line.toLowerCase().includes(keyword.toLowerCase())) {
          data.degree = line.trim();
          confidence += 0.4;
          break;
        }
      }
      if (data.degree) break;
    }

    // Détecter l'institution
    const institutionKeywords = ['université', 'école', 'institut', 'faculté', 'lycée', 'collège'];
    for (const line of lines) {
      for (const keyword of institutionKeywords) {
        if (line.toLowerCase().includes(keyword.toLowerCase())) {
          data.institution = line.trim();
          confidence += 0.3;
          break;
        }
      }
      if (data.institution) break;
    }

    // Description (contenu restant)
    if (content.trim()) {
      data.description = content.trim();
      confidence += 0.2;
    }

    // Validation
    if (!data.degree) {
      issues.push({
        field: 'education.degree',
        issue: 'Diplôme non détecté',
        severity: 'medium'
      });
    }

    if (!data.institution) {
      issues.push({
        field: 'education.institution',
        issue: 'Institution non détectée',
        severity: 'low'
      });
    }

    return {
      data,
      confidence: Math.min(confidence, 1.0),
      issues
    };
  }

  /**
   * Extrait les compétences
   */
  private static extractSkillsInfo(section: OCRSection): { data: Partial<Skills>; confidence: number; issues: Array<{ field: string; issue: string; severity: 'low' | 'medium' | 'high' }> } {
    const data: Skills = {
      technical: [],
      soft: [],
      languages: []
    };

    let confidence = 0;
    const issues: Array<{ field: string; issue: string; severity: 'low' | 'medium' | 'high' }> = [];

    const content = section.content.toLowerCase();

    // Compétences techniques
    const techSkills = [
      'javascript', 'python', 'java', 'php', 'c#', 'c++', 'ruby', 'go', 'rust',
      'react', 'vue', 'angular', 'node', 'express', 'django', 'flask', 'spring',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
      'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins',
      'html', 'css', 'sass', 'tailwind', 'bootstrap', 'typescript',
      'linux', 'windows', 'macos', 'agile', 'scrum', 'kanban'
    ];

    techSkills.forEach(skill => {
      if (content.includes(skill)) {
        data.technical.push(skill.charAt(0).toUpperCase() + skill.slice(1));
        confidence += 0.05;
      }
    });

    // Compétences soft (personnelles)
    const softSkills = [
      'communication', 'travail en équipe', 'leadership', 'créativité',
      'résolution de problèmes', 'adaptabilité', 'management', 'organisation',
      'autonomie', 'ponctualité', 'persévérance', 'empathie'
    ];

    softSkills.forEach(skill => {
      if (content.includes(skill)) {
        data.soft.push(skill.charAt(0).toUpperCase() + skill.slice(1));
        confidence += 0.05;
      }
    });

    // Si aucune compétence n'est extraite, utiliser le contenu brut
    if (data.technical.length === 0 && data.soft.length === 0) {
      // Diviser par ligne et virgule
      const skillsText = section.content
        .split('\n')
        .flatMap(line => line.split(','))
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      data.technical = skillsText;
      confidence += 0.2;
    }

    if (data.technical.length === 0) {
      issues.push({
        field: 'skills.technical',
        issue: 'Compétences techniques non détectées',
        severity: 'low'
      });
    }

    return {
      data,
      confidence: Math.min(confidence, 1.0),
      issues
    };
  }

  /**
   * Extrait le résumé professionnel
   */
  private static extractSummaryInfo(section: OCRSection): { data: string; confidence: number; issues: Array<{ field: string; issue: string; severity: 'low' | 'medium' | 'high' }> } {
    return {
      data: section.content.trim(),
      confidence: 0.8, // Les résumés sont généralement bien préservés
      issues: []
    };
  }

  /**
   * Extrait les langues
   */
  private static extractLanguagesInfo(section: OCRSection): { data: string[]; confidence: number; issues: Array<{ field: string; issue: string; severity: 'low' | 'medium' | 'high' }> } {
    const languages = ['français', 'french', 'anglais', 'english', 'espagnol', 'spanish', 'allemand', 'german', 'italien', 'italian', 'chinois', 'chinese', 'japonais', 'japanese', 'russe', 'russian', 'arabe', 'arabic', 'portugais', 'portuguese'];
    const data: string[] = [];
    let confidence = 0;

    const content = section.content.toLowerCase();

    languages.forEach(language => {
      if (content.includes(language)) {
        data.push(language.charAt(0).toUpperCase() + language.slice(1));
        confidence += 0.1;
      }
    });

    // Si aucune langue spécifique n'est détectée, utiliser le contenu brut
    if (data.length === 0) {
      const languagesText = section.content
        .split('\n')
        .flatMap(line => line.split(','))
        .map(lang => lang.trim())
        .filter(lang => lang.length > 0);

      data.push(...languagesText);
      confidence += 0.2;
    }

    return {
      data,
      confidence: Math.min(confidence, 1.0),
      issues: data.length === 0 ? [{
        field: 'skills.languages',
        issue: 'Langues non détectées',
        severity: 'low'
      }] : []
    };
  }

  /**
   * Extrait les dates d'un texte
   */
  private static extractDates(text: string): string[] {
    const dates: string[] = [];

    for (const pattern of this.DATE_PATTERNS) {
      const matches = text.match(pattern);
      if (matches) {
        dates.push(...matches);
      }
    }

    // Supprimer les doublons
    return [...new Set(dates)].slice(0, 2); // Maximum 2 dates par section
  }
}
