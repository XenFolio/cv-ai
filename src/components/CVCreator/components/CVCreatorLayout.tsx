import React from 'react';
import { PreviewModule } from '../modules/PreviewModule';
import { StyleControlsModule } from '../modules/StyleControlsModule';
import { TemplateSelector } from './TemplateSelector';
import type { SectionConfig } from '../types';

interface CVCreatorLayoutProps {
  templatesLoading: boolean;
  selectedTemplate: string | null;
  setSectionsOrder: (sections: SectionConfig[]) => void;
  templates: Array<{ id: string; name: string; preview: string }>;
  onTemplateSelect: (templateId: string, templateName: string) => void;
  onDownloadTemplate: (template: any) => void;
  setCustomColor: (color: string) => void;
  setTitleColor: (color: string) => void;
  setCustomFont: (font: string) => void;
  setNameAlignment: (alignment: 'left' | 'center' | 'right') => void;
  setLayoutColumns: (columns: number) => void;
  setEditableContent: (content: any) => void;
}

export const CVCreatorLayout: React.FC<CVCreatorLayoutProps> = ({
  templatesLoading,
  selectedTemplate,
  setSectionsOrder,
  templates,
  onTemplateSelect,
  onDownloadTemplate,
  setCustomColor,
  setTitleColor,
  setCustomFont,
  setNameAlignment,
  setLayoutColumns,
  setEditableContent
}) => {
  return (
    <div className="p-2 grid grid-cols-1 lg:grid-cols-12 gap-1">
      <div className="lg:col-span-9 flex gap-2">
        {/* Contrôles de style à gauche */}
        <aside className="w-80 flex-shrink-0">
          <StyleControlsModule />
        </aside>

        {/* Aperçu dynamique en temps réel */}
        <section className="flex-1">
          <PreviewModule
            setSectionsOrder={setSectionsOrder}
            templates={templates}
          />
        </section>
      </div>

      {/* Sélecteur de templates à droite */}
      <TemplateSelector
        templatesLoading={templatesLoading}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={onTemplateSelect}
        onDownloadTemplate={onDownloadTemplate}
        setCustomColor={setCustomColor}
        setTitleColor={setTitleColor}
        setCustomFont={setCustomFont}
        setNameAlignment={setNameAlignment}
        setLayoutColumns={setLayoutColumns}
        setEditableContent={setEditableContent}
        setSectionsOrder={setSectionsOrder}
      />
    </div>
  );
};