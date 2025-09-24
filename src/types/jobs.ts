export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period: 'hour' | 'month' | 'year';
  };
  contractType: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Alternance' | 'Temps partiel';
  experience: 'Débutant' | 'Junior' | 'Confirmé' | 'Senior' | 'Expert';
  remote: boolean;
  publishedAt: Date;
  expiresAt?: Date;
  url: string;
  source: 'indeed' | 'linkedin' | 'welcometothejungle' | 'apec' | 'pole-emploi' | 'github' | 'careerjet' | 'themuse' | 'adzuna' | 'jsearch' | 'activejobsdb' | 'other';
  tags: string[];
  companyLogo?: string;
  applicationCount?: number;
}

export interface JobSearchFilters {
  query?: string;
  location?: string;
  contractType?: JobOffer['contractType'][];
  experience?: JobOffer['experience'][];
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  publishedSince?: number; // days
  source?: JobOffer['source'][];
}

export interface JobSearchResult {
  jobs: JobOffer[];
  totalCount: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface JobApiResponse {
  success: boolean;
  data?: JobSearchResult;
  error?: string;
  rateLimitRemaining?: number;
}

// Configuration pour les différentes sources d'API
export interface JobApiConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit: number; // requests per minute
  endpoints: {
    search: string;
    details?: string;
  };
  headers?: Record<string, string>;
}

// Statistiques de recherche
export interface JobSearchStats {
  totalJobs: number;
  bySource: Record<JobOffer['source'], number>;
  byLocation: Record<string, number>;
  byContractType: Record<JobOffer['contractType'], number>;
  averageSalary?: number;
  lastUpdated: Date;
}
