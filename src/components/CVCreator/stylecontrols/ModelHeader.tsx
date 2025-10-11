import React from 'react';

interface ModelHeaderProps {
  selectedTemplate: string | null;
  selectedTemplateName: string;
}

export const ModelHeader: React.FC<ModelHeaderProps> = ({
  selectedTemplate,
  selectedTemplateName
}) => {
  // N'afficher l'en-tête que si un modèle est sélectionné
  if (!selectedTemplate || !selectedTemplateName) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-violet-500 via-pink-500 to-purple-600 rounded-t-lg py-2 mb-0 shadow-lg">
      <h3 className="text-white font-bold text-lg text-center drop-shadow-md">
        {selectedTemplateName}
      </h3>
    </div>
  );
};