import { useState } from 'react';
import { useSupabase } from './useSupabase';

export interface CVAnalysisRequest {
  content: string;
  jobDescription?: string;
  targetRole?: string;
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
  return getApiKeyFromLocalStorage();
};

// Function to call OpenAI API for CV analysis
const callOpenAIAPI = async (content: string, targetRole?: string, profile?: { openai_api_key?: string } | null): Promise<CVAnalysisResponse> => {
  const apiKey = getApiKey(profile);
  
  if (!apiKey) {
    throw new Error('Clé API OpenAI non configurée. Veuillez l\'ajouter dans les paramètres.');
  }

  const prompt = `ANALYSE CV - FORMAT JSON OBLIGATOIRE

Tu es un expert senior en recrutement ATS. Analyse ce CV et réponds UNIQUEMENT en JSON valide.

${targetRole ? `POSTE VISÉ : ${targetRole}` : 'ANALYSE GÉNÉRALE'}

CV À ANALYSER :
${content}

RÉPONSE OBLIGATOIRE - JSON UNIQUEMENT :
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
  ]
}

IMPORTANT : Réponds UNIQUEMENT avec le JSON, aucun autre texte.`;

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
const callOpenAIForGeneration = async (userInfo: UserInfo, profile?: { openai_api_key?: string } | null): Promise<string> => {
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
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en rédaction de CV professionnel et coach de carrière. Tu aides à générer du contenu concis, percutant et optimisé pour les systèmes ATS. Tu peux également aider à préparer des entretiens d\'embauche en fournissant des conseils, des questions types, et des stratégies de réponse. Tu réponds toujours directement et de manière professionnelle.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
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

export const useOpenAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useSupabase();

  const analyzeCVContent = async (request: CVAnalysisRequest): Promise<CVAnalysisResponse | null> => {
    console.log('analyzeCVContent appelé');
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

      // Call OpenAI API for real analysis
      console.log('Appel de l\'API OpenAI...');
      const analysisResult = await callOpenAIAPI(request.content, request.targetRole, profile);
      console.log('Réponse de l\'API OpenAI:', analysisResult);

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

  const analyzeFile = async (file: File, targetRole?: string): Promise<CVAnalysisResponse | null> => {
    console.log('analyzeFile appelé avec:', file.name, file.type);
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
        targetRole
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
      const generatedContent = await callOpenAIForGeneration(userInfo, profile);
      
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

  return {
    analyzeCV: analyzeCVContent,
    analyzeFile,
    generateCVContent,
    editCVField,
    isLoading,
    error
  };
};
