import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Filter, Briefcase, RefreshCw, TrendingUp } from 'lucide-react';
import { useJobSearch } from '../../hooks/useJobSearch';
import { JobSearchFilters } from '../../types/jobs';
import { JobCard, JobFilters, JobStats } from './';

interface JobSearchProps {
  initialKeywords?: string[];
  initialLocation?: string;
}

export const JobSearch: React.FC<JobSearchProps> = ({ 
  initialKeywords = [], 
  initialLocation = '' 
}) => {
  const {
    jobs,
    loading,
    error,
    totalCount,
    hasMore,
    stats,
    searchJobs,
    loadMore,
    refreshResults,
    findSimilarJobs
  } = useJobSearch();

  const [filters, setFilters] = useState<JobSearchFilters>({
    query: initialKeywords.join(' '),
    location: initialLocation || 'France',
    publishedSince: 30
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'manual' | 'cv-based'>('manual');

  // Recherche initiale si des mots-clés sont fournis
  useEffect(() => {
    if (initialKeywords.length > 0) {
      setSearchMode('cv-based');
      findSimilarJobs(initialKeywords, initialLocation);
    }
  }, [initialKeywords, initialLocation, findSimilarJobs]);

  // Gestion de la recherche
  const handleSearch = async () => {
    if (!filters.query?.trim()) return;
    
    setSearchMode('manual');
    await searchJobs(filters);
  };

  // Gestion de la recherche basée sur le CV
  const handleCVBasedSearch = async () => {
    if (initialKeywords.length === 0) return;
    
    setSearchMode('cv-based');
    await findSimilarJobs(initialKeywords, filters.location);
  };

  // Gestion des filtres
  const handleFiltersChange = (newFilters: Partial<JobSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Appliquer les filtres
  const applyFilters = async () => {
    setShowFilters(false);
    if (searchMode === 'cv-based' && initialKeywords.length > 0) {
      await findSimilarJobs(initialKeywords, filters.location);
    } else {
      await searchJobs(filters);
    }
  };

  return (
    <>
      <Helmet>
        <title>Recherche d'Emploi - CV ATS Assistant</title>
        <meta name="description" content="Trouvez des offres d'emploi correspondant à votre profil. Recherche intelligente basée sur votre CV analysé." />
        <meta name="keywords" content="recherche emploi, offres d'emploi, CV, candidature, recrutement" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-400 bg-clip-text text-transparent mb-2">
              Recherche d'Emploi
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez des opportunités professionnelles adaptées à votre profil
              {initialKeywords.length > 0 && ' basées sur votre CV analysé'}
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Champ de recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Poste, compétences, entreprise..."
                  value={filters.query || ''}
                  onChange={(e) => handleFiltersChange({ query: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Localisation */}
              <div className="lg:w-64 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ville, région..."
                  value={filters.location || ''}
                  onChange={(e) => handleFiltersChange({ location: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  disabled={loading || !filters.query?.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl hover:from-violet-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Rechercher
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                </button>
              </div>
            </div>

            {/* Recherche basée sur le CV */}
            {initialKeywords.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Mots-clés de votre CV : {initialKeywords.slice(0, 3).join(', ')}</span>
                    {initialKeywords.length > 3 && <span>+{initialKeywords.length - 3} autres</span>}
                  </div>
                  <button
                    onClick={handleCVBasedSearch}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 text-sm"
                  >
                    Emplois similaires à mon CV
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <JobFilters
              filters={filters}
              onChange={handleFiltersChange}
              onApply={applyFilters}
              onClose={() => setShowFilters(false)}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Statistiques */}
            <div className="lg:col-span-1">
              {stats && <JobStats stats={stats} />}
            </div>

            {/* Résultats */}
            <div className="lg:col-span-3">
              {/* Barre d'informations */}
              {(jobs.length > 0 || loading) && (
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      {loading ? 'Recherche en cours...' : `${totalCount} offres trouvées`}
                    </span>
                    {searchMode === 'cv-based' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Basé sur votre CV
                      </span>
                    )}
                  </div>
                  
                  {jobs.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={refreshResults}
                        disabled={loading}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Actualiser"
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* Liste des offres */}
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Bouton "Charger plus" */}
              {hasMore && !loading && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Charger plus d'offres
                  </button>
                </div>
              )}

              {/* Message si aucun résultat */}
              {!loading && jobs.length === 0 && !error && (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune offre trouvée
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Essayez d'ajuster vos critères de recherche ou vos filtres
                  </p>
                  {initialKeywords.length > 0 && (
                    <button
                      onClick={handleCVBasedSearch}
                      className="px-4 py-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-lg hover:from-violet-600 hover:to-pink-600 transition-all duration-200"
                    >
                      Rechercher avec les mots-clés de mon CV
                    </button>
                  )}
                </div>
              )}

              {/* Loader */}
              {loading && jobs.length === 0 && (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-violet-500 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Recherche d'offres d'emploi en cours...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
