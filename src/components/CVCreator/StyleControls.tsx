import React from 'react';
import { CustomSelect } from './CustomSelect';
import { Columns, RectangleVertical, AlignLeft, AlignCenter, AlignRight, Circle, Square, Plus, Minus, ZoomIn, ZoomOut, RotateCw, Move, RotateCcw, Maximize, Frame, Eye, EyeOff, Palette, ChevronDown, ChevronRight, MinusCircle, PlusCircle } from 'lucide-react';
import { useCVCreator } from './CVCreatorContext.hook';
import type { SectionConfig } from './types';

// Fonction pour convertir hex en RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Fonction pour convertir RGB en hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Fonction pour générer des variations de couleur
const generateColorVariations = (baseHex: string): Array<{ name: string; value: string; category: string }> => {
  const rgb = hexToRgb(baseHex);
  const variations = [];

  // Version blanc (très clair)
  variations.push({ name: 'Blanc', value: 'ffffff', category: 'blanc' });

  // Version pastel (très claire)
  const pastel = rgbToHex(
    Math.min(255, rgb.r + 100),
    Math.min(255, rgb.g + 100),
    Math.min(255, rgb.b + 100)
  );
  variations.push({ name: 'Pastel', value: pastel.replace('#', ''), category: 'pastel' });

  // Version claire
  const light = rgbToHex(
    Math.min(255, rgb.r + 60),
    Math.min(255, rgb.g + 60),
    Math.min(255, rgb.b + 60)
  );
  variations.push({ name: 'Clair', value: light.replace('#', ''), category: 'clair' });

  // Version medium (couleur originale)
  variations.push({ name: 'Original', value: baseHex.replace('#', ''), category: 'original' });

  // Version foncée
  const dark = rgbToHex(
    Math.max(0, rgb.r - 40),
    Math.max(0, rgb.g - 40),
    Math.max(0, rgb.b - 40)
  );
  variations.push({ name: 'Foncé', value: dark.replace('#', ''), category: 'fonce' });

  // Version très foncée
  const veryDark = rgbToHex(
    Math.max(0, rgb.r - 80),
    Math.max(0, rgb.g - 80),
    Math.max(0, rgb.b - 80)
  );
  variations.push({ name: 'Très foncé', value: veryDark.replace('#', ''), category: 'tres-fonce' });

  return variations;
};

// Interface pour définir les couleurs d'une section
interface SectionColors {
  background?: string;
  title?: string;
  content?: string;
}

