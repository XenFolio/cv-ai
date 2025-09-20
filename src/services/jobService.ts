import { JobOffer, JobSearchFilters, JobSearchResult, JobApiResponse } from '../types/jobs';

// Configuration des APIs d'emploi
const JOB_APIS = {
  // API gratuite JSearch (RapidAPI)
  jsearch: {
    baseUrl: 'https://jsearch.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY || '',
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  },
  // API Adzuna (gratuite avec limite)
  adzuna: {
    baseUrl: 'https://api.adzuna.com/v1/api/jobs/fr/search',
    appId: process.env.REACT_APP_ADZUNA_APP_ID || '',
    appKey: process.env.REACT_APP_ADZUNA_APP_KEY || ''
  }
};

class JobService {
  private cache = new Map<string, { data: JobSearchResult; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Recherche via JSearch API (Indeed, LinkedIn, etc.)
  async searchJobsJSearch(filters: JobSearchFilters, page = 1): Promise<JobApiResponse> {
    try {
      const query = this.buildJSearchQuery(filters);
      const cacheKey = `jsearch-${JSON.stringify({ query, page })}`;
      
      // Vérifier le cache
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const response = await fetch(`${JOB_APIS.jsearch.baseUrl}/search?${query}&page=${page}`, {
        headers: JOB_APIS.jsearch.headers
      });

      if (!response.ok) {
        throw new Error(`JSearch API error: ${response.status}`);
      }

      const data = await response.json();
      const result = this.transformJSearchResponse(data);
      
      // Mettre en cache
      this.setCachedResult(cacheKey, result);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('JSearch API error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }

  // Recherche via Adzuna API
  async searchJobsAdzuna(filters: JobSearchFilters, page = 1): Promise<JobApiResponse> {
    try {
      const query = this.buildAdzunaQuery(filters);
      const cacheKey = `adzuna-${JSON.stringify({ query, page })}`;
      
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const url = `${JOB_APIS.adzuna.baseUrl}/${page}?${query}&app_id=${JOB_APIS.adzuna.appId}&app_key=${JOB_APIS.adzuna.appKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Adzuna API error: ${response.status}`);
      }

      const data = await response.json();
      const result = this.transformAdzunaResponse(data);
      
      this.setCachedResult(cacheKey, result);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Adzuna API error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }

  // Recherche combinée depuis plusieurs sources
  async searchJobsMultiSource(filters: JobSearchFilters, page = 1): Promise<JobApiResponse> {
    const results = await Promise.allSettled([
      this.searchJobsJSearch(filters, page),
      this.searchJobsAdzuna(filters, page)
    ]);

    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<JobApiResponse> => 
        result.status === 'fulfilled' && result.value.success && !!result.value.data
      )
      .map(result => result.value.data!);

    if (successfulResults.length === 0) {
      return { 
        success: false, 
        error: 'Aucune source d\'emploi disponible' 
      };
    }

    // Combiner et dédupliquer les résultats
    const combinedJobs = this.deduplicateJobs(
      successfulResults.flatMap(result => result.jobs)
    );

    const totalCount = successfulResults.reduce((sum, result) => sum + result.totalCount, 0);

    return {
      success: true,
      data: {
        jobs: combinedJobs.slice(0, 20), // Limiter à 20 par page
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / 20),
        hasMore: combinedJobs.length > 20
      }
    };
  }

  // Recherche de jobs similaires basée sur les mots-clés du CV
  async findSimilarJobs(cvKeywords: string[], location?: string): Promise<JobApiResponse> {
    const query = cvKeywords.slice(0, 5).join(' '); // Utiliser les 5 premiers mots-clés
    
    return this.searchJobsMultiSource({
      query,
      location: location || 'France',
      publishedSince: 30 // Jobs des 30 derniers jours
    });
  }

  // Construction de la query pour JSearch
  private buildJSearchQuery(filters: JobSearchFilters): string {
    const params = new URLSearchParams();
    
    if (filters.query) params.append('query', filters.query);
    if (filters.location) params.append('location', filters.location);
    if (filters.remote) params.append('remote_jobs_only', 'true');
    if (filters.publishedSince) {
      const date = new Date();
      date.setDate(date.getDate() - filters.publishedSince);
      params.append('date_posted', 'month'); // JSearch options: today, 3days, week, month
    }
    
    params.append('num_pages', '1');
    params.append('country', 'FR');
    
    return params.toString();
  }

  // Construction de la query pour Adzuna
  private buildAdzunaQuery(filters: JobSearchFilters): string {
    const params = new URLSearchParams();
    
    if (filters.query) params.append('what', filters.query);
    if (filters.location) params.append('where', filters.location);
    if (filters.salaryMin) params.append('salary_min', filters.salaryMin.toString());
    if (filters.salaryMax) params.append('salary_max', filters.salaryMax.toString());
    
    params.append('results_per_page', '20');
    params.append('content-type', 'application/json');
    
    return params.toString();
  }

  // Transformation des réponses JSearch
  private transformJSearchResponse(data: any): JobSearchResult {
    const jobs: JobOffer[] = (data.data || []).map((job: any) => ({
      id: job.job_id || Math.random().toString(36),
      title: job.job_title || 'Titre non spécifié',
      company: job.employer_name || 'Entreprise non spécifiée',
      location: job.job_city ? `${job.job_city}, ${job.job_country}` : 'Localisation non spécifiée',
      description: job.job_description || '',
      requirements: job.job_highlights?.Qualifications || [],
      salary: job.job_min_salary && job.job_max_salary ? {
        min: job.job_min_salary,
        max: job.job_max_salary,
        currency: 'EUR',
        period: 'year' as const
      } : undefined,
      contractType: this.mapContractType(job.job_employment_type),
      experience: this.mapExperienceLevel(job.job_required_experience),
      remote: job.job_is_remote || false,
      publishedAt: new Date(job.job_posted_at_datetime_utc || Date.now()),
      url: job.job_apply_link || job.job_google_link || '#',
      source: 'indeed' as const,
      tags: job.job_highlights?.Responsibilities?.slice(0, 3) || [],
      companyLogo: job.employer_logo
    }));

    return {
      jobs,
      totalCount: data.num_results || jobs.length,
      page: 1,
      totalPages: Math.ceil((data.num_results || jobs.length) / 20),
      hasMore: jobs.length >= 20
    };
  }

  // Transformation des réponses Adzuna
  private transformAdzunaResponse(data: any): JobSearchResult {
    const jobs: JobOffer[] = (data.results || []).map((job: any) => ({
      id: job.id?.toString() || Math.random().toString(36),
      title: job.title || 'Titre non spécifié',
      company: job.company?.display_name || 'Entreprise non spécifiée',
      location: job.location?.display_name || 'Localisation non spécifiée',
      description: job.description || '',
      requirements: [],
      salary: job.salary_min && job.salary_max ? {
        min: job.salary_min,
        max: job.salary_max,
        currency: 'EUR',
        period: 'year' as const
      } : undefined,
      contractType: this.mapContractType(job.contract_type),
      experience: 'Confirmé' as const,
      remote: false,
      publishedAt: new Date(job.created),
      url: job.redirect_url || '#',
      source: 'other' as const,
      tags: job.category?.tag ? [job.category.tag] : []
    }));

    return {
      jobs,
      totalCount: data.count || jobs.length,
      page: 1,
      totalPages: Math.ceil((data.count || jobs.length) / 20),
      hasMore: jobs.length >= 20
    };
  }

  // Mappage des types de contrat
  private mapContractType(type: string): JobOffer['contractType'] {
    const typeMap: Record<string, JobOffer['contractType']> = {
      'FULLTIME': 'CDI',
      'PARTTIME': 'CDD',
      'CONTRACTOR': 'Freelance',
      'INTERN': 'Stage',
      'permanent': 'CDI',
      'contract': 'CDD',
      'part_time': 'CDD'
    };
    
    return typeMap[type?.toLowerCase()] || 'CDI';
  }

  // Mappage des niveaux d'expérience
  private mapExperienceLevel(experience: any): JobOffer['experience'] {
    if (!experience) return 'Confirmé';
    
    const exp = experience.toString().toLowerCase();
    if (exp.includes('entry') || exp.includes('junior') || exp === '0') return 'Junior';
    if (exp.includes('senior') || exp.includes('lead')) return 'Senior';
    if (exp.includes('expert') || exp.includes('principal')) return 'Expert';
    
    return 'Confirmé';
  }

  // Déduplication des offres d'emploi
  private deduplicateJobs(jobs: JobOffer[]): JobOffer[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}-${job.location}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Gestion du cache
  private getCachedResult(key: string): JobSearchResult | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedResult(key: string, data: JobSearchResult): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Nettoyage du cache
  clearCache(): void {
    this.cache.clear();
  }
}

export const jobService = new JobService();
