import { Document, Packer, Paragraph, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import type { Template } from '../templates';
import type { CVContent, CVExperience, CVLanguage, CVEducation } from '../types';
import type { CVData } from '../../../hooks/useCVLibrary';
import { CVAnalysisResponse } from '../../../hooks/useOpenAI';

// Function to get skills based on category
const getSkillsByCategory = (category: string): string[] => {
  switch (category) {
    case 'Développement': return ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'SQL', 'Git', 'Docker'];
    case 'Marketing': return ['Google Analytics', 'SEO/SEM', 'Social Media', 'Content Marketing', 'Email Marketing', 'CRM'];
    case 'Finance': return ['Excel', 'Modélisation financière', 'Analyse de risque', 'Bloomberg', 'SAP'];
    default: return ['Communication', 'Travail d\'équipe', 'Résolution de problèmes', 'Adaptabilité'];
  }
};

// Function to calculate ATS score
const calculateATSScore = (template: Template, cvData: CVData): number => {
  let score = template.atsScore; // Score de base du template

  // Bonifications basées sur le contenu
  if (cvData.name && cvData.name !== '[VOTRE NOM]') score += 2;
  if (cvData.contact && !cvData.contact.includes('[')) score += 3;
  if (cvData.profileContent && !cvData.profileContent.includes('Résumé de votre profil')) score += 3;
  if (cvData.experiences.length > 0 && !cvData.experiences[0].content.includes('[Poste]')) score += 5;
  if (cvData.skills.length >= 3) score += 3;
  if (cvData.languages.length >= 1) score += 2;
  if (cvData.educations.length > 0 && !cvData.educations[0].degree.includes('[Diplôme]')) score += 2;

  // Plafonner le score à 98
  return Math.min(score, 98);
};

