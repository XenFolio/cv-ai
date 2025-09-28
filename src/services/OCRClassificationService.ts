/**
 * Service de classification intelligent pour données OCR extraites
 * Permet de trier et organiser automatiquement le contenu brût d'un CV
 */
export interface OCRSection {
  id: string;
  type: 'personal' | 'experience' | 'education' | 'skills' | 'summary' | 'projects' | 'languages' | 'certifications';
  title: string;
  content: string;
  confidence: number;
  rawLines: string[];
  position: number;
}

export interface OCRClassificationResult {
  sections: OCRSection[];
  confidence: number;
  warnings: string[];
  metadata: {
    totalLines: number;
    processingTime: number;
    analysisVersion: string;
  };
}

export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  website?: string;
  birthday?: string;
}

export interface Experience {
  company: string;
  position: string;
  period: string;
  description: string;
  technologies?: string[];
  achievements?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  description: string;
  location?: string;
}

export interface Skills {
  technical: string[];
  soft: string[];
  languages: string[];
}

export interface StructuredCVData {
  personal: PersonalInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    period?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
}

export class OCRClassificationService {
  private static readonly SECTION_KEYWORDS = {
    personal: ['nom', 'nom/prénom', 'coordonnées', 'contact', 'adresse'],
    experience: [
      'expérience', 'experience', 'expériences', 'experiences', 'emploi',
      'professionnel', 'professionnelle', 'carrière', 'career', 'job',
      'poste', 'position', 'fonction'
    ],
    education: [
      'formation', 'éducation', 'education', 'diplôme', 'diplomes',
      'études', 'etudes', 'université', 'universite', 'école', 'ecole',
      'baccalauréat', 'licence', 'master', 'doctorat'
    ],
    skills: [
      'compétences', 'competences', 'skills', 'expertise', 'connaissances',
      'technologies', 'logiciels', 'outils', 'savoir', 'savoir-faire'
    ],
    summary: [
      'profil', 'profile', 'résumé', 'resume', 'à propos', 'about',
      'objectifs', 'objectives', 'motivation'
    ],
    projects: ['projets', 'project', 'réalisations', 'realisations'],
    languages: ['langues', 'languages', 'langue'],
    certifications: ['certifications', 'certification', 'formations']
  };

  private static readonly MONTHS_FR = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  /**
   * Classifie automatiquement le texte OCR brut en sections structurées
   */
  static async classifyOCRText(ocrText: string): Promise<OCRClassificationResult> {
    const startTime = Date.now();

    // Étape 1 : Nettoyer et normaliser le texte
    const cleanedText = this.cleanOCRText(ocrText);
    const lines = cleanedText.split('\n').filter(line => line.trim().length > 0);

    // Étape 2 : Analyser chaque ligne et détecter les sections
    const sections = this.analyzeSections(lines);

    // Étape 3 : Valider et fusionner les sections similaires
    const mergedSections = this.mergeSections(sections);

    // Étape 4 : Calculer la confiance globale
    const confidence = this.calculateOverallConfidence(mergedSections);

    const result: OCRClassificationResult = {
      sections: mergedSections,
      confidence,
      warnings: this.generateWarnings(mergedSections, lines.length),
      metadata: {
        totalLines: lines.length,
        processingTime: Date.now() - startTime,
        analysisVersion: '1.0.0'
      }
    };

    return result;
  }

  /**
   * Nettoie le texte OCR brut pour améliorer la classification
   */
  private static cleanOCRText(text: string): string {
    return text
      // Normaliser les espaces et caractères spéciaux
      .replace(/\s+/g, ' ')
      .replace(/[\u2014\u2013\u2012]/g, '-') // Tirets longs en tiret normal
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // Guillemets différents en guillemets normaux
      .replace(/[\u2019\u2018]/g, "'") // Apostrophes différentes en apostrophe normale

      // Supprimer les artefacts OCR courants
      .replace(/[^\w\s\-@./:,;()À-žà-ÿ€£$%+\-=]/g, '') // Supprimer caractères étranges

      // Normaliser les nouvelles lignes
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')

      // Nettoyer les espaces autour de la ponctuation
      .replace(/\s*([,.!?;:])\s*/g, '$1 ')
      .replace(/\s*\n\s*/g, '\n')

      // Supprimer les lignes vides répétées
      .replace(/\n{3,}/g, '\n\n')

      .trim();
  }

