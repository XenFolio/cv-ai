import { JobOffer, JobSearchFilters, JobSearchResult, JobApiResponse } from '../types/jobs';
import { jobStorageService } from './jobStorageService';

// Type pour le mapping des contrats
export type ContractTypeMapping = Record<string, JobOffer['contractType']>;

// Interfaces pour les réponses des APIs externes
interface JSearchJobHighlights {
  Qualifications?: string[];
  Responsibilities?: string[];
}

interface JSearchJobData {
  job_id?: string;
  job_title?: string;
  employer_name?: string;
  job_city?: string;
  job_country?: string;
  job_description?: string;
  job_highlights?: JSearchJobHighlights;
  job_min_salary?: number;
  job_max_salary?: number;
  job_employment_type?: string; // Type brut de l'API (ex: "FULLTIME", "PARTTIME")
  job_required_experience?: string | number;
  job_is_remote?: boolean;
  job_posted_at_datetime_utc?: string;
  job_apply_link?: string;
  job_google_link?: string;
  employer_logo?: string;
}

interface JSearchApiResponse {
  data?: JSearchJobData[];
  num_results?: number;
}

interface AdzunaJobCompany {
  display_name?: string;
}

interface AdzunaJobLocation {
  display_name?: string;
}

interface AdzunaJobCategory {
  tag?: string;
}

interface AdzunaJobData {
  id?: string | number;
  title?: string;
  company?: AdzunaJobCompany;
  location?: AdzunaJobLocation;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  created?: string;
  redirect_url?: string;
  category?: AdzunaJobCategory;
}

interface AdzunaApiResponse {
  results?: AdzunaJobData[];
  count?: number;
}

interface MuseJobData {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  publication_date: string;
  categories: string[];
  levels: string[];
}

interface MuseApiResponse {
  results: MuseJobData[];
  count: number;
}


interface CareerJetJobData {
  id: string;
  title: string;
  company: string;
  locations: string[];
  description: string;
  url: string;
  salary: string;
  date: string;
  type: string;
  site: string;
}

interface CareerJetApiResponse {
  type: string;
  jobs: CareerJetJobData[];
}

interface ActiveJobsDBJobData {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  url?: string;
  employment_type?: string;
  salary?: string;
  posted_date?: string;
}

interface ActiveJobsDBApiResponse {
  jobs?: ActiveJobsDBJobData[];
  count?: number;
}

// Configuration des APIs d'emploi
const JOB_APIS = {
  // API gratuite JSearch (RapidAPI)
  jsearch: {
    baseUrl: 'https://jsearch.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY || '',
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  },
  // API Adzuna (gratuite avec limite)
  adzuna: {
    baseUrl: 'https://api.adzuna.com/v1/api/jobs/fr/search',
    appId: import.meta.env.VITE_ADZUNA_APP_ID || '',
    appKey: import.meta.env.VITE_ADZUNA_APP_KEY || ''
  },
  // API The Muse (gratuite)
  themuse: {
    baseUrl: 'https://www.themuse.com/api/public/jobs',
    apiKey: import.meta.env.VITE_MUSE_API_KEY || ''
  },
  // API CareerJet (gratuite avec limite)
  careerjet: {
    baseUrl: 'https://public-api.careerjet.com/api',
    apiKey: import.meta.env.VITE_CAREERJET_API_KEY || ''
  },
  // API Active Jobs DB (nouvelle API)
  activejobsdb: {
    baseUrl: 'https://active-jobs-db.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY || '',
      'X-RapidAPI-Host': 'active-jobs-db.p.rapidapi.com'
    }
  }
};

