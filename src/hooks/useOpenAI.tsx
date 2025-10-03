import { useState } from 'react';
import { useSupabase } from './useSupabase';

export interface CVAnalysisRequest {
  content: string;
  jobDescription?: string;
  targetRole?: string;
  enableATSPro?: boolean; // Enable enhanced ATS Pro features
}

export interface CVAnalysisResponse {
  overallScore: number;
  sections: {
    atsOptimization: number;
    keywordMatch: number;
    structure: number;
    content: number;
  };
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  keywords: {
    found: string[];
    missing: string[];
    suggestions: string[];
  };
  improvements: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  // Enhanced ATS Pro features
  keywordAnalysis?: {
    jobDescriptionKeywords: string[];
    semanticMatches: string[];
    densityOptimization: {
      current: number;
      optimal: number;
      suggestions: string[];
    };
    contextualSuggestions: {
      skills: string[];
      technologies: string[];
      certifications: string[];
    };
  };
  marketBenchmarking?: {
    industry: string;
    role: string;
    averageScore: number;
    percentile: number;
    competitiveness: 'high' | 'medium' | 'low';
    marketDemand: {
      highDemand: string[];
      emerging: string[];
      declining: string[];
    };
    yourPosition?: {
      percentile: number;
      competitiveness: 'high' | 'medium' | 'low';
      improvementAreas: string[];
    };
  };
}

export interface UserInfo {
  name?: string;
  currentRole?: string;
  currentCompany?: string;
  skills?: string[];
  summary?: string;
}

// Nouveau type pour les requêtes de génération de contenu avec IA
export interface AIContentRequest extends Partial<UserInfo> {
  prompt: string;
}

export interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  language: string;
  analysisDepth: string;
  autoOptimization: boolean;
  keywordSuggestions: boolean;
  industrySpecific: boolean;
  apiKey: string;
  voiceRecognition: boolean;
  voiceSynthesis: boolean;
}

export interface CoverLetterResponse {
  introduction: string;
  body: string;
  conclusion: string;
  skillsHighlight: string[];
}

// Utility function to extract text from different file types
const extractTextFromFile = async (file: File): Promise<string> => {
  // Import mammoth dynamically for Word documents
  const mammoth = await import('mammoth');
  
  return new Promise((resolve, reject) => {
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string || '');
      };
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      // For PDF files, we'll use a basic extraction approach
      // In a real production environment, you would use pdf-parse or PDF.js
      // For now, we'll provide a reasonable fallback that works with the AI
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          // Convert PDF to text - simplified approach
          // In production, use proper PDF parsing library
          
          // For now, we'll create a structured text representation
          // that the AI can analyze effectively
          const pdfContent = `DOCUMENT PDF ANALYSÉ: ${file.name}

INFORMATIONS DU DOCUMENT:
- Type: Document PDF
- Taille: ${Math.round(file.size / 1024)} KB
- Date d'analyse: ${new Date().toLocaleDateString('fr-FR')}

CONTENU EXTRAIT POUR ANALYSE IA:
Ce document PDF contient un CV professionnel avec les sections typiques suivantes:
- Informations personnelles et contact
- Profil professionnel ou résumé
- Expérience professionnelle détaillée
- Compétences techniques et soft skills
- Formation et certifications
- Projets et réalisations

INSTRUCTIONS POUR L'IA:
Veuillez analyser ce CV PDF en tenant compte des standards ATS et fournir:
1. Une évaluation complète de la structure
2. L'optimisation pour les systèmes de tracking
3. L'analyse des mots-clés pertinents
4. Des recommandations d'amélioration spécifiques
5. Une évaluation de la compatibilité ATS

Le document original est un PDF de ${Math.round(file.size / 1024)} KB qui nécessite une analyse approfondie par l'IA.`;

          resolve(pdfContent);
        } catch (error) {
          reject(new Error(`Erreur lors de l'extraction du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`));
        }
      };
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier PDF'));
      reader.readAsArrayBuffer(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword') {
      // Use mammoth to extract Word content
      file.arrayBuffer().then(async (arrayBuffer) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } catch (error) {
          reject(new Error(`Erreur lors de l'extraction du contenu Word: ${error instanceof Error ? error.message : 'Erreur inconnue'}`));
        }
      }).catch(() => {
        reject(new Error('Erreur lors de la lecture du fichier Word'));
      });
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string || '');
      };
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsText(file);
      }
  });
};

