import React from 'react';
import {
  Undo2,
  Redo2,
  Link,
  Image,
  Grid3x3,
  Square,
  FileText,
  ToggleLeft,
  ToggleRight,
  
  Ruler
} from 'lucide-react';
import { FontSelector } from './FontSelector';
import { FontSizeSelector } from './FontSizeSelector';
import { ColorPicker } from './ColorPicker';
import { FormatButtons } from './FormatButtons';
import { AlignmentButtons } from './AlignmentButtons';
import { ExportButtons } from './ExportButtons';

interface NewToolbarProps {
  // Formatage
  currentFont: string;
  currentFontSize: string;
  showFontFamily: boolean;
  showFontSize: boolean;
  showColorPicker: boolean;
  onFontChange: (font: string) => void;
  onFontSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
  onToggleFontFamily: () => void;
  onToggleFontSize: () => void;
  onToggleColorPicker: () => void;
  onFormatCommand: (command: string) => void;
  onAlignCommand: (alignment: 'left' | 'center' | 'right' | 'justify') => void;

  // Actions
  onUndo: () => void;
  onRedo: () => void;
  onInsertLink: () => void;
  onInsertImage: () => void;

  // Export
  onSave: () => void;
  onExportPDF: () => void;
  onTogglePreview: () => void;
  isPreview: boolean;

  // Options
  showSidebar: boolean;
  onToggleSidebar: () => void;
  showMarginGuides: boolean;
  onToggleMarginGuides: () => void;
  showBorders: boolean;
  onToggleBorders: () => void;
  onOpenRulesModal: () => void;
  allowMultiplePages: boolean;
  onToggleMultiplePages: () => void;
}

export const NewToolbar: React.FC<NewToolbarProps> = ({
  // Formatage
  currentFont,
  currentFontSize,
  showFontFamily,
  showFontSize,
  showColorPicker,
  onFontChange,
  onFontSizeChange,
  onColorChange,
  onToggleFontFamily,
  onToggleFontSize,
  onToggleColorPicker,
  onFormatCommand,
  onAlignCommand,

  // Actions
  onUndo,
  onRedo,
  onInsertLink,
  onInsertImage,

  // Export
  onSave,
  onExportPDF,
  onTogglePreview,
  isPreview,

  // Options
  showSidebar,
  onToggleSidebar,
  showMarginGuides,
  onToggleMarginGuides,
  showBorders,
  onToggleBorders,
  onOpenRulesModal,
  allowMultiplePages,
  onToggleMultiplePages,
}) => {
  return (
    <div className="bg-white rounded-t-lg shadow-lg border-b border-gray-200">
      {/* Première ligne : Actions principales et formatage de base */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-100">
        {/* Section gauche : Actions principales */}
        <div className="flex items-center gap-2">
          <ExportButtons
            onSave={onSave}
            onExportPDF={onExportPDF}
            onTogglePreview={onTogglePreview}
            isPreview={isPreview}
          />
        </div>

        {/* Section centre : Formatage de base */}
        <div className="flex items-center gap-1">
          <div className="flex items-center border-r border-gray-300 pr-2">
            <button
              onClick={onUndo}
              className="p-1.5 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
              title="Annuler (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              className="p-1.5 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
              title="Refaire (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <FormatButtons onFormatCommand={onFormatCommand} />

          <div className="border-l border-gray-300 pl-2">
            <FontSelector
              currentFont={currentFont}
              onFontChange={onFontChange}
              showFontFamily={showFontFamily}
              onToggleFontFamily={onToggleFontFamily}
            />
          </div>

          <FontSizeSelector
            currentFontSize={currentFontSize}
            onFontSizeChange={onFontSizeChange}
            showFontSize={showFontSize}
            onToggleFontSize={onToggleFontSize}
          />

          <ColorPicker
            onColorChange={onColorChange}
            showColorPicker={showColorPicker}
            onToggleColorPicker={onToggleColorPicker}
          />
        </div>

        {/* Section droite : Options principales */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded transition-colors ${
              showSidebar
                ? 'bg-purple-100 text-indigo-600 hover:bg-purple-200'
                : 'text-gray-700 hover:bg-purple-100 hover:text-indigo-600'
            }`}
            title={showSidebar ? 'Masquer la barre latérale' : 'Afficher la barre latérale'}
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleBorders}
            className={`p-2 rounded transition-colors ${
              showBorders
                ? 'bg-purple-100 text-indigo-600 hover:bg-purple-200'
                : 'text-gray-700 hover:bg-purple-100 hover:text-indigo-600'
            }`}
            title={showBorders ? 'Masquer les bordures' : 'Afficher les bordures'}
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Deuxième ligne : Options avancées */}
      <div className="flex items-center justify-between px-3 py-1">
        {/* Section gauche : Alignement et insertion */}
        <div className="flex items-center gap-1">
          <AlignmentButtons onAlignCommand={onAlignCommand} />

          <div className="flex items-center border-l border-gray-300 pl-2">
            <button
              onClick={onInsertLink}
              className="p-1.5 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
              title="Insérer un lien"
            >
              <Link className="w-4 h-4" />
            </button>
            <button
              onClick={onInsertImage}
              className="p-1.5 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
              title="Insérer une image"
            >
              <Image className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section droite : Options avancées */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMarginGuides}
            className={`p-2 rounded transition-colors ${
              showMarginGuides
                ? 'bg-purple-100 text-indigo-600 hover:bg-purple-200'
                : 'text-gray-700 hover:bg-purple-100 hover:text-indigo-600'
            }`}
            title={showMarginGuides ? 'Masquer les guides de marges' : 'Afficher les guides de marges'}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRulesModal}
            className="p-1.5 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
            title="Paramètres des marges"
          >
            <Ruler className="w-4 h-4" />
            
          </button>

          <div className="flex items-center border-l border-gray-300 pl-2">
            <button
              onClick={onToggleMultiplePages}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                allowMultiplePages
                  ? 'bg-purple-100 text-indigo-600 hover:bg-purple-200'
                  : 'text-gray-700 hover:bg-purple-100 hover:text-indigo-600'
              }`}
              title={allowMultiplePages ? 'Mode page unique' : 'Mode multi-pages'}
            >
              {allowMultiplePages ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              <span>{allowMultiplePages ? 'Multi' : 'Single'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};