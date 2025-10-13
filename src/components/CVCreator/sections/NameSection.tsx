import React from 'react';
import type { CVContent } from '../types';
import { useCVCreator } from '../CVCreatorContext.hook';

interface NameSectionProps {
  editableContent: CVContent;
  setEditableContent: React.Dispatch<React.SetStateAction<CVContent>>;
  titleColor: string;
  generateWithAI: (field: string, content?: string) => Promise<void>;
  isLoading: boolean;
  nameAlignment?: 'left' | 'center' | 'right';
  nameFontSize?: number;
  isCreativeTemplate?: boolean;
  sectionId?: string;
}


export const NameSection: React.FC<NameSectionProps> = ({
  editableContent,
  setEditableContent,
  titleColor,

  nameAlignment,
  nameFontSize = 18,
  isCreativeTemplate = false,
  sectionId
}) => {
  const { sectionColors, capitalizeSections } = useCVCreator();

  // Taille de police pour le template créatif (utilise nameFontSize s'il est différent de la valeur par défaut)
  const creativeFontSize = isCreativeTemplate ? (nameFontSize !== 18 ? nameFontSize : 32) : nameFontSize;

  // Couleurs personnalisées pour la section
  const sectionColorSettings = sectionId ? sectionColors[sectionId] : null;
  const textColor = sectionColorSettings?.title || titleColor;

  // Appliquer la capitalisation en majuscules si activée
  const isCapitalised = sectionId ? capitalizeSections[sectionId] ?? true : true;
  const displayName = isCapitalised ? editableContent.name.toUpperCase() : editableContent.name;

  return (
    <div className={`mt-0 ${nameAlignment === 'left' ? 'text-left' : nameAlignment === 'right' ? 'text-right' : 'text-center'}`}>
      <div className={`group flex items-center gap-2 relative ${nameAlignment === 'left' ? 'justify-start' : nameAlignment === 'right' ? 'justify-end' : 'justify-center'}`}>
        <input
          type="text"
          value={displayName}
          onChange={(e) => {
            // Conserver la valeur originale dans l'état, sans transformation en majuscules
            setEditableContent(prev => ({ ...prev, name: e.target.value }));
          }}
          placeholder="Votre nom et prénom"
          className={`font-bold border-b border-transparent hover:border-gray-300 focus:border-violet-500 focus:outline-none bg-transparent transition-colors duration-200 p-0 leading-none ${nameAlignment === 'left' ? 'text-left' : nameAlignment === 'right' ? 'text-right' : 'text-center'}`}
          style={{
            color: `#${textColor}`,
            fontSize: `${creativeFontSize}px`,
            minWidth: '320px',
            width: `${Math.max(displayName.length * (isCreativeTemplate ? 16 : 12) + 40, 200)}px`,
            height: `${creativeFontSize}px`
          }}
        />

      </div>
    </div>
  );
};