// Composant ColorToneSelector
const ColorToneSelector: React.FC<{
  baseColor: string;
  element: 'background' | 'title' | 'content';
  onColorSelect: (color: string) => void;
  currentColors: SectionColors;
}> = ({ baseColor, element, onColorSelect, currentColors }: {
  baseColor: string;
  element: 'background' | 'title' | 'content';
  onColorSelect: (color: string) => void;
  currentColors: SectionColors;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const variations = generateColorVariations(baseColor);

  const currentValue = currentColors[element] || (element === 'background' ? 'transparent' : 'ffffff');

  return (
    <div className="relative">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${currentValue === baseColor.replace('#', '') ? 'border-violet-500 shadow-md' : 'border-gray-300'
          }`}
        style={{ backgroundColor: baseColor }}
        title={`Tons de ${baseColor}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-white drop-shadow-md" />
          ) : (
            <ChevronRight className="w-3 h-3 text-white drop-shadow-md" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[180px]">
          <div className="text-xs font-medium text-gray-700 mb-2">Variations de ton</div>
          <div className="grid grid-cols-6 gap-1">
            {variations.map((variation) => (
              <div
                key={`${baseColor}-${variation.category}`}
                onClick={() => {
                  onColorSelect(variation.value);
                  setIsExpanded(false);
                }}
                className={`w-6 h-6 rounded border transition-all duration-200 hover:scale-110 ${currentValue === variation.value ? 'border-violet-500 shadow-md' : 'border-gray-300'
                  }`}
                style={{ backgroundColor: `#${variation.value}` }}
                title={variation.name}
              />
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {variations.map(v => v.name).join(' → ')}
          </div>
        </div>
      )}
    </div>
  );
};

interface StyleControlsProps {
  customFont: string;
  setCustomFont: (font: string) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
  titleColor: string;
  setTitleColor: (color: string) => void;
  layoutColumns?: number;
  setLayoutColumns?: (columns: number) => void;
  sectionSpacing?: 0 | 1 | 2 | 3 | 4;
  setSectionSpacing?: (spacing: 0 | 1 | 2 | 3 | 4) => void;
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
  columnRatio?: '1/2-1/2' | '1/3-2/3' | '2/3-1/3';
  setColumnRatio?: (ratio: '1/2-1/2' | '1/3-2/3' | '2/3-1/3') => void;
  hasPhoto?: boolean;
  sections?: SectionConfig[];
  setSectionsOrder?: (sections: SectionConfig[]) => void;
  toggleSectionVisibility?: (sectionId: string) => void;
  pageMarginHorizontal?: number;
  setPageMarginHorizontal?: (margin: number) => void;
  pageMarginVertical?: number;
  setPageMarginVertical?: (margin: number) => void;
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
  columnRatio = '1/2-1/2',
  setColumnRatio,
  hasPhoto,
  sections,
  setSectionsOrder,
  toggleSectionVisibility,
  pageMarginHorizontal = 20,
  setPageMarginHorizontal,
  pageMarginVertical = 20,
  setPageMarginVertical
}) => {
  const { sectionColors, updateSectionElementColor, sectionSpacing, setSectionSpacing, cleanupLayers } = useCVCreator();

  // Utiliser directement les sections passées en props, elles sont déjà réactives
  const contextSections = sections || [];

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
        <div className="bg-violet-50 rounded-lg shadow-sm p-3 mb-4 -mt-2 -ml-1 -mr-1 text-center text-sm text-gray-500">
          Veuillez d'abord télécharger une photo pour voir les options de style.
        </div>
      );
    }
    return (
      <div data-controls className="bg-violet-50 rounded-lg shadow-sm p-3 mb-4 -mt-2 -ml-1 -mr-1">
        {/* Première ligne de contrôles */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Forme photo</label>
            <div className="flex gap-1">
              <div
                onClick={() => setPhotoShape?.('circle')}
                className={`p-1 rounded transition-all duration-200 ${photoShape === 'circle'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo ronde"
              >
                <Circle className="w-4 h-4" />
              </div>
              <div
                onClick={() => setPhotoShape?.('square')}
                className={`p-1 rounded transition-all duration-200 ${photoShape === 'square'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo carrée"
              >
                <Square className="w-4 h-4" />
              </div>
              <div
                onClick={() => setPhotoShape?.('rounded')}
                className={`p-1 rounded transition-all duration-200 ${photoShape === 'rounded'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo arrondie"
              >
                <div className="w-4 h-4 border border-current rounded" />
              </div>
            </div>
          </div>
          {/* { /* Taille photo */}
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Taille photo</label>
            <div className="flex gap-1">
              <div
                onClick={() => setPhotoSize?.('small')}
                className={`px-2 py-1 rounded text-xs transition-all duration-200 ${photoSize === 'small'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Petite photo"
              >
                S
              </div>
              <div
                onClick={() => setPhotoSize?.('medium')}
                className={`px-2 py-1 rounded text-xs transition-all duration-200 ${photoSize === 'medium'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo moyenne"
              >
                M
              </div>
              <div
                onClick={() => setPhotoSize?.('large')}
                className={`px-2 py-1 rounded text-xs transition-all duration-200 ${photoSize === 'large'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Grande photo"
              >
                L
              </div>
            </div>
          </div>
          {/* Alignement photo */}
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Alignement photo</label>
            <div className="flex gap-1">
              <div
                onClick={() => setPhotoAlignment?.('left')}
                className={`p-1 rounded transition-all duration-200 ${photoAlignment === 'left'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo à gauche"
              >
                <AlignLeft className="w-4 h-4" />
              </div>
              <div
                onClick={() => setPhotoAlignment?.('center')}
                className={`p-1 rounded transition-all duration-200 ${photoAlignment === 'center'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo centrée"
              >
                <AlignCenter className="w-4 h-4" />
              </div>
              <div
                onClick={() => setPhotoAlignment?.('right')}
                className={`p-1 rounded transition-all duration-200 ${photoAlignment === 'right'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-violet-100'
                  }`}
                title="Photo à droite"
              >
                <AlignRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Ajustement</label>
            <div className="flex gap-1">
              <div
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
              </div>
            </div>
          </div>
        </div>


        {/* Deuxième ligne - Ajustements d'image */}
        <div className="flex items-start gap-4 pt-4 border-t border-violet-200">
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Zoom ({photoZoom}%)</label>
            <div className="flex gap-1">
              <div
                onClick={() => setPhotoZoom?.(Math.max((photoZoom || 100) - 10, 50))}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Dézoomer"
              >
                <ZoomOut className="w-4 h-4" />
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={photoZoom}
                onChange={(e) => setPhotoZoom?.(parseInt(e.target.value))}
                className="w-16 h-6"
                title="Ajuster le zoom"
              />
              <div
                onClick={() => setPhotoZoom?.(Math.min((photoZoom || 100) + 10, 200))}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Zoomer"
              >
                <ZoomIn className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Position X ({photoPositionX}px)</label>
            <div className="flex gap-1">
              <div
                onClick={() => setPhotoPositionX?.((photoPositionX || 0) - 5)}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Déplacer à gauche"
              >
                <Move className="w-4 h-4 transform -rotate-90" />
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={photoPositionX}
                onChange={(e) => setPhotoPositionX?.(parseInt(e.target.value))}
                className="w-16 h-6"
                title="Ajuster position horizontale"
              />
              <div
                onClick={() => setPhotoPositionX?.((photoPositionX || 0) + 5)}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Déplacer à droite"
              >
                <Move className="w-4 h-4 transform rotate-90" />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Position Y ({photoPositionY}px)</label>
            <div className="flex gap-1">
              <div
                onClick={() => setPhotoPositionY?.((photoPositionY || 0) - 5)}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Déplacer vers le haut"
              >
                <Move className="w-4 h-4" />
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={photoPositionY}
                onChange={(e) => setPhotoPositionY?.(parseInt(e.target.value))}
                className="w-16 h-6"
                title="Ajuster position verticale"
              />
              <div
                onClick={() => setPhotoPositionY?.((photoPositionY || 0) + 5)}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Déplacer vers le bas"
              >
                <Move className="w-4 h-4 transform rotate-180" />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Rotation ({photoRotation}°)</label>
            <div className="flex gap-1">
              <div
                onClick={() => setPhotoRotation?.((photoRotation || 0) - 15)}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Rotation gauche"
              >
                <RotateCw className="w-4 h-4 transform scale-x-[-1]" />
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={photoRotation}
                onChange={(e) => setPhotoRotation?.(parseInt(e.target.value))}
                className="w-16 h-6"
                title="Ajuster la rotation"
              />
              <div
                onClick={() => setPhotoRotation?.((photoRotation || 0) + 15)}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Rotation droite"
              >
                <RotateCw className="w-4 h-4" />
              </div>
            </div>
          </div>


          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Réinitialiser</label>
            <div className="flex gap-1">
              <div
                onClick={handleResetAdjustments}
                className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                title="Réinitialiser les styles de la photo"
              >
                <RotateCcw className="w-4 h-4" />
              </div>
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

  // Toujours afficher les contrôles de base (police et mise en page) en premier
  const renderBasicControls = () => (
    <div className="flex items-start gap-2">
      <div className="flex-shrink-0">
        <label className="block text-sm font-medium mb-2">Police</label>
        <div className="w-full">
          <CustomSelect
            value={customFont}
            onChange={setCustomFont}
            options={fontOptions}
          />
        </div>
      </div>
      {/* Mise en page */}
        <div className="flex-shrink-0">
          <div>
            <label className="block text-sm font-medium mb-2">Mise en page</label>
          </div>
          <div className="flex gap-2 top-2">
            <div className=''>
              <div
                onClick={() => {
                  const newColumns = layoutColumns === 1 ? 2 : 1;
                  setLayoutColumns?.(newColumns);

                  // Ajuster automatiquement la disposition des sections selon le ratio de colonnes
                  if (contextSections && setSectionsOrder) {
                    if (newColumns === 2) {
                      // Passer en mode 2 colonnes selon le ratio sélectionné
                      const updatedSections = contextSections.map(section => {
                        if (section.id === 'name' || section.id === 'profile') {
                          return { ...section, width: 'full' as const };
                        } else {
                          // Appliquer le ratio de colonnes
                          if (columnRatio === '1/3-2/3') {
                            return { ...section, width: section.order === 0 ? '1/3' as const : '2/3' as const };
                          } else if (columnRatio === '2/3-1/3') {
                            return { ...section, width: section.order === 0 ? '2/3' as const : '1/3' as const };
                          } else {
                            // Par défaut 1/2-1/2
                            return { ...section, width: 'half' as const };
                          }
                        }
                      });
                      setSectionsOrder?.(cleanupLayers(updatedSections));
                    } else {
                      // Passer en mode 1 colonne : toutes les sections en full
                      const updatedSections = contextSections.map(section => ({
                        ...section,
                        width: 'full' as const
                      }));
                      setSectionsOrder?.(cleanupLayers(updatedSections));
                    }
                  }
                }}
                className="cursor-pointer leading-none p-0 flex items-center justify-center w-7 h-8 rounded-md text-sm font-medium transition-all bg-violet-500 text-white shadow-md hover:bg-violet-600 hover:shadow-lg"
                title={layoutColumns === 1 ? "Passer à deux colonnes" : "Passer à une colonne"}
              >
                {layoutColumns === 1 ? (
                  <Columns className="w-4 h-4" />
                ) : (
                  <RectangleVertical className="w-4 h-4" />
                )}
              </div>
            </div>
            {/* Combo ratio colonnes - visible seulement en mode 2 colonnes */}
            {layoutColumns === 2 && (
              <div className="w-full">
                <CustomSelect
                  value={columnRatio}
                  onChange={(value) => {
                    console.log('Changing column ratio from', columnRatio, 'to', value);
                    const newRatio = value as '1/2-1/2' | '1/3-2/3' | '2/3-1/3' ;
                    setColumnRatio?.(newRatio);

                    // Appliquer immédiatement le nouveau ratio aux sections existantes
                    if (contextSections && setSectionsOrder) {
                      const updatedSections = contextSections.map(section => {
                        if (section.id === 'name' || section.id === 'profile') {
                          return { ...section, width: 'full' as const };
                        } else {
                          // Appliquer le nouveau ratio à toutes les autres sections
                          if (newRatio === '1/3-2/3') {
                            return { ...section, width: section.order === 0 ? '1/3' as const : '2/3' as const };
                          } else if (newRatio === '2/3-1/3') {
                            return { ...section, width: section.order === 0 ? '2/3' as const : '1/3' as const };
                          } else {
                            return { ...section, width: 'half' as const };
                          }
                        }
                      });
                      setSectionsOrder?.(cleanupLayers(updatedSections));
                    }
                  }}
                  options={[
                    { value: '1/2-1/2', label: '1/2-1/2' },
                    { value: '1/3-2/3', label: '1/3-2/3' },
                    { value: '2/3-1/3', label: '2/3-1/3' }
                  ]}
                />
              </div>
            )}
          </div>
        </div>
        
    </div>
        
  );

  // Afficher les contrôles généraux quand aucune section n'est sélectionnée
  if (selectedSection === null && sections && toggleSectionVisibility) {
    return (
      <div data-controls className="bg-violet-50 rounded-lg shadow-sm p-2">
        <div className="space-y-4">
          {/* Contrôles principaux */}
          {renderBasicControls()}

          {/* Contrôle d'espacement sur ligne séparée */}
          {setSectionSpacing && (
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
          )}

          {/* Contrôles de marges de la page */}
          {(setPageMarginHorizontal || setPageMarginVertical) && (
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
                      onClick={() => setPageMarginHorizontal?.(Math.max((pageMarginHorizontal || 20) - 5, 0))}
                      className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                      title="Réduire la marge horizontale"
                    >
                      <MinusCircle className="w-3 h-3" />
                    </div>
                    <span className="px-2 py-1 text-xs bg-white rounded border text-gray-700 min-w-[32px] text-center">
                      {pageMarginHorizontal || 20}
                    </span>
                    <div
                      onClick={() => setPageMarginHorizontal?.(Math.min((pageMarginHorizontal || 20) + 5, 50))}
                      className=" p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                      title="Augmenter la marge horizontale"
                    >
                      <PlusCircle className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Marge verticale */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600 w-16">Vertical</span>
                    <div
                      onClick={() => setPageMarginVertical?.(Math.max((pageMarginVertical || 20) - 5, 0))}
                      className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                      title="Réduire la marge verticale"
                    >
                      <MinusCircle className="w-3 h-3" />
                    </div>
                    <span className="px-2 py-1 text-xs bg-white rounded border text-gray-700 min-w-[32px] text-center">
                      {pageMarginVertical || 20}
                    </span>
                    <div
                      onClick={() => setPageMarginVertical?.(Math.min((pageMarginVertical || 20) + 5, 50))}
                      className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                      title="Augmenter la marge verticale"
                    >
                      <PlusCircle className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contrôles de couleurs globales */}
          <div className="flex flex-col gap-4 pt-4 border-t border-violet-200">
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
          </div>

          {/* Visibilité des sections */}
          <div className="pt-4 border-t border-violet-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Visibilité des sections</h3>
            <div className="grid grid-cols-1 gap-2">
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
      </div>
    );
  }

  // Pour toutes les autres sections, afficher les contrôles appropriés
  return (
    <div data-controls className="bg-violet-50 rounded-lg shadow-sm p-3 mb-4 -mt-2 -ml-1 -mr-1">
      <div className="flex flex-col gap-2">
        {/* Contrôles de police */}
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium mb-2">Police</label>
            <div className="w-full">
              <CustomSelect
                value={customFont}
                onChange={setCustomFont}
                options={fontOptions}
              />
            </div>
          </div>
          {/* Mise en page - visible seulement si aucune section n'est sélectionnée */}
          {selectedSection === null && (
            <div className="flex-shrink-0">
              <div>
                <label className="block text-sm font-medium mb-2">Mise en page</label>
              </div>
              <div className="flex gap-2 top-2">
                <div className=''>
                  <div
                    onClick={() => {
                      const newColumns = layoutColumns === 1 ? 2 : 1;
                      setLayoutColumns?.(newColumns);

                      // Ajuster automatiquement la disposition des sections selon le ratio de colonnes
                      if (contextSections && setSectionsOrder) {
                        if (newColumns === 2) {
                          // Passer en mode 2 colonnes selon le ratio sélectionné
                          const updatedSections = contextSections.map(section => {
                            if (section.id === 'name' || section.id === 'profile') {
                              return { ...section, width: 'full' as const };
                            } else {
                              // Appliquer le ratio de colonnes
                              if (columnRatio === '1/3-2/3') {
                                return { ...section, width: section.order === 0 ? '1/3' as const : '2/3' as const };
                              } else if (columnRatio === '2/3-1/3') {
                                return { ...section, width: section.order === 0 ? '2/3' as const : '1/3' as const };
                              } else {
                                // Par défaut 1/2-1/2
                                return { ...section, width: 'half' as const };
                              }
                            }
                          });
                          setSectionsOrder?.(cleanupLayers(updatedSections));
                        } else {
                          // Passer en mode 1 colonne : toutes les sections en full
                          const updatedSections = contextSections.map(section => ({
                            ...section,
                            width: 'full' as const
                          }));
                          setSectionsOrder?.(cleanupLayers(updatedSections));
                        }
                      }
                    }}
                    className="cursor-pointer leading-none p-0 flex items-center justify-center w-7 h-8 rounded-md text-sm font-medium transition-all bg-violet-500 text-white shadow-md hover:bg-violet-600 hover:shadow-lg"
                    title={layoutColumns === 1 ? "Passer à deux colonnes" : "Passer à une colonne"}
                  >
                    {layoutColumns === 1 ? (
                      <Columns className="w-4 h-4" />
                    ) : (
                      <RectangleVertical className="w-4 h-4" />
                    )}
                  </div>
                </div>
                {/* Combo ratio colonnes - visible seulement en mode 2 colonnes */}
                {layoutColumns === 2 && (
                  <div className="w-full">
                    <CustomSelect
                      value={columnRatio}
                      onChange={(value) => {
                        console.log('Changing column ratio from', columnRatio, 'to', value);
                        const newRatio = value as '1/2-1/2' | '1/3-2/3' | '2/3-1/3';
                        setColumnRatio?.(newRatio);

                        // Appliquer immédiatement le nouveau ratio aux sections existantes
                        if (contextSections && setSectionsOrder) {
                          const updatedSections = contextSections.map(section => {
                            if (section.id === 'name' || section.id === 'profile') {
                              return { ...section, width: 'full' as const };
                            } else {
                              // Appliquer le nouveau ratio à toutes les autres sections
                              if (newRatio === '1/3-2/3') {
                                return { ...section, width: section.order === 0 ? '1/3' as const : '2/3' as const };
                              } else if (newRatio === '2/3-1/3') {
                                return { ...section, width: section.order === 0 ? '2/3' as const : '1/3' as const };
                              } else {
                                return { ...section, width: 'half' as const };
                              }
                            }
                          });
                          setSectionsOrder?.(cleanupLayers(updatedSections));
                        }
                      }}
                      options={[
                        { value: '1/2-1/2', label: '1/2-1/2' },
                        { value: '1/3-2/3', label: '1/3-2/3' },
                        { value: '2/3-1/3', label: '2/3-1/3' }
                      ]}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {showNameAlignment && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium mb-2">Alignement nom</label>
              <div className="flex gap-1">
                <div
                  onClick={() => setNameAlignment?.('left')}
                  className={`p-1 rounded transition-all duration-200 ${nameAlignment === 'left'
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-violet-100'
                    }`}
                  title="Aligner à gauche"
                >
                  <AlignLeft className="w-4 h-4" />
                </div>
                <div
                  onClick={() => setNameAlignment?.('center')}
                  className={`p-1 rounded transition-all duration-200 ${nameAlignment === 'center'
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-violet-100'
                    }`}
                  title="Centrer"
                >
                  <AlignCenter className="w-4 h-4" />
                </div>
                <div
                  onClick={() => setNameAlignment?.('right')}
                  className={`p-1 rounded transition-all duration-200 ${nameAlignment === 'right'
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-violet-100'
                    }`}
                  title="Aligner à droite"
                >
                  <AlignRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {selectedSection === 'name' && (
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium mb-2">Taille police nom</label>
                <div className="flex gap-1">
                  <div
                    onClick={() => setNameFontSize?.(Math.max((nameFontSize || 18) - 2, 12))}
                    className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                    title="Diminuer la taille"
                  >
                    <Minus className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-1 text-xs bg-white rounded border text-gray-700 min-w-[32px] text-center">
                    {nameFontSize || 18}
                  </span>
                  <div
                    onClick={() => setNameFontSize?.(Math.min((nameFontSize || 18) + 2, 36))}
                    className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
                    title="Augmenter la taille"
                  >
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contrôles d'alignement pour les sections (sauf photo et nom) */}
        {selectedSection && selectedSection !== 'photo' && selectedSection !== 'name' && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium mb-2">Alignement section</label>
              <div className="flex gap-1">
                <div
                  onClick={() => {
                    // Mettre à jour l'alignement de la section dans la configuration
                    if (contextSections && setSectionsOrder) {
                      const updatedSections = contextSections.map(section =>
                        section.id === selectedSection
                          ? { ...section, alignment: 'left' as const }
                          : section
                      );
                      setSectionsOrder?.(updatedSections);
                    }
                  }}
                  className={`p-1 rounded transition-all duration-200 ${contextSections?.find(s => s.id === selectedSection)?.alignment === 'left'
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-violet-100'
                    }`}
                  title="Aligner à gauche"
                >
                  <AlignLeft className="w-4 h-4" />
                </div>
                <div
                  onClick={() => {
                    if (contextSections && setSectionsOrder) {
                      const updatedSections = contextSections.map(section =>
                        section.id === selectedSection
                          ? { ...section, alignment: 'center' as const }
                          : section
                      );
                      setSectionsOrder?.(updatedSections);
                    }
                  }}
                  className={`p-1 rounded transition-all duration-200 ${contextSections?.find(s => s.id === selectedSection)?.alignment === 'center' || !contextSections?.find(s => s.id === selectedSection)?.alignment
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-violet-100'
                    }`}
                  title="Centrer"
                >
                  <AlignCenter className="w-4 h-4" />
                </div>
                <div
                  onClick={() => {
                    if (contextSections && setSectionsOrder) {
                      const updatedSections = contextSections.map(section =>
                        section.id === selectedSection
                          ? { ...section, alignment: 'right' as const }
                          : section
                      );
                      setSectionsOrder?.(updatedSections);
                    }
                  }}
                  className={`p-1 rounded transition-all duration-200 ${contextSections?.find(s => s.id === selectedSection)?.alignment === 'right'
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-violet-100'
                    }`}
                  title="Aligner à droite"
                >
                  <AlignRight className="w-4 h-4" />
                </div>
              </div>
            </div>
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
      </div>
    </div>
  );
};

// Helper function to get section display name
const getSectionName = (sectionId: string): string => {
  const sectionNames: Record<string, string> = {
    'name': 'Nom',
    'profile': 'Profil',
    'contact': 'Contact',
    'experience': 'Expériences',
    'education': 'Formations',
    'skills': 'Compétences',
    'languages': 'Langues'
  };
  return sectionNames[sectionId] || sectionId;
};