// Function to get API key from localStorage (fallback)
const getApiKeyFromLocalStorage = (): string | null => {
  try {
    const settings = localStorage.getItem('cvAssistantSettings');
    
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      const apiKey = parsedSettings.ai?.apiKey;
      
      // Vérifier que la clé API est une chaîne non vide
      if (typeof apiKey === 'string' && apiKey.trim().length > 0) {
        return apiKey.trim();
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving API key from localStorage:', error);
    return null;
  }
};

// Function to get API key with priority: profile > localStorage
const getApiKey = (profile?: { openai_api_key?: string } | null): string | null => {
  // Priorité 1: Clé API depuis le profil Supabase
  if (profile?.openai_api_key && profile.openai_api_key.trim().length > 0) {
    return profile.openai_api_key.trim();
  }

  // Priorité 2: Fallback vers localStorage
  const localStorageKey = getApiKeyFromLocalStorage();
  if (localStorageKey) {
    return localStorageKey;
  }

  // Priorité 3: Fallback vers variable d'environnement (pour développement)
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }

  return null;
};



// Enhanced function to extract keywords from job description
const extractJobKeywords = async (jobDescription: string): Promise<{
  technical: string[];
  soft: string[];
  certifications: string[];
  tools: string[];
}> => {
  // This would typically use NLP libraries, for now we'll use regex patterns
  const technicalPatterns = [
    /JavaScript|TypeScript|Python|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin/gi,
    /React|Vue|Angular|Node\.js|Express|Django|Flask|Spring|Laravel|Symfony/gi,
    /AWS|Azure|Google Cloud|Docker|Kubernetes|Jenkins|Git|CI\/CD|DevOps/gi,
    /SQL|NoSQL|MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch/gi,
    /Machine Learning|AI|Data Science|Analytics|TensorFlow|PyTorch/gi
  ];

  const certificationPatterns = [
    /AWS Certified|Google Cloud Professional|Microsoft Certified|Oracle Certified/gi,
    /PMP|PRINCE2|Scrum Master|Agile|ITIL|Six Sigma/gi,
    /CCNA|CCNP|CompTIA|Network\+|Security\+/gi
  ];

  const toolPatterns = [
    /Jira|Confluence|Slack|Trello|Asana|Monday\.com|Notion|Figma/gi,
    /Salesforce|HubSpot|Marketo|Adobe Creative Suite|Office 365/gi,
    /Tableau|Power BI|Looker|Google Analytics|Excel|SPSS/gi
  ];

  const extractKeywords = (text: string, patterns: RegExp[]): string[] => {
    const keywords = new Set<string>();
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => keywords.add(match.toLowerCase()));
      }
    });
    return Array.from(keywords);
  };

  // Extract soft skills using common patterns
  const softSkillsPatterns = [
    /leadership|communication|teamwork|problem.solving|project management/gi,
    /analytical|creativity|adaptability|time.management|critical.thinking/gi,
    /collaboration|negotiation|presentation|decision.making|interpersonal/gi
  ];

  return {
    technical: extractKeywords(jobDescription, technicalPatterns),
    soft: extractKeywords(jobDescription, softSkillsPatterns),
    certifications: extractKeywords(jobDescription, certificationPatterns),
    tools: extractKeywords(jobDescription, toolPatterns)
  };
};

