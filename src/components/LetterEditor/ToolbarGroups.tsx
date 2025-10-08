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
  Ruler,
  Sparkles,
  CheckCircle,
  Lightbulb,
  Search
} from 'lucide-react';
import { FontSelector } from './FontSelector';
import { FontSizeSelector } from './FontSizeSelector';
import { ColorPicker } from './ColorPicker';
import { FormatButtons } from './FormatButtons';
import { AlignmentButtons } from './AlignmentButtons';
import { ExportButtons } from './ExportButtons';

interface ToolbarGroupsProps {
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
  onAIAction: () => void;
  onSearch?: () => void;

  // Export
  onSave: () => void;
  onExportPDF: () => void;
  onExportWord?: () => void;
  onExportText?: () => void;
  onExportATSOptimizedPDF?: () => void;
  onAnalyzeTone?: () => void;
  onCheckGrammar?: () => void;
  onStyleSuggestions?: () => void;
  onATSAnalysis?: () => void;

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
  isAILoading?: boolean;
}

export const getToolbarGroups = (props: ToolbarGroupsProps) => {
  return [
    {
      id: 'export',
      title: 'Export',
      position: 0,
      component: (
        <ExportButtons
          onSave={props.onSave}
          onExportPDF={props.onExportPDF}
          onExportWord={props.onExportWord}
          onExportText={props.onExportText}
          onExportATSOptimizedPDF={props.onExportATSOptimizedPDF}
          onAnalyzeTone={props.onAnalyzeTone}
          onATSAnalysis={props.onATSAnalysis}
        />
      )
    },
    {
      id: 'history',
      title: 'Historique',
      position: 1,
      component: (
        <div className="flex items-center gap-1">
          <button
            onClick={props.onUndo}
            className="p-1.5 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
            title="Annuler (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={props.onRedo}
            className="p-1.5 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
            title="Refaire (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      id: 'format',
      title: 'Formatage',
      position: 2,
      component: (
        <FormatButtons onFormatCommand={props.onFormatCommand} />
      )
    },
    {
      id: 'font',
      title: 'Police',
      position: 3,
      component: (
        <div className="flex items-center gap-1">
          <FontSelector
            currentFont={props.currentFont}
            onFontChange={props.onFontChange}
            showFontFamily={props.showFontFamily}
            onToggleFontFamily={props.onToggleFontFamily}
          />
          <FontSizeSelector
            currentFontSize={props.currentFontSize}
            onFontSizeChange={props.onFontSizeChange}
            showFontSize={props.showFontSize}
            onToggleFontSize={props.onToggleFontSize}
          />
        </div>
      )
    },
    {
      id: 'color',
      title: 'Couleur',
      position: 4,
      component: (
        <ColorPicker
          onColorChange={props.onColorChange}
          showColorPicker={props.showColorPicker}
          onToggleColorPicker={props.onToggleColorPicker}
        />
      )
    },
    {
      id: 'alignment',
      title: 'Alignement',
      position: 5,
      component: (
        <AlignmentButtons onAlignCommand={props.onAlignCommand} />
      )
    },
    {
      id: 'insert',
      title: 'Insertion',
      position: 6,
      component: (
        <div className="flex items-center gap-1">
          <button
            onClick={props.onInsertLink}
            className="p-1.5 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
            title="Insérer un lien"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            onClick={props.onInsertImage}
            className="p-1.5 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
            title="Insérer une image"
          >
            <Image className="w-4 h-4" />
          </button>
          {props.onSearch && (
            <button
              onClick={props.onSearch}
              className="p-1.5 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
              title="Rechercher et remplacer"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    },
    {
      id: 'ai',
      title: 'IA',
      position: 7,
      component: (
        <div className="flex items-center gap-1">
          <button
            onClick={props.onAIAction}
            disabled={props.isAILoading}
            className={`
              p-1.5 rounded transition-all duration-200 relative overflow-hidden
              ${props.isAILoading
                ? 'text-purple-600 bg-gradient-to-r from-purple-100 to-indigo-100 cursor-not-allowed shadow-lg shadow-purple-200'
                : 'text-gray-700 hover:bg-purple-100 hover:text-indigo-600 cursor-pointer hover:scale-105 active:scale-95'
              }
            `}
            title={props.isAILoading ? 'IA en cours de traitement...' : 'Assistant IA'}
          >
            {props.isAILoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 animate-pulse" />
            )}
            <Sparkles className={`
              w-4 h-4 transition-all duration-300 relative z-10
              ${props.isAILoading ? 'animate-pulse text-purple-600 scale-110' : 'text-gray-700'}
            `} />
            {props.isAILoading && (
              <>
                <div className="absolute -top-1 -right-1 z-20">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-bounce shadow-lg" />
                </div>
                <div className="absolute -bottom-1 -left-1 z-20">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                </div>
                <div className="absolute top-0 left-0 w-full h-full rounded animate-pulse">
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent animate-shimmer" />
                </div>
              </>
            )}
          </button>

          <button
            onClick={props.onCheckGrammar}
            disabled={props.isAILoading}
            className={`
              p-1.5 rounded transition-all duration-200
              ${props.isAILoading
                ? 'text-green-600 bg-green-100 cursor-not-allowed'
                : 'text-gray-700 hover:bg-green-100 hover:text-green-600 cursor-pointer'
              }
            `}
            title="Vérifier la grammaire"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          {props.onStyleSuggestions && (
            <button
              onClick={props.onStyleSuggestions}
              disabled={props.isAILoading}
              className={`
                p-1.5 rounded transition-all duration-200
                ${props.isAILoading
                  ? 'text-blue-600 bg-blue-100 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600 cursor-pointer'
                }
              `}
              title="Suggestions stylistiques"
            >
              <Lightbulb className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    },
    {
      id: 'view',
      title: 'Affichage',
      position: 8,
      component: (
        <div className="flex items-center gap-1">
          <button
            onClick={props.onToggleSidebar}
            className={`p-2 rounded transition-colors ${
              props.showSidebar
                ? 'bg-purple-100 text-indigo-600 hover:bg-purple-200'
                : 'text-gray-700 hover:bg-purple-100 hover:text-indigo-600'
            }`}
            title={props.showSidebar ? 'Masquer la barre latérale' : 'Afficher la barre latérale'}
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={props.onToggleBorders}
            className={`p-2 rounded transition-colors ${
              props.showBorders
                ? 'bg-purple-100 text-indigo-600 hover:bg-purple-200'
                : 'text-gray-700 hover:bg-purple-100 hover:text-indigo-600'
            }`}
            title={props.showBorders ? 'Masquer les bordures' : 'Afficher les bordures'}
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={props.onToggleMarginGuides}
            className={`p-2 rounded transition-colors ${
              props.showMarginGuides
                ? 'bg-purple-100 text-indigo-600 hover:bg-purple-200'
                : 'text-gray-700 hover:bg-purple-100 hover:text-indigo-600'
            }`}
            title={props.showMarginGuides ? 'Masquer les guides de marges' : 'Afficher les guides de marges'}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      id: 'advanced',
      title: 'Avancé',
      position: 9,
      component: (
        <div className="flex items-center gap-1">
          <button
            onClick={props.onOpenRulesModal}
            className="p-1.5 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
            title="Paramètres des marges"
          >
            <Ruler className="w-4 h-4" />
          </button>

          <button
            onClick={props.onToggleMultiplePages}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              props.allowMultiplePages
                ? 'bg-purple-100 text-indigo-600 hover:bg-purple-200'
                : 'text-gray-700 hover:bg-purple-100 hover:text-indigo-600'
            }`}
            title={props.allowMultiplePages ? 'Mode page unique' : 'Mode multi-pages'}
          >
            {props.allowMultiplePages ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span>{props.allowMultiplePages ? 'Multi' : 'Single'}</span>
          </button>
        </div>
      )
    }
  ];
};
