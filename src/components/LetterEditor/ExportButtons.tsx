import React from 'react';
import { Save, FileDown, FileText, BarChart3, FileType, TrendingUp, Target } from 'lucide-react';

interface ExportButtonsProps {
  onSave: () => void;
  onExportPDF: () => void;
  onExportWord?: () => void;
  onExportText?: () => void;
  onExportATSOptimizedPDF?: () => void;
  onAnalyzeTone?: () => void;
  onATSAnalysis?: () => void;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  onSave,
  onExportPDF,
  onExportWord,
  onExportText,
  onExportATSOptimizedPDF,
  onAnalyzeTone,
  onATSAnalysis,
}) => {
  return (
    <div className="flex items-center border-l border-gray-300 pl-2">
      <button
        onClick={onSave}
        className="flex items-center gap-1 px-2 py-1 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
        title="Sauvegarder (Ctrl+S)"
      >
        <Save className="w-4 h-4" />
      </button>

      <button
        onClick={onExportPDF}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-colors ml-1"
        title="Exporter en PDF"
      >
        <FileDown className="w-4 h-4" />
      </button>

      {onExportWord && (
        <button
          onClick={onExportWord}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-colors ml-1"
          title="Exporter en Word"
        >
          <FileText className="w-4 h-4" />
        </button>
      )}

      {onExportText && (
        <button
          onClick={onExportText}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-colors ml-1"
          title="Exporter en texte ATS"
        >
          <FileType className="w-4 h-4" />
        </button>
      )}

      {onExportATSOptimizedPDF && (
        <button
          onClick={onExportATSOptimizedPDF}
          className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded transition-colors ml-1"
          title="Exporter en PDF optimisé ATS"
        >
          <Target className="w-4 h-4" />
          <span className="text-xs font-medium">PDF ATS</span>
        </button>
      )}

      {onAnalyzeTone && (
        <button
          onClick={onAnalyzeTone}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-colors ml-1"
          title="Analyser le ton et l'équilibre"
        >
          <BarChart3 className="w-4 h-4" />
        </button>
      )}

      {onATSAnalysis && (
        <button
          onClick={onATSAnalysis}
          className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white hover:bg-green-600 rounded transition-colors ml-1"
          title="Analyse ATS et Export PDF"
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-medium">ATS</span>
        </button>
      )}
    </div>
  );
};