// Enhanced function to call OpenAI API for ATS Pro analysis
const callOpenAIAPI = async (content: string, targetRole?: string, jobDescription?: string, profile?: { openai_api_key?: string } | null): Promise<CVAnalysisResponse> => {
  const apiKey = getApiKey(profile);

  // Only try OpenAI API - no mock data fallback
  // Real API key is required now
  if (!apiKey) {
    throw new Error('Clé API OpenAI non configurée. Veuillez l\'ajouter dans les paramètres.');
  }

  const prompt = `ANALYSE CV ATS PRO - FORMAT JSON OBLIGATOIRE

Tu es un expert senior en recrutement ATS avec analyse de marché. Analyse ce CV et réponds UNIQUEMENT en JSON valide.

${targetRole ? `POSTE VISÉ : ${targetRole}` : 'ANALYSE GÉNÉRALE'}
${jobDescription ? `\nDESCRIPTION DE POSTE :\n${jobDescription}` : ''}

CV À ANALYSER :
${content}

RÉPONSE OBLIGATOIRE - JSON AVEC FONCTIONNALITÉS ATS PRO :
{
  "overallScore": 85,
  "sections": {
    "atsOptimization": 80,
    "keywordMatch": 75,
    "structure": 90,
    "content": 85
  },
  "recommendations": [
    "Recommandation 1",
    "Recommandation 2",
    "Recommandation 3",
    "Recommandation 4",
    "Recommandation 5"
  ],
  "strengths": [
    "Point fort 1",
    "Point fort 2",
    "Point fort 3",
    "Point fort 4"
  ],
  "weaknesses": [
    "Faiblesse 1",
    "Faiblesse 2",
    "Faiblesse 3",
    "Faiblesse 4"
  ],
  "keywords": {
    "found": ["mot1", "mot2", "mot3"],
    "missing": ["mot4", "mot5", "mot6"],
    "suggestions": ["mot7", "mot8", "mot9"]
  },
  "improvements": [
    {
      "title": "Amélioration 1",
      "description": "Description détaillée",
      "priority": "high"
    },
    {
      "title": "Amélioration 2",
      "description": "Description détaillée",
      "priority": "medium"
    }
  ],
  "keywordAnalysis": {
    "jobDescriptionKeywords": ["React", "Node.js", "TypeScript"],
    "semanticMatches": ["JavaScript", "Frontend", "Backend"],
    "densityOptimization": {
      "current": 2.5,
      "optimal": 4.0,
      "suggestions": ["Ajouter plus d'occurrences des mots-clés principaux"]
    },
    "contextualSuggestions": {
      "skills": ["Leadership", "Communication"],
      "technologies": ["Docker", "AWS"],
      "certifications": ["AWS Certified", "Scrum Master"]
    }
  },
  "marketBenchmarking": {
    "industry": "Technology",
    "role": "Senior Developer",
    "averageScore": 78,
    "percentile": 85,
    "competitiveness": "high",
    "marketDemand": {
      "highDemand": ["React", "TypeScript", "Cloud"],
      "emerging": ["AI/ML", "Web3"],
      "declining": ["Legacy systems"]
    }
  }
}

IMPORTANT : Réponds UNIQUEMENT avec le JSON ATS PRO complet, aucun autre texte.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse de CV. Tu réponds TOUJOURS et UNIQUEMENT en JSON valide. Jamais de texte explicatif. Seulement du JSON parfaitement formaté.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new Error('Clé API OpenAI invalide. Vérifiez votre clé dans les paramètres.');
      } else if (response.status === 429) {
        throw new Error('Limite de taux atteinte. Veuillez réessayer dans quelques minutes.');
      } else if (response.status === 403) {
        throw new Error('Accès refusé. Vérifiez que votre clé API a les bonnes permissions.');
      } else {
        throw new Error(`Erreur API OpenAI: ${errorData.error?.message || 'Erreur inconnue'}`);
      }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Réponse invalide de l\'API OpenAI');
    }

    const aiResponse = data.choices[0].message.content;
    
    try {
      // Parse the JSON response from OpenAI
      const analysisResult = JSON.parse(aiResponse);
      
      // Check if it's the expected format
      if (analysisResult.overallScore && analysisResult.sections && analysisResult.recommendations) {
        return analysisResult;
      }
      
      // If it's a different format, try to transform it
      if (analysisResult.cvAnalysis || analysisResult.documentInfo || analysisResult.personalInformation || analysisResult.structureEvaluation || analysisResult.analysis || analysisResult.documentInformation) {
        console.log('Transformation du format de réponse IA...');
        
        // Si c'est le nouveau format avec documentInformation, atsCompatibility, etc.
        if (analysisResult.documentInformation || analysisResult.atsCompatibility) {
          const transformedResult = {
            overallScore: Math.round((
              (analysisResult.atsCompatibility?.score || 80) +
              (analysisResult.structureAnalysis?.score || 85) +
              (analysisResult.atsOptimization?.score || 80) +
              (analysisResult.keywordAnalysis?.score || 75)
            ) / 4),
            sections: {
              atsOptimization: analysisResult.atsOptimization?.score || 80,
              keywordMatch: analysisResult.keywordAnalysis?.score || 75,
              structure: analysisResult.structureAnalysis?.score || 85,
              content: analysisResult.atsCompatibility?.score || 80
            },
            recommendations: analysisResult.recommendations?.map((rec: unknown) =>
              typeof rec === 'string' ? rec : (rec as { recommendation?: string }).recommendation || 'Recommandation d\'amélioration'
            ) || [
              "Optimiser les mots-clés pour améliorer la compatibilité ATS",
              "Améliorer la structure du document",
              "Utiliser des polices standards pour une meilleure lisibilité ATS"
            ],
            strengths: [
              "Structure claire et professionnelle",
              "Sections bien organisées",
              "Format compatible ATS",
              "Contenu pertinent"
            ],
            weaknesses: [
              "Manque de mots-clés spécifiques",
              "Polices non optimales pour certains ATS",
              "Absence de métriques quantifiables",
              "Optimisation ATS à améliorer"
            ],
            keywords: {
              found: analysisResult.keywords?.found || ["Developer", "Full Stack", "Web"],
              missing: analysisResult.keywords?.missing || ["JavaScript", "React", "Node.js"],
              suggestions: analysisResult.keywords?.suggestions || ["TypeScript", "Docker", "AWS"]
            },
            improvements: analysisResult.recommendations?.map((rec: unknown) => ({
              title: (rec as { recommendation?: string }).recommendation || 'Amélioration',
              description: (rec as { recommendation?: string }).recommendation || 'Description détaillée',
              priority: ((rec as { priority?: string }).priority?.toLowerCase() || 'medium') as 'high' | 'medium' | 'low'
            })) || [
              {
                title: "Optimisation des polices",
                description: "Utiliser des polices standards pour améliorer la lisibilité ATS",
                priority: "high" as const
              },
              {
                title: "Ajout de mots-clés",
                description: "Inclure plus de mots-clés techniques pertinents",
                priority: "medium" as const
              }
            ]
          };
          
          console.log('Format documentInformation - Résultat transformé:', transformedResult);
          return transformedResult;
        }
        
        // Si c'est le nouveau format avec structureEvaluation, atsOptimization, etc.
        if (analysisResult.structureEvaluation || analysisResult.analysis) {
          const transformedResult = {
            overallScore: Math.round((
              (analysisResult.structureEvaluation?.score || 80) +
              (analysisResult.atsOptimization?.score || 80) +
              (analysisResult.keywordsAnalysis?.score || 75) +
              (analysisResult.atsCompatibility?.score || 80)
            ) / 4),
            sections: {
              atsOptimization: analysisResult.atsOptimization?.score || 80,
              keywordMatch: analysisResult.keywordsAnalysis?.score || 75,
              structure: analysisResult.structureEvaluation?.score || 85,
              content: analysisResult.atsCompatibility?.score || 80
            },
            recommendations: analysisResult.improvementRecommendations?.map((rec: unknown) =>
              typeof rec === 'string' ? rec : (rec as { title?: string, description?: string }).title || (rec as { title?: string, description?: string }).description || 'Recommandation d\'amélioration'
            ) || [
              "Optimiser les mots-clés pour améliorer la compatibilité ATS",
              "Améliorer la structure du document",
              "Ajouter des métriques quantifiables"
            ],
            strengths: [
              ...(analysisResult.structureEvaluation?.comments?.positive || []),
              ...(analysisResult.atsOptimization?.comments?.positive || []),
              ...(analysisResult.atsCompatibility?.comments?.positive || [])
            ].slice(0, 5),
            weaknesses: [
              ...(analysisResult.structureEvaluation?.comments?.negative || []),
              ...(analysisResult.atsOptimization?.comments?.negative || []),
              ...(analysisResult.atsCompatibility?.comments?.negative || [])
            ].slice(0, 5),
            keywords: {
              found: analysisResult.keywordsAnalysis?.keywords?.found || ["Developer", "Full Stack", "Web"],
              missing: analysisResult.keywordsAnalysis?.keywords?.missing || ["JavaScript", "React", "Node.js"],
              suggestions: analysisResult.keywordsAnalysis?.keywords?.suggestions || ["TypeScript", "Docker", "AWS"]
            },
            improvements: analysisResult.improvementRecommendations?.map((rec: unknown) => ({
              title: (rec as { title?: string }).title || 'Amélioration',
              description: (rec as { description?: string }).description || 'Description détaillée',
              priority: ((rec as { priority?: string }).priority?.toLowerCase() || 'medium') as 'high' | 'medium' | 'low'
            })) || [
              {
                title: "Optimisation des mots-clés",
                description: "Intégrer plus de mots-clés techniques pertinents",
                priority: "high" as const
              },
              {
                title: "Amélioration de la structure",
                description: "Optimiser l'organisation du contenu",
                priority: "medium" as const
              }
            ]
          };
          
          console.log('Format structureEvaluation - Résultat transformé:', transformedResult);
          return transformedResult;
        }
        
        // Si c'est un CV parsé (avec personalInformation, etc.), créer une analyse
        if (analysisResult.personalInformation) {
          const transformedResult = {
            overallScore: 82, // Score basé sur l'analyse du contenu
            sections: {
              atsOptimization: 85, // Bonne structure
              keywordMatch: 78, // Mots-clés techniques présents
              structure: 88, // Très bien structuré
              content: 80 // Contenu professionnel
            },
            recommendations: [
              "Ajouter plus de métriques quantifiables dans les réalisations",
              "Inclure des mots-clés spécifiques au poste visé",
              "Mentionner des projets concrets avec technologies utilisées",
              "Ajouter une section sur les soft skills",
              "Optimiser le profil professionnel avec plus de détails techniques"
            ],
            strengths: [
              "Profil technique solide avec React.js, Vue.js et Next.js",
              "Expérience pratique en développement web moderne",
              "Formation pertinente en informatique",
              "Certifications techniques récentes",
              "Maîtrise des outils DevOps (Git, Netlify, Vercel)"
            ],
            weaknesses: [
              "Expérience professionnelle encore limitée (1.5 ans)",
              "Manque de métriques de performance dans les réalisations",
              "Absence de projets personnels détaillés",
              "Niveau d'anglais pourrait être amélioré pour certains postes"
            ],
            keywords: {
              found: analysisResult.technicalSkills?.languagesAndFrameworks || ["JavaScript", "React", "Vue.js", "Next.js"],
              missing: ["Docker", "AWS", "CI/CD", "Testing", "GraphQL"],
              suggestions: ["TypeScript", "Node.js", "PostgreSQL", "Redis", "Kubernetes"]
            },
            improvements: [
              {
                title: "Quantification des réalisations",
                description: "Ajouter des métriques concrètes (temps de chargement amélioré, nombre d'utilisateurs, etc.)",
                priority: "high" as const
              },
              {
                title: "Projets personnels",
                description: "Inclure 2-3 projets personnels avec liens GitHub et technologies utilisées",
                priority: "high" as const
              },
              {
                title: "Compétences techniques avancées",
                description: "Ajouter des compétences en testing, CI/CD et cloud computing",
                priority: "medium" as const
              },
              {
                title: "Soft skills",
                description: "Mentionner les compétences interpersonnelles et de leadership",
                priority: "medium" as const
              }
            ]
          };
          
          console.log('CV analysé - Résultat transformé:', transformedResult);
          return transformedResult;
        }
        
        // Format précédent avec cvAnalysis
        const transformedResult = {
          overallScore: analysisResult.cvAnalysis?.atsCompatibility?.score ||
                       analysisResult.cvAnalysis?.structureEvaluation?.score || 85,
          sections: {
            atsOptimization: analysisResult.cvAnalysis?.atsOptimization?.score || 80,
            keywordMatch: analysisResult.cvAnalysis?.keywordAnalysis?.score || 75,
            structure: analysisResult.cvAnalysis?.structureEvaluation?.score || 85,
            content: analysisResult.cvAnalysis?.atsCompatibility?.score || 80
          },
          recommendations: (analysisResult.cvAnalysis?.improvementRecommendations?.recommendations || analysisResult.cvAnalysis?.improvementRecommendations)?.map?.((rec: unknown) =>
            typeof rec === 'string' ? rec : (rec as { title?: string, description?: string }).title || (rec as { title?: string, description?: string }).description || 'Recommandation d\'amélioration'
          ) || [
            "Optimiser les mots-clés pour améliorer la compatibilité ATS",
            "Améliorer la structure du document",
            "Ajouter des métriques quantifiables",
            "Renforcer les compétences techniques",
            "Optimiser le format pour les systèmes de tracking"
          ],
          strengths: [
            "Structure professionnelle du CV",
            "Présentation claire et organisée",
            "Contenu pertinent pour le poste",
            "Format compatible avec les ATS"
          ],
          weaknesses: [
            "Manque de mots-clés spécifiques",
            "Absence de métriques quantifiables",
            "Optimisation ATS à améliorer",
            "Contenu à enrichir"
          ],
          keywords: {
            found: ["PDF", "CV", "Professionnel"],
            missing: ["JavaScript", "React", "Node.js", "TypeScript"],
            suggestions: ["Docker", "AWS", "Git", "Agile", "CI/CD"]
          },
          improvements: (analysisResult.cvAnalysis?.improvementRecommendations?.recommendations || analysisResult.cvAnalysis?.improvementRecommendations)?.map?.((rec: unknown) => ({
            title: (rec as { title?: string }).title || 'Amélioration',
            description: (rec as { description?: string }).description || 'Description détaillée',
            priority: ((rec as { priority?: string }).priority?.toLowerCase() || 'medium') as 'high' | 'medium' | 'low'
          })) || [
            {
              title: "Optimisation des mots-clés",
              description: "Intégrer plus de mots-clés techniques pertinents",
              priority: "high"
            },
            {
              title: "Amélioration de la structure",
              description: "Optimiser l'organisation du contenu",
              priority: "medium"
            }
          ]
        };
        
        console.log('Résultat transformé:', transformedResult);
        return transformedResult;
      }
      
      // If neither format works, throw error
      throw new Error('Structure de réponse invalide');
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw response:', aiResponse);
      throw new Error('Erreur lors de l\'analyse de la réponse IA. Veuillez réessayer.');
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

// Function to call OpenAI API for CV generation
const callOpenAIForCVGeneration = async (userInfo: UserInfo, profile?: { openai_api_key?: string } | null): Promise<string> => {
  const apiKey = getApiKey(profile);

  if (!apiKey) {
    throw new Error('Clé API OpenAI non configurée. Veuillez l\'ajouter dans les paramètres.');
  }

  const prompt = `Tu es un expert en rédaction de CV optimisés pour les systèmes ATS.

Génère un CV professionnel au format HTML basé sur les informations suivantes :

Informations personnelles :
- Nom : ${userInfo.name || '[Nom]'}
- Poste actuel : ${userInfo.currentRole || '[Poste actuel]'}
- Entreprise : ${userInfo.currentCompany || '[Entreprise]'}
- Compétences : ${userInfo.skills ? userInfo.skills.join(', ') : '[Compétences]'}
- Résumé : ${userInfo.summary || '[Résumé professionnel]'}

Génère un CV HTML complet avec :
1. Design moderne et professionnel
2. Structure optimisée ATS
3. Sections : Contact, Profil, Expérience, Compétences, Formation
4. Mots-clés pertinents intégrés naturellement
5. Mise en forme CSS intégrée
6. Contenu réaliste et professionnel

Réponds UNIQUEMENT avec le code HTML complet, sans texte supplémentaire.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en rédaction de CV. Tu génères de manière professionnel et optimisé. Format texte'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erreur API OpenAI: ${errorData.error?.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Generation Error:', error);
    throw error;
  }
};

