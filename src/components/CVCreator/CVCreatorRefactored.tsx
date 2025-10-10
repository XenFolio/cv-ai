import React, { useCallback } from 'react';
import { CVCreatorProvider } from './CVCreatorContext.provider';
import { CVCreatorHeader } from './components/CVCreatorHeader';
import { TemplateSelector } from './components/TemplateSelector';
import { PreviewModule } from './modules/PreviewModule';
import { StyleControlsModule } from './modules/StyleControlsModule';
import { useCVData } from './useCVData';
import { useCVHandlers } from './handlers';

interface SectionConfig {
  id: string;
  name: string;
  component: string;
  visible: boolean;
  layer?: number;
  order?: number;
  width?: "full" | "half";
}

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
  sectionsOrder: SectionConfig[];
}

const CVCreatorRefactored: React.FC = () => {

  // Hook pour la gestion des données
  const {
    editableContent,
    setEditableContent,
    experiences,
    setExperiences,
    skills,
    setSkills,
    languages,
    setLanguages,
    educations,
    setEducations,
    selectedTemplate,
    setSelectedTemplate,
    selectedTemplateName,
    templatesLoading,
    error,
    setError,
    customFont,
    setCustomFont,
    customColor,
    setCustomColor,
    titleColor,
    setTitleColor,
    layoutColumns,
    setLayoutColumns,
    nameAlignment,
    setNameAlignment,
    photoAlignment,
    setPhotoAlignment,
    photoSize,
    setPhotoSize,
    photoShape,
    setPhotoShape,
    nameFontSize,
    setNameFontSize,
    photoZoom,
    setPhotoZoom,
    photoPositionX,
    setPhotoPositionX,
    photoPositionY,
    setPhotoPositionY,
    photoRotation,
    setPhotoRotation,
    photoObjectFit,
    setPhotoObjectFit,
    sectionSpacing,
    setSectionSpacing,
    columnRatio,
    setColumnRatio,
    pageMarginHorizontal,
    setPageMarginHorizontal,
    pageMarginVertical,
    setPageMarginVertical,
    editingField,
    setEditingField,
    selectedSection,
    setSelectedSection,
    sectionColors,
    setSectionColors,
    updateSectionColor,
    updateSectionElementColor,
    sections,
    toggleSectionVisibility,
    setSectionsOrder: setSectionsOrderFunc,
    cleanupLayers,
    expandSection,
    contractSection,
    hasLocalData,
    lastSaved,
    autoSaveEnabled,
    setAutoSaveEnabled,
    addCreatedCV,
    templates
  } = useCVData();

  // Hook pour les handlers
  const {
    generateWithAI,
    addExperience,
    removeExperience,
    addSkill,
    removeSkill,
    addLanguage,
    removeLanguage,
    addEducation,
    removeEducation,
    isLoading,
    openAIError
  } = useCVHandlers(
    experiences,
    setExperiences,
    skills,
    setSkills,
    languages,
    setLanguages,
    educations,
    setEducations,
    setEditableContent,
    setError
  );

  // Fonction d'export
  const handleDownload = useCallback(async () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      const { generateCVDocument } = await import('./ExportModule');

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

  // Fonction d'analyse ATS et export PDF
  const handleATSAnalysis = useCallback(async () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      const { generateQuickATSAnalysis } = await import('./ExportModule');
      const ATSReportExportModule = await import('../CVAnalysis/ATSReportExport');

      const getSkillsByCategory = (category: string): string[] => {
        switch (category) {
          case 'Développement': return ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'SQL', 'Git', 'Docker'];
          case 'Marketing': return ['Google Analytics', 'SEO/SEM', 'Social Media', 'Content Marketing', 'Email Marketing', 'CRM'];
          case 'Finance': return ['Excel', 'Modélisation financière', 'Analyse de risque', 'Bloomberg', 'SAP'];
          default: return ['Communication', 'Travail d\'équipe', 'Résolution de problèmes', 'Adaptabilité'];
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
        email: editableContent.contact.includes('@') ? editableContent.contact.split(' ').find(s => s.includes('@')) : '',
        position: editableContent.profileTitle
      };

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
    const fullTemplate = templates.find(t => t.id === template.id);
    if (!fullTemplate) return;

    try {
      const { generateCVDocument } = await import('./ExportModule');

      await generateCVDocument(
        fullTemplate,
        editableContent,
        experiences,
        languages,
        educations,
        addCreatedCV
      );
    } catch (error) {
      console.error('Erreur lors du téléchargement du template:', error);
    }
  }, [editableContent, experiences, languages, educations, addCreatedCV, templates]);

  // Context value for provider
  const contextValue = {
    // Content state
    editableContent,
    setEditableContent,
    experiences,
    setExperiences,
    skills,
    setSkills,
    languages,
    setLanguages,
    educations,
    setEducations,

    // Style state
    customFont,
    setCustomFont,
    customColor,
    setCustomColor,
    titleColor,
    setTitleColor,
    layoutColumns,
    setLayoutColumns,
    nameAlignment,
    setNameAlignment,
    photoAlignment,
    setPhotoAlignment,
    photoSize,
    setPhotoSize,
    photoShape,
    setPhotoShape,
    nameFontSize,
    setNameFontSize,
    photoZoom,
    setPhotoZoom,
    photoPositionX,
    setPhotoPositionX,
    photoPositionY,
    setPhotoPositionY,
    photoRotation,
    setPhotoRotation,
    photoObjectFit,
    setPhotoObjectFit,
    sectionSpacing,
    setSectionSpacing,
    columnRatio,
    setColumnRatio,
    pageMarginHorizontal,
    setPageMarginHorizontal,
    pageMarginVertical,
    setPageMarginVertical,

    // UI state
    editingField,
    setEditingField,
    selectedSection,
    setSelectedSection,
    selectedTemplateName,
    selectedTemplate,

    // Sections state
    sections,
    toggleSectionVisibility,
    setSectionsOrder: setSectionsOrderFunc,
    cleanupLayers,
    expandSection,
    contractSection,
    sectionColors,
    setSectionColors,
    updateSectionColor,
    updateSectionElementColor,

    // Actions
    addExperience,
    removeExperience,
    addSkill,
    removeSkill,
    addLanguage,
    removeLanguage,
    addEducation,
    removeEducation,
    generateWithAI,

    // Data
    availableFonts: ['Calibri', 'Georgia', 'Helvetica', 'Consolas', 'Times New Roman', 'Arial'],
    availableColors: [
      { name: 'Noir', value: '000000', category: 'Neutres' },
      { name: 'Gris anthracite', value: '374151', category: 'Neutres' },
      { name: 'Bleu nuit', value: '1E3A8A', category: 'Bleus' },
      { name: 'Vert forêt', value: '065F46', category: 'Verts' },
      { name: 'Violet royal', value: '7C3AED', category: 'Violets' },
      { name: 'Bordeaux', value: '7F1D1D', category: 'Rouges' },
      { name: 'Orange brûlé', value: 'C2410C', category: 'Oranges' }
    ],
    isLoading,
    error,
    openAIError
  };

  return (
    <CVCreatorProvider value={contextValue}>
      <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
        <CVCreatorHeader
          hasLocalData={hasLocalData}
          lastSaved={lastSaved}
          autoSaveEnabled={autoSaveEnabled}
          setAutoSaveEnabled={setAutoSaveEnabled}
          onATSAnalysis={handleATSAnalysis}
          onDownload={handleDownload}
        />

        <div className="p-2 grid grid-cols-1 lg:grid-cols-12 gap-1">
          <div className="lg:col-span-9 flex gap-2">
            {/* Contrôles de style à gauche */}
            <aside className="w-80 flex-shrink-0">
              <StyleControlsModule />
            </aside>

            {/* Aperçu dynamique en temps réel */}
            <section className="flex-1">
              <PreviewModule
                setSectionsOrder={setSectionsOrderFunc}
                templates={templates.map(t => ({ id: t.id, name: t.name, preview: t.preview }))}
              />
            </section>
          </div>

          <TemplateSelector
            templatesLoading={templatesLoading}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={setSelectedTemplate}
            onDownloadTemplate={handleDownloadTemplate}
            setCustomColor={setCustomColor}
            setTitleColor={setTitleColor}
            setCustomFont={setCustomFont}
            setNameAlignment={setNameAlignment}
            setLayoutColumns={setLayoutColumns}
            setEditableContent={setEditableContent}
            setSectionsOrder={setSectionsOrderFunc}
          />
        </div>
      </main>
    </CVCreatorProvider>
  );
};

export default CVCreatorRefactored;
