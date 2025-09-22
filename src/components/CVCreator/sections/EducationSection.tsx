import React from 'react';
import { Sparkles, Plus, Minus } from 'lucide-react';
import type { CVContent, CVEducation } from '../types';
import { useCVCreator } from '../CVCreatorContext.hook';

interface EducationSectionProps {
  editableContent: CVContent;
  setEditableContent: React.Dispatch<React.SetStateAction<CVContent>>;
  educations: CVEducation[];
  setEducations: React.Dispatch<React.SetStateAction<CVEducation[]>>;
  editingField: string | null;
  setEditingField: React.Dispatch<React.SetStateAction<string | null>>;
  titleColor: string;
  addEducation: () => void;
  removeEducation: (id: number) => void;
  generateWithAI: (field: string, currentContent?: string) => Promise<void>;
  isLoading: boolean;
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

export const EducationSection: React.FC<EducationSectionProps> = ({
  editableContent,
  setEditableContent,
  educations,
  setEducations,
  editingField,
  setEditingField,
  titleColor,
  addEducation,
  removeEducation,
  generateWithAI,
  isLoading,
  sectionId
}) => {
  const { sectionColors } = useCVCreator();

  // Couleurs personnalisées pour la section
  const sectionColorSettings = sectionId ? sectionColors[sectionId] : null;
  const textColor = sectionColorSettings?.title || titleColor;
  const contentColor = sectionColorSettings?.content || '000000';
  const [titleHovered, setTitleHovered] = React.useState(false);
  return (
    <div className="mt-0">
        {editingField === 'educationTitle' ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editableContent.educationTitle}
              onChange={(e) => setEditableContent(prev => ({ ...prev, educationTitle: e.target.value }))}
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
              className="text-sm font-semibold border-b border-gray-400 focus:outline-none focus:border-violet-500 bg-transparent"
              style={{
                width: `${Math.max(editableContent.educationTitle.length * 7 + 20, 180)}px`,
                color: `#${textColor}`
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
              onClick={() => setEditingField('educationTitle')}
              style={{
                color: `#${textColor}`,
                width: `${Math.max(editableContent.educationTitle.length * 7 + 20, 180)}px`
              }}
            >
              {editableContent.educationTitle}
            </h4>
            <div className={`flex gap-1 transition-opacity duration-200 ${titleHovered ? 'opacity-100' : 'opacity-0'}`}>
              <AIButton
                isLoading={isLoading}
                onClick={() => generateWithAI('educationTitle', editableContent.educationTitle)}
                title="Modifier avec IA"
              />
              <button
                onClick={addEducation}
                className="p-1 text-violet-600 hover:text-violet-800 transition-all duration-200 hover:scale-110"
                title="Ajouter une formation"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {educations.map(edu => (
          <div
            key={edu.id}
            className="relative mt-2 group"
          >
            {/* Layout aligné : Diplôme, École, Année sur une seule ligne */}
            <div className="flex items-center gap-2 overflow-hidden w-full">
              {/* Diplôme */}
              {editingField === `educationDegree-${edu.id}` ? (
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => setEducations(prev => prev.map(item => item.id === edu.id ? { ...item, degree: e.target.value } : item))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                  className="text-sm border-b border-gray-400 focus:outline-none focus:border-violet-500 bg-transparent"
                  placeholder="Diplôme"
                  style={{ width: `${Math.min(Math.max(edu.degree.length * 7 + 20, 80), 120)}px` }}
                  autoFocus
                />
              ) : (
                <p
                  className="text-sm font-medium cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors duration-200 truncate"
                  onClick={() => setEditingField(`educationDegree-${edu.id}`)}
                  style={{
                    color: `#${contentColor}`,
                    width: `${Math.min(Math.max(edu.degree.length * 7 + 20, 80), 140)}px`,
                    maxWidth: '140px'
                  }}
                  title={edu.degree}
                >
                  {edu.degree}
                </p>
              )}
              
              <span className="text-sm text-gray-400 flex-shrink-0">•</span>

              {/* École */}
              {editingField === `educationSchool-${edu.id}` ? (
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => setEducations(prev => prev.map(item => item.id === edu.id ? { ...item, school: e.target.value } : item))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                  className="text-sm border-b border-gray-400 focus:outline-none focus:border-violet-500 bg-transparent"
                  placeholder="École"
                  style={{ width: `${Math.min(Math.max(edu.school.length * 7 + 20, 60), 100)}px` }}
                  autoFocus
                />
              ) : (
                <p
                  className="text-sm cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors duration-200 truncate"
                  onClick={() => setEditingField(`educationSchool-${edu.id}`)}
                  style={{
                    color: `#${contentColor}`,
                    width: `${Math.min(Math.max(edu.school.length * 7 + 20, 80), 120)}px`,
                    maxWidth: '120px'
                  }}
                  title={edu.school}
                >
                  {edu.school}
                </p>
              )}

              <span className="text-sm text-gray-400 flex-shrink-0">•</span>

              {/* Année */}
              {editingField === `educationYear-${edu.id}` ? (
                <input
                  type="text"
                  value={edu.year}
                  onChange={(e) => setEducations(prev => prev.map(item => item.id === edu.id ? { ...item, year: e.target.value } : item))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                  className="text-sm border-b border-gray-400 focus:outline-none focus:border-violet-500 bg-transparent w-16 flex-shrink-0"
                  placeholder="Année"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-1">
                  <p
                    className="text-sm cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors duration-200 w-16 flex-shrink-0 text-center"
                    onClick={() => setEditingField(`educationYear-${edu.id}`)}
                    style={{ color: `#${contentColor}` }}
                    title={edu.year}
                  >
                    {edu.year}
                  </p>
                  {/* Delete button */}
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="p-1 text-red-600 hover:text-red-800 transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                    title="Supprimer cette formation"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              )}

            </div>
          </div>
        ))}
    </div>
  );
};