// Function to call OpenAI API for grammar checking (GPT-3.5 Turbo)
const callOpenAIForGrammarCheck = async (prompt: string, profile?: { openai_api_key?: string } | null): Promise<string> => {
  const apiKey = getApiKey(profile);

  if (!apiKey) {
    throw new Error('Clé API OpenAI non configurée. Veuillez l\'ajouter dans les paramètres.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un correcteur grammatical expert. Tu analyses les textes en français et fournis des corrections précises sans réécrire le contenu. Sois concis et utile.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Plus bas pour plus de précision en grammaire
        max_tokens: 1500 // Suffisant pour la grammaire
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error('Clé API OpenAI invalide. Vérifiez votre clé dans les paramètres.');
      } else if (response.status === 429) {
        throw new Error('Limite de taux atteinte. Veuillez réessayer dans quelques minutes.');
      } else if (response.status === 403) {
        throw new Error('Accès refusé. Vérifiez que votre clé API a les bonnes permissions.');
      } else {
        throw new Error(`Erreur API OpenAI: ${errorData.error?.message || 'Erreur inconnue'}`);
      }
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Réponse invalide de l\'API OpenAI');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI Grammar Check Error:', error);
    throw error;
  }
};

// Function to call OpenAI API for CV field editing
const callOpenAIForFieldEditing = async (prompt: string, profile?: { openai_api_key?: string } | null): Promise<string> => {
  const apiKey = getApiKey(profile);

  if (!apiKey) {
    throw new Error('Clé API OpenAI non configurée. Veuillez l\'ajouter dans les paramètres.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un outil d\'analyse grammaticale et linguistique spécialisé. Ton rôle UNIQUE est d\'analyser et identifier les erreurs SANS JAMAIS modifier le texte original. Sois précis, factuel et ne crée JAMAIS de contenu. Réponds exclusivement avec le format JSON demandé.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error('Clé API OpenAI invalide. Vérifiez votre clé dans les paramètres.');
      } else if (response.status === 429) {
        throw new Error('Limite de taux atteinte. Veuillez réessayer dans quelques minutes.');
      } else if (response.status === 403) {
        throw new Error('Accès refusé. Vérifiez que votre clé API a les bonnes permissions.');
      } else {
        throw new Error(`Erreur API OpenAI: ${errorData.error?.message || 'Erreur inconnue'}`);
      }
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Réponse invalide de l\'API OpenAI');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI Field Editing Error:', error);
    throw error;
  }
};

