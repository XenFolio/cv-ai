import React from 'react';
import { BookOpen } from 'lucide-react';
import { useCVCreator } from '../CVCreatorContext.hook';

interface SkillsLayoutControlsProps {
  selectedSection: string | null;
}

export const SkillsLayoutControls: React.FC<SkillsLayoutControlsProps> = ({
  selectedSection
}) => {
  const { skillsLayout, setSkillsLayout, openSkillsLibrary } = useCVCreator();

  if (selectedSection !== 'skills') return null;

  return (
    <div className="flex-shrink-0 w-full border-t border-violet-200 pt-4 space-y-4">
      {/* Contrôle de disposition */}
      <div>
        <label className="block text-sm font-medium mb-2">Disposition des compétences</label>
        <div className="flex gap-1">
          {[
            { value: 'libre', label: 'Libre' },
            { value: '1colonne', label: '1 col' },
            { value: '2colonnes', label: '2 cols' },
            { value: '3colonnes', label: '3 cols' }
          ].map((layout) => {
            const layoutMap: { [key: string]: 'free' | '1col' | '2col' | '3col' } = {
              'libre': 'free',
              '1colonne': '1col',
              '2colonnes': '2col',
              '3colonnes': '3col'
            };
            const isActive = skillsLayout === layoutMap[layout.value];

            return (
              <div
                key={layout.value}
                onClick={() => {
                  setSkillsLayout(layoutMap[layout.value]);
                }}
                className={`px-2 py-1 rounded text-xs transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-violet-100 border border-violet-200 hover:shadow-md'
                }`}
                title={`Disposition ${layout.label.toLowerCase()}`}
              >
                {layout.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bouton bibliothèque de compétences */}
      <div className="flex items-center gap-2">
        <button
          onClick={openSkillsLibrary}
          className="flex items-center gap-2 px-3 py-2 bg-violet-500 text-white text-sm rounded-lg hover:bg-violet-600 transition-all duration-200 shadow-md hover:shadow-lg"
          title="Ouvrir la bibliothèque de compétences"
        >
          <BookOpen size={16} />
          Bibliothèque de compétences
        </button>
      </div>
    </div>
  );
};