// Function to generate quick ATS analysis
export const generateQuickATSAnalysis = (template: Template, cvData: CVData): CVAnalysisResponse => {
  const atsScore = calculateATSScore(template, cvData);

  // Generate section scores
  const sections = {
    atsOptimization: Math.min(95, atsScore + Math.random() * 10 - 5),
    keywordMatch: Math.min(90, 70 + (cvData.skills.length / 5) * 20),
    structure: template.atsScore,
    content: Math.min(85, atsScore + Math.random() * 15 - 5)
  };

  // Generate keywords based on template category and skills
  const commonKeywords = {
    'Développement': ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'SQL', 'Git', 'Docker', 'API', 'Full Stack'],
    'Marketing': ['Marketing Digital', 'SEO', 'Social Media', 'Content Marketing', 'Analytics', 'CRM', 'Strategy', 'Branding'],
    'Finance': ['Finance', 'Excel', 'Modélisation', 'Analyse', 'Budget', 'Rapport', 'SAP', 'Audit', 'Prévision'],
    'Design': ['Design', 'UI/UX', 'Photoshop', 'Figma', 'Adobe', 'Créatif', 'Prototype', 'Interface'],
    'Management': ['Management', 'Leadership', 'Strategy', 'Team', 'Project', 'Agile', 'Communication', 'Planning']
  };

  const categoryKeywords = commonKeywords[template.category as keyof typeof commonKeywords] || commonKeywords['Développement'];
  const skillKeywords = cvData.skills.map(s => s.content.toLowerCase());
  const foundKeywords = categoryKeywords.filter(kw =>
    skillKeywords.some(skill => skill.includes(kw.toLowerCase()) || kw.toLowerCase().includes(skill))
  );
  const missingKeywords = categoryKeywords.filter(kw => !foundKeywords.includes(kw));

  // Generate recommendations based on score and content
  const recommendations = [];
  if (atsScore < 80) {
    recommendations.push('Optimisez les mots-clés spécifiques à votre secteur pour améliorer votre score ATS');
    recommendations.push('Ajoutez plus de détails quantifiables dans vos expériences professionnelles');
  }
  if (cvData.experiences.length < 2) {
    recommendations.push('Ajoutez plus d\'expériences professionnelles pour démontrer votre progression');
  }
  if (cvData.skills.length < 5) {
    recommendations.push('Développez votre section compétences avec plus de techniques et outils');
  }
  recommendations.push('Utilisez des verbes d\'action forts pour commencer chaque point d\'expérience');

  // Generate strengths and weaknesses
  const strengths = [
    cvData.name && !cvData.name.includes('[') ? 'Informations de contact complètes' : null,
    cvData.experiences.length > 0 ? 'Structure d\'expérience professionnelle claire' : null,
    cvData.skills.length >= 3 ? 'Bonne variété de compétences techniques' : null,
    sections.structure >= 80 ? 'Structure du CV optimisée pour les ATS' : null
  ].filter(Boolean);

  const weaknesses = [
    cvData.name?.includes('[') ? 'Informations personnelles incomplètes' : null,
    missingKeywords.length > 3 ? 'Mots-clés pertinents manquants' : null,
    cvData.experiences.length === 0 ? 'Aucune expérience professionnelle détaillée' : null,
    sections.content < 70 ? 'Contenu pourrait être plus détaillé' : null
  ].filter(Boolean);

  // Generate improvements
  const improvements = [
    {
      title: 'Optimisation des mots-clés',
      description: `Ajoutez les mots-clés manquants: ${missingKeywords.slice(0, 3).join(', ')}`,
      priority: missingKeywords.length > 3 ? 'high' as const : 'medium' as const
    },
    {
      title: 'Détail des expériences',
      description: 'Ajoutez des réalisations quantifiables et des résultats chiffrés',
      priority: cvData.experiences.length < 2 ? 'high' as const : 'medium' as const
    },
    {
      title: 'Formatage ATS',
      description: 'Assurez-vous d\'utiliser un format standard sans colonnes complexes',
      priority: sections.atsOptimization < 80 ? 'medium' as const : 'low' as const
    }
  ];

  return {
    overallScore: Math.round(atsScore),
    sections,
    keywords: {
      found: foundKeywords,
      missing: missingKeywords,
      suggestions: categoryKeywords.slice(0, 5)
    },
    strengths,
    weaknesses,
    recommendations,
    improvements,
    atsOptimization: Math.round(sections.atsOptimization),
    keywordDensity: Math.round(sections.keywordMatch),
    formatScore: Math.round(sections.structure),
    readabilityScore: Math.round(sections.content),
    marketComparison: Math.round(atsScore),
    suggestions: recommendations
  };
};

// Function to calculate ATS score for letters
const calculateLetterATSScore = (template: Template, letterContent: string, formData: { [key: string]: string }): number => {
  let score = 75; // Score de base pour les lettres

  // Analyse du contenu
  if (!letterContent.includes('[') && !letterContent.includes('...')) score += 5;
  if (letterContent.length > 200) score += 3;
  if (letterContent.length > 500) score += 2;

  // Analyse des éléments du formulaire
  if (formData?.poste && formData.poste !== '') score += 3;
  if (formData?.entreprise && formData.entreprise !== '') score += 2;
  if (formData?.secteur && formData.secteur !== '') score += 2;
  if (formData?.experience && formData.experience !== '') score += 3;
  if (formData?.motivation && formData.motivation !== '') score += 3;
  if (formData?.competences && formData.competences !== '') score += 3;

  // Structure de la lettre
  if (letterContent.toLowerCase().includes('madame, monsieur,') ||
      letterContent.toLowerCase().includes('à l\'attention de')) score += 2;
  if (letterContent.includes('\n\n')) score += 2; // Paragraphes bien séparés
  if (letterContent.toLowerCase().includes('cordialement,') ||
      letterContent.toLowerCase().includes('sincères salutations,')) score += 2;

  // Mots-clés pertinents
  const letterKeywords = [
    'motivation', 'intérêt', 'enthousiasme', 'competences', 'expérience',
    'projet', 'développement', 'collaboration', 'résultats', 'objectifs'
  ];

  const keywordMatches = letterKeywords.filter(keyword =>
    letterContent.toLowerCase().includes(keyword.toLowerCase())
  );
  score += Math.min(keywordMatches.length * 2, 8);

  return Math.min(score, 98);
};