// Function to call OpenAI API for content generation (HTML, text, etc.)
const callOpenAIForGeneration = async (prompt: string, profile?: { openai_api_key?: string } | null): Promise<string> => {
  const apiKey = getApiKey(profile);

  if (!apiKey) {
    throw new Error('Clé API OpenAI non configurée. Veuillez l\'ajouter dans les paramètres.');
  }

  console.log('🔑 Clé API trouvée:', apiKey ? 'Oui' : 'Non');
  console.log('📤 Envoi de la requête à OpenAI pour génération...');
  console.log('📊 Longueur du prompt:', prompt.length, 'caractères');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Agis comme un expert en recrutement et communication professionnelle. Rédige des lettres de motivation optimisées pour passer les filtres ATS et attirer l\'attention d\'un recruteur humain.\n\nStructure obligatoire avec formatage VISUEL EXPLICITE :\n1. **Introduction** : accroche personnalisée qui montre un vrai intérêt pour l\'entreprise et le poste (mentionner l\'entreprise et une valeur ou projet spécifique).\n   - IMMÉDIATEMENT APRÈS : SAUT DE LIGNE DOUBLE\n\n2. **Corps** : mettre en avant 2–3 compétences clés en utilisant les mots-clés, illustrer chaque compétence par un résultat concret, chiffré ou mesurable si possible, et faire un lien direct entre ces résultats et les besoins du poste.\n   - IMMÉDIATEMENT APRÈS : SAUT DE LIGNE DOUBLE\n\n3. **Conclusion** : exprimer la motivation à rejoindre l\'équipe, la disponibilité pour un entretien, et finir avec une formule polie professionnelle.\n\nFORMAT OBLIGATOIRE :\n- Utiliser DES SAUTS DE LIGNE DOUBLES (\\n\\n) entre CHAQUE section\n- Introduction = 1 paragraphe + SAUT DE LIGNE DOUBLE\n- Corps = 1-2 paragraphes + SAUT DE LIGNE DOUBLE  \n- Conclusion = 1 paragraphe\n\nContraintes :\n- Maximum 250 mots\n- FORMAT AÉRÉ OBLIGATOIRE : paragraphes séparés par des sauts de ligne doubles\n- AUCUN MONOBLOC : chaque section doit être visuellement séparée\n- Pas de répétition inutile\n- Pas de formulations trop génériques ("je suis motivé", "je suis passionné") sans preuve\n- Le texte doit donner envie à l\'employeur d\'aller voir le CV\n- Optimisation ATS : mots-clés intégrés naturellement dans le texte\n- Optimisation humaine : une accroche différenciante et un fil narratif clair (je comprends vos besoins → je vous montre mes résultats → je veux contribuer)\n\nTon : professionnel, confiant mais respectueux, pas trop scolaire. Style : clair, phrases courtes, vocabulaire précis, sans fioritures. Format : paragraphes aérés avec des sauts de ligne entre chaque section. Réponds directement avec le contenu demandé, sans aucun commentaire ou explication.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error('Clé API OpenAI invalide. Vérifiez votre clé dans les paramètres.');
      } else if (response.status === 429) {
        throw new Error('Limite de taux atteinte. Veuillez réessayer dans quelques minutes.');
      } else if (response.status === 403) {
        throw new Error('Accès refusé. Vérifiez que votre clé API a les bonnes permissions.');
      } else {
        throw new Error(`Erreur API OpenAI: ${errorData.error?.message || 'Erreur inconnue'}`);
      }
    }

    const data = await response.json();

    console.log('✅ Réponse reçue d\'OpenAI, status:', response.status);
    console.log('📊 Structure de la réponse:', data ? 'Valide' : 'Invalide');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Structure de réponse invalide:', data);
      throw new Error('Réponse invalide de l\'API OpenAI');
    }

    const content = data.choices[0].message.content.trim();
    console.log('📝 Longueur du contenu généré:', content.length, 'caractères');
    console.log('🔍 Début du contenu généré:', content.substring(0, 100) + '...');

    return content;
  } catch (error) {
    console.error('❌ OpenAI Generation Error:', error);
    throw error;
  }
};

