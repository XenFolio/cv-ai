import React from 'react';
import { Sparkles, Plus, Minus } from 'lucide-react';
import type { CVContent, CVEducation } from '../types';

interface EducationSectionProps {
  editableContent: CVContent;
  setEditableContent: React.Dispatch<React.SetStateAction<CVContent>>;
  educations: CVEducation[];
  setEducations: React.Dispatch<React.SetStateAction<CVEducation[]>>;
  editingField: string | null;
  setEditingField: React.Dispatch<React.SetStateAction<string | null>>;
  customColor: string;
  titleColor: string;
  addEducation: () => void;
  removeEducation: (id: number) => void;
  generateWithAI: (field: string, currentContent?: string) => Promise<void>;
  isLoading: boolean;
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
  customColor,
  titleColor,
  addEducation,
  removeEducation,
  generateWithAI,
  isLoading
}) => {
  const [titleHovered, setTitleHovered] = React.useState(false);
  const [hoveredEduId, setHoveredEduId] = React.useState<number | null>(null);
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
              className="text-md font-semibold border-b border-gray-400 focus:outline-none focus:border-violet-500 bg-transparent"
              style={{ width: `${Math.max(editableContent.educationTitle.length * 8 + 20, 200)}px` }}
              autoFocus
            />
            <button
              onClick={addEducation}
              className="p-1 text-violet-600 hover:text-violet-800 transition-all duration-200 hover:scale-110"
              title="Ajouter une formation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-2"
            onMouseEnter={() => setTitleHovered(true)}
            onMouseLeave={() => setTitleHovered(false)}
          >
            <h4
              className="text-md font-semibold cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors duration-200"
              onClick={() => setEditingField('educationTitle')}
              style={{
                color: `#${titleColor}`,
                width: `${Math.max(editableContent.educationTitle.length * 8 + 20, 200)}px`
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
            className="relative mt-2"
            onMouseEnter={() => setHoveredEduId(edu.id)}
            onMouseLeave={() => setHoveredEduId(null)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="grid grid-cols-[2fr_2fr_1fr] gap-2 flex-1">
                {/* Diplôme */}
                {editingField === `educationDegree-${edu.id}` ? (
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => setEducations(prev => prev.map(item => item.id === edu.id ? { ...item, degree: e.target.value } : item))}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    className="text-sm w-full border-b border-gray-400 focus:outline-none focus:border-violet-500"
                    placeholder="Diplôme"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-1 relative">
                    <p
                      className="text-sm cursor-pointer hover:bg-gray-100 p-1 rounded flex-1 transition-colors duration-200"
                      onClick={() => setEditingField(`educationDegree-${edu.id}`)}
                      style={{ color: `#${customColor}` }}
                    >
                      {edu.degree}
                    </p>
                    <div className={`transition-opacity duration-200 flex-shrink-0 ${hoveredEduId === edu.id ? 'opacity-100' : 'opacity-0'}`}>
                      <AIButton
                        isLoading={isLoading}
                        onClick={() => generateWithAI('educationDegree', edu.degree)}
                        title="Modifier avec IA"
                      />
                    </div>
                  </div>
                )}

                {/* École */}
                {editingField === `educationSchool-${edu.id}` ? (
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => setEducations(prev => prev.map(item => item.id === edu.id ? { ...item, school: e.target.value } : item))}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    className="text-sm w-full border-b border-gray-400 focus:outline-none focus:border-violet-500"
                    placeholder="École"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-1 relative">
                    <p
                      className="text-sm cursor-pointer hover:bg-gray-100 p-1 rounded flex-1 transition-colors duration-200"
                      onClick={() => setEditingField(`educationSchool-${edu.id}`)}
                      style={{ color: `#${customColor}` }}
                    >
                      {edu.school}
                    </p>
                    <div className={`transition-opacity duration-200 flex-shrink-0 ${hoveredEduId === edu.id ? 'opacity-100' : 'opacity-0'}`}>
                      <AIButton
                        isLoading={isLoading}
                        onClick={() => generateWithAI('educationSchool', edu.school)}
                        title="Modifier avec IA"
                      />
                    </div>
                  </div>
                )}

                {/* Année - avec largeur réduite */}
                {editingField === `educationYear-${edu.id}` ? (
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => setEducations(prev => prev.map(item => item.id === edu.id ? { ...item, year: e.target.value } : item))}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    className="text-sm w-full border-b border-gray-400 focus:outline-none focus:border-violet-500"
                    placeholder="Année"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-1 relative">
                    <p
                      className="text-sm cursor-pointer hover:bg-gray-100 p-1 rounded flex-1 transition-colors duration-200"
                      onClick={() => setEditingField(`educationYear-${edu.id}`)}
                      style={{ color: `#${customColor}` }}
                    >
                      {edu.year}
                    </p>
                    <div className={`transition-opacity duration-200 flex-shrink-0 ${hoveredEduId === edu.id ? 'opacity-100' : 'opacity-0'}`}>
                      <AIButton
                        isLoading={isLoading}
                        onClick={() => generateWithAI('educationYear', edu.year)}
                        title="Modifier avec IA"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bouton supprimer visible seulement au hover */}
              <button
                onClick={() => removeEducation(edu.id)}
                className={`p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200 hover:scale-110 ${hoveredEduId === edu.id ? 'opacity-100' : 'opacity-0'}`}
                title="Supprimer la formation"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};