  /**
   * Analyse les sections du texte ligne par ligne
   */
  private static analyzeSections(lines: string[]): OCRSection[] {
    const sections: OCRSection[] = [];
    let currentSection: Partial<OCRSection> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const upperLine = line.toUpperCase();

      // Détecter le début d'une nouvelle section
      const sectionType = this.detectSectionType(line, upperLine, lines, i);

      if (sectionType) {
        // Sauvegarder la section précédente si elle existe
        if (currentSection) {
          sections.push(this.finalizeSection(currentSection as OCRSection));
        }

        // Créer la nouvelle section
        currentSection = {
          id: `section-${sections.length + 1}`,
          type: sectionType,
          title: line,
          content: '',
          confidence: this.calculateSectionConfidence(line, sectionType),
          rawLines: [line],
          position: i
        };

        continue;
      }

      // Ajouter la ligne à la section courante
      if (currentSection) {
        currentSection.rawLines!.push(line);
        currentSection.content! += line + ' ';
      } else {
        // Créer une section par défaut (personnel) pour les lignes sans section
        currentSection = {
          id: `section-default`,
          type: 'personal',
          title: '',
          content: line + ' ',
          confidence: 0.5,
          rawLines: [line],
          position: i
        };
      }
    }

    // Sauvegarder la dernière section
    if (currentSection) {
      sections.push(this.finalizeSection(currentSection as OCRSection));
    }

