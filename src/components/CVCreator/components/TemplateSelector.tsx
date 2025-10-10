import React from 'react';
import { CVTemplateCarousel } from '../CVTemplateCarousel';
import { TemplateSkeleton } from '../TemplateSkeleton';
import { templates, type Template } from '../templates';
import type { SectionConfig, CVContent } from '../types';

interface TemplateSelectorProps {
  templatesLoading: boolean;
  selectedTemplate: string | null;
  onTemplateSelect: (templateId: string, templateName: string) => void;
  onDownloadTemplate: (template: Template) => void;
  setCustomColor: (color: string) => void;
  setTitleColor: (color: string) => void;
  setCustomFont: (font: string) => void;
  setNameAlignment: (alignment: 'left' | 'center' | 'right') => void;
  setLayoutColumns: (columns: number) => void;
  setEditableContent: React.Dispatch<React.SetStateAction<CVContent>>;
  setSectionsOrder: (sections: SectionConfig[]) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templatesLoading,
  selectedTemplate,
  onTemplateSelect,
  onDownloadTemplate,
  setCustomColor,
  setTitleColor,
  setCustomFont,
  setNameAlignment,
  setLayoutColumns,
  setEditableContent,
  setSectionsOrder
}) => {
  const handleTemplateSelect = (templateId: string, templateName: string) => {
    onTemplateSelect(templateId, templateName);
    const template = templates.find(t => t.id === templateId);

    if (template) {
      // Appliquer automatiquement le thème du template
      setCustomColor(template.theme.primaryColor);
      setTitleColor(template.theme.primaryColor);
      setCustomFont(template.theme.font);

      // Définir l'alignement du nom selon le template
      if (template.name === "Minimaliste") {
        setNameAlignment('left');
      } else {
        setNameAlignment('center');
      }

      // Appliquer le nombre de colonnes du template
      setLayoutColumns(template.layoutColumns);

      // Appliquer les titres de sections du template
      setEditableContent((prev: CVContent) => ({
        ...prev,
        profileTitle: template.sectionTitles.profileTitle,
        experienceTitle: template.sectionTitles.experienceTitle,
        educationTitle: template.sectionTitles.educationTitle,
        skillsTitle: template.sectionTitles.skillsTitle,
        languagesTitle: template.sectionTitles.languagesTitle,
        contactTitle: template.sectionTitles.contactTitle
      }));

      // Appliquer l'ordre des sections du template
      if (setSectionsOrder && Array.isArray(template.sectionsOrder)) {
        try {
          const sectionsWithOrder = template.sectionsOrder.map((section, index) => {
            const templateSection = section as unknown as Record<string, unknown>;
            return {
              ...section,
              layer: (templateSection.layer as number) ?? 1,
              order: index + 1
            } as SectionConfig;
          });
          setSectionsOrder(sectionsWithOrder);
        } catch (error) {
          console.warn('Erreur lors de l\'application de l\'ordre des sections:', error);
        }
      }
    }
  };

  return (
    <aside className="lg:col-span-3">
      {templatesLoading ? (
        <TemplateSkeleton />
      ) : (
        <CVTemplateCarousel
          templates={templates}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
          onDownloadTemplate={onDownloadTemplate}
        />
      )}
    </aside>
  );
};
