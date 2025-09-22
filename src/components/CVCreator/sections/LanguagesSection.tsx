import React from 'react';
import { Sparkles, Plus, Minus } from 'lucide-react';
import type { CVContent, CVLanguage } from '../types';
import { useCVCreator } from '../CVCreatorContext.hook';

interface LanguagesSectionProps {
  editableContent: CVContent;
  setEditableContent: React.Dispatch<React.SetStateAction<CVContent>>;
  languages: CVLanguage[];
  setLanguages: React.Dispatch<React.SetStateAction<CVLanguage[]>>;
  editingField: string | null;
  setEditingField: React.Dispatch<React.SetStateAction<string | null>>;
  titleColor: string;
  addLanguage: () => void;
  removeLanguage: (id: number) => void;
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

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  editableContent,
  setEditableContent,
  languages,
  setLanguages,
  editingField,
  setEditingField,
  titleColor,
  addLanguage,
  removeLanguage,
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
  const [hoveredLangId, setHoveredLangId] = React.useState<number | null>(null);
  return (
    <div className="mt-0">
      {editingField === 'languagesTitle' ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editableContent.languagesTitle}
            onChange={(e) => setEditableContent(prev => ({ ...prev, languagesTitle: e.target.value }))}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
            className="text-sm font-semibold border-b border-gray-400 focus:outline-none focus:border-violet-500 bg-transparent"
            style={{
              width: `${Math.max(editableContent.languagesTitle.length * 7 + 20, 180)}px`,
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
            onClick={() => setEditingField('languagesTitle')}
            style={{ color: `#${textColor}` }}
          >
            {editableContent.languagesTitle}
          </h4>
          <div className={`flex gap-1 ml-auto transition-opacity duration-200 ${titleHovered ? 'opacity-100' : 'opacity-0'}`}>
            <AIButton
              isLoading={isLoading}
              onClick={() => generateWithAI('languagesTitle', editableContent.languagesTitle)}
              title="Modifier avec IA"
            />
            <button
              onClick={addLanguage}
              className="p-1 text-violet-600 hover:text-violet-800 transition-all duration-200 hover:scale-110"
              title="Ajouter une langue"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Liste des langues */}
      <div className="mt-2">
        {languages.map(lang => (
          <div
            key={lang.id}
            className="relative flex items-start gap-2 mt-1"
            onMouseEnter={() => setHoveredLangId(lang.id)}
            onMouseLeave={() => setHoveredLangId(null)}
          >
            <div className={`absolute right-0 top-0 flex gap-1 transition-opacity duration-200 ${hoveredLangId === lang.id ? 'opacity-100' : 'opacity-0'}`}>
              <AIButton
                isLoading={isLoading}
                onClick={() => generateWithAI(`languageLevel-${lang.id}`, lang.level)}
                title="Générer le niveau avec IA"
              />
              <button
                onClick={() => removeLanguage(lang.id)}
                className="p-1 text-red-600 hover:text-red-800"
                title="Supprimer la langue"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 flex-1">
              {editingField === `languageName-${lang.id}` ? (
                <input
                  type="text"
                  value={lang.name}
                  onChange={(e) => setLanguages(prev => prev.map(item => item.id === lang.id ? { ...item, name: e.target.value } : item))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                  className="text-sm border-b border-gray-400 focus:outline-none focus:border-violet-500"
                  placeholder="Langue"
                  style={{ width: `${Math.max(lang.name.length * 8 + 20, 80)}px` }}
                  autoFocus
                />
              ) : (
                <p
                  className="text-sm cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors duration-200"
                  onClick={() => setEditingField(`languageName-${lang.id}`)}
                  style={{ color: `#${contentColor}`, width: `${Math.max(lang.name.length * 8 + 20, 80)}px` }}
                >
                  {lang.name}
                </p>
              )}

              {editingField === `languageLevel-${lang.id}` ? (
                <select
                  value={lang.level}
                  onChange={(e) => setLanguages(prev => prev.map(item => item.id === lang.id ? { ...item, level: e.target.value } : item))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                  className="text-sm border border-gray-400 rounded focus:outline-none focus:border-violet-500 px-2 py-1 bg-white"
                  style={{ width: `${Math.max(lang.level.length * 8 + 40, 120)}px` }}
                  autoFocus
                >
                  <option value="">Sélectionner un niveau</option>
                  <option value="Débutant">Débutant</option>
                  <option value="Élémentaire">Élémentaire</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Courant">Courant</option>
                  <option value="Avancé">Avancé</option>
                  <option value="Bilingue">Bilingue</option>
                  <option value="Natif">Natif</option>
                </select>
              ) : (
                <p
                  className="text-sm cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors duration-200"
                  onClick={() => setEditingField(`languageLevel-${lang.id}`)}
                  style={{ color: `#${contentColor}`, width: `${Math.max(lang.level.length * 8 + 40, 100)}px` }}
                >
                  ({lang.level})
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