// Function to generate quick ATS analysis for letters
export const generateQuickLetterATSAnalysis = (template: Template, letterContent: string, formData: { [key: string]: string }): CVAnalysisResponse => {
  const atsScore = calculateLetterATSScore(template, letterContent, formData);

  // Generate section scores for letters
  const sections = {
    atsOptimization: Math.min(90, atsScore + Math.random() * 8 - 4),
    keywordMatch: Math.min(85, 65 + (letterContent.length / 100) * 10),
    structure: 80 + Math.random() * 15,
    content: Math.min(88, atsScore + Math.random() * 12 - 6)
  };

  // Keywords spécifiques aux lettres de motivation
  const letterKeywords = {
    'Marketing': ['Marketing Digital', 'Communication', 'Stratégie', 'Campagnes', 'SEO', 'Social Media', 'Analytics'],
    'Développement': ['Développement', 'Programmation', 'JavaScript', 'React', 'API', 'Base de données', 'Git'],
    'Finance': ['Finance', 'Analyse', 'Budget', 'Prévisions', 'Excel', 'Modélisation', 'Rapports'],
    'RH': ['Ressources Humaines', 'Recrutement', 'Formation', 'Gestion', 'Politiques', 'Performance'],
    'Commercial': ['Ventes', 'Négociation', 'Client', 'Prospection', 'Chiffre d\'affaires', 'CRM', 'Objectifs']
  };

  const sector = formData?.secteur || 'Développement';
  const sectorKeywords = letterKeywords[sector as keyof typeof letterKeywords] || letterKeywords['Développement'];

  const contentLower = letterContent.toLowerCase();
  const foundKeywords = sectorKeywords.filter(kw =>
    contentLower.includes(kw.toLowerCase())
  );
  const missingKeywords = sectorKeywords.filter(kw =>
    !contentLower.includes(kw.toLowerCase())
  );

  // Generate strengths and weaknesses for letters
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];
  const improvements = [];

  if (atsScore >= 85) {
    strengths.push('Structure professionnelle et claire');
    strengths.push('Contenu personnalisé et pertinent');
  } else {
    weaknesses.push('Structure pourrait être améliorée');
    recommendations.push('Utilisez une structure standard: introduction, développement, conclusion');
  }

  if (foundKeywords.length >= 3) {
    strengths.push('Bonne intégration des mots-clés du secteur');
  } else {
    weaknesses.push('Mots-clés du secteur insuffisants');
    recommendations.push(`Intégrez plus de mots-clés comme: ${missingKeywords.slice(0, 3).join(', ')}`);
  }

  if (letterContent.length > 300) {
    strengths.push('Contenu détaillé et informatif');
  } else {
    weaknesses.push('Contenu trop court');
    recommendations.push('Développez votre expérience et votre motivation');
    improvements.push({
      title: 'Enrichissement du contenu',
      description: 'Ajoutez des exemples concrets de vos réalisations',
      priority: 'high' as const
    });
  }

  if (formData?.poste && formData?.entreprise) {
    strengths.push('Personnalisation adaptée au poste');
  } else {
    recommendations.push('Personnalisez davantage pour le poste spécifique');
  }

  // Add specific improvements for letters
  improvements.push(
    {
      title: 'Appel à l\'action',
      description: 'Terminez par une proposition d\'entretien claire',
      priority: 'medium' as const
    },
    {
      title: 'Mise en forme',
      description: 'Utilisez un format simple et lisible par les ATS',
      priority: sections.atsOptimization < 80 ? 'high' as const : 'low' as const
    }
  );

  return {
    overallScore: Math.round(atsScore),
    sections,
    keywords: {
      found: foundKeywords,
      missing: missingKeywords,
      suggestions: sectorKeywords.slice(0, 5)
    },
    strengths,
    weaknesses,
    recommendations,
    improvements,
    atsOptimization: Math.round(sections.atsOptimization),
    keywordDensity: Math.round(sections.keywordMatch),
    formatScore: Math.round(sections.structure),
    readabilityScore: Math.round(sections.content),
    marketComparison: Math.round(atsScore),
    suggestions: recommendations
  };
};