    return sections;
  }

  /**
   * Détecte le type de section d'une ligne
   */
  private static detectSectionType(line: string, upperLine: string, contextLines: string[], currentIndex: number): OCRSection['type'] | null {
    const trimmedLine = line.trim();

    // Vérifier si la ligne ressemble à un titre de section
    for (const [sectionType, keywords] of Object.entries(this.SECTION_KEYWORDS)) {
      if (keywords.some(keyword =>
        upperLine.includes(keyword.toUpperCase()) ||
        trimmedLine.toLowerCase().includes(keyword.toLowerCase())
      )) {
        return sectionType as OCRSection['type'];
      }
    }

    // Vérifier les patterns contextuels
    if (this.isBulletPoint(trimmedLine)) {
      return this.inferBulletPointType(contextLines, currentIndex);
    }

    // Vérifier les dates pour expérience/éducation
    if (this.containsDate(trimmedLine)) {
      return this.inferDateContext(contextLines, currentIndex);
    }

    return null;
  }

  /**
   * Vérifie si une ligne commence par un bullet point
   */
  private static isBulletPoint(line: string): boolean {
    return /^[\s]*[-•◦▪▸▶•*]\s/.test(line) ||
           /^[\s]*\d+[.)]\s/.test(line) ||
           /^[\s]*[a-zA-Z][.)]\s/.test(line);
  }

  /**
   * Infère le type de bullet point selon le contexte
   */
  private static inferBulletPointType(contextLines: string[], currentIndex: number): OCRSection['type'] | null {
    const previousLines = contextLines.slice(Math.max(0, currentIndex - 3), currentIndex);

    for (const prevLine of previousLines.reverse()) {
      for (const [sectionType, keywords] of Object.entries(this.SECTION_KEYWORDS)) {
        if (keywords.some(keyword => prevLine.toUpperCase().includes(keyword.toUpperCase()))) {
          return sectionType as OCRSection['type'];
        }
      }
    }

    return null;
  }

  /**
   * Vérifie si une ligne contient des dates
   */
  private static containsDate(line: string): boolean {
    const years = new RegExp(`\\b(19|20)\\d{2}\\b`, 'i');
    const monthsPattern = new RegExp(`\\b(${this.MONTHS_FR.join('|')})\\b`, 'i');

    return years.test(line) || monthsPattern.test(line) ||
           /\b\d{2}\/\d{2}\/\d{4}\b/.test(line) ||
           /\b\d{4}-\d{2}-\d{2}\b/.test(line);
  }

  /**
   * Infère le contexte des dates dans les lignes environnantes
   */
  private static inferDateContext(contextLines: string[], currentIndex: number): OCRSection['type'] | null {
    const nearbyLines = contextLines.slice(Math.max(0, currentIndex - 2), Math.min(contextLines.length, currentIndex + 3));
    const nearbyText = nearbyLines.join(' ').toLowerCase();

    // Vérifier proximité avec mots-clés d'expérience
    const experienceWords = ['entreprise', 'job', 'poste', 'position', 'fonction', 'société', 'compagnie'];
    if (experienceWords.some(word => nearbyText.includes(word))) {
      return 'experience';
    }

    // Vérifier proximité avec mots-clés d'éducation
    const educationWords = ['université', 'école', 'diplôme', 'formation'];
    if (educationWords.some(word => nearbyText.includes(word))) {
      return 'education';
    }

    return null;
  }

  /**
   * Calcule la confiance d'identification d'une section
   */
  private static calculateSectionConfidence(line: string, sectionType: OCRSection['type']): number {
    let confidence = 0.5;

    // Vérifier la présence directe de mots-clés
    const keywords = this.SECTION_KEYWORDS[sectionType];
    const matchedKeywords = keywords.filter(keyword =>
      line.toLowerCase().includes(keyword.toLowerCase())
    );

    confidence += matchedKeywords.length * 0.2;

    // Bonus pour les sections avec des indicateurs structurels
    if (line.match(/[A-ZÉ]{3,}/)) confidence += 0.1; // Mots en majuscules (titres)
    if (line === line.toUpperCase()) confidence += 0.2; // Ligne entièrement en majuscules
    if (line.includes(':')) confidence += 0.1; // Présence de deux-points

    return Math.min(confidence, 1.0);
  }

  /**
   * Fusionne les sections similaires ou mal séparées
   */
  private static mergeSections(sections: OCRSection[]): OCRSection[] {
    const merged: OCRSection[] = [];
    const typeGroups = new Map<OCRSection['type'], OCRSection[]>();

    // Grouper par type
    sections.forEach(section => {
      if (!typeGroups.has(section.type)) {
        typeGroups.set(section.type, []);
      }
      typeGroups.get(section.type)!.push(section);
    });

    // Pour chaque type, décider de fusionner ou garder séparé
    typeGroups.forEach((sectionsOfType, type) => {
      if (sectionsOfType.length === 1) {
        merged.push(sectionsOfType[0]);
      } else if (type === 'personal') {
        // Fusionner toutes les sections personnelles
        const mergedPersonal = this.mergePersonalSections(sectionsOfType);
        merged.push(mergedPersonal);
      } else {
        // Vérifier s'il faut fusionner les sections consécutives
        const mergedGroup = this.tryMergeConsecutive(sectionsOfType);
        merged.push(...mergedGroup);
      }
    });

    // Trier par position dans le document original
    return merged.sort((a, b) => a.position - b.position);
  }

  /**
   * Fusionne les sections personnelles
   */
  private static mergePersonalSections(sections: OCRSection[]): OCRSection {
    const merged = sections[0];

    for (let i = 1; i < sections.length; i++) {
      merged.content += '\n' + sections[i].content;
      merged.confidence = (merged.confidence + sections[i].confidence) / 2;
      merged.rawLines.push(...sections[i].rawLines);
    }

    return merged;
  }

  /**
   * Essaie de fusionner les sections consécutives du même type
   */
  private static tryMergeConsecutive(sections: OCRSection[]): OCRSection[] {
    if (sections.length <= 1) return sections;

    const result: OCRSection[] = [sections[0]];

    for (let i = 1; i < sections.length; i++) {
      const lastSection = result[result.length - 1];
      const currentSection = sections[i];

      // Fusionner si elles sont consécutives et similaires
      if (currentSection.position - lastSection.position < 10 &&
          this.areSimilarSections(lastSection, currentSection)) {
        this.mergeTwoSections(lastSection, currentSection);
      } else {
        result.push(currentSection);
      }
    }

    return result;
  }

  /**
   * Vérifie si deux sections sont similaires et peuvent être fusionnées
   */
  private static areSimilarSections(section1: OCRSection, section2: OCRSection): boolean {
    // Même type
    if (section1.type !== section2.type) return false;

    // Distance raisonnable entre sections
    const distance = section2.position - section1.position;
    if (distance > 20) return false;

    // Similarité de contenu (keywords communs)
    const words1 = section1.content.toLowerCase().split(' ').filter(w => w.length > 3);
    const words2 = section2.content.toLowerCase().split(' ').filter(w => w.length > 3);

    const commonWords = words1.filter(word => words2.includes(word));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);

    return similarity > 0.3;
  }

  /**
   * Fusionne deux sections spécifiques
   */
  private static mergeTwoSections(target: OCRSection, source: OCRSection): void {
    target.content += '\n' + source.content;
    target.confidence = (target.confidence + source.confidence) / 2;
    target.rawLines.push(...source.rawLines);
  }

  /**
   * Finalise une section (nettoie et ajuste le contenu)
   */
  private static finalizeSection(section: OCRSection): OCRSection {
    return {
      ...section,
      content: section.content.trim(),
      rawLines: section.rawLines.filter(line => line.trim().length > 0)
    };
  }

  /**
   * Calcule la confiance globale du résultat
   */
  private static calculateOverallConfidence(sections: OCRSection[]): number {
    if (sections.length === 0) return 0;

    const avgConfidence = sections.reduce((sum, section) => sum + section.confidence, 0) / sections.length;
    const coverage = Math.min(sections.reduce((sum, section) => sum + section.rawLines.length, 0) / 50, 1);

    return (avgConfidence * 0.7) + (coverage * 0.3);
  }

  /**
   * Génère des avertissements basés sur la qualité du résultat
   */
  private static generateWarnings(sections: OCRSection[], totalLines: number): string[] {
    const warnings: string[] = [];

    if (sections.length === 0) {
      warnings.push('Aucune section détectée dans le document');
    }

    const lowConfidenceSections = sections.filter(s => s.confidence < 0.3);
    if (lowConfidenceSections.length > 0) {
      warnings.push(`${lowConfidenceSections.length} section(s) avec faible confiance de classification`);
    }

    const totalClassifiedLines = sections.reduce((sum, s) => sum + s.rawLines.length, 0);
    const uncategorizedRatio = (totalLines - totalClassifiedLines) / totalLines;

    if (uncategorizedRatio > 0.5) {
      warnings.push('Plus de 50% du contenu n\'a pas été catégorisé');
    }

    return warnings;
  }
}
