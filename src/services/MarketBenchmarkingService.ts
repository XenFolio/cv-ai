// Market Benchmarking Service for ATS Pro
export interface MarketBenchmark {
  industry: string;
  role: string;
  location?: string;
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  marketData: {
    averageATSScore: number;
    topPercentileScore: number;
    competitiveThreshold: number;
    salaryCorrelation: number;
    skillDemand: SkillDemand[];
  };
  yourPosition: {
    percentile: number;
    competitiveness: 'high' | 'medium' | 'low';
    improvementAreas: string[];
  };
}

export interface SkillDemand {
  skill: string;
  demand: 'high' | 'medium' | 'low';
  trend: 'rising' | 'stable' | 'declining';
  marketValue: number; // 1-10 scale
}

export interface JobMarketData {
  industry: string;
  role: string;
  averageScore: number;
  highDemandSkills: string[];
  emergingSkills: string[];
  decliningSkills: string[];
  salaryRanges: {
    junior: { min: number; max: number };
    mid: { min: number; max: number };
    senior: { min: number; max: number };
  };
  competitiveness: 'high' | 'medium' | 'low';
}

// Market data based on industry research and trends
const marketData: Record<string, JobMarketData[]> = {
  technology: [
    {
      industry: 'Technology',
      role: 'Software Engineer',
      averageScore: 78,
      highDemandSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Cloud', 'Git'],
      emergingSkills: ['AI/ML', 'Web3', 'Blockchain', 'Rust', 'Go'],
      decliningSkills: ['jQuery', 'AngularJS', 'COBOL', 'Flash'],
      salaryRanges: {
        junior: { min: 35000, max: 50000 },
        mid: { min: 50000, max: 75000 },
        senior: { min: 75000, max: 120000 }
      },
      competitiveness: 'high'
    },
    {
      industry: 'Technology',
      role: 'Data Scientist',
      averageScore: 82,
      highDemandSkills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistics'],
      emergingSkills: ['Deep Learning', 'MLOps', 'Computer Vision', 'NLP'],
      decliningSkills: ['Basic Excel', 'Traditional BI'],
      salaryRanges: {
        junior: { min: 45000, max: 65000 },
        mid: { min: 65000, max: 90000 },
        senior: { min: 90000, max: 140000 }
      },
      competitiveness: 'high'
    },
    {
      industry: 'Technology',
      role: 'DevOps Engineer',
      averageScore: 80,
      highDemandSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
      emergingSkills: ['GitOps', 'Infrastructure as Code', 'Observability', 'Service Mesh'],
      decliningSkills: ['Manual Deployment', 'On-premise only'],
      salaryRanges: {
        junior: { min: 40000, max: 60000 },
        mid: { min: 60000, max: 85000 },
        senior: { min: 85000, max: 130000 }
      },
      competitiveness: 'high'
    }
  ],
  finance: [
    {
      industry: 'Finance',
      role: 'Financial Analyst',
      averageScore: 75,
      highDemandSkills: ['Excel', 'Financial Modeling', 'SQL', 'Power BI', 'Accounting'],
      emergingSkills: ['Python', 'R', 'Machine Learning', 'Blockchain'],
      decliningSkills: ['Basic Bookkeeping', 'Manual Reporting'],
      salaryRanges: {
        junior: { min: 40000, max: 55000 },
        mid: { min: 55000, max: 75000 },
        senior: { min: 75000, max: 110000 }
      },
      competitiveness: 'medium'
    }
  ],
  healthcare: [
    {
      industry: 'Healthcare',
      role: 'Healthcare Administrator',
      averageScore: 73,
      highDemandSkills: ['Healthcare Management', 'HIPAA', 'EHR Systems', 'Budgeting'],
      emergingSkills: ['Health Informatics', 'Telemedicine', 'AI Diagnostics'],
      decliningSkills: ['Paper Records', 'Traditional Admin'],
      salaryRanges: {
        junior: { min: 45000, max: 60000 },
        mid: { min: 60000, max: 80000 },
        senior: { min: 80000, max: 120000 }
      },
      competitiveness: 'medium'
    }
  ]
};

class MarketBenchmarkingService {
  private static instance: MarketBenchmarkingService;

  static getInstance(): MarketBenchmarkingService {
    if (!MarketBenchmarkingService.instance) {
      MarketBenchmarkingService.instance = new MarketBenchmarkingService();
    }
    return MarketBenchmarkingService.instance;
  }

