import React from 'react';
import { Search, X } from 'lucide-react';
import { useCVCreator } from './CVCreatorContext.hook';

interface SkillsLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: {
    border: string;
    input: string;
    content: string;
  };
}

export const SkillsLibraryModal: React.FC<SkillsLibraryModalProps> = ({
  isOpen,
  onClose,
  colors
}) => {
  const {
    selectedSkillsCategory,
    setSelectedSkillsCategory,
    availableSkillsCategories,
    categorySkills,
    searchSkillsQuery,
    setSearchSkillsQuery,
    skillsSearchResults,
    addSkillFromLibrary
  } = useCVCreator();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-start z-50 pt-8">
      <div
        className="bg-white rounded-lg shadow-xl max-w-[420px] w-full max-h-[85vh] overflow-hidden"
        style={{
          borderColor: colors.border ? `#${colors.border}` : '#d1d5db',
          marginLeft: '2px'
        }}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-4 py-0 border-b bg-gradient-to-r from-violet-500 via-pink-500 to-white">
          <h3
            className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-violet-200 drop-shadow-lg"
            style={{
              textShadow: '2px 2px 4px rgba(139, 92, 246, 0.3), 0 4px 8px rgba(236, 72, 153, 0.2)'
            }}
          >
            Bibliothèque de compétences
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors drop-shadow-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
          {/* Barre de recherche */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une compétence..."
                value={searchSkillsQuery}
                onChange={(e) => setSearchSkillsQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:border-violet-500"
                style={{
                  borderColor: colors.border ? `#${colors.border}` : '#d1d5db',
                  color: `#${colors.input}`
                }}
              />
            </div>
          </div>

          {/* Résultats de recherche */}
          {skillsSearchResults.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Résultats de recherche</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {skillsSearchResults.map((skill) => (
                  <div
                    key={skill.id}
                    onClick={() => addSkillFromLibrary(skill)}
                    className="text-left px-3 py-2 text-sm border rounded-lg hover:text-violet-600 hover:bg-violet-50 hover:border-violet-300 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    style={{
                      borderColor: colors.border ? `#${colors.border}` : '#d1d5db',
                      color: `#${colors.content}`
                    }}
                    title={skill.name}
                  >
                    <div className="font-medium">{skill.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{skill.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sélecteur de catégorie */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie de compétences
            </label>
            <select
              value={selectedSkillsCategory}
              onChange={(e) => setSelectedSkillsCategory(e.target.value)}
              className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:border-violet-500 bg-white cursor-pointer shadow-sm"
              style={{
                borderColor: colors.border ? `#${colors.border}` : '#d1d5db',
                color: `#${colors.input}`,
              }}
            >
              {availableSkillsCategories.length > 0 ? (
                availableSkillsCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))
              ) : (
                <option value="">Aucune catégorie disponible</option>
              )}
            </select>
          </div>

          {/* Compétences par catégorie */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Compétences disponibles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {categorySkills.map((skill) => (
                <div
                  key={skill.id}
                  onClick={() => addSkillFromLibrary(skill)}
                  className="text-left p-3 text-sm border rounded-lg hover:bg-violet-50 hover:border-violet-300 transition-all cursor-pointer shadow-sm hover:shadow-md"
                  style={{
                    borderColor: colors.border ? `#${colors.border}` : '#d1d5db',
                    color: `#${colors.content}`
                  }}
                  title={skill.name}
                >
                  <div className="font-medium">{skill.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{skill.category}</div>
                </div>
              ))}
            </div>

            {categorySkills.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="mb-2">
                  <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-sm">Aucune compétence trouvée pour cette catégorie</p>
                <p className="text-xs mt-1">Essayez une autre catégorie ou utilisez la recherche</p>
              </div>
            )}
          </div>
        </div>

        {/* Pied de page */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {categorySkills.length} compétence{categorySkills.length !== 1 ? 's' : ''} dans cette catégorie
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-violet-500 text-white text-sm rounded-lg hover:bg-violet-600 transition-colors shadow-sm hover:shadow-md"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};