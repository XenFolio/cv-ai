import React from 'react';
import { Sparkles } from 'lucide-react';
import type { CVContent } from '../types';
import { useCVCreator } from '../CVCreatorContext.hook';

interface ContactSectionProps {
  editableContent: CVContent;
  setEditableContent: React.Dispatch<React.SetStateAction<CVContent>>;
  editingField: string | null;
  setEditingField: React.Dispatch<React.SetStateAction<string | null>>;
  titleColor: string;
  generateWithAI: (field: string, content?: string) => Promise<void>;
  isLoading: boolean;
  sectionId?: string;
  alignment?: 'left' | 'center' | 'right';
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  editableContent,
  setEditableContent,
  editingField,
  setEditingField,
  titleColor,
  generateWithAI,
  isLoading,
  sectionId,
  alignment = 'center'
}) => {
  const { sectionColors } = useCVCreator();

  // Couleurs personnalisées pour la section
  const sectionColorSettings = sectionId ? sectionColors[sectionId] : null;
  const textColor = sectionColorSettings?.title || titleColor;
  const contentColor = sectionColorSettings?.content || '000000';
  return (
    <div className="mt-0" style={{ textAlign: alignment }}>
      <div className="group flex items-center gap-2">
        <input
          type="text"
          value={editableContent.contactTitle}
          onChange={(e) => setEditableContent(prev => ({ ...prev, contactTitle: e.target.value }))}
          placeholder="Nom de la section (ex: Contact)"
          className="text-sm font-semibold border-b border-transparent hover:border-gray-300 focus:border-violet-500 focus:outline-none bg-transparent transition-colors duration-200 flex-1"
          style={{ 
            color: `#${textColor}`,
            width: `${Math.max(editableContent.contactTitle.length * 7 + 20, 180)}px` 
          }}
        />
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => generateWithAI('contactTitle', editableContent.contactTitle)}
            disabled={isLoading}
            className="p-1 text-violet-600 hover:text-violet-800 disabled:opacity-50"
            title="Modifier avec IA"
          >
            {isLoading ? (
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-violet-600 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {editingField === 'contact' ? (
        <textarea
          value={editableContent.contact}
          onChange={(e) => setEditableContent(prev => ({ ...prev, contact: e.target.value }))}
          onBlur={() => setEditingField(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              setEditingField(null);
            }
          }}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-violet-500 resize-none text-[0.8rem]"
          rows={3}
          autoFocus
        />
      ) : (
        <div className="group relative mt-2">
          <div
            className="text-[0.85rem] cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors duration-200 whitespace-pre-wrap"
            onClick={() => setEditingField('contact')}
            style={{ color: `#${contentColor}` }}
          >
            {editableContent.contact || 'Cliquez pour ajouter vos informations de contact'}
          </div>
          
        </div>
      )}
    </div>
  );
};