  async getMarketBenchmark(
    industry: string,
    role: string,
    experienceLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'executive' = 'mid',
    location?: string
  ): Promise<MarketBenchmark> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find matching market data
    const industryData = marketData[industry.toLowerCase()] || [];
    const roleData = industryData.find(data =>
      data.role.toLowerCase().includes(role.toLowerCase())
    );

    if (!roleData) {
      // Return default benchmark if no specific data found
      return this.getDefaultBenchmark(industry, role, experienceLevel);
    }

    // Calculate percentile based on score distribution (normal distribution)
    const calculatePercentile = (score: number, mean: number, stdDev: number = 12): number => {
      const zScore = (score - mean) / stdDev;
      const percentile = (0.5 * (1 + this.erf(zScore / Math.sqrt(2)))) * 100;
      return Math.max(0, Math.min(100, Math.round(percentile)));
    };

    const percentile = calculatePercentile(roleData.averageScore, roleData.averageScore);

    return {
      industry,
      role,
      location,
      experienceLevel,
      marketData: {
        averageATSScore: roleData.averageScore,
        topPercentileScore: Math.min(100, roleData.averageScore + 20),
        competitiveThreshold: roleData.averageScore + 5,
        salaryCorrelation: 0.75, // Correlation between CV score and salary
        skillDemand: roleData.highDemandSkills.map(skill => ({
          skill,
          demand: 'high' as const,
          trend: 'stable' as const,
          marketValue: Math.floor(Math.random() * 3) + 8 // 8-10
        }))
      },
      yourPosition: {
        percentile,
        competitiveness: percentile >= 80 ? 'high' : percentile >= 60 ? 'medium' : 'low',
        improvementAreas: this.generateImprovementAreas(percentile, roleData)
      }
    };
  }

  private getDefaultBenchmark(industry: string, role: string, experienceLevel: string): MarketBenchmark {
    return {
      industry,
      role,
      experienceLevel: experienceLevel as any,
      marketData: {
        averageATSScore: 75,
        topPercentileScore: 95,
        competitiveThreshold: 80,
        salaryCorrelation: 0.7,
        skillDemand: [
          { skill: 'Communication', demand: 'high', trend: 'stable', marketValue: 8 },
          { skill: 'Teamwork', demand: 'high', trend: 'stable', marketValue: 8 },
          { skill: 'Problem Solving', demand: 'high', trend: 'rising', marketValue: 9 }
        ]
      },
      yourPosition: {
        percentile: 65,
        competitiveness: 'medium',
        improvementAreas: [
          'Add more quantifiable achievements',
          'Include industry-specific keywords',
          'Highlight technical certifications',
          'Improve professional summary'
        ]
      }
    };
  }

  private generateImprovementAreas(percentile: number, roleData: JobMarketData): string[] {
    const areas: string[] = [];

    if (percentile < 70) {
      areas.push('Strengthen technical skills section');
      areas.push('Add more quantifiable achievements');
    }

    if (percentile < 80) {
      areas.push('Include industry-specific certifications');
      areas.push('Optimize keyword density');
    }

    if (percentile < 90) {
      areas.push('Add leadership experience');
      areas.push('Include emerging technologies');
    }

    // Add role-specific suggestions
    if (roleData.industry === 'Technology') {
      areas.push('Highlight recent project experience');
      areas.push('Include GitHub/portfolio links');
    }

    return areas.slice(0, 4); // Return top 4 suggestions
  }

  // Error function for percentile calculation
  private erf(x: number): number {
    // Approximation of error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  async getIndustryTrends(industry: string): Promise<{
    risingSkills: string[];
    stableSkills: string[];
    decliningSkills: string[];
    marketOutlook: 'positive' | 'neutral' | 'negative';
  }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const industryData = marketData[industry.toLowerCase()];
    if (!industryData) {
      return {
        risingSkills: ['Digital Literacy', 'Remote Collaboration'],
        stableSkills: ['Communication', 'Project Management'],
        decliningSkills: ['Legacy Systems', 'Manual Processes'],
        marketOutlook: 'neutral'
      };
    }

    const allRising = industryData.flatMap(data => data.emergingSkills);
    const allDeclining = industryData.flatMap(data => data.decliningSkills);
    const allStable = industryData.flatMap(data => data.highDemandSkills);

    return {
      risingSkills: [...new Set(allRising)].slice(0, 10),
      stableSkills: [...new Set(allStable)].slice(0, 10),
      decliningSkills: [...new Set(allDeclining)].slice(0, 10),
      marketOutlook: industry === 'technology' ? 'positive' : 'neutral'
    };
  }
}

export default MarketBenchmarkingService;
export { MarketBenchmarkingService };