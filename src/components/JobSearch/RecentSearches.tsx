import React, { useEffect, useState } from 'react';
import { Clock, X, Search, Trash2 } from 'lucide-react';
import { JobSearchFilters } from '../../types/jobs';
import { jobService } from '../../services/jobService';
import { InteractiveButton, LoadingState } from '../UI/AdvancedLoadingStates';

interface RecentSearchesProps {
  onSelectSearch: (filters: JobSearchFilters) => void;
  className?: string;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  onSelectSearch,
  className = ''
}) => {
  const [recentSearches, setRecentSearches] = useState<JobSearchFilters[]>([]);
  const [cacheStats, setCacheStats] = useState({ total: 0, recent: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    setLoading(true);
    setError(null);
    try {
      const searches = jobService.getRecentSearches(5);
      const stats = jobService.getCacheStats();
      setRecentSearches(searches);
      setCacheStats(stats);
    } catch (err) {
      setError('Erreur lors du chargement des recherches récentes');
      console.error('Error loading recent searches:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleSelectSearch = (filters: JobSearchFilters) => {
    // Annonce pour les lecteurs d'écran
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = 'Recherche sélectionnée';
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);

    onSelectSearch(filters);
  };

  const handleDeleteSearch = (filters: JobSearchFilters, e: React.MouseEvent) => {
    e.stopPropagation();
    jobService.removeSearchFromCache(filters);

    // Annonce pour les lecteurs d'écran
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = 'Recherche supprimée';
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);

    loadRecentSearches();
  };

  const handleClearAll = () => {
    jobService.clearPersistentCache();
    setRecentSearches([]);
    setCacheStats({ total: 0, recent: 0, expired: 0 });

    // Annonce pour les lecteurs d'écran
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = 'Toutes les recherches ont été effacées';
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const formatFilters = (filters: JobSearchFilters): string => {
    const parts = [];

    if (filters.query) {
      parts.push(`"${filters.query}"`);
    }

    if (filters.location && filters.location !== 'France') {
      parts.push(filters.location);
    }

    if (filters.remote) {
      parts.push('Télétravail');
    }

    if (filters.contractType && filters.contractType.length > 0) {
      parts.push(filters.contractType.join(', '));
    }

    return parts.length > 0 ? parts.join(' • ') : 'Recherche récente';
  };

  const formatRelativeTime = (filters: JobSearchFilters): string => {
    // Trouver la recherche correspondante pour obtenir le timestamp
    const allSearches = jobService.getRecentSearches(10);
    const search = allSearches.find(s =>
      JSON.stringify(s) === JSON.stringify(filters)
    );

    if (!search) return 'Il y a quelque temps';

    // Cette fonction est appelée depuis l'UI donc on ne peut pas accéder directement au timestamp
    return 'Recherche récente';
  };

  if (recentSearches.length === 0 && !loading && !error) {
    return null;
  }

  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-4 ${className}`}
         role="region"
         aria-label="Recherches récentes">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Recherches récentes</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">({cacheStats.recent} sauvegardées)</span>
        </div>

        {recentSearches.length > 0 && (
          <InteractiveButton
            onClick={handleClearAll}
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-3 h-3" />}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
            title="Effacer toutes les recherches"
          >
            Tout effacer
          </InteractiveButton>
        )}
      </div>

      {/* Loading State */}
      <LoadingState
        isLoading={loading}
        error={error}
        variant="skeleton"
      >

      <div className="space-y-2">
        {recentSearches.map((filters, index) => (
          <div
            key={index}
            className="group relative flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer animate-fadeIn border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
            onClick={() => handleSelectSearch(filters)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectSearch(filters);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Rechercher: ${formatFilters(filters)}`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200">
                  {formatFilters(filters)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(filters)}
                </div>
              </div>
            </div>

            <InteractiveButton
              onClick={(e) => handleDeleteSearch(filters, e)}
              variant="ghost"
              size="sm"
              icon={<X className="w-3 h-3" />}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
              title="Supprimer cette recherche"
              aria-label="Supprimer cette recherche"
            />
          </div>
        ))}
      </div>

      {cacheStats.expired > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {cacheStats.expired} recherche{cacheStats.expired > 1 ? 's' : ''} expirée{cacheStats.expired > 1 ? 's' : ''} nettoyée{cacheStats.expired > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Message quand aucune recherche */}
      {!loading && !error && recentSearches.length === 0 && (
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucune recherche récente
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Vos recherches s'afficheront ici
          </p>
        </div>
      )}
      </LoadingState>
    </div>
  );
};