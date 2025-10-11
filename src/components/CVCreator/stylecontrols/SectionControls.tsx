import React from 'react';
import { Eye, EyeOff, MinusCircle, PlusCircle, Maximize } from 'lucide-react';
import type { SectionConfig } from '../types';

interface SectionControlsProps {
  sections: SectionConfig[];
  toggleSectionVisibility: (sectionId: string) => void;
  sectionSpacing: 0 | 1 | 2 | 3 | 4;
  setSectionSpacing: (spacing: 0 | 1 | 2 | 3 | 4) => void;
  pageMarginHorizontal: number;
  setPageMarginHorizontal: (margin: number) => void;
  pageMarginVertical: number;
  setPageMarginVertical: (margin: number) => void;
}

export const SectionControls: React.FC<SectionControlsProps> = ({
  sections,
  toggleSectionVisibility,
  sectionSpacing,
  setSectionSpacing,
  pageMarginHorizontal,
  setPageMarginHorizontal,
  pageMarginVertical,
  setPageMarginVertical
}) => {
  return (
    <div className="space-y-4">
      {/* Contrôle d'espacement sur ligne séparée */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium mb-2">
            Espacement entre sections
          </label>
          <div className="space-x-2 inline-flex">
            {[0, 1, 2, 3, 4].map((spacing) => (
              <div
                key={spacing}
                onClick={() => setSectionSpacing(spacing as 0 | 1 | 2 | 3 | 4)}
                className={`cursor-pointer h-[28px] px-2 flex items-center justify-center rounded text-xs transition-all duration-200 ${sectionSpacing === spacing
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100 border border-violet-200 hover:shadow-md'
                  }`}
                title={`Espacement ${spacing === 0
                  ? 'nul'
                  : spacing === 1
                    ? 'minimal'
                    : spacing === 2
                      ? 'petit'
                      : spacing === 3
                        ? 'moyen'
                        : 'grand'
                  }`}
              >
                {spacing}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contrôles de marges de la page */}
      <div className="flex items-start gap-4 pt-4 border-t border-violet-200">
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium mb-2 flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            Marges page
          </label>
          <div className="space-y-2">
            {/* Marge horizontale */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600 w-16">Horizontal</span>
              <div
                onClick={() => setPageMarginHorizontal(Math.max((pageMarginHorizontal || 20) - 5, 0))}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Réduire la marge horizontale"
              >
                <MinusCircle className="w-3 h-3" />
              </div>
              <span className="px-2 py-1 text-xs bg-white rounded border text-gray-700 min-w-[32px] text-center">
                {pageMarginHorizontal || 20}
              </span>
              <div
                onClick={() => setPageMarginHorizontal(Math.min((pageMarginHorizontal || 20) + 5, 50))}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Augmenter la marge horizontale"
              >
                <PlusCircle className="w-3 h-3" />
              </div>
            </div>

            {/* Marge verticale */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600 w-16">Vertical</span>
              <div
                onClick={() => setPageMarginVertical(Math.max((pageMarginVertical || 20) - 5, 0))}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Réduire la marge verticale"
              >
                <MinusCircle className="w-3 h-3" />
              </div>
              <span className="px-2 py-1 text-xs bg-white rounded border text-gray-700 min-w-[32px] text-center">
                {pageMarginVertical || 20}
              </span>
              <div
                onClick={() => setPageMarginVertical(Math.min((pageMarginVertical || 20) + 5, 50))}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Augmenter la marge verticale"
              >
                <PlusCircle className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visibilité des sections */}
      <div className="pt-4 border-t border-violet-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Visibilité des sections</h3>
        <div className="grid grid-cols-2 gap-2">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => {
                console.log('Toggle section:', section.id, 'current visibility:', section.visible);
                toggleSectionVisibility(section.id);
              }}
              className={`flex items-center gap-2 p-2 rounded-md transition-all duration-200 text-left ${section.visible
                ? 'bg-white text-gray-700 hover:bg-gray-50'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              title={section.visible ? 'Masquer la section' : 'Afficher la section'}
            >
              {section.visible ? (
                <Eye className="w-4 h-4 text-violet-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm font-medium truncate">{section.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};