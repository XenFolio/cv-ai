import React from 'react';
import { Save, FileDown, Eye, EyeOff } from 'lucide-react';

interface ExportButtonsProps {
  onSave: () => void;
  onExportPDF: () => void;
  onTogglePreview: () => void;
  isPreview: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  onSave,
  onExportPDF,
  onTogglePreview,
  isPreview,
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

      <button
        onClick={onTogglePreview}
        className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ml-1 ${
          isPreview
            ? 'bg-purple-100 text-indigo-600 hover:bg-purple-200'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        title={isPreview ? 'Mode édition' : 'Mode aperçu'}
      >
        {isPreview ? (
          <>
            <EyeOff className="w-4 h-4" />
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};