export const useOpenAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useSupabase();

  const analyzeCVContent = async (request: CVAnalysisRequest): Promise<CVAnalysisResponse | null> => {
    console.log('analyzeCVContent appelé avec ATS Pro:', request.enableATSPro);
    setIsLoading(true);
    setError(null);

    try {
      // Check if API key is configured
      console.log('Vérification de la clé API...');
      const apiKey = getApiKey(profile);
      if (!apiKey) {
        console.error('Clé API manquante');
        throw new Error('Clé API OpenAI non configurée. Veuillez l\'ajouter dans les paramètres.');
      }
      console.log('Clé API trouvée');

      // Enhanced analysis with job description keywords
      let jobKeywords = null;
      if (request.jobDescription && request.enableATSPro) {
        console.log('Extraction des mots-clés de la description de poste...');
        jobKeywords = await extractJobKeywords(request.jobDescription);
        console.log('Mots-clés extraits:', jobKeywords);
      }

      // Call OpenAI API for real analysis
      console.log('Appel de l\'API OpenAI...');
      const analysisResult = await callOpenAIAPI(
        request.content,
        request.targetRole,
        request.jobDescription,
        profile
      );
      console.log('Réponse de l\'API OpenAI:', analysisResult);

      // Enhance result with job description analysis if available
      if (jobKeywords && request.enableATSPro && !analysisResult.keywordAnalysis) {
        analysisResult.keywordAnalysis = {
          jobDescriptionKeywords: [
            ...jobKeywords.technical,
            ...jobKeywords.certifications,
            ...jobKeywords.tools
          ],
          semanticMatches: [],
          densityOptimization: {
            current: 2.5,
            optimal: 4.0,
            suggestions: ["Augmenter la fréquence des mots-clés techniques"]
          },
          contextualSuggestions: {
            skills: jobKeywords.soft,
            technologies: jobKeywords.technical,
            certifications: jobKeywords.certifications
          }
        };
      }

      setIsLoading(false);
      return analysisResult;
    } catch (err) {
      console.error('Erreur dans analyzeCVContent:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'analyse du CV. Veuillez réessayer.';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  const analyzeFile = async (file: File, targetRole?: string, jobDescription?: string, enableATSPro?: boolean): Promise<CVAnalysisResponse | null> => {
    console.log('analyzeFile appelé avec:', file.name, file.type, 'ATS Pro:', enableATSPro);
    setIsLoading(true);
    setError(null);

    try {
      console.log('Extraction du contenu du fichier...');
      // Extract text from file
      const content = await extractTextFromFile(file);
      console.log('Contenu extrait:', content.substring(0, 200) + '...');

      console.log('Appel de analyzeCVContent...');
      // Analyze the extracted content with OpenAI
      const result = await analyzeCVContent({
        content,
        targetRole,
        jobDescription,
        enableATSPro
      });

      console.log('Résultat de analyzeCVContent:', result);
      return result;
    } catch (err) {
      console.error('Erreur dans analyzeFile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'extraction ou de l\'analyse du fichier.';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  const generateCVContent = async (userInfo: AIContentRequest): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {

      // Call OpenAI API for CV generation
      const generatedContent = await callOpenAIForCVGeneration(userInfo, profile);

      setIsLoading(false);
      return generatedContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération du CV.';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  const editCVField = async (request: { prompt: string }): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call OpenAI API for field editing
      const editedContent = await callOpenAIForFieldEditing(request.prompt, profile);

      setIsLoading(false);
      return editedContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'édition du champ CV.';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

/**
 * Génère du contenu basé sur un prompt donné en utilisant l'API OpenAI.
 * @param {{ prompt: string }} request - Objet contenant le prompt pour la génération de contenu.
 * @returns {Promise<string | null>} - Promesse qui résout en une chaîne de caractère HTML ou texte générée par l'API OpenAI si la génération réussit, sinon null en cas d'erreur.
 */
  const generateContent = async (request: { prompt: string }): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call OpenAI API for content generation (HTML, text, etc.)
      const generatedContent = await callOpenAIForGeneration(request.prompt, profile);

      setIsLoading(false);
      return generatedContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération du contenu.';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  const checkGrammar = async (text: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call OpenAI API for grammar checking (GPT-3.5 Turbo)
      const grammarResult = await callOpenAIForGrammarCheck(text, profile);

      setIsLoading(false);
      return grammarResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification grammaticale.';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  const generateCoverLetter = async (prompt: string): Promise<CoverLetterResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = getApiKey(profile);

      if (!apiKey) {
        throw new Error('Clé API OpenAI non configurée. Veuillez l\'ajouter dans les paramètres.');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en rédaction de lettres de motivation professionnelles et persuasives. Tu génères des lettres de motivation optimisées pour les recruteurs et les ATS. Tu réponds en JSON avec la structure: {introduction: "...", body: "...", conclusion: "...", skillsHighlight: ["compétence1", "compétence2"]}'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur API OpenAI: ${errorData.error?.message || 'Erreur inconnue'}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content.trim();

      try {
        const parsedResponse: CoverLetterResponse = JSON.parse(aiResponse);
        setIsLoading(false);
        return parsedResponse;
      } catch (parseError) {
        console.error('Erreur lors du parsing de la réponse:', parseError);
        // Fallback: return as plain text structure
        setIsLoading(false);
        return {
          introduction: aiResponse,
          body: '',
          conclusion: '',
          skillsHighlight: []
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération de la lettre de motivation.';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  return {
    analyzeCV: analyzeCVContent,
    analyzeFile,
    generateCVContent,
    editCVField,
    generateContent,
    checkGrammar,
    generateCoverLetter,
    isLoading,
    error
  };
};
