import React from 'react';
import { useCVCreator } from '../CVCreatorContext.hook';
import { DraggableSections } from '../DraggableSections';
import type { SectionConfig } from '../types';

interface PreviewModuleProps {
  setSectionsOrder: (sections: SectionConfig[]) => void;
  templates: Array<{
    id: string;
    name: string;
    preview: string;
  }>;
}

export const PreviewModule: React.FC<PreviewModuleProps> = ({ setSectionsOrder, templates }) => {
  const {
    customFont,
    error,
    openAIError,
    selectedTemplate,
    setSelectedSection,
    pageMarginHorizontal = 20,
    pageMarginVertical = 20
  } = useCVCreator();
  const [showError, setShowError] = React.useState(false);

  // Fonction pour trouver le template sélectionné et obtenir sa couleur de fond
  const getSelectedTemplatePreview = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    return template ? template.preview : "bg-white";
  };

  // Auto-hide error after 3 seconds
  React.useEffect(() => {
    if (error || openAIError) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
  }, [error, openAIError]);

  // Gestionnaire de clic pour désélectionner les sections
  const handlePreviewClick = (e: React.MouseEvent) => {
    // Vérifier si le clic n'est pas sur une section, un bouton, un input ou des contrôles de style
    const target = e.target as HTMLElement;
    if (!target.closest('[data-section]') && !target.closest('button') && !target.closest('input') && !target.closest('[data-controls]')) {
      setSelectedSection?.(null);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="relative w-full max-w-[595px]">
        {/* Dégradés décoratifs discrets autour du CV */}
        <div className="absolute -inset-4 bg-gradient-to-br from-gray-100 via-slate-50 to-gray-100 rounded-2xl opacity-40 blur-sm"></div>
        <div className="absolute -inset-2 bg-gradient-to-tr from-violet-50 via-gray-50 to-violet-50 rounded-xl opacity-30 blur-xs"></div>

        {/* CV au format A4 */}
        <div
          className={`relative border border-violet-500 rounded-lg shadow-xl flex flex-col ${getSelectedTemplatePreview()}`}
          style={{
            fontFamily: customFont,
            boxSizing: 'border-box',
            aspectRatio: '1 / 1.414', // Ratio A4 (210mm x 297mm)
            width: '100%',
            maxWidth: '595px', // Largeur A4 en pixels à 72 DPI (210mm)
            minHeight: '842px', // Hauteur A4 en pixels à 72 DPI (297mm)
            overflow: 'hidden', // Éviter le débordement du contenu
            padding: `${pageMarginVertical}px ${pageMarginHorizontal}px`
          }}
          onClick={handlePreviewClick}
        >
          {/* Indicateur d'erreur */}
          {(showError && error) && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded text-sm shadow-lg">
                {error}
              </div>
            </div>
          )}

          {/* Indicateur d'erreur OpenAI */}
          {(showError && openAIError) && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-1 rounded text-sm shadow-lg">
                {openAIError}
              </div>
            </div>
          )}

          <DraggableSections setSectionsOrder={setSectionsOrder} />
        </div>
      </div>
    </div>
  );
};