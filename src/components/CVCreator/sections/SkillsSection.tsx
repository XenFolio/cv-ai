import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Plus, Minus, Database, Search, GripVertical } from 'lucide-react';
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
import { useSkills, type Skill } from '../../../hooks/useSkills';
import { useCVCreator } from '../CVCreatorContext.hook';

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
  templateName?: string;
  sectionId?: string;
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
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          title="Déplacer la compétence"
        >
          <GripVertical className="w-3 h-3" />
        </button>

        {/* Boutons IA et suppression - visibles seulement si sélectionné */}
        {isSelected && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white rounded shadow-md p-1 z-20 flex gap-1">
            <AIButton
              isLoading={isLoading}
              onClick={onAIGenerate}
              title="Modifier avec IA"
            />
            <button
              onClick={onRemove}
              className="p-1 text-red-600 hover:text-red-800"
              title="Supprimer la compétence"
            >
              <Minus className="w-3 h-3" />
            </button>
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
  templateName,
  sectionId
}) => {
  const { sectionColors } = useCVCreator();

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
  const { getSkillsByCategory, getAvailableCategories, searchSkills, loading: skillsLoading } = useSkills();
  const [showSkillsLibrary, setShowSkillsLibrary] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('technique');
  const [categorySkills, setCategorySkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Skill[]>([]);
  // Forcer 2 colonnes pour le template minimaliste
  const defaultLayout = templateName?.toLowerCase() === 'minimaliste' ? '2col' : 'free';
  const [skillsLayout, setSkillsLayout] = useState<'free' | '1col' | '2col' | '3col'>(defaultLayout);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [titleHovered, setTitleHovered] = React.useState(false);

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

  // Charger les catégories disponibles au montage
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await getAvailableCategories();
        const defaultCategories = ['technique', 'soft-skills', 'outils', 'langues', 'certifications'];
        setAvailableCategories(categories.length > 0 ? categories : defaultCategories);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        setAvailableCategories(['technique', 'soft-skills', 'outils', 'langues', 'certifications']);
      }
    };

    // Charger immédiatement les catégories par défaut
    setAvailableCategories(['technique', 'soft-skills', 'outils', 'langues', 'certifications']);
    
    // Puis essayer de charger depuis la base de données
    loadCategories();
  }, [getAvailableCategories]);

  // Charger les compétences par catégorie
  const loadSkillsByCategory = useCallback(async (category: string) => {
    try {
      const skills = await getSkillsByCategory(category, {
        generateIfEmpty: true,
        context: `Compétences ${category} pour un CV professionnel`,
        count: 8
      });
      setCategorySkills(skills);
    } catch (error) {
      console.error('Erreur lors du chargement des compétences:', error);
      setCategorySkills([]);
    }
  }, [getSkillsByCategory]);

  // Rechercher des compétences
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      try {
        const results = await searchSkills(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Ajouter une compétence depuis la bibliothèque
  const addSkillFromLibrary = (skill: Skill) => {
    const newSkill: CVSkill = {
      id: Date.now(),
      content: skill.name
    };
    setSkills(prev => [...prev, newSkill]);
    setShowSkillsLibrary(false);
  };

  // Charger les compétences de la catégorie sélectionnée
  useEffect(() => {
    if (showSkillsLibrary && selectedCategory) {
      loadSkillsByCategory(selectedCategory);
    }
  }, [loadSkillsByCategory, selectedCategory, showSkillsLibrary]);

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
          <div
            className="flex items-center gap-2"
            onMouseEnter={() => setTitleHovered(true)}
            onMouseLeave={() => setTitleHovered(false)}
          >
            <h4
              className="text-sm font-semibold cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors duration-200"
              onClick={() => setEditingField('skillsTitle')}
              style={{ color: `#${colors.title}` }}
            >
              {editableContent.skillsTitle}
            </h4>
            <div className={`flex gap-1 ml-2 transition-opacity duration-200 ${titleHovered ? 'opacity-100' : 'opacity-0'}`}>
              <AIButton
                isLoading={isLoading}
                onClick={() => generateWithAI('skillsTitle', editableContent.skillsTitle)}
                title="Modifier avec IA"
              />
              
              {/* Sélecteur de mise en page */}
              <select
                value={skillsLayout}
                onChange={(e) => setSkillsLayout(e.target.value as 'free' | '1col' | '2col' | '3col')}
                className="p-1 text-xs border rounded text-gray-600 hover:text-gray-800 focus:outline-none focus:border-violet-500 w-auto min-w-fit"
                style={{
                  borderColor: colors.border ? `#${colors.border}` : '#d1d5db',
                  color: `#${colors.input}`
                }}
                title="Mise en page des compétences"
              >
                <option value="free">Libre</option>
                <option value="1col">1 colonne</option>
                <option value="2col">2 colonnes</option>
                <option value="3col">3 colonnes</option>
              </select>
              
              <button
                onClick={() => setShowSkillsLibrary(!showSkillsLibrary)}
                className="p-1 text-blue-600 hover:text-blue-800 transition-all duration-200 hover:scale-110"
                title="Bibliothèque de compétences"
              >
                <Database className="w-4 h-4" />
              </button>
              <button
                onClick={addSkill}
                className="p-1 text-violet-600 hover:text-violet-800 transition-all duration-200 hover:scale-110"
                title="Ajouter une compétence"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
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

      {/* Bibliothèque de compétences - Version compacte */}
      {showSkillsLibrary && (
        <div
          className="mt-2 p-3 border rounded-lg bg-white shadow-lg relative z-10"
          style={{
            borderColor: colors.border ? `#${colors.border}` : '#d1d5db',
            maxHeight: '300px',
            overflow: 'hidden'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-gray-700 text-sm">Bibliothèque</h5>
            <button
              onClick={() => setShowSkillsLibrary(false)}
              className="text-gray-500 hover:text-gray-700 text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="mb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une compétence..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:border-violet-500"
              style={{
                borderColor: colors.border ? `#${colors.border}` : '#d1d5db',
                color: `#${colors.input}`
              }}
              />
            </div>
          </div>

          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div className="mb-4">
              <h6 className="text-sm font-medium text-gray-600 mb-2">Résultats de recherche</h6>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {searchResults.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => addSkillFromLibrary(skill)}
                    className="text-left p-2 text-sm border rounded hover:bg-violet-50 hover:border-violet-300 transition-colors"
                style={{
                  borderColor: colors.border ? `#${colors.border}` : '#d1d5db',
                  color: `#${colors.content}`
                }}
                    title={skill.description}
                  >
                    <div className="font-medium">{skill.name}</div>
                    {skill.level && (
                      <div className="text-xs text-gray-500">{skill.level}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sélecteur de catégorie */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie de compétences
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:border-violet-500 bg-white cursor-pointer"
            style={{
              borderColor: colors.border ? `#${colors.border}` : '#d1d5db',
              color: `#${colors.input}`,
              minHeight: '36px'
            }}
            >
              {availableCategories.length > 0 ? (
                availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'technique' ? 'Techniques' :
                     category === 'soft-skills' ? 'Soft Skills' :
                     category === 'outils' ? 'Outils' :
                     category === 'langues' ? 'Langues' :
                     category === 'certifications' ? 'Certifications' :
                     category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))
              ) : (
                <>
                  <option value="technique">Techniques</option>
                  <option value="soft-skills">Soft Skills</option>
                  <option value="outils">Outils</option>
                  <option value="langues">Langues</option>
                  <option value="certifications">Certifications</option>
                </>
              )}
            </select>
          </div>

          {/* Compétences par catégorie */}
          {skillsLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-violet-600 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {categorySkills.length === 0 ? 'Génération avec IA...' : 'Chargement...'}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {categorySkills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => addSkillFromLibrary(skill)}
                  className="text-left p-2 text-sm border rounded hover:bg-violet-50 hover:border-violet-300 transition-colors"
                style={{
                  borderColor: colors.border ? `#${colors.border}` : '#d1d5db',
                  color: `#${colors.content}`
                }}
                  title={skill.description}
                >
                  <div className="font-medium">{skill.name}</div>
                  {skill.level && (
                    <div className="text-xs text-gray-500">{skill.level}</div>
                  )}
                  {skill.is_ai_generated && (
                    <div className="text-xs text-violet-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      IA
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {categorySkills.length === 0 && !skillsLoading && (
            <div className="text-center py-4 text-gray-500 text-sm">
              <p>Aucune compétence trouvée pour cette catégorie</p>
              <button
                onClick={() => loadSkillsByCategory(selectedCategory)}
                className="mt-2 px-3 py-1 text-xs bg-violet-100 text-violet-700 rounded-md hover:bg-violet-200 transition-colors"
              >
                Générer avec IA
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </>
);
};
