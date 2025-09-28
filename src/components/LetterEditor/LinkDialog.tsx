import React from 'react';
import { Link } from 'lucide-react';

interface LinkDialogProps {
  isVisible: boolean;
  linkUrl: string;
  linkText: string;
  onUrlChange: (url: string) => void;
  onTextChange: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({
  isVisible,
  linkUrl,
  linkText,
  onUrlChange,
  onTextChange,
  onConfirm,
  onCancel
}) => {
  if (!isVisible) return null;

  return (
    <div className="mt-3 p-4 bg-blue-50 rounded border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Link className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-blue-700">Insérer un lien</span>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL du lien
          </label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://exemple.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texte du lien
          </label>
          <input
            type="text"
            value={linkText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Texte à afficher"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Insérer
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};