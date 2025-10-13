import React from 'react';
import { Palette } from 'lucide-react';
import { getSectionName } from '../utils/sections';
import { ColorToneSelector } from '../StyleControls';

interface ColorControlsProps {
  selectedSection: string | null;
  sectionColors: Record<string, {
    background: string;
    title: string;
    content: string;
    input: string;
    button: string;
    aiButton: string;
    separator: string;
    border: string;
  }>;
  availableColors: Array<{ name: string; value: string; category: string }>;
  titleColor: string;
  setTitleColor: (color: string) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
  updateSectionElementColor: (
    sectionId: string,
    elementType: 'background' | 'title' | 'content' | 'input' | 'button' | 'aiButton' | 'separator' | 'border',
    color: string
  ) => void;
  showTextColor: boolean;
}

export const ColorControls: React.FC<ColorControlsProps> = ({
  selectedSection,
  sectionColors,
  availableColors,
  titleColor,
  setTitleColor,
  customColor,
  setCustomColor,
  updateSectionElementColor,
  showTextColor
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex-shrink-0 w-full">
        <label className="block text-sm font-medium mb-2">Couleur titres</label>
        <div className="flex gap-1">
          {availableColors.reduce((acc, color) => {
            if (!acc.find(c => c.category === color.category)) {
              acc.push(color);
            }
            return acc;
          }, [] as Array<{ name: string; value: string; category: string }>).map((color) => (
            <div
              key={color.category}
              onClick={() => setTitleColor(color.value)}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${titleColor === color.value
                ? 'border-violet-500 shadow-lg ring-2 ring-violet-200'
                : 'border-gray-300 hover:border-gray-400'
                }`}
              style={{ backgroundColor: `#${color.value}` }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {showTextColor && (
        <div className="flex-shrink-0 w-full">
          <label className="block text-sm font-medium mb-2">Couleur texte</label>
          <div className="flex gap-1">
            {availableColors.reduce((acc, color) => {
              if (!acc.find(c => c.category === color.category)) {
                acc.push(color);
              }
              return acc;
            }, [] as Array<{ name: string; value: string; category: string }>).map((color) => (
              <div
                key={color.category}
                onClick={() => setCustomColor(color.value)}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${customColor === color.value
                  ? 'border-violet-500 shadow-lg ring-2 ring-violet-200'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}
                style={{ backgroundColor: `#${color.value}` }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contrôles de couleur personnalisés pour la section sélectionnée */}
      {selectedSection && selectedSection !== 'photo' && (
        <div className="flex-shrink-0 w-full border-t border-violet-200 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-violet-600" />
            <label className="block text-sm font-medium text-violet-700">
              Couleurs personnalisées - {getSectionName(selectedSection)}
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Couleur de fond */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">Fond</label>
              <div className="flex gap-1 flex-wrap">
                {[
                  { name: 'Transparent', value: 'transparent' },
                  { name: 'Blanc', value: 'ffffff' },
                  { name: 'Gris clair', value: 'f3f4f6' },
                  { name: 'Jaune clair', value: 'fef3c7' },
                  { name: 'Bleu clair', value: 'dbeafe' },
                  { name: 'Vert clair', value: 'dcfce7' },
                  { name: 'Rose clair', value: 'fce7f3' },
                  { name: 'Violet clair', value: 'f3e8ff' },
                  { name: 'Orange clair', value: 'fed7aa' },
                  { name: 'Dégradé bleu', value: 'linear-gradient(to right, #3b82f6, #1d4ed8)' },
                  { name: 'Dégradé violet', value: 'linear-gradient(to right, #8b5cf6, #6d28d9)' },
                  { name: 'Dégradé vert', value: 'linear-gradient(to right, #10b981, #059669)' },
                  { name: 'Dégradé rose', value: 'linear-gradient(to right, #ec4899, #be185d)' },
                  { name: 'Dégradé orange', value: 'linear-gradient(to right, #f59e0b, #d97706)' }
                ].map((color) => {
                  const currentColors = sectionColors[selectedSection] || { background: '' };
                  return (
                    <div
                      key={`bg-${color.value}`}
                      onClick={() => updateSectionElementColor(selectedSection, 'background', color.value)}
                      className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 relative ${currentColors.background === color.value ? 'border-violet-500 shadow-md ring-2 ring-violet-200' : 'border-gray-300'
                        } ${color.value === 'transparent' ? '!bg-transparent' : color.value.includes('gradient') ? '' : ''}`}
                      style={{ backgroundColor: color.value === 'transparent' ? 'transparent' : color.value.includes('gradient') ? 'transparent' : `#${color.value}`, backgroundImage: color.value.includes('gradient') ? color.value : 'none' }}
                      title={color.name}>
                      {color.value === 'transparent' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-0.5 bg-red-500 rotate-45 absolute"></div>
                          <div className="w-4 h-0.5 bg-red-500 -rotate-45 absolute"></div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Sélecteurs de tons pour différentes couleurs */}
                <ColorToneSelector
                  baseColor="#3b82f6"  // Bleu
                  element="background"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'background', color)}
                  currentColors={sectionColors[selectedSection] || { background: '' }}
                />
                <ColorToneSelector
                  baseColor="#8b5cf6"  // Violet
                  element="background"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'background', color)}
                  currentColors={sectionColors[selectedSection] || { background: '' }}
                />
                <ColorToneSelector
                  baseColor="#10b981"  // Vert
                  element="background"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'background', color)}
                  currentColors={sectionColors[selectedSection] || { background: '' }}
                />
                <ColorToneSelector
                  baseColor="#ec4899"  // Rose
                  element="background"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'background', color)}
                  currentColors={sectionColors[selectedSection] || { background: '' }}
                />
                <ColorToneSelector
                  baseColor="#f59e0b"  // Orange
                  element="background"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'background', color)}
                  currentColors={sectionColors[selectedSection] || { background: '' }}
                />
                <ColorToneSelector
                  baseColor="#ef4444"  // Rouge
                  element="background"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'background', color)}
                  currentColors={sectionColors[selectedSection] || { background: '' }}
                />
                <ColorToneSelector
                  baseColor="#6b7280"  // Gris
                  element="background"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'background', color)}
                  currentColors={sectionColors[selectedSection] || { background: '' }}
                />
                <ColorToneSelector
                  baseColor="#14b8a6"  // Turquoise
                  element="background"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'background', color)}
                  currentColors={sectionColors[selectedSection] || { background: '' }}
                />
              </div>
            </div>

            {/* Couleur des titres */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">Titres</label>
              <div className="flex gap-1 flex-wrap">
                {/* Blanc comme option par défaut */}
                <div
                  key="title-white"
                  onClick={() => updateSectionElementColor(selectedSection, 'title', 'ffffff')}
                  className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${(sectionColors[selectedSection]?.title || '000000') === 'ffffff' ? 'border-violet-500 shadow-md' : 'border-gray-300'
                    }`}
                  style={{ backgroundColor: '#ffffff' }}
                  title="Blanc"
                />

                {/* Couleurs de base pour les titres */}
                {availableColors.slice(0, 3).map((color) => {
                  const currentColors = sectionColors[selectedSection] || { title: 'ffffff' };
                  return (
                    <div
                      key={`title-${color.value}`}
                      onClick={() => updateSectionElementColor(selectedSection, 'title', color.value)}
                      className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${currentColors.title === color.value ? 'border-violet-500 shadow-md' : 'border-gray-300'
                        }`}
                      style={{ backgroundColor: `#${color.value}` }}
                      title={color.name}
                    />
                  );
                })}

                {/* Sélecteurs de tons pour les titres */}
                <ColorToneSelector
                  baseColor="#000000"  // Noir
                  element="title"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'title', color)}
                  currentColors={sectionColors[selectedSection] || { title: 'ffffff' }}
                />
                <ColorToneSelector
                  baseColor="#1f2937"  // Gris foncé
                  element="title"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'title', color)}
                  currentColors={sectionColors[selectedSection] || { title: 'ffffff' }}
                />
                <ColorToneSelector
                  baseColor="#3b82f6"  // Bleu
                  element="title"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'title', color)}
                  currentColors={sectionColors[selectedSection] || { title: 'ffffff' }}
                />
                <ColorToneSelector
                  baseColor="#8b5cf6"  // Violet
                  element="title"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'title', color)}
                  currentColors={sectionColors[selectedSection] || { title: 'ffffff' }}
                />
                <ColorToneSelector
                  baseColor="#10b981"  // Vert
                  element="title"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'title', color)}
                  currentColors={sectionColors[selectedSection] || { title: 'ffffff' }}
                />
                <ColorToneSelector
                  baseColor="#ef4444"  // Rouge
                  element="title"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'title', color)}
                  currentColors={sectionColors[selectedSection] || { title: 'ffffff' }}
                />
              </div>
            </div>

            {/* Couleur du contenu */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">Contenu</label>
              <div className="flex gap-1 flex-wrap">
                {/* Blanc comme option par défaut */}
                <div
                  key="content-white"
                  onClick={() => updateSectionElementColor(selectedSection, 'content', 'ffffff')}
                  className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${(sectionColors[selectedSection]?.content || '000000') === 'ffffff' ? 'border-violet-500 shadow-md' : 'border-gray-300'
                    }`}
                  style={{ backgroundColor: '#ffffff' }}
                  title="Blanc"
                />

                {/* Couleurs de base pour le contenu */}
                {availableColors.slice(0, 3).map((color) => {
                  const currentColors = sectionColors[selectedSection] || { content: 'ffffff' };
                  return (
                    <div
                      key={`content-${color.value}`}
                      onClick={() => updateSectionElementColor(selectedSection, 'content', color.value)}
                      className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${currentColors.content === color.value ? 'border-violet-500 shadow-md' : 'border-gray-300'
                        }`}
                      style={{ backgroundColor: `#${color.value}` }}
                      title={color.name}
                    />
                  );
                })}

                {/* Sélecteurs de tons pour le contenu */}
                <ColorToneSelector
                  baseColor="#000000"  // Noir
                  element="content"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'content', color)}
                  currentColors={sectionColors[selectedSection] || { content: 'ffffff' }}
                />
                <ColorToneSelector
                  baseColor="#6b7280"  // Gris moyen
                  element="content"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'content', color)}
                  currentColors={sectionColors[selectedSection] || { content: 'ffffff' }}
                />
                <ColorToneSelector
                  baseColor="#1f2937"  // Gris foncé
                  element="content"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'content', color)}
                  currentColors={sectionColors[selectedSection] || { content: 'ffffff' }}
                />
                <ColorToneSelector
                  baseColor="#3b82f6"  // Bleu
                  element="content"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'content', color)}
                  currentColors={sectionColors[selectedSection] || { content: 'ffffff' }}
                />
                <ColorToneSelector
                  baseColor="#10b981"  // Vert
                  element="content"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'content', color)}
                  currentColors={sectionColors[selectedSection] || { content: 'ffffff' }}
                />
                <ColorToneSelector
                  baseColor="#8b5cf6"  // Violet
                  element="content"
                  onColorSelect={(color) => updateSectionElementColor(selectedSection, 'content', color)}
                  currentColors={sectionColors[selectedSection] || { content: 'ffffff' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
