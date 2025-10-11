import React from 'react';
import { AIButton } from '../../UI';
import { useCVCreator } from '../CVCreatorContext.hook';
import EditableFieldWithTitle from '../EditableFieldWithTitle';
import type { ProfileSectionProps } from '../types';

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  editableContent,
  setEditableContent,
  editingField,
  setEditingField,
  titleColor,
  generateWithAI,
  isLoading,
  sectionId
}) => {
  const { sectionColors, capitalizeSections } = useCVCreator();

  // Couleurs personnalisées pour la section
  const sectionColorSettings = sectionId ? sectionColors[sectionId] : null;
  const colors = {
    title: sectionColorSettings?.title || titleColor,
    content: sectionColorSettings?.content || '000000',
    input: sectionColorSettings?.input || '000000',
    border: sectionColorSettings?.border || 'd1d5db',
  };

  // Vérifier si la capitalisation des titres est activée
  const isTitleCapitalized = sectionId ? capitalizeSections[sectionId] ?? true : true;
  return (
    <div className="mt-0">
      {editingField === 'profileTitle' ? (
        <input
          type="text"
          value={editableContent.profileTitle}
          onChange={(e) => setEditableContent(prev => ({ ...prev, profileTitle: e.target.value }))}
          onBlur={() => setEditingField(null)}
          onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
          className="text-sm font-semibold border-b focus:outline-none focus:border-violet-500 bg-transparent max-w-full"
          style={{
            color: `#${colors.title}`,
            borderColor: `#${colors.border}`,
            width: `${Math.min(Math.max(editableContent.profileTitle.length * 7 + 20, 120), 200)}px`
          }}
          autoFocus
        />
      ) : (
        <EditableFieldWithTitle
          title={editableContent.profileTitle}
          value={editableContent.profileTitle}
          isEditing={editingField === 'profileTitle'}
          isLoading={isLoading}
          colors={{
            title: colors.title,
            text: colors.content
          }}
          isTitleCapitalized={isTitleCapitalized}
          onEdit={() => setEditingField('profileTitle')}
          onAdd={() => {
            // Logique pour ajouter un nouveau profil ou section
            console.log('Ajouter un nouveau profil');
          }}
          onGenerateWithAI={() => generateWithAI('profileTitle', editableContent.profileTitle)}
          showAddButton={false}
          showEditButton={true}
        />
      )}

      {editingField === 'profileContent' ? (
        <textarea
          value={editableContent.profileContent}
          onChange={(e) => setEditableContent(prev => ({ ...prev, profileContent: e.target.value }))}
          onBlur={() => setEditingField(null)}
          className="text-sm w-full border focus:outline-none focus:border-violet-500 p-1 rounded"
          style={{
            borderColor: `#${colors.border}`,
            color: `#${colors.input}`,
            textAlign: 'left'
          }}
          autoFocus
          rows={3}
        />
      ) : (
        <div className="group flex items-start gap-1 relative">
          <p
            className="text-sm cursor-pointer hover:bg-gray-100 p-1 rounded flex-1 transition-colors duration-200 line-clamp-3"
            onClick={() => setEditingField('profileContent')}
            style={{ color: `#${colors.content}` }}
          >
            {editableContent.profileContent}
          </p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
            <AIButton
              isLoading={isLoading}
              onClick={() => generateWithAI('profileContent', editableContent.profileContent)}
              title="Modifier avec IA"
              className="mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};
