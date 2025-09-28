import React from 'react';

interface EditorFooterProps {
  currentTemplateName: string;
  characterCount: number;
  autoSaveEnabled?: boolean;
}

export const EditorFooter: React.FC<EditorFooterProps> = ({
  currentTemplateName,
  characterCount,
  autoSaveEnabled = true
}) => {
  return (
    <div className="bg-gray-100 rounded-b-lg border border-gray-200 border-t-0 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
      <div className="flex items-center gap-4">
        <span>Template: {currentTemplateName}</span>
        <span>|</span>
        <span>{characterCount} caractères</span>
      </div>
      <div className="flex items-center gap-2">
        {autoSaveEnabled && (
          <span className="text-green-600">✓ Sauvegarde automatique</span>
        )}
      </div>
    </div>
  );
};