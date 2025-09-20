import React from 'react';
import { CustomSelect } from './CustomSelect';
import { Columns, RectangleVertical, AlignLeft, AlignCenter, AlignRight, Circle, Square, Plus, Minus, ZoomIn, ZoomOut, RotateCw, Move, RotateCcw, Maximize, Frame, Eye, EyeOff } from 'lucide-react';

interface StyleControlsProps {
  customFont: string;
  setCustomFont: (font: string) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
  titleColor: string;
  setTitleColor: (color: string) => void;
  layoutColumns?: number;
  setLayoutColumns?: (columns: number) => void;
  nameAlignment?: 'left' | 'center' | 'right';
  setNameAlignment?: (alignment: 'left' | 'center' | 'right') => void;
  photoAlignment?: 'left' | 'center' | 'right';
  setPhotoAlignment?: (alignment: 'left' | 'center' | 'right') => void;
  photoSize?: 'small' | 'medium' | 'large';
  setPhotoSize?: (size: 'small' | 'medium' | 'large') => void;
  photoShape?: 'circle' | 'square' | 'rounded';
  setPhotoShape?: (shape: 'circle' | 'square' | 'rounded') => void;
  nameFontSize?: number;
  setNameFontSize?: (size: number) => void;
  // Nouveaux props pour ajustements d'image
  photoZoom?: number;
  setPhotoZoom?: (zoom: number) => void;
  photoPositionX?: number;
  setPhotoPositionX?: (x: number) => void;
  photoPositionY?: number;
  setPhotoPositionY?: (y: number) => void;
  photoRotation?: number;
  setPhotoRotation?: (rotation: number) => void;
  photoObjectFit?: 'contain' | 'cover';
  setPhotoObjectFit?: (objectFit: 'contain' | 'cover') => void;
  availableFonts: string[];
  availableColors: Array<{ name: string; value: string; category: string }>;
  selectedSection?: string | null;
  hasPhoto?: boolean;
  sections?: Array<{ id: string; name: string; visible: boolean }>;
  toggleSectionVisibility?: (sectionId: string) => void;
}

