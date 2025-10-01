import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface MarginSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface MarginModalProps {
  isVisible: boolean;
  margins: MarginSettings;
  onSave: (margins: MarginSettings) => void;
  onCancel: () => void;
}

export const MarginModal: React.FC<MarginModalProps> = ({
  isVisible,
  margins,
  onSave,
  onCancel,
}) => {
  const [localMargins, setLocalMargins] = useState<MarginSettings>(margins);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Ajuster les marges</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="text-sm text-gray-600 mb-4">
            Définissez les marges du document en millimètres (mm)
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Marge supérieure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Haut
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={localMargins.top}
                  onChange={(e) => setLocalMargins(prev => ({
                    ...prev,
                    top: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-8 top-3 text-gray-400 text-sm">mm</span>
              </div>
            </div>

            {/* Marge inférieure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bas
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={localMargins.bottom}
                  onChange={(e) => setLocalMargins(prev => ({
                    ...prev,
                    bottom: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-8 top-3 text-gray-400 text-sm">mm</span>
              </div>
            </div>

            {/* Marge gauche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gauche
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={localMargins.left}
                  onChange={(e) => setLocalMargins(prev => ({
                    ...prev,
                    left: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-8 top-3 text-gray-400 text-sm">mm</span>
              </div>
            </div>

            {/* Marge droite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Droite
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={localMargins.right}
                  onChange={(e) => setLocalMargins(prev => ({
                    ...prev,
                    right: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-8 top-3 text-gray-400 text-sm">mm</span>
              </div>
            </div>
          </div>

          {/* Preset buttons */}
          <div className="mt-6">
            <div className="text-sm font-medium text-gray-700 mb-2">Préconfigurations:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLocalMargins({ top: 20, right: 20, bottom: 20, left: 20 })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Standard (20mm)
              </button>
              <button
                onClick={() => setLocalMargins({ top: 10, right: 10, bottom: 10, left: 10 })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Etroit (10mm)
              </button>
              <button
                onClick={() => setLocalMargins({ top: 30, right: 30, bottom: 30, left: 30 })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Large (30mm)
              </button>
              <button
                onClick={() => setLocalMargins({ top: 25, right: 15, bottom: 25, left: 35 })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Lettre type
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(localMargins)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};
