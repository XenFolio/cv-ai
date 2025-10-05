import { Document, Packer, Paragraph, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import type { Template } from '../templates';
import type { CVContent, CVExperience, CVLanguage, CVEducation } from '../types';
import type { CVData } from '../../../hooks/useCVLibrary';

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