class JobService {
  private cache = new Map<string, { data: JobSearchResult; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Vérifier si les clés API sont configurées
  private isApiConfigured(): boolean {
    return !!(JOB_APIS.jsearch.headers['X-RapidAPI-Key'] ||
             (JOB_APIS.adzuna.appId && JOB_APIS.adzuna.appKey) ||
             JOB_APIS.themuse.apiKey ||
             JOB_APIS.careerjet.apiKey ||
             JOB_APIS.activejobsdb.headers['X-RapidAPI-Key']);
  }

  // Recherche via JSearch API (Indeed, LinkedIn, etc.)
  async searchJobsJSearch(filters: JobSearchFilters, page = 1): Promise<JobApiResponse> {
    // Si pas de clé API, retourner une erreur
    if (!JOB_APIS.jsearch.headers['X-RapidAPI-Key']) {
      console.warn('JSearch API: Clé API manquante');
      return { success: false, error: 'JSearch API non configurée. Veuillez ajouter votre clé API RapidAPI.' };
    }

    try {
      const query = this.buildJSearchQuery(filters, page);
      const cacheKey = `jsearch-${JSON.stringify({ query, page })}`;
      
      // Vérifier le cache
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const response = await fetch(`${JOB_APIS.jsearch.baseUrl}/search?${query}`, {
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
      console.warn('JSearch API error:', error);
      return { success: false, error: 'JSearch API indisponible. Veuillez réessayer plus tard.' };
    }
  }

  // Recherche via Adzuna API
  async searchJobsAdzuna(filters: JobSearchFilters, page = 1): Promise<JobApiResponse> {
    // Si pas de clé API, retourner une erreur
    if (!JOB_APIS.adzuna.appId || !JOB_APIS.adzuna.appKey) {
      return { success: false, error: 'Adzuna API non configurée. Veuillez ajouter vos clés API Adzuna.' };
    }

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
      console.warn('Adzuna API error:', error);
      return { success: false, error: 'Adzuna API indisponible. Veuillez réessayer plus tard.' };
    }
  }

  
  // Recherche via CareerJet API
  async searchJobsCareerJet(filters: JobSearchFilters, page = 1): Promise<JobApiResponse> {
    // Si pas de clé API, retourner une erreur
    if (!JOB_APIS.careerjet.apiKey) {
      return { success: false, error: 'CareerJet API non configurée. Veuillez ajouter votre clé API CareerJet.' };
    }

    try {
      const query = this.buildCareerJetQuery(filters, page);
      const cacheKey = `careerjet-${JSON.stringify({ query, page })}`;

      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const url = `${JOB_APIS.careerjet.baseUrl}/search?${query}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`CareerJet API error: ${response.status}`);
      }

      const data = await response.json();
      const result = this.transformCareerJetResponse(data);

      this.setCachedResult(cacheKey, result);

      return { success: true, data: result };
    } catch (error) {
      console.warn('CareerJet API error:', error);
      return { success: false, error: 'CareerJet API indisponible. Veuillez réessayer plus tard.' };
    }
  }

  // Recherche via Active Jobs DB API
  async searchJobsActiveJobsDB(filters: JobSearchFilters, page = 1): Promise<JobApiResponse> {
    // Si pas de clé API, retourner une erreur
    if (!JOB_APIS.activejobsdb.headers['X-RapidAPI-Key']) {
      return { success: false, error: 'Active Jobs DB API non configurée. Veuillez ajouter votre clé API RapidAPI dans VITE_RAPIDAPI_KEY.' };
    }

    try {
      const query = this.buildActiveJobsDBQuery(filters, page);
      const cacheKey = `activejobsdb-${JSON.stringify({ query, page })}`;

      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const url = `${JOB_APIS.activejobsdb.baseUrl}${query}`;

      const response = await fetch(url, {
        headers: JOB_APIS.activejobsdb.headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Active Jobs DB API error details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });

        if (response.status === 401) {
          throw new Error('Active Jobs DB API: Clé API non valide ou abonnement insuffisant. Veuillez vérifier votre abonnement RapidAPI.');
        } else {
          throw new Error(`Active Jobs DB API error: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      const result = this.transformActiveJobsDBResponse(data);

      this.setCachedResult(cacheKey, result);

      return { success: true, data: result };
    } catch (error) {
      console.warn('Active Jobs DB API error:', error);
      return { success: false, error: 'Active Jobs DB API indisponible. Veuillez réessayer plus tard.' };
    }
  }

  // Recherche via The Muse API
  async searchJobsMuse(filters: JobSearchFilters, page = 1): Promise<JobApiResponse> {
    // Si pas de clé API, retourner une erreur
    if (!JOB_APIS.themuse.apiKey) {
      return { success: false, error: 'The Muse API non configurée. Veuillez ajouter votre clé API The Muse.' };
    }

    try {
      const query = this.buildMuseQuery(filters);
      const cacheKey = `muse-${JSON.stringify({ query, page })}`;

      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const url = `${JOB_APIS.themuse.baseUrl}?${query}&page=${page}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`The Muse API error: ${response.status}`);
      }

      const data = await response.json();
      const result = this.transformMuseResponse(data);

      this.setCachedResult(cacheKey, result);

      return { success: true, data: result };
    } catch (error) {
      console.warn('The Muse API error:', error);
      return { success: false, error: 'The Muse API indisponible. Veuillez réessayer plus tard.' };
    }
  }

  // Recherche combinée depuis plusieurs sources
  async searchJobsMultiSource(filters: JobSearchFilters, page = 1): Promise<JobApiResponse> {
    // Vérifier d'abord le cache persistant
    const cachedResult = jobStorageService.getSearch(filters);
    if (cachedResult) {
      console.info('Résultats trouvés dans le cache persistant');
      return { success: true, data: cachedResult };
    }

    if (!this.isApiConfigured()) {
      return {
        success: false,
        error: 'Aucune API configurée. Veuillez configurer les clés API pour la recherche d\'emploi.'
      };
    }

    const results = await Promise.allSettled([
      this.searchJobsJSearch(filters, page),
      this.searchJobsAdzuna(filters, page),
      this.searchJobsMuse(filters, page),
      this.searchJobsCareerJet(filters, page)
      // this.searchJobsActiveJobsDB(filters, page) // Temporarily disabled due to subscription limitations
    ]);

    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<JobApiResponse> =>
        result.status === 'fulfilled' && result.value.success && !!result.value.data
      )
      .map(result => result.value.data!);

    if (successfulResults.length === 0) {
      // Retourner une erreur si toutes les APIs échouent
      const errorMessages = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason instanceof Error ? result.reason.message : 'Erreur inconnue')
        .join(', ');

      return {
        success: false,
        error: `Aucune offre d'emploi trouvée. Erreur(s) API: ${errorMessages || 'Services indisponibles'}`
      };
    }

    // Combiner et dédupliquer les résultats
    const combinedJobs = this.deduplicateJobs(
      successfulResults.flatMap(result => result.jobs)
    );

    const totalCount = successfulResults.reduce((sum, result) => sum + result.totalCount, 0);

    const finalResult: JobSearchResult = {
      jobs: combinedJobs.slice(0, 20), // 20 par page
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / 20),
      hasMore: combinedJobs.length > 20
    };

    // Sauvegarder le résultat dans le cache persistant
    jobStorageService.saveSearch(filters, finalResult);

    return {
      success: true,
      data: finalResult
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
  private buildJSearchQuery(filters: JobSearchFilters, page = 1): string {
    const params = new URLSearchParams();

    if (filters.query) params.append('query', filters.query);
    if (filters.location) params.append('location', filters.location);
    if (filters.remote) params.append('remote_jobs_only', 'true');

    // Paramètres pour la pagination - essayer d'obtenir plus de résultats
    params.append('page', page.toString());
    params.append('num_pages', '2'); // Augmenter pour obtenir plus de résultats

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

  // Construction de la query pour CareerJet
  private buildCareerJetQuery(filters: JobSearchFilters, page = 1): string {
    const params = new URLSearchParams();

    if (filters.query) params.append('keywords', filters.query);
    if (filters.location) params.append('location', filters.location);
    if (filters.salaryMin) params.append('salary_min', filters.salaryMin.toString());
    if (filters.salaryMax) params.append('salary_max', filters.salaryMax.toString());
    if (filters.contractType && filters.contractType.length > 0) {
      params.append('contract_type', filters.contractType[0]);
    }

    params.append('affid', JOB_APIS.careerjet.apiKey);
    params.append('locale_code', 'FR_fr');
    params.append('page', page.toString());
    params.append('pagesize', '50'); // Augmenter à 50 résultats par page

    return params.toString();
  }

  // Construction de la query pour Active Jobs DB
  private buildActiveJobsDBQuery(filters: JobSearchFilters, page = 1): string {
    const offset = (page - 1) * 50; // 50 résultats par page

    let url = `/active-ats-1h?offset=${offset}`;

    if (filters.query) {
      const encodedTitle = encodeURIComponent(filters.query);
      url += `&title_filter="${encodedTitle}"`;
    }

    if (filters.location) {
      // Pour Active Jobs DB, on peut spécifier plusieurs localisations
      const locations = filters.location.includes(',') ? filters.location.split(',') : [filters.location];
      const locationFilters = locations.map(loc => `"${loc.trim()}"`).join(' OR ');
      url += `&location_filter=${locationFilters}`;
    }

    url += '&description_type=text';

    return url;
  }

  // Construction de la query pour The Muse
  private buildMuseQuery(filters: JobSearchFilters): string {
    const params = new URLSearchParams();

    if (filters.query) params.append('category', filters.query);
    if (filters.location) params.append('location', filters.location);
    if (filters.experience && filters.experience.length > 0) {
      // Utiliser le premier niveau d'expérience pour The Muse API
      const level = filters.experience[0].toLowerCase();
      params.append('level', level);
    }

    params.append('page', '1');
    params.append('descending', 'true');
    params.append('items_per_page', '50'); // Augmenter à 50 résultats par page

    return params.toString();
  }

  // Transformation des réponses JSearch
  private transformJSearchResponse(data: JSearchApiResponse): JobSearchResult {
    const jobs: JobOffer[] = (data.data || []).map((job: JSearchJobData) => ({
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
      contractType: this.mapContractType(job.job_employment_type || ''),
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
  private transformAdzunaResponse(data: AdzunaApiResponse): JobSearchResult {
    const jobs: JobOffer[] = (data.results || []).map((job: AdzunaJobData) => ({
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
      contractType: this.mapContractType(job.contract_type || ''),
      experience: 'Confirmé' as const,
      remote: false,
      publishedAt: new Date(job.created || Date.now()),
      url: job.redirect_url || '#',
      source: 'adzuna' as const,
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

  // Transformation des réponses CareerJet
  private transformCareerJetResponse(data: CareerJetApiResponse): JobSearchResult {
    const jobs: JobOffer[] = (data.jobs || []).map((job: CareerJetJobData) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.locations?.join(', ') || job.locations?.[0] || 'Localisation non spécifiée',
      description: job.description,
      requirements: this.extractRequirementsFromDescription(job.description),
      contractType: this.mapCareerJetContractType(job.type),
      experience: this.mapCareerJetExperienceLevel(job.description),
      remote: job.locations?.some(loc => loc.toLowerCase().includes('remote') || loc.toLowerCase().includes('télétravail')) || false,
      publishedAt: new Date(job.date),
      url: job.url,
      source: 'careerjet' as const,
      tags: [job.site, job.type].filter(Boolean)
    }));

    return {
      jobs,
      totalCount: data.jobs?.length || jobs.length,
      page: 1,
      totalPages: Math.ceil((data.jobs?.length || 0) / 20),
      hasMore: jobs.length >= 20
    };
  }

  // Transformation des réponses Active Jobs DB
  private transformActiveJobsDBResponse(data: ActiveJobsDBApiResponse): JobSearchResult {
    const jobs: JobOffer[] = (data.jobs || []).map((job: ActiveJobsDBJobData) => ({
      id: job.id || Math.random().toString(36).substring(7),
      title: job.title || 'Titre non spécifié',
      company: job.company || 'Entreprise non spécifiée',
      location: job.location || 'Localisation non spécifiée',
      description: job.description || 'Description non disponible',
      requirements: this.extractRequirementsFromDescription(job.description || ''),
      contractType: this.mapActiveJobsDBContractType(job.employment_type || ''),
      experience: this.mapActiveJobsDBExperienceLevel(job.description || ''),
      remote: job.location?.toLowerCase().includes('remote') || false,
      publishedAt: job.posted_date ? new Date(job.posted_date) : new Date(),
      url: job.url || '#',
      source: 'activejobsdb' as const,
      tags: ['Active Jobs DB', job.employment_type || ''].filter(Boolean)
    }));

    return {
      jobs,
      totalCount: data.count || jobs.length,
      page: 1,
      totalPages: Math.ceil((data.count || jobs.length) / 50),
      hasMore: jobs.length >= 50
    };
  }

  // Transformation des réponses The Muse
  private transformMuseResponse(data: MuseApiResponse): JobSearchResult {
    const jobs: JobOffer[] = (data.results || []).map((job: MuseJobData) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      requirements: [],
      contractType: this.mapContractType(job.type),
      experience: this.mapMuseExperienceLevel(job.levels),
      remote: false,
      publishedAt: new Date(job.publication_date),
      url: `https://www.themuse.com/jobs/${job.id}`,
      source: 'themuse' as const,
      tags: job.categories
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
    const typeMap: ContractTypeMapping = {
      // Types standards
      'FULLTIME': 'CDI',
      'CONTRACTOR': 'Freelance',
      'INTERN': 'Stage',

      // Alternatives courantes
      'permanent': 'CDI',
      'contract': 'CDD',
      'freelance': 'Freelance',
      'internship': 'Stage',
      'apprenticeship': 'Alternance',
      'apprenti': 'Alternance',

      // Variations
      'full-time': 'CDI',
      'cdi': 'CDI',
      'cdd': 'CDD',
      'stage': 'Stage',
      'alternance': 'Alternance',
    };
    
    return typeMap[type?.toLowerCase()] || 'CDI';
  }

  // Mappage des niveaux d'expérience
  private mapExperienceLevel(experience: string | number | undefined): JobOffer['experience'] {
    if (!experience) return 'Confirmé';

    const exp = experience.toString().toLowerCase();
    if (exp.includes('entry') || exp.includes('junior') || exp === '0') return 'Junior';
    if (exp.includes('senior') || exp.includes('lead')) return 'Senior';
    if (exp.includes('expert') || exp.includes('principal')) return 'Expert';

    return 'Confirmé';
  }

  // Mappage des niveaux d'expérience pour The Muse
  private mapMuseExperienceLevel(levels: string[]): JobOffer['experience'] {
    if (!levels || levels.length === 0) return 'Confirmé';

    const level = levels[0].toLowerCase();
    if (level.includes('entry') || level.includes('junior')) return 'Junior';
    if (level.includes('senior') || level.includes('lead')) return 'Senior';
    if (level.includes('mid')) return 'Confirmé';
    if (level.includes('intern') || level.includes('internship')) return 'Junior';

    return 'Confirmé';
  }

  // Mappage des types de contrat pour CareerJet
  private mapCareerJetContractType(type: string): JobOffer['contractType'] {
    const typeMap: Record<string, JobOffer['contractType']> = {
      'permanent': 'CDI',
      'temporary': 'CDD',
      'contract': 'CDD',
      'part-time': 'Temps partiel',
      'internship': 'Stage',
      'freelance': 'Freelance',
      'apprenticeship': 'Alternance',
      'cdi': 'CDI',
      'cdd': 'CDD',
      'stage': 'Stage',
      'alternance': 'Alternance'
    };

    return typeMap[type.toLowerCase()] || 'CDI';
  }

  // Mappage des niveaux d'expérience pour CareerJet
  private mapCareerJetExperienceLevel(description: string): JobOffer['experience'] {
    const desc = description.toLowerCase();

    if (desc.includes('débutant') || desc.includes('junior') || desc.includes('jeune diplômé')) return 'Junior';
    if (desc.includes('senior') || desc.includes('confirmé') || desc.includes('expert')) return 'Senior';
    if (desc.includes('directeur') || desc.includes('manager') || desc.includes('responsable')) return 'Expert';
    if (desc.includes('stage') || desc.includes('stagiaire') || desc.includes('alternance')) return 'Junior';

    return 'Confirmé';
  }

  // Mappage des types de contrat pour Active Jobs DB
  private mapActiveJobsDBContractType(type: string): JobOffer['contractType'] {
    const typeMap: Record<string, JobOffer['contractType']> = {
      'full-time': 'CDI',
      'full time': 'CDI',
      'permanent': 'CDI',
      'part-time': 'Temps partiel',
      'part time': 'Temps partiel',
      'contract': 'CDD',
      'temporary': 'CDD',
      'internship': 'Stage',
      'freelance': 'Freelance',
      'contractor': 'Freelance',
      'apprenticeship': 'Alternance'
    };

    return typeMap[type.toLowerCase()] || 'CDI';
  }

  // Mappage des niveaux d'expérience pour Active Jobs DB
  private mapActiveJobsDBExperienceLevel(description: string): JobOffer['experience'] {
    const desc = description.toLowerCase();

    if (desc.includes('junior') || desc.includes('entry level') || desc.includes('graduate')) return 'Junior';
    if (desc.includes('senior') || desc.includes('lead') || desc.includes('principal')) return 'Senior';
    if (desc.includes('expert') || desc.includes('architect') || desc.includes('staff')) return 'Expert';
    if (desc.includes('intern') || desc.includes('internship') || desc.includes('stagiaire')) return 'Junior';

    return 'Confirmé';
  }

  // Extraire les prérequis de la description
  private extractRequirementsFromDescription(description: string): string[] {
    const requirements: string[] = [];
    const desc = description.toLowerCase();

    // Mots-clés techniques courants
    const techKeywords = [
      'react', 'vue', 'angular', 'javascript', 'typescript', 'node.js', 'python',
      'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
      'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes',
      'aws', 'azure', 'gcp', 'git', 'agile', 'scrum', 'rest api', 'graphql'
    ];

    techKeywords.forEach(tech => {
      if (desc.includes(tech) && !requirements.includes(tech)) {
        requirements.push(tech);
      }
    });

    // Limiter à 5 prérequis maximum
    return requirements.slice(0, 5);
  }

  // Déduplication des offres d'emploi
  private deduplicateJobs(jobs: JobOffer[]): JobOffer[] {
    const seen = new Map<string, JobOffer>();

    jobs.forEach(job => {
      // Clé moins stricte pour permettre plus de variations
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;

      // Si on n'a pas encore ce job ou si le nouveau a une meilleure description
      if (!seen.has(key) || (job.description.length > seen.get(key)!.description.length)) {
        seen.set(key, job);
      }
    });

    return Array.from(seen.values()).sort((a, b) => {
      // Trier par date de publication (plus récent d'abord)
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
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

  // Méthodes de gestion du cache persistant
  getRecentSearches(limit = 5): JobSearchFilters[] {
    return jobStorageService.getRecentSearches(limit);
  }

  clearPersistentCache(): void {
    jobStorageService.clearAllSearches();
  }

  getCacheStats() {
    return jobStorageService.getCacheStats();
  }

  removeSearchFromCache(filters: JobSearchFilters): void {
    jobStorageService.deleteSearch(filters);
  }
}

export const jobService = new JobService();
