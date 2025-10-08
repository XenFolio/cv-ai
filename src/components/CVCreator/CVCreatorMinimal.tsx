import React, { useMemo } from 'react';
import { CVCreatorProvider } from './CVCreatorContext.provider';
import { CVCreatorHeader } from './components/CVCreatorHeader';
import { CVCreatorLayout } from './components/CVCreatorLayout';
import { useCVData } from './useCVData';
import { useCVHandlers } from './handlers';
import { useExportHandlers } from './hooks/useExportHandlers';
import type { SectionConfig } from './types';

const CVCreatorMinimal: React.FC = () => {
  // Hook pour la gestion des données
  const cvData = useCVData();

  // Hook pour les handlers de contenu
  const contentHandlers = useCVHandlers(
    cvData.experiences,
    cvData.setExperiences,
    cvData.skills,
    cvData.setSkills,
    cvData.languages,
    cvData.setLanguages,
    cvData.educations,
    cvData.setEducations,
    cvData.editableContent,
    cvData.setEditableContent,
    cvData.setError
  );

  // Hook pour les handlers d'export
  const exportHandlers = useExportHandlers({
    selectedTemplate: cvData.selectedTemplate,
    editableContent: cvData.editableContent,
    experiences: cvData.experiences,
    languages: cvData.languages,
    educations: cvData.educations,
    addCreatedCV: cvData.addCreatedCV,
    templates: cvData.templates
  });

  // Construction manuelle du contexte pour éviter les incompatibilités de type
  const contextValue = useMemo(() => ({
    // Content state
    editableContent: cvData.editableContent,
    setEditableContent: cvData.setEditableContent,
    experiences: cvData.experiences,
    setExperiences: cvData.setExperiences,
    skills: cvData.skills,
    setSkills: cvData.setSkills,
    languages: cvData.languages,
    setLanguages: cvData.setLanguages,
    educations: cvData.educations,
    setEducations: cvData.setEducations,

    // Style state
    customFont: cvData.customFont,
    setCustomFont: cvData.setCustomFont,
    customColor: cvData.customColor,
    setCustomColor: cvData.setCustomColor,
    titleColor: cvData.titleColor,
    setTitleColor: cvData.setTitleColor,
    layoutColumns: cvData.layoutColumns,
    setLayoutColumns: cvData.setLayoutColumns,
    nameAlignment: cvData.nameAlignment,
    setNameAlignment: cvData.setNameAlignment,
    photoAlignment: cvData.photoAlignment,
    setPhotoAlignment: cvData.setPhotoAlignment,
    photoSize: cvData.photoSize,
    setPhotoSize: cvData.setPhotoSize,
    photoShape: cvData.photoShape,
    setPhotoShape: cvData.setPhotoShape,
    nameFontSize: cvData.nameFontSize,
    setNameFontSize: cvData.setNameFontSize,
    photoZoom: cvData.photoZoom,
    setPhotoZoom: cvData.setPhotoZoom,
    photoPositionX: cvData.photoPositionX,
    setPhotoPositionX: cvData.setPhotoPositionX,
    photoPositionY: cvData.photoPositionY,
    setPhotoPositionY: cvData.setPhotoPositionY,
    photoRotation: cvData.photoRotation,
    setPhotoRotation: cvData.setPhotoRotation,
    photoObjectFit: cvData.photoObjectFit,
    setPhotoObjectFit: cvData.setPhotoObjectFit,
    sectionSpacing: cvData.sectionSpacing,
    setSectionSpacing: cvData.setSectionSpacing,
    columnRatio: cvData.columnRatio,
    setColumnRatio: cvData.setColumnRatio,
    pageMarginHorizontal: cvData.pageMarginHorizontal,
    setPageMarginHorizontal: cvData.setPageMarginHorizontal,
    pageMarginVertical: cvData.pageMarginVertical,
    setPageMarginVertical: cvData.setPageMarginVertical,

    // UI state
    editingField: cvData.editingField,
    setEditingField: cvData.setEditingField,
    selectedSection: cvData.selectedSection,
    setSelectedSection: cvData.setSelectedSection,

    // Sections state
    sections: cvData.sections,
    toggleSectionVisibility: cvData.toggleSectionVisibility,
    setSectionsOrder: cvData.setSectionsOrder,
    cleanupLayers: (sections: SectionConfig[]) => cvData.cleanupLayers(sections),
    expandSection: cvData.expandSection,
    contractSection: cvData.contractSection,

    // Section colors state
    sectionColors: cvData.sectionColors,
    setSectionColors: cvData.setSectionColors,
    updateSectionColor: cvData.updateSectionColor,
    updateSectionElementColor: cvData.updateSectionElementColor,

    // Template state
    selectedTemplateName: cvData.selectedTemplateName,
    selectedTemplate: cvData.selectedTemplate,

    // Actions
    addExperience: contentHandlers.addExperience,
    removeExperience: contentHandlers.removeExperience,
    addSkill: contentHandlers.addSkill,
    removeSkill: contentHandlers.removeSkill,
    addLanguage: contentHandlers.addLanguage,
    removeLanguage: contentHandlers.removeLanguage,
    addEducation: contentHandlers.addEducation,
    removeEducation: contentHandlers.removeEducation,
    generateWithAI: contentHandlers.generateWithAI,

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
    isLoading: contentHandlers.isLoading,
    error: cvData.error,
    openAIError: contentHandlers.openAIError
  }), [
    cvData,
    contentHandlers
  ]);

  return (
    <CVCreatorProvider value={contextValue}>
      <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
        <CVCreatorHeader
          hasLocalData={cvData.hasLocalData}
          lastSaved={cvData.lastSaved}
          autoSaveEnabled={cvData.autoSaveEnabled}
          setAutoSaveEnabled={cvData.setAutoSaveEnabled}
          onATSAnalysis={exportHandlers.handleATSAnalysis}
          onDownload={exportHandlers.handleDownload}
        />

        <CVCreatorLayout
          templatesLoading={cvData.templatesLoading}
          selectedTemplate={cvData.selectedTemplate}
          setSectionsOrder={cvData.setSectionsOrder}
          templates={cvData.templates.map(t => ({
            id: t.id,
            name: t.name,
            preview: t.preview
          }))}
          onTemplateSelect={cvData.setSelectedTemplate}
          onDownloadTemplate={exportHandlers.handleDownloadTemplate}
          setCustomColor={cvData.setCustomColor}
          setTitleColor={cvData.setTitleColor}
          setCustomFont={cvData.setCustomFont}
          setNameAlignment={cvData.setNameAlignment}
          setLayoutColumns={cvData.setLayoutColumns}
          setEditableContent={cvData.setEditableContent}
        />
      </main>
    </CVCreatorProvider>
  );
};

export default CVCreatorMinimal;
