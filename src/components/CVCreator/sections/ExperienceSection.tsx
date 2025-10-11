import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { AIButton } from '../../UI';
import type { ExperienceSectionProps } from '../types';
import { useCVCreator } from '../CVCreatorContext.hook';

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  editableContent,
  setEditableContent,
  experiences,
  setExperiences,
  editingField,
  setEditingField,
  titleColor,
  addExperience,
  removeExperience,
  generateWithAI,
  isLoading,
  sectionId
}) => {
  const { sectionColors, capitalizeSections } = useCVCreator();

  // Couleurs personnalisées pour la section
  const sectionColorSettings = sectionId ? sectionColors[sectionId] : null;
  const textColor = sectionColorSettings?.title || titleColor;
  const contentColor = sectionColorSettings?.content || '000000';
  const [titleHovered, setTitleHovered] = React.useState(false);
  const [hoveredExpId, setHoveredExpId] = React.useState<number | null>(null);

  // Vérifier si la capitalisation des titres est activée
  const isTitleCapitalized = sectionId ? capitalizeSections[sectionId] ?? true : true;
  return (
    <div className="mt-0">
      {editingField === 'experienceTitle' ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editableContent.experienceTitle}
            onChange={(e) => setEditableContent(prev => ({ ...prev, experienceTitle: e.target.value }))}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
            className="text-sm font-semibold border-b border-gray-400 focus:outline-none focus:border-violet-500 bg-transparent"
            style={{
              width: `${Math.max(editableContent.experienceTitle.length * 7 + 20, 180)}px`,
              color: `#${textColor}`
            }}
            autoFocus
          />
          <div
            onClick={addExperience}
            className="p-1 text-violet-600 hover:text-violet-800 transition-all duration-200 hover:scale-110"
            title="Ajouter une expérience"
          >
            <Plus className="w-4 h-4" />
          </div>
        </div>
      ) : (
        <div
          className="flex items-center gap-2"
          onMouseEnter={() => setTitleHovered(true)}
          onMouseLeave={() => setTitleHovered(false)}
        >
          <h4
            className="text-sm font-semibold cursor-pointer hover:bg-gray-100 p-1 rounded whitespace-nowrap transition-colors duration-200"
            onClick={() => setEditingField('experienceTitle')}
            style={{
              color: `#${textColor}`,
              textTransform: isTitleCapitalized ? 'uppercase' : 'none'
            }}
          >
            {editableContent.experienceTitle}
          </h4>
          <div className={`flex gap-1 ml-auto transition-opacity duration-200 ${titleHovered ? 'opacity-100' : 'opacity-0'}`}>
            <AIButton
              isLoading={isLoading}
              onClick={() => generateWithAI('experienceTitle', editableContent.experienceTitle)}
              title="Modifier avec IA"
            />
            <div
              onClick={addExperience}
              className="p-1 text-violet-600 hover:text-violet-800 transition-all duration-200 hover:scale-110"
              title="Ajouter une expérience"
            >
              <Plus className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {experiences.map(exp => (
        <div
          key={exp.id}
          className="relative"
          onMouseEnter={() => setHoveredExpId(exp.id)}
          onMouseLeave={() => setHoveredExpId(null)}
        >
          <div className={`absolute right-0 top-0 flex gap-1 transition-opacity duration-200 ${hoveredExpId === exp.id ? 'opacity-100' : 'opacity-0'}`}>
            <AIButton
              isLoading={isLoading}
              onClick={() => generateWithAI('experienceContent', exp.content)}
              title="Modifier avec IA"
            />
            <div
              onClick={() => removeExperience(exp.id)}
              className="p-1 text-red-600 hover:text-red-800"
              title="Supprimer l'expérience"
            >
              <Minus className="w-4 h-4" />
            </div>
          </div>

          {editingField === `experienceContent-${exp.id}` ? (
            <input
              type="text"
              value={exp.content}
              onChange={(e) => setExperiences(prev => prev.map(item => item.id === exp.id ? { ...item, content: e.target.value } : item))}
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
              className="text-sm w-full border-b border-gray-400 focus:outline-none focus:border-violet-500 mt-2"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <p
                className="text-sm cursor-pointer hover:bg-gray-100 p-1 rounded flex-1 font-bold transition-colors duration-200"
                onClick={() => setEditingField(`experienceContent-${exp.id}`)}
                style={{ color: `#${contentColor}` }}
              >
                {exp.content}
              </p>
            </div>
          )}

          {editingField === `experienceDetails-${exp.id}` ? (
            <textarea
              value={exp.details}
              onChange={(e) => setExperiences(prev => prev.map(item => item.id === exp.id ? { ...item, details: e.target.value } : item))}
              onBlur={() => setEditingField(null)}
              className="text-sm w-full border border-gray-400 focus:outline-none focus:border-violet-500 p-1 rounded mt-1"
              autoFocus
              rows={2}
            />
          ) : (
            <div className="flex items-start gap-2 mt-1">
              <p
                className="text-sm cursor-pointer hover:bg-gray-100 p-1 rounded flex-1 transition-colors duration-200"
                onClick={() => setEditingField(`experienceDetails-${exp.id}`)}
                style={{ color: `#${contentColor}` }}
              >
                {exp.details}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