export const StyleControls: React.FC<StyleControlsProps> = ({
  customFont,
  setCustomFont,
  customColor,
  setCustomColor,
  titleColor,
  setTitleColor,
  layoutColumns = 1,
  setLayoutColumns,
  nameAlignment = 'center',
  setNameAlignment,
  photoAlignment = 'center',
  setPhotoAlignment,
  photoSize = 'medium',
  setPhotoSize,
  photoShape = 'circle',
  setPhotoShape,
  nameFontSize = 18,
  setNameFontSize,
  photoZoom = 100,
  setPhotoZoom,
  photoPositionX = 0,
  setPhotoPositionX,
  photoPositionY = 0,
  setPhotoPositionY,
  photoRotation = 0,
  setPhotoRotation,
  photoObjectFit = 'contain',
  setPhotoObjectFit,
  availableFonts,
  availableColors,
  selectedSection,
  hasPhoto,
  sections,
  toggleSectionVisibility
}) => {
  const handleResetAdjustments = () => {
    setPhotoZoom?.(100);
    setPhotoPositionX?.(0);
    setPhotoPositionY?.(0);
    setPhotoRotation?.(0);
    // Réinitialise aussi la forme, taille et alignement
    setPhotoShape?.('circle');
    setPhotoSize?.('medium');
    setPhotoAlignment?.('center');
  };

  const fontOptions = availableFonts.map(font => ({ value: font, label: font }));

  // Si la section photo est sélectionnée, afficher seulement les contrôles photo
  if (selectedSection === 'photo') {
    if (!hasPhoto) {
      return (
        <div className="bg-violet-50 rounded-lg shadow-sm p-4 mb-4 -mt-2 -ml-2 -mr-2 text-center text-sm text-gray-500">
          Veuillez d'abord télécharger une photo pour voir les options de style.
        </div>
      );
    }
    return (
      <div className="bg-violet-50 rounded-lg shadow-sm p-4 mb-4 -mt-2 -ml-2 -mr-2">
        {/* Première ligne de contrôles */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Forme photo</label>
            <div className="flex gap-1">
              <button
                onClick={() => setPhotoShape?.('circle')}
                className={`p-1 rounded transition-all duration-200 ${photoShape === 'circle'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo ronde"
              >
                <Circle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPhotoShape?.('square')}
                className={`p-1 rounded transition-all duration-200 ${photoShape === 'square'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo carrée"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPhotoShape?.('rounded')}
                className={`p-1 rounded transition-all duration-200 ${photoShape === 'rounded'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo arrondie"
              >
                <div className="w-4 h-4 border border-current rounded" />
              </button>
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Taille photo</label>
            <div className="flex gap-1">
              <button
                onClick={() => setPhotoSize?.('small')}
                className={`px-2 py-1 rounded text-xs transition-all duration-200 ${photoSize === 'small'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Petite photo"
              >
                S
              </button>
              <button
                onClick={() => setPhotoSize?.('medium')}
                className={`px-2 py-1 rounded text-xs transition-all duration-200 ${photoSize === 'medium'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo moyenne"
              >
                M
              </button>
              <button
                onClick={() => setPhotoSize?.('large')}
                className={`px-2 py-1 rounded text-xs transition-all duration-200 ${photoSize === 'large'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Grande photo"
              >
                L
              </button>
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Alignement photo</label>
            <div className="flex gap-1">
              <button
                onClick={() => setPhotoAlignment?.('left')}
                className={`p-1 rounded transition-all duration-200 ${photoAlignment === 'left'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo à gauche"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPhotoAlignment?.('center')}
                className={`p-1 rounded transition-all duration-200 ${photoAlignment === 'center'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo centrée"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPhotoAlignment?.('right')}
                className={`p-1 rounded transition-all duration-200 ${photoAlignment === 'right'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo à droite"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Ajustement</label>
            <div className="flex gap-1">
              <button
                onClick={() => setPhotoObjectFit?.(photoObjectFit === 'contain' ? 'cover' : 'contain')}
                className={`p-1 rounded transition-all duration-200 ${photoObjectFit === 'contain'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title={photoObjectFit === 'contain' 
                  ? "Basculer vers mode couvrir (remplir l'espace)" 
                  : "Basculer vers mode contenir (image complète visible)"
                }
              >
                {photoObjectFit === 'contain' ? (
                  <Frame className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        

        {/* Deuxième ligne - Ajustements d'image */}
        <div className="flex items-start gap-4 pt-4 border-t border-violet-200">
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Zoom ({photoZoom}%)</label>
            <div className="flex gap-1">
              <button
                onClick={() => setPhotoZoom?.(Math.max((photoZoom || 100) - 10, 50))}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Dézoomer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="50"
                max="200"
                value={photoZoom}
                onChange={(e) => setPhotoZoom?.(parseInt(e.target.value))}
                className="w-16 h-6"
                title="Ajuster le zoom"
              />
              <button
                onClick={() => setPhotoZoom?.(Math.min((photoZoom || 100) + 10, 200))}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Zoomer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Position X ({photoPositionX}px)</label>
            <div className="flex gap-1">
              <button
                onClick={() => setPhotoPositionX?.((photoPositionX || 0) - 5)}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Déplacer à gauche"
              >
                <Move className="w-4 h-4 transform -rotate-90" />
              </button>
              <input
                type="range"
                min="-50"
                max="50"
                value={photoPositionX}
                onChange={(e) => setPhotoPositionX?.(parseInt(e.target.value))}
                className="w-16 h-6"
                title="Ajuster position horizontale"
              />
              <button
                onClick={() => setPhotoPositionX?.((photoPositionX || 0) + 5)}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Déplacer à droite"
              >
                <Move className="w-4 h-4 transform rotate-90" />
              </button>
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Position Y ({photoPositionY}px)</label>
            <div className="flex gap-1">
              <button
                onClick={() => setPhotoPositionY?.((photoPositionY || 0) - 5)}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Déplacer vers le haut"
              >
                <Move className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="-50"
                max="50"
                value={photoPositionY}
                onChange={(e) => setPhotoPositionY?.(parseInt(e.target.value))}
                className="w-16 h-6"
                title="Ajuster position verticale"
              />
              <button
                onClick={() => setPhotoPositionY?.((photoPositionY || 0) + 5)}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Déplacer vers le bas"
              >
                <Move className="w-4 h-4 transform rotate-180" />
              </button>
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Rotation ({photoRotation}°)</label>
            <div className="flex gap-1">
              <button
                onClick={() => setPhotoRotation?.((photoRotation || 0) - 15)}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Rotation gauche"
              >
                <RotateCw className="w-4 h-4 transform scale-x-[-1]" />
              </button>
              <input
                type="range"
                min="-180"
                max="180"
                value={photoRotation}
                onChange={(e) => setPhotoRotation?.(parseInt(e.target.value))}
                className="w-16 h-6"
                title="Ajuster la rotation"
              />
              <button
                onClick={() => setPhotoRotation?.((photoRotation || 0) + 15)}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Rotation droite"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>


          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Réinitialiser</label>
            <div className="flex gap-1">
              <button
                onClick={handleResetAdjustments}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Réinitialiser les styles de la photo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Déterminer si on affiche l'alignement nom
  const showNameAlignment = selectedSection === 'name' || selectedSection === null;
  // Déterminer si on affiche la couleur texte (pas pour la section nom)
  const showTextColor = selectedSection !== 'name';

  // Afficher les contrôles de visibilité des sections quand aucune section n'est sélectionnée
  if (selectedSection === null && sections && toggleSectionVisibility) {
    console.log('Sections in StyleControls:', sections);
    return (
      <div className="bg-violet-50 rounded-lg shadow-sm p-4 mb-4 -mt-2 -ml-2 -mr-2">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Visibilité des sections</h3>
          <div className="grid grid-cols-1 gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
  console.log('Toggle section:', section.id, 'current visibility:', section.visible);
  toggleSectionVisibility(section.id);
}}
                className={`flex items-center gap-2 p-2 rounded-md transition-all duration-200 text-left ${
                  section.visible
                    ? 'bg-white text-gray-700 hover:bg-gray-50'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title={section.visible ? 'Masquer la section' : 'Afficher la section'}
              >
                {section.visible ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm font-medium truncate">{section.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Pour toutes les autres sections, afficher les contrôles appropriés
  return (
    <div className="bg-violet-50 rounded-lg shadow-sm p-4 mb-4 -mt-2 -ml-2 -mr-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Police</label>
            <div className="w-[120px]">
              <CustomSelect
                value={customFont}
                onChange={setCustomFont}
                options={fontOptions}
              />
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Mise en page</label>
            <div className="flex items-center justify-start h-[32px]">
              <button
                onClick={() => setLayoutColumns?.(layoutColumns === 1 ? 2 : 1)}
                className="top-0 flex items-center justify-center w-10 h-[30px] rounded-md text-sm font-medium transition-all bg-violet-500 text-white shadow-md hover:bg-violet-600 hover:shadow-lg"
                title={layoutColumns === 1 ? "Passer à deux colonnes" : "Passer à une colonne"}
              >
                {layoutColumns === 1 ? (
                  <Columns className="w-4 h-4" />
                ) : (
                  <RectangleVertical className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {showNameAlignment && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium mb-2">Alignement nom</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setNameAlignment?.('left')}
                  className={`p-1 rounded transition-all duration-200 ${nameAlignment === 'left'
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-violet-100'
                    }`}
                  title="Aligner à gauche"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setNameAlignment?.('center')}
                  className={`p-1 rounded transition-all duration-200 ${nameAlignment === 'center'
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-violet-100'
                    }`}
                  title="Centrer"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setNameAlignment?.('right')}
                  className={`p-1 rounded transition-all duration-200 ${nameAlignment === 'right'
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-violet-100'
                    }`}
                  title="Aligner à droite"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {selectedSection === 'name' && (
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium mb-2">Taille police nom</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setNameFontSize?.(Math.max((nameFontSize || 18) - 2, 12))}
                    className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                    title="Diminuer la taille"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-2 py-1 text-xs bg-white rounded border text-gray-700 min-w-[32px] text-center">
                    {nameFontSize || 18}
                  </span>
                  <button
                    onClick={() => setNameFontSize?.(Math.min((nameFontSize || 18) + 2, 36))}
                    className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                    title="Augmenter la taille"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
                <button
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
                  <button
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
        </div>
      </div>
    </div>
  );
};
