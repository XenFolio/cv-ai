import React from 'react';
import type { CVContent } from '../types';
import { useCVCreator } from '../CVCreatorContext.hook';
import EditableFieldWithTitle from '../EditableFieldWithTitle';

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
  alignment = 'left'
}) => {
  const { sectionColors, capitalizeSections } = useCVCreator();

  // Couleurs personnalisées pour la section
  const sectionColorSettings = sectionId ? sectionColors[sectionId] : null;
  const textColor = sectionColorSettings?.title || titleColor;
  const contentColor = sectionColorSettings?.content || '000000';
  /* const [titleHovered, setTitleHovered] = React.useState(false);
 */
  // Vérifier si la capitalisation des titres est activée
  const isTitleCapitalized = sectionId ? capitalizeSections[sectionId] ?? true : true;

  // Déterminer les classes d'alignement
  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'center':
        return 'text-center items-center justify-center';
      case 'right':
        return 'text-right items-end justify-end';
      default:
        return 'text-left items-start justify-start';
    }
  };

  return (
    <div className={`mt-0 ${getAlignmentClasses()}`}>
      {editingField === 'contactTitle' ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editableContent.contactTitle}
            onChange={(e) => setEditableContent(prev => ({ ...prev, contactTitle: e.target.value }))}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
            className="text-sm font-semibold border-b border-gray-400 focus:outline-none focus:border-violet-500 bg-transparent"
            style={{
              width: `${Math.max(editableContent.contactTitle.length * 7 + 20, 180)}px`,
              color: `#${textColor}`
            }}
            autoFocus
          />
        </div>
      ) : (
        <EditableFieldWithTitle
          title={editableContent.contactTitle}
          value={editableContent.contactTitle}
          isEditing={editingField === 'contactTitle'}
          isLoading={isLoading}
          colors={{
            title: textColor,
            text: contentColor
          }}
          isTitleCapitalized={isTitleCapitalized}
          onEdit={() => setEditingField('contactTitle')}
          onAdd={() => {
            // Logique pour ajouter un nouveau contact ou information
            console.log('Ajouter une information de contact');
          }}
          onGenerateWithAI={() => generateWithAI('contactTitle', editableContent.contactTitle)}
          showAddButton={false}
          showEditButton={true}
        />
      )}
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
          className="w-full p-0 border border-gray-300 rounded focus:outline-none focus:border-violet-500 resize-none text-[0.8rem]"
          rows={3}
          autoFocus
        />
      ) : (
        <div className="group relative mt-0">
          <div
            className="text-[0.8rem] cursor-pointer hover:bg-gray-100 p-0 rounded transition-colors duration-200 whitespace-pre-wrap leading-relaxed"
            onClick={() => setEditingField('contact')}
            style={{ color: `#${contentColor}` }}
          >
            {editableContent.contact
              ? editableContent.contact
                  .split(/[,•\n]/)
                  .filter(part => part.trim())
                  .map((part, index, array) => (
                    <React.Fragment key={index}>
                      {part.trim()}
                      {index < array.length - 1 && <br />}
                    </React.Fragment>
                  ))
              : 'Cliquez pour ajouter vos informations de contact'
            }
          </div>
        </div>
      )}
    </div>
  );
};
