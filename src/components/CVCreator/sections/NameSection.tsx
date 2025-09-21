import React from 'react';
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


export const NameSection: React.FC<NameSectionProps> = ({
  editableContent,
  setEditableContent,
  titleColor,
  
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
        
      </div>
    </div>
  );
};