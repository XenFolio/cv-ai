import React from 'react';
import { Type, Minus } from 'lucide-react';

interface SectionTogglesProps {
  capitalizeSections: Record<string, boolean>;
  updateSectionCapitalization: (sectionId: string, capitalize: boolean) => void;
  sectionTopBorders: Record<string, boolean>;
  updateSectionTopBorder: (sectionId: string, hasTopBorder: boolean) => void;
  selectedSection: string;
}

export const SectionToggles: React.FC<SectionTogglesProps> = ({
  capitalizeSections,
  updateSectionCapitalization,
  sectionTopBorders,
  updateSectionTopBorder,
  selectedSection
}) => {
  const isCapitalized = capitalizeSections[selectedSection] ?? true;
  const hasTopBorder = sectionTopBorders[selectedSection] ?? false;

  return (
    <div className="flex gap-2">
      {/* Bouton capitalisation */}
      <div
        onClick={() => updateSectionCapitalization(selectedSection, !isCapitalized)}
        className={`cursor-pointer flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all duration-200 text-xs ${
          isCapitalized
            ? 'bg-violet-500 text-white shadow-sm hover:bg-violet-600'
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-violet-600 hover:border-violet-200'
        }`}
        title={isCapitalized ? "Désactiver les majuscules" : "Activer les majuscules"}
      >
        <Type className="w-3.5 h-3.5" />
        <span className="font-medium">
          {isCapitalized ? 'MAJ' : 'min'}
        </span>
      </div>

      {/* Bouton trait de séparation */}
      <div
        onClick={() => updateSectionTopBorder(selectedSection, !hasTopBorder)}
        className={`cursor-pointer flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all duration-200 text-xs ${
          hasTopBorder
            ? 'bg-violet-500 text-white shadow-sm hover:bg-violet-600'
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-violet-600 hover:border-violet-200'
        }`}
        title={hasTopBorder ? "Supprimer le trait de séparation" : "Ajouter un trait de séparation"}
      >
        <Minus className="w-3.5 h-3.5" />
        <span className="font-medium">
          {hasTopBorder ? 'Trait' : 'Aucun'}
        </span>
      </div>
    </div>
  );
};