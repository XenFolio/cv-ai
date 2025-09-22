import React from 'react';
import { useCVCreator } from './CVCreatorContext.hook';
import { DraggableSections } from './DraggableSections';
import type { SectionConfig } from './types';

interface CVPreviewDragDropProps {
  setSectionsOrder: (sections: SectionConfig[]) => void;
}

export const CVPreviewDragDrop: React.FC<CVPreviewDragDropProps> = ({ setSectionsOrder }) => {
  const {
    customFont,
    error,
    openAIError,
    selectedTemplate,
    setSelectedSection
  } = useCVCreator();
  const [showError, setShowError] = React.useState(false);

  // Fonction pour trouver le template sélectionné et obtenir sa couleur de fond
  const getSelectedTemplatePreview = () => {
    const templates = [
      {
        id: "1",
        name: "Minimaliste",
        preview: "bg-gradient-to-br from-gray-50 to-white",
      },
      {
        id: "2",
        name: "Créatif",
        preview: "bg-gradient-to-br from-yellow-50 to-orange-50",
      },
      {
        id: "3",
        name: "Corporate",
        preview: "bg-gradient-to-br from-white to-slate-100",
      },
      {
        id: "4",
        name: "Moderne Coloré",
        preview: "bg-gradient-to-br from-white to-slate-100",
      },
      {
        id: "5",
        name: "Élégant B&W",
        preview: "bg-gradient-to-br from-white to-slate-100",
      },
      {
        id: "6",
        name: "Émeraude",
        preview: "bg-[#fbf9f4]",
      }
    ];

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
    // Vérifier si le clic n'est pas sur une section ou un bouton
    const target = e.target as HTMLElement;
    if (!target.closest('[data-section]') && !target.closest('button') && !target.closest('input')) {
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
            overflow: 'hidden' // Éviter le débordement du contenu
          }}
          onClick={handlePreviewClick}
        >

          {/* Zone de contenu CV sans scroll */}
          <div className="flex-1 p-4 h-full overflow-auto">
            {/* Affichage des erreurs avec auto-hide */}
            {(error || openAIError) && showError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 pr-12 rounded relative mb-4 transition-opacity duration-300" role="alert">
                <strong className="font-bold">Erreur : </strong>
                <span className="block sm:inline">{error || openAIError}</span>
                <button
                  onClick={() => setShowError(false)}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-red-700 hover:text-red-900 hover:bg-red-200 rounded-full text-lg font-bold transition-colors duration-200"
                  aria-label="Fermer"
                  title="Fermer le message"
                >
                  ×
                </button>
              </div>
            )}

              {/* Sections déplaçables */}
            <DraggableSections setSectionsOrder={setSectionsOrder} />
          </div>
        </div>
      </div>
    </div>
  );
};
