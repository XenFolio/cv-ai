import React, { useCallback } from 'react';
import { Document, Packer, Paragraph, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { useCVCreator } from '../CVCreatorContext.hook';
import { useCVLibrary, CVData } from '../../../hooks/useCVLibrary';
import type { Template, SectionConfig } from '../types';

interface ExportModuleProps {
  templates: Template[];
  selectedTemplate: string | null;
}

export const ExportModule: React.FC<ExportModuleProps> = ({
  templates,
  selectedTemplate
}) => {
  const {
    editableContent,
    experiences,
    skills,
    languages,
    educations,
    customFont,
    customColor,
    titleColor,
    nameFontSize,
    nameAlignment,
    layoutColumns,
    photoAlignment,
    photoSize,
    photoShape,
    photoZoom,
    photoPositionX,
    photoPositionY,
    photoRotation,
    photoObjectFit,
    sectionSpacing,
    columnRatio,
    pageMarginHorizontal,
    pageMarginVertical,
    sectionColors,
    selectedTemplateName
  } = useCVCreator();

  const { addCreatedCV } = useCVLibrary();

  const getSkillsByCategory = (category: string) => {
    switch (category) {
      case 'Développement': return ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'SQL', 'Git', 'Docker'];
      case 'Marketing': return ['Google Analytics', 'SEO/SEM', 'Social Media', 'Content Marketing', 'Email Marketing', 'CRM'];
      case 'Finance': return ['Excel', 'Modélisation financière', 'Analyse de risque', 'Bloomberg', 'SAP'];
      default: return ['Communication', 'Travail d\'équipe', 'Résolution de problèmes', 'Adaptabilité'];
    }
  };

  const calculateATSScore = useCallback((template: Template, cvData: CVData): number => {
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
  }, []);

  const generateDocx = useCallback(async (template: Template) => {
    const skills = getSkillsByCategory(template.category);

    // Générer la chaîne de caractères pour les langues
    const languagesString = languages.map(lang => `${lang.name} (${lang.level})`).join(' • ');

    // Générer la chaîne de caractères pour les formations
    const educationsString = educations.map(edu => `${edu.degree} - ${edu.school} - ${edu.year}`).join('\n');

    const doc = new Document({
      styles: {
        default: {
          document: { run: { font: customFont } }
        },
        paragraphStyles: [
          {
            id: 'Title',
            name: 'Title',
            basedOn: 'Normal',
            run: { size: 48, bold: true, color: titleColor },
            paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 300 } }
          },
          {
            id: 'Heading2',
            name: 'Heading 2',
            basedOn: 'Normal',
            run: { size: 28, bold: true, color: titleColor },
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
          ...skills.map(skill => new Paragraph({ text: `• ${skill}` })),
          new Paragraph({ text: editableContent.languagesTitle, style: 'Heading2' }),
          new Paragraph({ text: languagesString })
        ]
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
        skills: skills.map((skill, index) => ({ id: index + 1, content: skill })), // Convertir en format CVData
        languages: languages,
        educations: educations,
        industry: template.category,
        customFont: customFont,
        customColor: customColor,
        templateName: template.name
      };

      // Calculer un score ATS basé sur le template et le contenu
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
  }, [
    editableContent,
    experiences,
    skills,
    languages,
    educations,
    customFont,
    titleColor,
    addCreatedCV,
    calculateATSScore
  ]);

  const handleDownload = useCallback(() => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      generateDocx(template);
    }
  }, [templates, selectedTemplate, generateDocx]);

  const handleTemplateDownload = useCallback((template: Template) => {
    generateDocx(template);
  }, [generateDocx]);

  return {
    handleDownload,
    handleTemplateDownload
  };
};