import { useCallback } from 'react';
import type { Template } from '../templates';
import type { CVContent, CVExperience, CVLanguage, CVEducation } from '../types';
import type { CVData } from '../../../hooks/useCVLibrary';

interface UseExportHandlersProps {
  selectedTemplate: string | null;
  editableContent: CVContent;
  experiences: CVExperience[];
  languages: CVLanguage[];
  educations: CVEducation[];
  addCreatedCV: (cvName: string, cvData: CVData, templateName?: string, atsScore?: number) => Promise<string>;
  templates: Template[];
}

export const useExportHandlers = ({
  selectedTemplate,
  editableContent,
  experiences,
  languages,
  educations,
  addCreatedCV,
  templates
}: UseExportHandlersProps) => {

  const handleDownload = useCallback(async () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      const { generateCVDocument } = await import('../ExportModule');
      await generateCVDocument(
        template,
        editableContent,
        experiences,
        languages,
        educations,
        addCreatedCV
      );
    } catch (error) {
      console.error('Erreur lors du téléchargement du CV:', error);
    }
  }, [selectedTemplate, editableContent, experiences, languages, educations, addCreatedCV, templates]);

  const handleATSAnalysis = useCallback(async () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      const { generateQuickATSAnalysis } = await import('../ExportModule');
      const ATSReportExportModule = await import('../../CVAnalysis/ATSReportExport');

      const getSkillsByCategory = (category: string): string[] => {
        switch (category) {
          case 'Développement':
            return ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'SQL', 'Git', 'Docker'];
          case 'Marketing':
            return ['Google Analytics', 'SEO/SEM', 'Social Media', 'Content Marketing', 'Email Marketing', 'CRM'];
          case 'Finance':
            return ['Excel', 'Modélisation financière', 'Analyse de risque', 'Bloomberg', 'SAP'];
          default:
            return ['Communication', 'Travail d\'équipe', 'Résolution de problèmes', 'Adaptabilité'];
        }
      };

      const skills = getSkillsByCategory(template.category);
      const cvData = {
        name: editableContent.name,
        contact: editableContent.contact,
        profileContent: editableContent.profileContent,
        experiences,
        skills: skills.map((skill, index) => ({ id: index + 1, content: skill })),
        languages,
        educations,
        industry: template.category,
        customFont: 'Calibri',
        customColor: '000000',
        templateName: template.name
      };

      const analysis = generateQuickATSAnalysis(template, cvData);

      const candidateInfo = {
        name: editableContent.name,
        email: editableContent.contact.includes('@')
          ? editableContent.contact.split(' ').find(s => s.includes('@'))
          : '',
        position: editableContent.profileTitle
      };

      // Création de la modal d'export ATS
      const modalRoot = document.createElement('div');
      modalRoot.id = 'ats-export-modal';
      document.body.appendChild(modalRoot);

      const { createElement } = await import('react');
      const { createRoot } = await import('react-dom/client');

      const ATSExportComponent = ATSReportExportModule.default;
      const exportComponent = createElement(ATSExportComponent, {
        analysis,
        candidateInfo,
        jobInfo: {
          title: editableContent.profileTitle,
          company: 'Entreprise Cible'
        }
      });

      const modal = createElement('div', {
        style: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        },
        onClick: (e: React.MouseEvent) => {
          if (e.target === e.currentTarget) {
            document.body.removeChild(modalRoot);
          }
        }
      },
        createElement('div', {
          style: {
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            width: '90%'
          }
        }, [
          createElement('button', {
            key: 'close',
            onClick: () => document.body.removeChild(modalRoot),
            style: {
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }
          }, '✕'),
          createElement('h2', {
            key: 'title',
            style: {
              margin: '0 0 20px 0',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333'
            }
          }, 'Analyse ATS et Export PDF'),
          exportComponent
        ])
      );

      const root = createRoot(modalRoot);
      root.render(modal);

    } catch (error) {
      console.error('Erreur lors de l\'analyse ATS:', error);
      alert('Une erreur est survenue lors de l\'analyse ATS. Veuillez réessayer.');
    }
  }, [selectedTemplate, editableContent, experiences, languages, educations, templates]);

  const handleDownloadTemplate = useCallback(async (template: Template) => {
    try {
      const { generateCVDocument } = await import('../ExportModule');
      await generateCVDocument(
        template,
        editableContent,
        experiences,
        languages,
        educations,
        addCreatedCV
      );
    } catch (error) {
      console.error('Erreur lors du téléchargement du template:', error);
    }
  }, [editableContent, experiences, languages, educations, addCreatedCV]);

  return {
    handleDownload,
    handleATSAnalysis,
    handleDownloadTemplate
  };
};
