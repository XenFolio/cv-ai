import React, { useEffect, useState } from 'react';
import { Clock, X, Search, Trash2 } from 'lucide-react';
import { JobSearchFilters } from '../../types/jobs';
import { jobService } from '../../services/jobService';

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

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = () => {
    const searches = jobService.getRecentSearches(5);
    const stats = jobService.getCacheStats();
    setRecentSearches(searches);
    setCacheStats(stats);
  };

  const handleSelectSearch = (filters: JobSearchFilters) => {
    onSelectSearch(filters);
  };

  const handleDeleteSearch = (filters: JobSearchFilters, e: React.MouseEvent) => {
    e.stopPropagation();
    jobService.removeSearchFromCache(filters);
    loadRecentSearches();
  };

  const handleClearAll = () => {
    jobService.clearPersistentCache();
    setRecentSearches([]);
    setCacheStats({ total: 0, recent: 0, expired: 0 });
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

  if (recentSearches.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/30 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-900">Recherches récentes</h3>
          <span className="text-xs text-gray-500">({cacheStats.recent} sauvegardées)</span>
        </div>

        {recentSearches.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
            title="Effacer toutes les recherches"
          >
            <Trash2 className="w-3 h-3" />
            Tout effacer
          </button>
        )}
      </div>

      <div className="space-y-2">
        {recentSearches.map((filters, index) => (
          <div
            key={index}
            className="group relative flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            onClick={() => handleSelectSearch(filters)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <Search className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {formatFilters(filters)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatRelativeTime(filters)}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => handleDeleteSearch(filters, e)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-600"
              title="Supprimer cette recherche"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {cacheStats.expired > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {cacheStats.expired} recherche{cacheStats.expired > 1 ? 's' : ''} expirée{cacheStats.expired > 1 ? 's' : ''} nettoyée{cacheStats.expired > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};