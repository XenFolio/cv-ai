import React from 'react';
import { Document, Packer, Paragraph, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { CVExperience, CVLanguage, CVEducation, CVContent } from './types';
import { CVData, useCVLibrary } from '../../hooks/useCVLibrary';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  image: string;
  category: string;
  atsScore: number;
  theme: { primaryColor: string; font: string };
  layoutColumns: number;
  sectionTitles: {
    profileTitle: string;
    experienceTitle: string;
    educationTitle: string;
    skillsTitle: string;
    languagesTitle: string;
    contactTitle: string;
  };
  sectionsOrder: unknown[];
}

// Fonction pour calculer un score ATS approximatif
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

// Fonction utilitaire pour générer un CV et le sauvegarder
export const generateCVDocument = async (
  template: Template,
  editableContent: CVContent,
  experiences: CVExperience[],
  languages: CVLanguage[],
  educations: CVEducation[],
  addCreatedCV: (name: string, cvData: CVData, templateName: string, atsScore: number) => Promise<string>
) => {
  const getSkillsByCategory = (category: string): string[] => {
    switch (category) {
      case 'Développement': return ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'SQL', 'Git', 'Docker'];
      case 'Marketing': return ['Google Analytics', 'SEO/SEM', 'Social Media', 'Content Marketing', 'Email Marketing', 'CRM'];
      case 'Finance': return ['Excel', 'Modélisation financière', 'Analyse de risque', 'Bloomberg', 'SAP'];
      default: return ['Communication', 'Travail d\'équipe', 'Résolution de problèmes', 'Adaptabilité'];
    }
  };

  const skillsByCategory = getSkillsByCategory(template.category);

  // Générer la chaîne de caractères pour les langues
  const languagesString = languages.map(lang => `${lang.name} (${lang.level})`).join(' • ');

  // Générer la chaîne de caractères pour les formations
  const educationsString = educations.map(edu => `${edu.degree} - ${edu.school} - ${edu.year}`).join('\n');

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: template.theme.font } }
      },
      paragraphStyles: [
        {
          id: 'Title',
          name: 'Title',
          basedOn: 'Normal',
          run: { size: 48, bold: true, color: template.theme.primaryColor },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 300 } }
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          run: { size: 28, bold: true, color: template.theme.primaryColor },
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
        ...experiences.map(exp => [
          new Paragraph({ text: exp.content, run: { bold: true } }),
          new Paragraph({ text: exp.details })
        ]).flat(),
        new Paragraph({ text: editableContent.educationTitle, style: 'Heading2' }),
        new Paragraph({ text: educationsString }),
        new Paragraph({ text: editableContent.skillsTitle, style: 'Heading2' }),
        ...skillsByCategory.map(skill => new Paragraph({ text: `• ${skill}` })),
        new Paragraph({ text: editableContent.languagesTitle, style: 'Heading2' }),
        new Paragraph({ text: languagesString })
      ].filter(Boolean)
    }]
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${template.name.replace(/\s+/g, '_').toLowerCase()}.docx`;
  saveAs(blob, fileName);

  // Ajouter le CV créé à la bibliothèque
  try {
    const cvData: CVData = {
      name: editableContent.name,
      contact: editableContent.contact,
      profileContent: editableContent.profileContent,
      experiences: experiences,
      skills: skillsByCategory.map((skill, index) => ({ id: index + 1, content: skill })),
      languages: languages,
      educations: educations,
      industry: template.category,
      customFont: template.theme.font,
      customColor: template.theme.primaryColor,
      templateName: template.name
    };

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
    // Ne pas bloquer la génération du CV
  }
};

// Hook pour gérer l'export CV
export const useCVExport = () => {
  const { addCreatedCV } = useCVLibrary();

  const exportToDocx = React.useCallback(async (
    template: Template,
    editableContent: CVContent,
    experiences: CVExperience[],
    languages: CVLanguage[],
    educations: CVEducation[]
  ) => {
    await generateCVDocument(
      template,
      editableContent,
      experiences,
      languages,
      educations,
      addCreatedCV
    );
  }, [addCreatedCV]);

  return { exportToDocx };
};

// Fonction pour générer une analyse ATS rapide
export const generateQuickATSAnalysis = (template: Template, cvData: CVData) => {
  const score = calculateATSScore(template, cvData);
  
  const analysis = {
    overallScore: score,
    sections: {
      atsOptimization: score,
      keywordMatch: Math.min(score + 5, 100),
      structure: Math.min(score + 10, 100),
      content: Math.min(score + 3, 100)
    },
    recommendations: [] as string[],
    strengths: [] as string[],
    weaknesses: [] as string[],
    keywords: {
      found: [] as string[],
      missing: [] as string[],
      suggestions: [] as string[]
    },
    improvements: [] as Array<{
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
    }>
  };

  // Analyser les points forts
  if (cvData.name && cvData.name !== '[VOTRE NOM]') {
    analysis.strengths.push('Nom complet renseigné');
  }
  if (cvData.contact && !cvData.contact.includes('[')) {
    analysis.strengths.push('Coordonnées complètes');
  }
  if (cvData.profileContent && !cvData.profileContent.includes('Résumé de votre profil')) {
    analysis.strengths.push('Profil professionnel détaillé');
  }
  if (cvData.experiences.length > 0 && !cvData.experiences[0].content.includes('[Poste]')) {
    analysis.strengths.push('Expériences professionnelles renseignées');
  }
  if (cvData.skills.length >= 3) {
    analysis.strengths.push('Bon nombre de compétences techniques');
  }

  // Analyser les points faibles
  if (!cvData.name || cvData.name === '[VOTRE NOM]') {
    analysis.weaknesses.push('Nom manquant ou générique');
  }
  if (!cvData.contact || cvData.contact.includes('[')) {
    analysis.weaknesses.push('Coordonnées incomplètes');
  }
  if (!cvData.profileContent || cvData.profileContent.includes('Résumé de votre profil')) {
    analysis.weaknesses.push('Profil professionnel non personnalisé');
  }
  if (cvData.experiences.length === 0 || cvData.experiences[0].content.includes('[Poste]')) {
    analysis.weaknesses.push('Absence d\'expériences professionnelles');
  }
  if (cvData.skills.length < 3) {
    analysis.weaknesses.push('Nombre insuffisant de compétences');
  }

  // Analyser les améliorations prioritaires
  if (!cvData.name || cvData.name === '[VOTRE NOM]') {
    analysis.improvements.push({
      title: 'Ajouter votre nom complet',
      description: 'Personnalisez votre nom pour une identification claire par les recruteurs',
      priority: 'high'
    });
  }
  if (!cvData.contact || cvData.contact.includes('[')) {
    analysis.improvements.push({
      title: 'Compléter vos coordonnées',
      description: 'Ajoutez email, téléphone et LinkedIn pour être facilement contactable',
      priority: 'high'
    });
  }
  if (!cvData.profileContent || cvData.profileContent.includes('Résumé de votre profil')) {
    analysis.improvements.push({
      title: 'Rédiger un profil professionnel personnalisé',
      description: 'Décrivez votre expertise et vos objectifs professionnels en quelques lignes',
      priority: 'medium'
    });
  }
  if (cvData.experiences.length === 0 || cvData.experiences[0].content.includes('[Poste]')) {
    analysis.improvements.push({
      title: 'Ajouter vos expériences professionnelles',
      description: 'Détaillez vos postes précédents avec réalisations quantifiables',
      priority: 'high'
    });
  }
  if (cvData.skills.length < 3) {
    analysis.improvements.push({
      title: 'Ajouter plus de compétences techniques',
      description: 'Listez les technologies et outils que vous maîtrisez',
      priority: 'medium'
    });
  }

  // Générer des recommandations
  if (score < 80) {
    analysis.recommendations.push('Améliorez le contenu de votre CV pour un meilleur score ATS');
  }
  if (cvData.profileContent.length < 100) {
    analysis.recommendations.push('Développez votre profil professionnel (minimum 100 caractères)');
  }
  if (cvData.experiences.length < 2) {
    analysis.recommendations.push('Ajoutez plus d\'expériences professionnelles');
  }

  // Analyser les mots-clés
  const commonKeywords = getCommonKeywords(template.category);
  const cvText = `${cvData.profileContent} ${cvData.experiences.map(e => e.content).join(' ')} ${cvData.skills.map(s => s.content).join(' ')}`.toLowerCase();
  
  analysis.keywords.found = commonKeywords.filter(keyword => 
    cvText.includes(keyword.toLowerCase())
  );
  
  analysis.keywords.missing = commonKeywords.filter(keyword => 
    !cvText.includes(keyword.toLowerCase())
  );
  
  analysis.keywords.suggestions = analysis.keywords.missing.slice(0, 5);

  return analysis;
};

// Fonction utilitaire pour obtenir les mots-clés courants par catégorie
const getCommonKeywords = (category: string): string[] => {
  switch (category) {
    case 'Développement':
      return ['javascript', 'react', 'node.js', 'typescript', 'python', 'sql', 'git', 'docker', 'api', 'fullstack'];
    case 'Marketing':
      return ['seo', 'sem', 'social media', 'content marketing', 'analytics', 'crm', 'branding', 'campaign', 'conversion'];
    case 'Finance':
      return ['excel', 'financial analysis', 'risk management', 'budgeting', 'forecasting', 'reporting', 'compliance', 'audit'];
    default:
      return ['communication', 'project management', 'teamwork', 'problem solving', 'leadership', 'organization'];
  }
};

export default useCVExport;
