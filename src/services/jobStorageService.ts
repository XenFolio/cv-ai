import { JobSearchResult, JobSearchFilters } from '../types/jobs';

interface CachedJobSearch {
  data: JobSearchResult;
  timestamp: number;
  filters: JobSearchFilters;
}

class JobStorageService {
  private readonly STORAGE_KEY = 'cv_ai_job_searches';
  private readonly MAX_SEARCHES = 10; // Garder les 10 dernières recherches
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

  // Sauvegarder une recherche
  saveSearch(filters: JobSearchFilters, result: JobSearchResult): void {
    try {
      const searches = this.getAllSearches();

      // Supprimer les recherches identiques existantes
      const filteredSearches = searches.filter(search =>
        !this.areFiltersEqual(search.filters, filters)
      );

      // Ajouter la nouvelle recherche au début
      const newSearch: CachedJobSearch = {
        data: result,
        timestamp: Date.now(),
        filters: { ...filters }
      };

      // Garder seulement les MAX_SEARCHES plus récentes
      const updatedSearches = [newSearch, ...filteredSearches].slice(0, this.MAX_SEARCHES);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSearches));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde de la recherche:', error);
    }
  }

  // Récupérer une recherche spécifique
  getSearch(filters: JobSearchFilters): JobSearchResult | null {
    try {
      const searches = this.getAllSearches();
      const cachedSearch = searches.find(search => this.areFiltersEqual(search.filters, filters));

      if (cachedSearch && !this.isExpired(cachedSearch.timestamp)) {
        return cachedSearch.data;
      }

      return null;
    } catch (error) {
      console.warn('Erreur lors de la récupération de la recherche:', error);
      return null;
    }
  }

  // Récupérer toutes les recherches valides
  getAllSearches(): CachedJobSearch[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const searches: CachedJobSearch[] = JSON.parse(stored);

      // Filtrer les recherches expirées
      return searches.filter(search => !this.isExpired(search.timestamp));
    } catch (error) {
      console.warn('Erreur lors de la lecture des recherches:', error);
      return [];
    }
  }

  // Récupérer les recherches récentes pour l'historique
  getRecentSearches(limit = 5): JobSearchFilters[] {
    try {
      const searches = this.getAllSearches();
      return searches
        .slice(0, limit)
        .map(search => search.filters);
    } catch (error) {
      console.warn('Erreur lors de la récupération des recherches récentes:', error);
      return [];
    }
  }

  // Supprimer une recherche spécifique
  deleteSearch(filters: JobSearchFilters): void {
    try {
      const searches = this.getAllSearches();
      const filteredSearches = searches.filter(search =>
        !this.areFiltersEqual(search.filters, filters)
      );

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSearches));
    } catch (error) {
      console.warn('Erreur lors de la suppression de la recherche:', error);
    }
  }

  // Vider toutes les recherches
  clearAllSearches(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Erreur lors du nettoyage des recherches:', error);
    }
  }

  // Vérifier si une recherche est expirée
  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.CACHE_DURATION;
  }

  // Comparer deux filtres de recherche
  private areFiltersEqual(filters1: JobSearchFilters, filters2: JobSearchFilters): boolean {
    return (
      filters1.query === filters2.query &&
      filters1.location === filters2.location &&
      JSON.stringify(filters1.contractType || []) === JSON.stringify(filters2.contractType || []) &&
      JSON.stringify(filters1.experience || []) === JSON.stringify(filters2.experience || []) &&
      filters1.remote === filters2.remote &&
      filters1.salaryMin === filters2.salaryMin &&
      filters1.salaryMax === filters2.salaryMax
    );
  }

  // Obtenir des statistiques sur le cache
  getCacheStats(): { total: number; recent: number; expired: number } {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return { total: 0, recent: 0, expired: 0 };

      const allSearches: CachedJobSearch[] = JSON.parse(stored);
      const validSearches = allSearches.filter(search => !this.isExpired(search.timestamp));

      return {
        total: allSearches.length,
        recent: validSearches.length,
        expired: allSearches.length - validSearches.length
      };
    } catch (error) {
      return { total: 0, recent: 0, expired: 0 };
    }
  }
}

export const jobStorageService = new JobStorageService();