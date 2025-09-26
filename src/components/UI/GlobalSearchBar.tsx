import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp, FileText, Briefcase, MessageSquare, Users } from 'lucide-react';
import { ProfessionalIcon, NavigationIcons, DocumentIcons, CareerIcons } from './ProfessionalIcons';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'cv' | 'job' | 'template' | 'conversation' | 'article';
  title: string;
  description: string;
  path: string;
  icon?: React.ComponentType<any>;
  category?: string;
  relevance?: number;
}

interface GlobalSearchBarProps {
  className?: string;
  placeholder?: string;
  maxResults?: number;
  showCategories?: boolean;
  showRecentSearches?: boolean;
  onSearch?: (query: string) => void;
  onResultSelect?: (result: SearchResult) => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  className = '',
  placeholder = 'Rechercher partout...',
  maxResults = 8,
  showCategories = true,
  showRecentSearches = true,
  onSearch,
  onResultSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Charger les recherches récentes depuis le localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('globalSearchRecent');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Sauvegarder les recherches récentes
  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('globalSearchRecent', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  // Simuler une recherche globale
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    onSearch?.(searchQuery);

    // Simuler des résultats de recherche
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'cv',
          title: 'Développeur Full Stack',
          description: 'CV créé le 15/09/2024',
          path: '/cv/analyze',
          icon: DocumentIcons.FileText,
          category: 'Mes Documents'
        },
        {
          id: '2',
          type: 'job',
          title: 'Développeur React Senior',
          description: 'Paris • CDI • 60-80k€',
          path: '/jobs',
          icon: CareerIcons.Briefcase,
          category: 'Offres d\'emploi'
        },
        {
          id: '3',
          type: 'template',
          title: 'Template Moderne',
          description: 'CV template design moderne',
          path: '/templates',
          icon: DocumentIcons.FileText,
          category: 'Modèles'
        },
        {
          id: '4',
          type: 'conversation',
          title: 'Conseils carrière',
          description: 'Conversation avec le coach IA',
          path: '/coach/chat-general',
          icon: MessageSquare,
          category: 'Coach IA'
        }
      ].filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(mockResults.slice(0, maxResults));
      setLoading(false);
    }, 300);
  };

  // Gérer la recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Gérer le focus et le blur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        resultsRef.current && !resultsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gérer la navigation au clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length + recentSearches.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const totalItems = recentSearches.length + results.length;
          if (selectedIndex < recentSearches.length) {
            handleRecentSearchSelect(recentSearches[selectedIndex]);
          } else {
            const resultIndex = selectedIndex - recentSearches.length;
            handleResultSelect(results[resultIndex]);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Gérer la sélection d'un résultat
  const handleResultSelect = (result: SearchResult) => {
    saveRecentSearch(query);
    onResultSelect?.(result);
    navigate(result.path);
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);

    // Annonce pour les lecteurs d'écran
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Navigation vers ${result.title}`;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  // Gérer la sélection d'une recherche récente
  const handleRecentSearchSelect = (searchTerm: string) => {
    setQuery(searchTerm);
    inputRef.current?.focus();
  };

  // Gérer le clear
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Rendre l'icône selon le type
  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      cv: DocumentIcons.FileText,
      job: CareerIcons.Briefcase,
      template: DocumentIcons.FileText,
      conversation: MessageSquare,
      article: FileText
    };
    return iconMap[type] || NavigationIcons.Search;
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      cv: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
      job: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
      template: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
      conversation: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
      article: 'text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-900/20'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <ProfessionalIcon
            icon={NavigationIcons.Search}
            size="sm"
            className="text-gray-400 dark:text-gray-500"
          />
        </div>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
          aria-label="Recherche globale"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Effacer la recherche"
          >
            <ProfessionalIcon
              icon={NavigationIcons.X}
              size="sm"
              animated
            />
          </button>
        )}
      </div>

      {isOpen && (query || showRecentSearches) && (
        <div
          id="search-results"
          ref={resultsRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-[1000] animate-fadeIn"
        >
          {/* Recent searches */}
          {showRecentSearches && !query && recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recherches récentes
                </h3>
                <button
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('globalSearchRecent');
                  }}
                  className="text-xs text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Effacer
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={search}
                    onClick={() => handleRecentSearchSelect(search)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedIndex === index
                        ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="p-6 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                Recherche en cours...
              </div>
            </div>
          )}

          {/* Search results */}
          {!loading && query && results.length === 0 && (
            <div className="p-6 text-center">
              <ProfessionalIcon
                icon={NavigationIcons.Search}
                size="lg"
                className="text-gray-300 dark:text-gray-600 mx-auto mb-2"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucun résultat trouvé pour "{query}"
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-2">
              {showCategories && (
                <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Résultats de recherche
                </div>
              )}
              <div className="space-y-1">
                {results.map((result, index) => {
                  const globalIndex = recentSearches.length + index;
                  const Icon = getTypeIcon(result.type);

                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultSelect(result)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 ${
                        selectedIndex === globalIndex
                          ? 'bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                      role="option"
                      aria-selected={selectedIndex === globalIndex}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg ${getTypeColor(result.type)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {result.title}
                            </h4>
                            {result.category && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {result.category}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {result.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer with keyboard shortcuts */}
          <div className="p-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Utilisez ↑↓ pour naviguer</span>
              <span>⏎ Enter pour sélectionner</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;