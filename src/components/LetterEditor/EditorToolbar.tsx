import React, { useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image,
  Save,
  Undo2,
  Redo2,
  Type,
  Palette,
  FileUp,
  Printer,
  Menu,
  X,
  Ruler,
  Square,
  FileText,

} from 'lucide-react';

interface EditorToolbarProps {
  onSave: () => void;
  onExportPDF: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePreview: () => void;
  isPreview: boolean;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  onFormatCommand: (command: string, value?: string) => void;
  onInsertLink: () => void;
  onInsertImage: () => void;
  onFontChange: (font: string) => void;
  onFontSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
  currentFont: string;
  currentFontSize: string;
  showFontFamily: boolean;
  showFontSize: boolean;
  showColorPicker: boolean;
  onToggleFontFamily: () => void;
  onToggleFontSize: () => void;
  onToggleColorPicker: () => void;
  showMarginGuides: boolean;
  onToggleMarginGuides: () => void;
  showBorders: boolean;
  onToggleBorders: () => void;
  onOpenRulesModal?: () => void;
  allowMultiplePages: boolean;
  onToggleMultiplePages: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onSave,
  onExportPDF,
  onUndo,
  onRedo,
  showSidebar,
  onToggleSidebar,
  onFormatCommand,
  onInsertLink,
  onInsertImage,
  onFontChange,
  onFontSizeChange,
  onColorChange,
  currentFont,
  currentFontSize,
  showFontFamily,
  showFontSize,
  showColorPicker,
  onToggleFontFamily,
  onToggleFontSize,
  onToggleColorPicker,
  
  
  showBorders,
  onToggleBorders,
  onOpenRulesModal,
  allowMultiplePages,
  onToggleMultiplePages
}) => {
  const fontFamilyRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const colors = [
    '#000000', '#333333', '#666666', '#999999',
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#008000', '#800000', '#000080', '#808000'
  ];

  const fontSizes = ['8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '28pt', '32pt'];

  const fontFamilies = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Calibri', value: 'Calibri, sans-serif' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
    { name: 'Courier New', value: 'Courier New, monospace' }
  ];

  return (
    <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 p-2 lg:p-3">
      <div className="flex flex-wrap items-center gap-1 lg:gap-2">
        {/* Bouton sidebar mobile */}
        <div className="lg:hidden">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600 rounded transition-colors"
            title="Afficher les templates"
          >
            {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Section Fichier */}
        <div className="flex items-center gap-1 pr-2 lg:pr-3 border-r border-gray-200">
          <button
            onClick={onSave}
            className="p-1.5 lg:p-2 text-gray-600 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors"
            title="Sauvegarder"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={onExportPDF}
            className="p-1.5 lg:p-2 text-red-600 hover:bg-red-50  rounded transition-colors"
            title="Exporter PDF"
          >
            <FileUp className="w-4 h-4" />
          </button>
        </div>

        {/* Section Édition */}
        <div className="flex items-center gap-1 pr-2 lg:pr-3 border-r border-gray-200">
          <button
            onClick={onUndo}
            className="p-1.5 lg:p-2 text-gray-600 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors"
            title="Annuler"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            className="p-1.5 lg:p-2 text-gray-600 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors"
            title="Rétablir"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Section Formatage */}
        <div className="flex items-center gap-1 pr-2 lg:pr-3 border-r border-gray-200">
          <button
            onClick={() => onFormatCommand('bold')}
            className="p-1.5 lg:p-2 text-gray-700 hover:bg-violet-50  hover:text-indigo-600 rounded transition-colors font-bold"
            title="Gras"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => onFormatCommand('italic')}
            className="p-1.5 lg:p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors italic"
            title="Italique"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => onFormatCommand('underline')}
            className="p-1.5 lg:p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors underline"
            title="Souligné"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        {/* Section Police et taille */}
        <div className="flex items-center gap-1 pr-2 lg:pr-3 border-r border-gray-200">
          {/* Menu famille de police */}
          <div className="relative font-family" ref={fontFamilyRef}>
            <button
              onClick={onToggleFontFamily}
              className="p-1.5 lg:p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors flex items-center gap-1 min-w-[80px] lg:min-w-[100px]"
              title="Police"
            >
              <Type className="w-4 h-4" />
              <span className="text-xs truncate hidden sm:inline">{currentFont}</span>
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showFontFamily && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-20 min-w-[180px] max-h-60 overflow-y-auto font-family">
                <div className="py-1">
                  {fontFamilies.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => {
                        onFontChange(font.value);
                        onToggleFontFamily();
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between"
                      style={{ fontFamily: font.value }}
                    >
                      <span>{font.name}</span>
                      {currentFont === font.name && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Menu taille de police */}
          <div className="relative font-size" ref={fontSizeRef}>
            <button
              onClick={onToggleFontSize}
              className="p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors flex items-center gap-1"
              title="Taille"
            >
              <span className="text-xs font-mono">{currentFontSize}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showFontSize && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-20 min-w-[120px] max-h-48 overflow-y-auto font-size">
                <div className="py-1">
                  {fontSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        onFontSizeChange(size);
                        onToggleFontSize();
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between font-mono"
                    >
                      <span>{size}</span>
                      {currentFontSize === size && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sélecteur de couleur */}
          <div className="relative color-picker" ref={colorPickerRef}>
            <button
              onClick={onToggleColorPicker}
              className="p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors"
              title="Couleur du texte"
            >
              <Palette className="w-4 h-4" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-20 min-w-[200px] color-picker">
                <div className="p-3">
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          onColorChange(color);
                          onToggleColorPicker();
                        }}
                        className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Cliquez sur une couleur pour l'appliquer
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Alignement */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
          <button
            onClick={() => onFormatCommand('justifyLeft')}
            className="p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors"
            title="Aligner à gauche"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onFormatCommand('justifyCenter')}
            className="p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors"
            title="Centrer"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => onFormatCommand('justifyRight')}
            className="p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors"
            title="Aligner à droite"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onFormatCommand('justifyFull')}
            className="p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors"
            title="Justifier"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Section Listes */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
          <button
            onClick={() => onFormatCommand('insertUnorderedList')}
            className="p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors"
            title="Liste à puces"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onFormatCommand('insertOrderedList')}
            className="p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors"
            title="Liste numérotée"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Section Liens et Images */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
          <button
            onClick={onInsertLink}
            className="p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors"
            title="Insérer un lien"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            onClick={onInsertImage}
            className="p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 hover:text-indigo-600 rounded transition-colors"
            title="Insérer une image"
          >
            <Image className="w-4 h-4" />
          </button>
        </div>

        {/* Section Aperçu et Guides */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenRulesModal}
            className="p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 hover:text-indigo-600 rounded transition-colors"
            title="Règles de l'éditeur"
          >
            <Ruler className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleMultiplePages}
            className={`p-2 rounded transition-colors ${
              allowMultiplePages
              ? 'text-green-600 bg-green-50 hover:text-green-600'
              : 'text-gray-700 hover:bg-violet-50 hover:text-indigo-600'
            }`}
            title={allowMultiplePages ? "Pages multiples activées" : "Activer les pages multiples"}
          >
            <FileText className="w-4 h-4" />
          </button>
         
          <button
            onClick={onToggleBorders}
            className={`p-2 rounded transition-colors ${
              showBorders
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-gray-700 hover:bg-violet-50'
            }`}
            title="Afficher/masquer les bordures"
          >
            <Square className="w-4 h-4" />
          </button>
         
          <button
            onClick={onExportPDF}
            className="p-2 text-gray-700 hover:bg-violet-50 hover:text-indigo-600 rounded transition-colors"
            title="Imprimer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
