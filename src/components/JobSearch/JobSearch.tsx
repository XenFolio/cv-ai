import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Filter, Briefcase, RefreshCw, TrendingUp } from 'lucide-react';
import { useJobSearch } from '../../hooks/useJobSearch';
import { JobSearchFilters } from '../../types/jobs';
import { JobCard, JobFilters, JobStats, RecentSearches } from './';
import { Pagination } from '../UI/Pagination';
import { LoadingState, ProgressIndicator, InteractiveButton, useToast, ToastNotification } from '../UI/AdvancedLoadingStates';
import { BreadcrumbNavigation } from '../UI/BreadcrumbNavigation';
import { useAppStore } from '../../store/useAppStore';
import { NavigationIcons } from '../UI/iconsData';

// Wrapper component for toast notifications
const JobSearchToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

interface JobSearchProps {
  initialKeywords?: string[];
  initialLocation?: string;
  onAnalyzeJob?: (jobId: string) => void;
}

export const JobSearch: React.FC<JobSearchProps> = ({
  initialKeywords = [],
  initialLocation = '',
  onAnalyzeJob
}) => {
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const {
    jobs,
    loading,
    error,
    totalCount,
    currentPage: hookCurrentPage,
    totalPages,
    stats,
    searchJobs,
    refreshResults,
    findSimilarJobs
  } = useJobSearch();

  const { addToast } = useToast();

  const [filters, setFilters] = useState<JobSearchFilters>({
    query: initialKeywords.join(' '),
    location: initialLocation || 'France',
    publishedSince: 30
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'manual' | 'cv-based'>('manual');
  const [itemsPerPage] = useState(20);
  const [searchProgress, setSearchProgress] = useState(0);

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
    setSearchProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      await searchJobs(filters, 1);
      setSearchProgress(100);
      addToast('Recherche terminée avec succès', 'success');
    } catch  {
      addToast('Erreur lors de la recherche', 'error');
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setSearchProgress(0), 1000);
    }
  };

  // Gestion du changement de page
  const handlePageChange = async (page: number) => {
    await searchJobs(filters, page);
  };

  // Gestion de la recherche basée sur le CV
  const handleCVBasedSearch = async () => {
    if (initialKeywords.length === 0) return;

    setSearchMode('cv-based');
    setSearchProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => Math.min(prev + 15, 90));
    }, 200);

    try {
      await findSimilarJobs(initialKeywords, filters.location);
      setSearchProgress(100);
      addToast('Analyse CV terminée', 'success');
    } catch  {
      addToast('Erreur lors de l\'analyse CV', 'error');
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setSearchProgress(0), 1000);
    }
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
      await searchJobs(filters, 1);
    }
  };

  // Gestion de la sélection d'une recherche récente
  const handleSelectRecentSearch = (selectedFilters: JobSearchFilters) => {
    setFilters(selectedFilters);
    searchJobs(selectedFilters, 1);
  };

  // Gestion de l'analyse d'offre
  const handleAnalyzeJob = (jobId: string) => {
    onAnalyzeJob?.(jobId);
    addToast('Analyse de l\'offre démarrée', 'info');
  };

  // Gestion du rafraîchissement avec réinitialisation de la page
  const handleRefreshResults = async () => {
    try {
      await refreshResults();
      addToast('Résultats actualisés', 'success');
    } catch  {
      addToast('Erreur lors du rafraîchissement', 'error');
    }
  };

  return (
    <>
      <Helmet>
        <title>Recherche d'Emploi - CV ATS Assistant</title>
        <meta name="description" content="Trouvez des offres d'emploi correspondant à votre profil. Recherche intelligente basée sur votre CV analysé." />
        <meta name="keywords" content="recherche emploi, offres d'emploi, CV, candidature, recrutement" />
      </Helmet>

      {/* Toast container pour les notifications */}
      <JobSearchToastContainer />

      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 pt-0 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header responsive */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <BreadcrumbNavigation
                items={[
                  {
                    label: 'Accueil',
                    icon: NavigationIcons.Home,
                    onClick: () => setActiveTab('dashboard')
                  },
                  {
                    label: 'Jobs',
                    onClick: () => setActiveTab('job-search')
                  },
                  { label: 'Recherche d\'Emploi', current: true }
                ]}
                showHome={false}
                className="justify-start"
              />
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl animate-scaleIn flex-shrink-0">
                <Briefcase className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-400 bg-clip-text text-transparent mb-2">
                Recherche d'Emploi
              </h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl sm:max-w-none mx-auto sm:mx-0">
                Découvrez des opportunités professionnelles adaptées à votre profil
                {initialKeywords.length > 0 && ' basées sur votre CV analysé'}
              </p>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="text-white bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-gray-200/30 dark:border-gray-700/30 mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Champ de recherche */}
              <div className="flex-1 relative">
                <label htmlFor="job-search" className="sr-only">Rechercher des offres d'emploi</label>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
                <input
                  id="job-search"
                  type="search"
                  placeholder="Poste, compétences, entreprise..."
                  value={filters.query || ''}
                  onChange={(e) => handleFiltersChange({ query: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className=" text-gray-900 w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                  aria-label="Rechercher des offres d'emploi"
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
                  className="text-gray-900 w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-0 focus:ring-violet-500 focus:border-transparent hover:border-violet-500 transition-all duration-200"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2">
                <InteractiveButton
                  onClick={handleSearch}
                  loading={loading}
                  disabled={!filters.query?.trim()}
                  icon={loading ? undefined : <Search className="w-4 h-4" />}
                  variant="primary"
                  className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white"
                >
                  {loading ? 'Recherche...' : 'Rechercher'}
                </InteractiveButton>

                <InteractiveButton
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  icon={<Filter className="w-4 h-4" />}
                  size="md"
                >
                  Filtres
                </InteractiveButton>
              </div>
            </div>

            {/* Progress Indicator */}
            {searchProgress > 0 && (
              <ProgressIndicator
                progress={searchProgress}
                label={searchMode === 'cv-based' ? 'Analyse CV en cours...' : 'Recherche en cours...'}
                className="mt-4"
                size="sm"
              />
            )}

            {/* Recherche basée sur le CV */}
            {initialKeywords.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Mots-clés de votre CV : {initialKeywords.slice(0, 3).join(', ')}</span>
                    {initialKeywords.length > 3 && <span>+{initialKeywords.length - 3} autres</span>}
                  </div>
                  <InteractiveButton
                    onClick={handleCVBasedSearch}
                    loading={loading}
                    variant="primary"
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    Emplois similaires à mon CV
                  </InteractiveButton>
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

          {/* Barre d'informations et recherches récentes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Informations principales */}
            <div className="lg:col-span-2">
              {(jobs.length > 0 || loading) && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      {loading ? 'Recherche en cours...' : `${totalCount} offres disponibles • ${jobs.length} affichées`}
                    </span>
                    {searchMode === 'cv-based' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Basé sur votre CV
                      </span>
                    )}
                  </div>

                  {jobs.length > 0 && (
                    <div className="flex gap-2">
                      <InteractiveButton
                        onClick={handleRefreshResults}
                        loading={loading}
                        variant="ghost"
                        size="sm"
                        className="p-2"
                        title="Actualiser"
                        icon={<RefreshCw className="w-4 h-4" />}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recherches récentes en largeur */}
            <div className="lg:col-span-3">
              <RecentSearches
                onSelectSearch={handleSelectRecentSearch}
              />
            </div>
          </div>

          {/* Zone des résultats avec sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar gauche */}
            <div className="lg:col-span-1 space-y-4">
              {/* Statistiques */}
              {stats && <JobStats stats={stats} />}
            </div>

            {/* Résultats centraux */}
            <div className="lg:col-span-3">
              {/* Message d'erreur */}
              {error && (
                <LoadingState
                  isLoading={false}
                  error={error}
                  className="mb-6"
                >
                  <InteractiveButton
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    Réessayer
                  </InteractiveButton>
                </LoadingState>
              )}

              {/* Liste des offres */}
              <LoadingState
                isLoading={loading && jobs.length === 0}
                error={error}
                variant="skeleton"
              >
                <div className="space-y-4">
                  {jobs.length === 0 && !loading && !error ? (
                    <div className="text-center py-12">
                      <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        {initialKeywords.length > 0 ? 'Aucune offre correspondante' : 'Commencez votre recherche'}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {initialKeywords.length > 0
                          ? 'Essayez d\'élargir vos critères de recherche'
                          : 'Entrez des mots-clés pour trouver des offres d\'emploi'
                        }
                      </p>
                      <InteractiveButton
                        onClick={() => document.getElementById('job-search')?.focus()}
                        variant="primary"
                      >
                        {initialKeywords.length > 0 ? 'Modifier la recherche' : 'Commencer'}
                      </InteractiveButton>
                    </div>
                  ) : (
                    jobs.map((job) => (
                      <JobCard
                        key={`${job.source}-${job.id}`}
                        job={job}
                        onAnalyze={handleAnalyzeJob}
                      />
                    ))
                  )}
                </div>
              </LoadingState>

              {/* Pagination */}
              {jobs.length > 0 && !loading && totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={hookCurrentPage}
                    totalPages={totalPages}
                    totalItems={totalCount}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                  />
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
                    <InteractiveButton
                      onClick={handleCVBasedSearch}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      Rechercher avec les mots-clés de mon CV
                    </InteractiveButton>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};
