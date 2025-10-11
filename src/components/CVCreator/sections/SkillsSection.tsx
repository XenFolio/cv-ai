import React, { useState } from 'react';
import {  Minus, GripVertical } from 'lucide-react';
import { AIButton } from '../../UI';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CVContent, CVSkill } from '../types';
import { useCVCreator } from '../CVCreatorContext.hook';
import EditableFieldWithLayout from '../EditableFieldWithLayout';
import { SkillsLibraryModal } from '../SkillsLibraryModal';

interface SkillsSectionProps {
  editableContent: CVContent;
  setEditableContent: React.Dispatch<React.SetStateAction<CVContent>>;
  skills: CVSkill[];
  setSkills: React.Dispatch<React.SetStateAction<CVSkill[]>>;
  editingField: string | null;
  setEditingField: React.Dispatch<React.SetStateAction<string | null>>;
  titleColor: string;
  addSkill: () => void;
  removeSkill: (id: number) => void;
  generateWithAI: (field: string, currentContent?: string) => Promise<void>;
  isLoading: boolean;
  sectionId?: string;
}


// Composant pour une compétence déplaçable
const SortableSkill: React.FC<{
  skill: CVSkill;
  isEditing: boolean;
  isSelected: boolean;
  onEdit: () => void;
  onSelect: () => void;
  onUpdate: (content: string) => void;
  onFinishEdit: () => void;
  onRemove: () => void;
  onAIGenerate: () => void;
  skillColor: string;
  colors: {
    title: string;
    content: string;
    input: string;
    button: string;
    aiButton: string;
    separator: string;
    border: string;
  };
  isLoading: boolean;
  isLast: boolean;
  showSeparator: boolean;
  showBulletPoint: boolean;
}> = ({
  skill,
  isEditing,
  isSelected,
  onEdit,
  onSelect,
  onUpdate,
  onFinishEdit,
  onRemove,
  onAIGenerate,
  skillColor,
  colors,
  isLoading,
  isLast,
  showSeparator,
  showBulletPoint
}) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: skill.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <span
        ref={setNodeRef}
        style={style}
        className={`inline-flex items-center relative ${isDragging ? 'z-10' : ''}`}
      >
        {/* Contenu de la compétence avec groupe hover individuel */}
        <span className="group relative inline-flex items-center">
          {/* Handle de drag */}
          <div
            {...attributes}
            {...listeners}
            className="h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            title="Déplacer la compétence"
            role='div'
          >
            <GripVertical className="w-3 h-3" />
          </div>

          {/* Boutons IA et suppression - visibles seulement si sélectionné */}
          {isSelected && (
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white rounded shadow-md p-1 z-20 flex gap-1">
              <AIButton
                isLoading={isLoading}
                onClick={onAIGenerate}
                title="Modifier avec IA"
              />
              <div
                onClick={onRemove}
                className="p-1 text-red-600 hover:text-red-800"
                title="Supprimer la compétence"
              >
                <Minus className="w-3 h-3" />
              </div>
            </div>
          )}

          {/* Contenu de la compétence */}
          <div className="flex items-center">
            {/* Point devant la compétence si les colonnes sont actives */}
            {showBulletPoint && (
              <span className="text-sm mr-2" style={{ color: `#${skillColor}` }}>
                •
              </span>
            )}

            {isEditing ? (
              <input
                type="text"
                value={skill.content}
                onChange={(e) => onUpdate(e.target.value)}
                onBlur={onFinishEdit}
                onKeyDown={(e) => e.key === 'Enter' && onFinishEdit()}
                className="text-sm border-b focus:outline-none focus:border-violet-500 bg-transparent min-w-0 max-w-full"
                style={{
                  width: `${Math.min(Math.max(skill.content.length * 8 + 20, 80), 150)}px`,
                  borderColor: colors.border ? `#${colors.border}` : '#d1d5db'
                }}
                autoFocus
              />
            ) : (
              <span
                className={`text-sm cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded transition-colors duration-200 truncate max-w-full inline-block ${isSelected ? 'bg-violet-50 border border-violet-200' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSelected) {
                    onEdit();
                  } else {
                    onSelect();
                  }
                }}
                style={{
                  color: `#${skillColor}`,
                  maxWidth: '150px'
                }}
                title={isSelected ? "Clic pour éditer" : "Clic pour sélectionner"}
              >
                {skill.content}
              </span>
            )}
          </div>
        </span>

        {/* Séparateur - seulement en mode libre */}
        {showSeparator && !isLast && (
          <span className="text-sm text-gray-400 mx-1" style={{ color: `#${skillColor}` }}>
            •
          </span>
        )}
      </span>
    );
  };

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  editableContent,
  setEditableContent,
  skills,
  setSkills,
  editingField,
  setEditingField,
  titleColor,
  addSkill,
  removeSkill,
  generateWithAI,
  isLoading,
  sectionId
}) => {
  const {
    sectionColors,
    capitalizeSections,
    // Props pour la bibliothèque de compétences depuis le contexte
    showSkillsLibrary,
    setShowSkillsLibrary  } = useCVCreator();

  // Couleurs personnalisées pour la section
  const sectionColorSettings = sectionId ? sectionColors[sectionId] : null;
  const colors = {
    title: sectionColorSettings?.title || titleColor,
    content: sectionColorSettings?.content || '000000',
    input: sectionColorSettings?.input || '000000',
    button: sectionColorSettings?.button || '6b7280',
    aiButton: sectionColorSettings?.aiButton || '9333ea',
    separator: sectionColorSettings?.separator || 'd1d5db',
    border: sectionColorSettings?.border || 'd1d5db',
  };

  // Vérifier si la capitalisation des titres est activée
  const isTitleCapitalized = sectionId ? capitalizeSections[sectionId] ?? true : true;
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  /* const [titleHovered, setTitleHovered] = React.useState(false); */

  // Récupérer la disposition des compétences depuis le contexte
  const { skillsLayout, setSkillsLayout } = useCVCreator();

  // Configuration du drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Gérer la fin du drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = skills.findIndex((skill) => skill.id === active.id);
      const newIndex = skills.findIndex((skill) => skill.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSkills = [...skills];
        const [movedSkill] = newSkills.splice(oldIndex, 1);
        newSkills.splice(newIndex, 0, movedSkill);
        setSkills(newSkills);
      }
    }
  };

  // Gérer l'ouverture de la bibliothèque

  return (
    <>
      <div
        className="mt-0"
        onClick={() => setSelectedSkillId(null)}
      >
        {editingField === 'skillsTitle' ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editableContent.skillsTitle}
              onChange={(e) => setEditableContent(prev => ({ ...prev, skillsTitle: e.target.value }))}
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
              className="text-sm font-semibold border-b focus:outline-none focus:border-violet-500 bg-transparent"
              style={{
                width: `${Math.max(editableContent.skillsTitle.length * 7 + 20, 180)}px`,
                color: `#${colors.title}`,
                borderColor: colors.border ? `#${colors.border}` : '#d1d5db'
              }}
              autoFocus
            />
          </div>
        ) : (
          <EditableFieldWithLayout
            title={editableContent.skillsTitle}
            value={editableContent.skillsTitle}
            isEditing={editingField === 'skillsTitle'}
            isLoading={isLoading}
            colors={{
              title: colors.title,
              text: colors.content
            }}
            isTitleCapitalized={isTitleCapitalized}
            onEdit={() => setEditingField('skillsTitle')}
            onAdd={addSkill}
            onGenerateWithAI={() => generateWithAI('skillsTitle', editableContent.skillsTitle)}
            onLayoutChange={(layout) => {
              // Convertir les valeurs pour correspondre à l'état existant
              const layoutMap: { [key: string]: 'free' | '1col' | '2col' | '3col' } = {
                'libre': 'free',
                '1colonne': '1col',
                '2colonnes': '2col',
                '3colonnes': '3col'
              };
              setSkillsLayout(layoutMap[layout] || 'free');
            }}
            showAddButton={true}
            showEditButton={true}
            selectedLayout={
              skillsLayout === 'free' ? 'libre' :
              skillsLayout === '1col' ? '1colonne' :
              skillsLayout === '2col' ? '2colonnes' : '3colonnes'
            }
          />
        )}

        {/* Compétences en ligne avec drag & drop */}
        <div className="mt-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={skills.map(skill => skill.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div
                className={
                  skillsLayout === 'free' ? 'flex flex-wrap items-center gap-1' :
                    skillsLayout === '1col' ? 'flex flex-col gap-1' :
                      skillsLayout === '2col' ? 'grid grid-cols-2 gap-1' :
                        'grid grid-cols-3 gap-1'
                }
                onClick={(e) => e.stopPropagation()}
              >
                {skills.map((skill, index) => (
                  <SortableSkill
                    key={skill.id}
                    skill={skill}
                    isEditing={editingField === `skillContent-${skill.id}`}
                    isSelected={selectedSkillId === skill.id}
                    onEdit={() => setEditingField(`skillContent-${skill.id}`)}
                    onSelect={() => setSelectedSkillId(selectedSkillId === skill.id ? null : skill.id)}
                    onUpdate={(content) => setSkills(prev => prev.map(item => item.id === skill.id ? { ...item, content } : item))}
                    onFinishEdit={() => setEditingField(null)}
                    onRemove={() => {
                      removeSkill(skill.id);
                      setSelectedSkillId(null);
                    }}
                    onAIGenerate={() => generateWithAI('skillContent', skill.content)}
                    skillColor={colors.content}
                    colors={colors}
                    isLoading={isLoading}
                    isLast={index === skills.length - 1}
                    showSeparator={skillsLayout === 'free'}
                    showBulletPoint={skillsLayout !== 'free'}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Bibliothèque de compétences - Modal */}
        <SkillsLibraryModal
          isOpen={showSkillsLibrary}
          onClose={() => setShowSkillsLibrary()}
          colors={{
            border: colors.border,
            input: colors.input,
            content: colors.content
          }}
        />
      </div>
    </>
  );
};
