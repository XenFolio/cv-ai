import React from 'react';
import { CustomSelect } from './CustomSelect';
import { AlignLeft, AlignCenter, AlignRight, Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { useCVCreator } from './CVCreatorContext.hook';
import type { SectionConfig } from './types';
import { PhotoControls } from './stylecontrols/PhotoControls';
import { LayoutControls } from './stylecontrols/LayoutControls';
import { ColorControls } from './stylecontrols/ColorControls';
import { SkillsLayoutControls } from './stylecontrols/SkillsLayoutControls';
import { SectionControls } from './stylecontrols/SectionControls';
import { ModelHeader } from './stylecontrols/ModelHeader';
import { SectionToggles } from './stylecontrols/SectionToggles';
import { SectionHeader } from './stylecontrols/SectionHeader';

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
export const ColorToneSelector: React.FC<{
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

// Helper function to get section display name
export const getSectionName = (sectionId: string): string => {
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
  const {
    sectionColors,
    updateSectionElementColor,
    updateSectionCapitalization,
    capitalizeSections,
    sectionSpacing,
    setSectionSpacing,
    cleanupLayers,
    updateSectionTopBorder,
    sectionTopBorders,
    selectedTemplateName,
    selectedTemplate
  } = useCVCreator();

  // Utiliser directement les sections passées en props, elles sont déjà réactives
  const contextSections = sections || [];

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
      <div data-controls className="bg-violet-50/90 rounded-lg shadow-sm px-2 mb-4 -mt-0">
        <ModelHeader
          selectedTemplate={selectedTemplate}
          selectedTemplateName={selectedTemplateName}
        />

        <SectionHeader
          selectedSection={selectedSection ?? null}
        />

        <PhotoControls
          photoShape={photoShape}
          setPhotoShape={setPhotoShape || (() => {})}
          photoSize={photoSize}
          setPhotoSize={setPhotoSize || (() => {})}
          photoAlignment={photoAlignment}
          setPhotoAlignment={setPhotoAlignment || (() => {})}
          photoObjectFit={photoObjectFit}
          setPhotoObjectFit={setPhotoObjectFit || (() => {})}
          photoZoom={photoZoom}
          setPhotoZoom={setPhotoZoom || (() => {})}
          photoPositionX={photoPositionX}
          setPhotoPositionX={setPhotoPositionX || (() => {})}
          photoPositionY={photoPositionY}
          setPhotoPositionY={setPhotoPositionY || (() => {})}
          photoRotation={photoRotation}
          setPhotoRotation={setPhotoRotation || (() => {})}
          handleResetAdjustments={() => {
            setPhotoZoom?.(100);
            setPhotoPositionX?.(0);
            setPhotoPositionY?.(0);
            setPhotoRotation?.(0);
            setPhotoShape?.('circle');
            setPhotoSize?.('medium');
            setPhotoAlignment?.('center');
          }}
        />
      </div>
    );
  }

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

      <LayoutControls
        layoutColumns={layoutColumns}
        setLayoutColumns={setLayoutColumns || (() => {})}
        columnRatio={columnRatio}
        setColumnRatio={setColumnRatio || (() => {})}
        sections={contextSections}
        setSectionsOrder={setSectionsOrder || (() => {})}
        cleanupLayers={cleanupLayers}
      />
    </div>
  );

  // Afficher les contrôles généraux quand aucune section n'est sélectionnée
  if (selectedSection === null && sections && toggleSectionVisibility) {
    return (
      <div data-controls className="bg-violet-50 rounded-lg shadow-sm px-2">
        <ModelHeader
          selectedTemplate={selectedTemplate}
          selectedTemplateName={selectedTemplateName}
        />
        <SectionHeader
          selectedSection={selectedSection ?? null}
        />

        <div className="space-y-4">
          {/* Contrôles principaux */}
          {renderBasicControls()}

          {/* Contrôles de section */}
          <SectionControls
            sections={sections}
            toggleSectionVisibility={toggleSectionVisibility}
            sectionSpacing={sectionSpacing}
            setSectionSpacing={setSectionSpacing || (() => {})}
            pageMarginHorizontal={pageMarginHorizontal}
            setPageMarginHorizontal={setPageMarginHorizontal || (() => {})}
            pageMarginVertical={pageMarginVertical}
            setPageMarginVertical={setPageMarginVertical || (() => {})}
          />

          {/* Contrôles de couleurs globales */}
          <ColorControls
            selectedSection={selectedSection || null}
            sectionColors={sectionColors}
            availableColors={availableColors}
            titleColor={titleColor}
            setTitleColor={setTitleColor}
            customColor={customColor}
            setCustomColor={setCustomColor}
            updateSectionElementColor={updateSectionElementColor}
            showTextColor={showTextColor}
          />
        </div>
      </div>
    );
  }

  // Pour toutes les autres sections, afficher les contrôles appropriés
  return (
    <div data-controls className="bg-violet-50 rounded-lg shadow-sm p-3 mb-4 -mt-2 -ml-1 -mr-1">
      <ModelHeader
        selectedTemplate={selectedTemplate}
        selectedTemplateName={selectedTemplateName}
      />
      <SectionHeader
        selectedSection={selectedSection ?? null}
      />

      <div className="flex flex-col gap-2">
        {/* Contrôles de police et mise en page */}
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

          {selectedSection === null && (
            <LayoutControls
              layoutColumns={layoutColumns}
              setLayoutColumns={setLayoutColumns || (() => {})}
              columnRatio={columnRatio}
              setColumnRatio={setColumnRatio || (() => {})}
              sections={contextSections}
              setSectionsOrder={setSectionsOrder || (() => {})}
              cleanupLayers={cleanupLayers}
            />
          )}
        </div>

        {/* Contrôles d'alignement pour le nom */}
        {selectedSection === 'name' && (
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

        {/* Contrôles de couleurs */}
        <ColorControls
          selectedSection={selectedSection || null}
          sectionColors={sectionColors}
          availableColors={availableColors}
          titleColor={titleColor}
          setTitleColor={setTitleColor}
          customColor={customColor}
          setCustomColor={setCustomColor}
          updateSectionElementColor={updateSectionElementColor}
          showTextColor={showTextColor}
        />

        {/* Contrôles de disposition pour la section compétences */}
        <SkillsLayoutControls selectedSection={selectedSection || null} />

        {/* Contrôles supplémentaires pour les sections */}
        {selectedSection && selectedSection !== 'photo' && (
          <div className="flex-shrink-0 w-full border-t border-violet-200 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Style de section</span>
            </div>
            <SectionToggles
              capitalizeSections={capitalizeSections}
              updateSectionCapitalization={updateSectionCapitalization}
              sectionTopBorders={sectionTopBorders}
              updateSectionTopBorder={updateSectionTopBorder}
              selectedSection={selectedSection}
            />
          </div>
        )}
      </div>
    </div>
  );
};
