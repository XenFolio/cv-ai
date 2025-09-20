import React from 'react';
import { Sparkles } from 'lucide-react';
import type { CVContent } from '../types';

interface NameSectionProps {
  editableContent: CVContent;
  setEditableContent: React.Dispatch<React.SetStateAction<CVContent>>;
  titleColor: string;
  generateWithAI: (field: string, content?: string) => Promise<void>;
  isLoading: boolean;
  nameAlignment?: 'left' | 'center' | 'right';
  nameFontSize?: number;
}

const AIButton: React.FC<{
  isLoading: boolean;
  onClick: () => void;
  title: string;
  className?: string;
}> = ({ isLoading, onClick, title, className = "" }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`p-1 text-violet-600 hover:text-violet-800 disabled:opacity-50 ${className}`}
    title={title}
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
);

export const NameSection: React.FC<NameSectionProps> = ({
  editableContent,
  setEditableContent,
  titleColor,
  generateWithAI,
  isLoading,
  nameAlignment,
  nameFontSize = 18
}) => {
  return (
    <div className={`mt-0 ${nameAlignment === 'left' ? 'text-left' : nameAlignment === 'right' ? 'text-right' : 'text-center'}`}>
      <div className={`group flex items-center gap-2 relative ${nameAlignment === 'left' ? 'justify-start' : nameAlignment === 'right' ? 'justify-end' : 'justify-center'}`}>
        <input
          type="text"
          value={editableContent.name}
          onChange={(e) => setEditableContent(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Votre nom et prénom"
          className={`font-bold border-b border-transparent hover:border-gray-300 focus:border-violet-500 focus:outline-none bg-transparent transition-colors duration-200 p-0 leading-none ${nameAlignment === 'left' ? 'text-left' : nameAlignment === 'right' ? 'text-right' : 'text-center'}`}
          style={{
            color: `#${titleColor}`,
            fontSize: `${nameFontSize}px`,
            minWidth: '320px',
            width: `${Math.max(editableContent.name.length * 12 + 40, 200)}px`,
            height: `${nameFontSize}px`
          }}
        />
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <AIButton
            isLoading={isLoading}
            onClick={() => generateWithAI('name', editableContent.name)}
            title="Modifier avec IA"
          />
        </div>
      </div>
    </div>
  );
};
