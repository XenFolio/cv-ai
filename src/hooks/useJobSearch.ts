import { useState, useEffect, useCallback } from 'react';
import { JobOffer, JobSearchFilters, JobSearchResult, JobSearchStats } from '../types/jobs';
import { jobService } from '../services/jobService';

interface UseJobSearchReturn {
  jobs: JobOffer[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  stats: JobSearchStats | null;
  searchJobs: (filters: JobSearchFilters, page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
  refreshResults: () => Promise<void>;
  findSimilarJobs: (cvKeywords: string[], location?: string) => Promise<void>;
}

export const useJobSearch = (): UseJobSearchReturn => {
  // Initialiser avec les jobs du localStorage s'ils existent
  const [jobs, setJobs] = useState<JobOffer[]>(() => {
    try {
      const savedJobs = localStorage.getItem('jobSearchResults');
      return savedJobs ? JSON.parse(savedJobs) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState<JobSearchStats | null>(null);
  const [lastFilters, setLastFilters] = useState<JobSearchFilters | null>(null);

  // Recherche d'offres d'emploi
  const searchJobs = useCallback(async (filters: JobSearchFilters, page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await jobService.searchJobsMultiSource(filters, page);
      
      if (response.success && response.data) {
        const { jobs: newJobs, totalCount, totalPages, hasMore } = response.data;
        
        let updatedJobs;
        if (page === 1) {
          updatedJobs = newJobs;
          setJobs(updatedJobs);
        } else {
          updatedJobs = [...jobs, ...newJobs];
          setJobs(updatedJobs);
        }

        // Sauvegarder dans le localStorage
        localStorage.setItem('jobSearchResults', JSON.stringify(updatedJobs));
        
        setTotalCount(totalCount);
        setCurrentPage(page);
        setTotalPages(totalPages);
        setHasMore(hasMore);
        setLastFilters(filters);
        
        // Calculer les statistiques
        updateStats(newJobs);
      } else {
        setError(response.error || 'Erreur lors de la recherche');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger plus de résultats
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !lastFilters) return;
    
    await searchJobs(lastFilters, currentPage + 1);
  }, [hasMore, loading, lastFilters, currentPage, searchJobs]);

  // Vider les résultats
  const clearResults = useCallback(() => {
    setJobs([]);
    setTotalCount(0);
    setCurrentPage(1);
    setTotalPages(0);
    setHasMore(false);
    setStats(null);
    setError(null);
    setLastFilters(null);

    // Supprimer du localStorage
    localStorage.removeItem('jobSearchResults');
  }, []);

  // Actualiser les résultats
  const refreshResults = useCallback(async () => {
    if (!lastFilters) return;
    
    jobService.clearCache();
    await searchJobs(lastFilters, 1);
  }, [lastFilters, searchJobs]);

  // Rechercher des emplois similaires basés sur les mots-clés du CV
  const findSimilarJobs = useCallback(async (cvKeywords: string[], location?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await jobService.findSimilarJobs(cvKeywords, location);
      
      if (response.success && response.data) {
        const { jobs: similarJobs, totalCount, totalPages, hasMore } = response.data;
        
        setJobs(similarJobs);
        setTotalCount(totalCount);
        setCurrentPage(1);
        setTotalPages(totalPages);
        setHasMore(hasMore);

        // Sauvegarder dans le localStorage
        localStorage.setItem('jobSearchResults', JSON.stringify(similarJobs));
        
        // Mettre à jour les filtres pour permettre le loadMore
        setLastFilters({
          query: cvKeywords.slice(0, 5).join(' '),
          location: location || 'France',
          publishedSince: 30
        });
        
        updateStats(similarJobs);
      } else {
        setError(response.error || 'Erreur lors de la recherche d\'emplois similaires');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour les statistiques
  const updateStats = useCallback((jobList: JobOffer[]) => {
    if (jobList.length === 0) {
      setStats(null);
      return;
    }

    const bySource: Record<JobOffer['source'], number> = {
      'indeed': 0,
      'linkedin': 0,
      'welcometothejungle': 0,
      'apec': 0,
      'pole-emploi': 0,
      'github': 0,
      'careerjet': 0,
      'themuse': 0,
      'adzuna': 0,
      'jsearch': 0,
      'activejobsdb': 0,
      'other': 0
    };

    const byLocation: Record<string, number> = {};
    const byContractType: Record<JobOffer['contractType'], number> = {
      'CDI': 0,
      'CDD': 0,
      'Stage': 0,
      'Freelance': 0,
      'Alternance': 0
    };

    let totalSalary = 0;
    let salaryCount = 0;

    jobList.forEach(job => {
      // Par source
      bySource[job.source]++;
      
      // Par localisation
      const location = job.location.split(',')[0].trim();
      byLocation[location] = (byLocation[location] || 0) + 1;
      
      // Par type de contrat
      byContractType[job.contractType]++;
      
      // Salaire moyen
      if (job.salary?.min && job.salary?.max) {
        totalSalary += (job.salary.min + job.salary.max) / 2;
        salaryCount++;
      }
    });

    setStats({
      totalJobs: jobList.length,
      bySource,
      byLocation,
      byContractType,
      averageSalary: salaryCount > 0 ? Math.round(totalSalary / salaryCount) : undefined,
      lastUpdated: new Date()
    });
  }, []);

  return {
    jobs,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    hasMore,
    stats,
    searchJobs,
    loadMore,
    clearResults,
    refreshResults,
    findSimilarJobs
  };
};