// Main export function that generates the CV document
export const generateCVDocument = async (
  template: Template,
  editableContent: CVContent,
  experiences: CVExperience[],
  languages: CVLanguage[],
  educations: CVEducation[],
  addCreatedCV: (name: string, cvData: CVData, templateName: string, atsScore: number) => Promise<string>
): Promise<void> => {
  // Get skills based on template category
  const skills = getSkillsByCategory(template.category);

  // Generate languages string
  const languagesString = languages.map(lang => `${lang.name} (${lang.level})`).join(' • ');

  // Generate educations string
  const educationsString = educations.map(edu => `${edu.degree} - ${edu.school} - ${edu.year}`).join('\n');

  // Create document
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Calibri' } } // Default fallbacks, will be overridden by custom fonts when available
      },
      paragraphStyles: [
        {
          id: 'Title',
          name: 'Title',
          basedOn: 'Normal',
          run: { size: 48, bold: true, color: '000000' }, // Fallback color
          paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 300 } }
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          run: { size: 28, bold: true, color: '000000' }, // Fallback color
          paragraph: { spacing: { before: 200, after: 100 } }
        }
      ]
    },
    sections: [{
      children: [
        new Paragraph({ text: editableContent.name, style: 'Title' }),
        new Paragraph({ text: editableContent.contact, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: editableContent.profileTitle, style: 'Heading2' }),
        new Paragraph({ text: editableContent.profileContent }),
        new Paragraph({ text: editableContent.experienceTitle, style: 'Heading2' }),
        ...experiences.flatMap(exp => [
          new Paragraph({ text: exp.content, run: { bold: true } }),
          new Paragraph({ text: exp.details })
        ]),
        new Paragraph({ text: editableContent.educationTitle, style: 'Heading2' }),
        new Paragraph({ text: educationsString }),
        new Paragraph({ text: editableContent.skillsTitle, style: 'Heading2' }),
        ...skills.map(skill => new Paragraph({ text: `• ${skill}` })),
        new Paragraph({ text: editableContent.languagesTitle, style: 'Heading2' }),
        new Paragraph({ text: languagesString })
      ]
    }]
  });

  // Generate blob and save file
  const blob = await Packer.toBlob(doc);
  const fileName = `${template.name.replace(/\s+/g, '_').toLowerCase()}.docx`;
  saveAs(blob, fileName);

  // Add created CV to library
  try {
    const cvData: CVData = {
      name: editableContent.name,
      contact: editableContent.contact,
      profileContent: editableContent.profileContent,
      experiences: experiences,
      skills: skills.map((skill, index) => ({ id: index + 1, content: skill })),
      languages: languages,
      educations: educations,
      industry: template.category,
      customFont: 'Calibri', // Fallback
      customColor: '000000', // Fallback
      templateName: template.name
    };

    // Calculate ATS score
    const atsScore = calculateATSScore(template, cvData);

    const docId = await addCreatedCV(
      `${editableContent.name || 'CV'} - ${template.name}`,
      cvData,
      template.name,
      atsScore
    );

    console.log(`✅ CV créé ajouté et sauvegardé avec l'ID: ${docId}`);
  } catch (error) {
    console.warn('Erreur lors de l\'ajout du CV créé à la bibliothèque:', error);
    // Don't block CV generation
  }
};
