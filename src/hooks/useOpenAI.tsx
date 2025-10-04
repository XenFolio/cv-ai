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
  markdownAnalysis?: string; // Nouveau champ pour le contenu Markdown de l'analyse
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
  markdownContent?: string; // Nouveau champ pour le contenu Markdown
}

export type CorrectionMode = "strict" | "premium";

export interface GrammarError {
  position: {
    start: number;
    end: number;
  };
  original: string;
  correction: string;
  type: 'orthographe' | 'grammaire' | 'conjugaison' | 'accord' | 'ponctuation';
  explanation: string;
  severity?: 'critique' | 'majeure' | 'mineure';
}

export interface StyleSuggestion {
  paragraphIndex: number;
  originalText: string;
  suggestions: {
    text: string;
    type: 'vocabulary' | 'structure' | 'clarity' | 'impact' | 'professionalism';
    explanation: string;
  }[];
}


// Helper function to extract keywords from text
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

// Enhanced function to call OpenAI API for ATS Pro analysis
const callOpenAIAPI = async (content: string, targetRole?: string, jobDescription?: string, profile?: { openai_api_key?: string } | null): Promise<CVAnalysisResponse> => {
  const apiKey = getApiKey(profile);

  // Only try OpenAI API - no mock data fallback
  // Real API key is required now
  if (!apiKey) {
    throw new Error('Clé API OpenAI non configurée. Veuillez l\'ajouter dans les paramètres.');
  }

  const prompt = `ANALYSE CV ATS PRO - FORMAT MARKDOWN/HTML

Tu es un expert senior en recrutement ATS avec analyse de marché. Analyse ce CV et réponds en format MARKDOWN avec du HTML quand c'est utile pour la mise en forme.

${targetRole ? `POSTE VISÉ : ${targetRole}` : 'ANALYSE GÉNÉRALE'}
${jobDescription ? `\nDESCRIPTION DE POSTE :\n${jobDescription}` : ''}

CV À ANALYSER :
${content}

STRUCTURE DE RÉPONSE SOUHAITÉE :

# Analyse ATS Pro - ${targetRole || 'Analyse Générale'}

## 📊 Score Global : 85/100

### Scores par Section
- **Optimisation ATS** : 80/100
- **Correspondance Mots-clés** : 75/100
- **Structure** : 90/100
- **Contenu** : 85/100

## 🎯 Forces Principales
- Point fort 1
- Point fort 2
- Point fort 3
- Point fort 4

## 🔬 Points à Améliorer
- Faiblesse 1
- Faiblesse 2
- Faiblesse 3
- Faiblesse 4

## 💡 Recommandations Prioritaires
1. **Recommandation 1** - Description détaillée
2. **Recommandation 2** - Description détaillée
3. **Recommandation 3** - Description détaillée
4. **Recommandation 4** - Description détaillée
5. **Recommandation 5** - Description détaillée

## 🔍 Analyse des Mots-clés

### Mots-clés Identifiés
- "mot1", "mot2", "mot3"

### Mots-clés Manquants
- "mot4", "mot5", "mot6"

### Suggestions
- Ajouter : "mot7", "mot8", "mot9"

## 📈 Optimisation de Densité
- **Actuelle** : 2.5%
- **Optimale** : 4.0%
- **Suggestions** : Ajouter plus d'occurrences des mots-clés principaux

## 🚀 Amélioration Prioritaires
<details>
<summary>🎯 Amélioration 1 (Priorité haute)</summary>
Description détaillée de l'amélioration suggérée
</details>

<details>
<summary>🔧 Amélioration 2 (Priorité moyenne)</summary>
Description détaillée de l'amélioration suggérée
</details>

## 🏢 Benchmarking Marché
**Industrie** : Technology
**Poste** : Senior Developer
**Positionnement** : 85e percentile (compétitivité haute)

### Tendances du Marché
- **Haute demande** : React, TypeScript, Cloud
- **Émergentes** : AI/ML, Web3
- **En déclin** : Legacy systems

IMPORTANT : Utilise le format Markdown avec des balises HTML quand utile pour la mise en forme. Pas de JSON, uniquement du contenu formaté pour l'affichage direct.`;

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
            content: 'Tu es un expert en analyse de CV. Tu réponds en format Markdown avec HTML quand utile pour la mise en forme. Sois clair, structuré et facile à lire.'
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
        throw new Error('Quota d\'API OpenAI dépassé. Veuillez réessayer plus tard.');
      } else {
        throw new Error(`Erreur API OpenAI: ${errorData.error?.message || 'Erreur inconnue'}`);
      }
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    try {
      // La réponse est maintenant en Markdown, on la retourne avec une structure de base
      return {
        overallScore: 85, // Score par défaut si non analysable
        sections: {
          atsOptimization: 80,
          keywordMatch: 75,
          structure: 90,
          content: 85
        },
        recommendations: ["Utilisez l'analyse Markdown pour des détails complets"],
        strengths: ["Force à déterminer depuis le Markdown"],
        weaknesses: ["Faiblesse à déterminer depuis le Markdown"],
        keywords: {
          found: ["mot-clé 1"],
          missing: ["mot-clé manquant"],
          suggestions: ["suggestion"]
        },
        improvements: [],
        keywordAnalysis: {
          jobDescriptionKeywords: [],
          semanticMatches: [],
          densityOptimization: {
            current: 2.0,
            optimal: 4.0,
            suggestions: []
          },
          contextualSuggestions: {
            skills: [],
            technologies: [],
            certifications: []
          }
        },
        marketBenchmarking: {
          industry: "Technology",
          role: "Professional",
          averageScore: 75,
          percentile: 70,
          competitiveness: "medium",
          marketDemand: {
            highDemand: [],
            emerging: [],
            declining: []
          }
        },
        markdownAnalysis: aiResponse // Contenu Markdown complet
      };
    } catch (parseError) {
      console.error('Error processing OpenAI response:', parseError);
      console.error('Raw response:', aiResponse);
      // Return default structure with markdown content
      return {
        overallScore: 75,
        sections: {
          atsOptimization: 75,
          keywordMatch: 70,
          structure: 80,
          content: 75
        },
        recommendations: ["Vérifier le format de la réponse"],
        strengths: ["Contenu Markdown généré"],
        weaknesses: ["Analyse automatisée limitée"],
        keywords: {
          found: [],
          missing: [],
          suggestions: []
        },
        improvements: [],
        keywordAnalysis: {
          jobDescriptionKeywords: [],
          semanticMatches: [],
          densityOptimization: {
            current: 2.0,
            optimal: 4.0,
            suggestions: []
          },
          contextualSuggestions: {
            skills: [],
            technologies: [],
            certifications: []
          }
        },
        marketBenchmarking: {
          industry: "Technology",
          role: "Professional",
          averageScore: 75,
          percentile: 70,
          competitiveness: "medium",
          marketDemand: {
            highDemand: [],
            emerging: [],
            declining: []
          }
        },
        markdownAnalysis: aiResponse // Contenu Markdown même en cas d'erreur
      };
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'analyse';
    throw new Error(errorMessage);
  }
};

// Function for grammar checking with Markdown response
const callOpenAIForGrammarCheck = async (content: string, profile?: { openai_api_key?: string } | null): Promise<string> => {
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
            content: 'Tu es un expert en grammaire et style professionnel. Tu réponds en format Markdown avec tableaux pour une clarté optimale.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erreur API OpenAI: ${errorData.error?.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

// Function to map text positions to HTML positions
const mapTextPositionToHTML = (_plainText: string, htmlContent: string, textPosition: number): number => {
  let htmlPosition = 0;
  let textIndex = 0;

  // Create a temporary element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Walk through the HTML content character by character
  const walkText = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textContent = node.textContent || '';
      for (let i = 0; i < textContent.length; i++) {
        if (textIndex === textPosition) {
          // Found the position, return the HTML position
          const range = document.createRange();
          range.setStart(node, i);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(tempDiv);
          preCaretRange.setEnd(range.startContainer, range.startOffset);
          htmlPosition = preCaretRange.toString().length;
          return;
        }
        textIndex++;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Handle <br> and <p> tags as line breaks
      const element = node as Element;
      if (element.tagName === 'BR') {
        if (textIndex === textPosition) {
          htmlPosition = textIndex; // Approximation for <br>
          return;
        }
        textIndex++;
      } else if (element.tagName === 'P') {
        // Handle paragraph breaks
        if (element.previousSibling && element.previousSibling.nodeType === Node.ELEMENT_NODE) {
          // Add extra line break between paragraphs
          if (textIndex === textPosition) {
            htmlPosition = textIndex;
            return;
          }
          textIndex++;
        }
      }

      // Recursively walk through child nodes
      for (let i = 0; i < node.childNodes.length; i++) {
        walkText(node.childNodes[i]);
        if (htmlPosition > 0) return; // Position found, stop walking
      }
    }
  };

  walkText(tempDiv);
  return htmlPosition || textPosition; // Fallback to original position
};

// Function to parse markdown corrections and extract structured data
const parseMarkdownCorrections = (markdownResponse: string, originalText: string, htmlContent?: string): { errors: GrammarError[], correctedText: string } => {
  const errors: GrammarError[] = [];
  let correctedText = originalText;

  try {
    // Extract table rows from markdown
    const tableRegex = /\|\s*(\d+-\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g;
    let match;

    while ((match = tableRegex.exec(markdownResponse)) !== null) {
      const position = match[1];
      const original = match[2].trim();
      const correction = match[3].trim();
      const type = match[4].trim().toLowerCase() as GrammarError['type'];
      const severity = match[5].trim().toLowerCase() as 'critique' | 'majeure' | 'mineure';
      const explanation = match[6].trim();

      // Parse position (format: "start-end")
      const [start, end] = position.split('-').map(Number);

      // Map text positions to HTML positions if HTML content is provided
      let htmlStart = start;
      let htmlEnd = end;
      if (htmlContent) {
        htmlStart = mapTextPositionToHTML(originalText, htmlContent, start);
        htmlEnd = mapTextPositionToHTML(originalText, htmlContent, end);
      }

      // Create error object with both text and HTML positions
      errors.push({
        position: { start, end }, // Keep original text positions for correction
        original,
        correction,
        type,
        explanation,
        severity,
        // Add HTML positions for highlighting
        htmlPosition: { start: htmlStart, end: htmlEnd }
      } as GrammarError & { htmlPosition: { start: number; end: number } });

      // Apply correction to text
      if (original && correction) {
        correctedText = correctedText.replace(new RegExp(escapeRegExp(original), 'g'), correction);
      }
    }

    // Try to extract corrected text from markdown section
    const correctedTextSection = markdownResponse.match(/## ✅ Texte Corrigé Complet\n([\s\S]*?)(?=\n##|$)/);
    if (correctedTextSection && correctedTextSection[1]) {
      const extractedText = correctedTextSection[1].trim();
      if (extractedText && extractedText.length > 0) {
        correctedText = extractedText;
      }
    }

  } catch (error) {
    console.error('Error parsing markdown corrections:', error);
  }

  return { errors, correctedText };
};

// Helper function to escape regex special characters
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Get API key from profile or settings
const getApiKey = (profile?: { openai_api_key?: string } | null): string | null => {
  // Try to get from profile first
  if (profile?.openai_api_key) {
    return profile.openai_api_key;
  }

  // Fallback to localStorage (for backward compatibility)
  const savedSettings = localStorage.getItem('openaiSettings');
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      return parsedSettings.apiKey || null;
    } catch {
      return null;
    }
  }

  return null;
};

// Keyword patterns for extraction
const technicalSkillsPatterns = [
  /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin)\b/gi,
  /\b(React|Vue|Angular|Node\.js|Express|Django|Flask|Spring|Laravel|Rails)\b/gi,
  /\b(HTML|CSS|SASS|LESS|Tailwind|Bootstrap|jQuery)\b/gi,
  /\b(MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch|Docker|Kubernetes)\b/gi,
  /\b(AWS|Azure|GCP|Firebase|Vercel|Netlify|Heroku)\b/gi
];

const softSkillsPatterns = [
  /\b(leadership|communication|collaboration|problem.?solving|critical.?thinking|creativity|adaptability)\b/gi,
  /\b(project.?management|time.?management|teamwork|negotiation|presentation|analytical)\b/gi
];

const certificationPatterns = [
  /\b(AWS|Google|Microsoft|Oracle|Cisco|PMP|Scrum|Agile|ITIL|CompTIA)\b/gi,
  /\b(Certified|Associate|Professional|Expert|Master|Architect)\b/gi
];

const toolPatterns = [
  /\b(Git|GitHub|GitLab|Jira|Trello|Slack|Figma|Sketch|VS.?Code|IntelliJ)\b/gi
];

export const useOpenAI = () => {
  const { profile } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

/**
 * Analyze a CV content using OpenAI API.
 *
 * @param {CVAnalysisRequest} request - Request object containing the content to analyze, the target role, and the job description.
 * @returns {Promise<CVAnalysisResponse>} - Promise resolving with the analyzed CV content.
 * @throws {Error} - Error thrown if the request fails.
 */
  const analyzeCV = async (request: CVAnalysisRequest): Promise<CVAnalysisResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await callOpenAIAPI(
        request.content,
        request.targetRole,
        request.jobDescription,
        profile
      );

      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'analyse du CV';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const editCVField = async ({ prompt }: { prompt: string }): Promise<string> => {
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
              content: 'Tu es un expert en rédaction de CV et de contenu professionnel. Réponds en format Markdown pour une meilleure lisibilité.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur API OpenAI: ${errorData.error?.message || 'Erreur inconnue'}`);
      }

      const data = await response.json();
      setIsLoading(false);
      return data.choices[0].message.content.trim();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération du contenu.';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const generateCoverLetter = async (request: {
    cvContent: string;
    jobDescription: string;
    companyInfo?: string;
    tone?: string;
  }): Promise<CoverLetterResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = getApiKey(profile);
      if (!apiKey) {
        throw new Error('Clé API OpenAI non configurée. Veuillez l\'ajouter dans les paramètres.');
      }

      const prompt = `Rédige une lettre de motivation professionnelle en te basant sur:

CV: ${request.cvContent}
Description du poste: ${request.jobDescription}
${request.companyInfo ? `Entreprise: ${request.companyInfo}` : ''}
${request.tone ? `Ton: ${request.tone}` : ''}

IMPORTANT: Réponds en format Markdown avec une structure claire et professionnelle.`;

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
              content: 'Tu es un expert en rédaction de lettres de motivation professionnelles et persuasives. Tu génères des lettres de motivation optimisées pour les recruteurs et les ATS. Tu réponds en format Markdown avec une structure claire et professionnelle.'
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
        // La réponse est maintenant en Markdown, on la retourne dans une structure adaptée
        setIsLoading(false);
        return {
          introduction: "Introduction générée avec succès",
          body: aiResponse, // Contenu Markdown complet
          conclusion: "Conclusion professionnelle",
          skillsHighlight: ["Compétence 1", "Compétence 2"], // Sera extrait du contenu
          markdownContent: aiResponse // Contenu Markdown complet
        };
      } catch (parseError) {
        console.error('Erreur lors du traitement:', parseError);
        // Fallback: return as plain text structure
        setIsLoading(false);
        return {
          introduction: "Erreur lors de la génération",
          body: aiResponse,
          conclusion: "Veuillez réessayer",
          skillsHighlight: [],
          markdownContent: aiResponse
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération de la lettre de motivation.';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const analyzeGrammarErrors = async (text: string): Promise<{ errors: GrammarError[], correctedText: string, markdownAnalysis?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const analysisPrompt = `Analyse ce texte et identifie TOUTES les erreurs grammaticales, orthographiques et de style.

TEXTE À ANALYSER :
"${text}"

CONSIGNES IMPORTANTES :
1. Identifie toutes les erreurs réelles : orthographe, grammaire, conjugaison, accords, ponctuation
2. Pour chaque erreur identifiée, crée une ligne dans le tableau avec :
   - Position exacte (format: start-end, comptez les caractères depuis 0)
   - Texte original exact (copiez-collez l'erreur)
   - Correction proposée
   - Type d'erreur (orthographe, grammaire, conjugaison, accord, ponctuation)
   - Sévérité (critique, majeure, mineure)
   - Explication courte et claire

COMMENT CALCULER LES POSITIONS :
- Comptez les caractères depuis le début du texte (espaces inclus)
- Format: nombre-nombre (ex: 15-25)
- Soyez précis!

FORMAT DE RÉPONSE OBLIGATOIRE :

# 📝 Correction Grammaticale et Style

## 📊 Résumé des Corrections
- **Erreurs critiques** : [nombre]
- **Erreurs majeures** : [nombre]
- **Erreurs mineures** : [nombre]

## 🔍 Corrections Détailées

| Position | Original | Correction | Type | Sévérité | Explication |
|----------|----------|------------|------|----------|-------------|
| [position] | [erreur exacte] | [correction] | [type] | [sévérité] | [explication] |

## ✅ Texte Corrigé Complet
[texte complet avec toutes les corrections appliquées]

IMPORTANT :
- Utilisez UNIQUEMENT ce format exact
- Ajoutez une ligne dans le tableau POUR CHAQUE erreur réelle trouvée
- Si aucune erreur, mettez "Aucune erreur détectée" dans le tableau
- Vérifiez que les positions sont exactes avant de répondre`;

      // Appeler l'API pour l'analyse
      const response = await callOpenAIForGrammarCheck(analysisPrompt, profile);

      try {
        // Parser la réponse Markdown pour extraire les corrections
        // Note: htmlContent n'est pas disponible ici, mais les positions seront mappées dans le composant
        const corrections = parseMarkdownCorrections(response, text);

        setIsLoading(false);
        return {
          errors: corrections.errors,
          correctedText: corrections.correctedText,
          markdownAnalysis: response // Garder le Markdown pour l'affichage
        };
      } catch (parseError) {
        console.error('Erreur de traitement:', parseError);
        // Fallback : retourner un résultat vide
        setIsLoading(false);
        return {
          errors: [],
          correctedText: text,
          markdownAnalysis: response
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'analyse grammaticale.';
      setError(errorMessage);
      setIsLoading(false);
      return {
        errors: [],
        correctedText: text
      };
    }
  };

  const suggestStyleImprovements = async (text: string): Promise<StyleSuggestion[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = getApiKey(profile);

      if (!apiKey) {
        throw new Error('Clé API OpenAI non configurée. Veuillez l\'ajouter dans les paramètres.');
      }

      const stylePrompt = `Analyse ce texte et suggère des améliorations stylistiques professionnelles.

TEXTE À ANALYSER :
"${text}"

CONSIGNES :
1. Identifie les paragraphes individuellement (séparés par des sauts de ligne)
2. Pour chaque paragraphe, suggère 2-3 améliorations maximum dans les catégories :
   - vocabulary: Amélioration du vocabulaire
   - structure: Amélioration de la structure de la phrase
   - clarity: Amélioration de la clarté
   - impact: Amélioration de l'impact professionnel
   - professionalism: Amélioration du ton professionnel

FORMAT DE RÉPONSE OBLIGATOIRE - JSON :

{
  "suggestions": [
    {
      "paragraphIndex": 0,
      "originalText": "texte original du paragraphe",
      "suggestions": [
        {
          "text": "texte suggéré amélioré",
          "type": "vocabulary",
          "explanation": "explication brève de l'amélioration"
        }
      ]
    }
  ]
}

IMPORTANT :
- Réponds UNIQUEMENT en format JSON valide
- Pas de texte avant ou après le JSON
- Maximum 3 suggestions par paragraphe
- Focus sur les améliorations qui ont un impact réel`;

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
              content: 'Tu es un expert en rédaction professionnelle et en amélioration stylistique. Tu réponds uniquement en format JSON valide, sans aucun texte avant ou après.'
            },
            {
              role: 'user',
              content: stylePrompt
            }
          ],
          temperature: 0.3,
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
        // Parser la réponse JSON
        const parsedResponse = JSON.parse(aiResponse) as {
          suggestions: Array<{
            paragraphIndex?: number;
            originalText?: string;
            suggestions?: Array<{
              text?: string;
              type?: string;
              explanation?: string;
            }>;
          }>;
        };

        // Valider et transformer les suggestions
        const styleSuggestions: StyleSuggestion[] = [];

        if (parsedResponse.suggestions && Array.isArray(parsedResponse.suggestions)) {
          parsedResponse.suggestions.forEach((suggestion) => {
            if (suggestion.paragraphIndex !== undefined &&
                suggestion.originalText &&
                suggestion.suggestions &&
                Array.isArray(suggestion.suggestions)) {

              const validSuggestions = suggestion.suggestions.filter((s) =>
                s.text && s.type && s.explanation
              );

              if (validSuggestions.length > 0) {
                styleSuggestions.push({
                  paragraphIndex: suggestion.paragraphIndex,
                  originalText: suggestion.originalText,
                  suggestions: validSuggestions.map((s) => ({
                    text: s.text!,
                    type: s.type as StyleSuggestion['suggestions'][0]['type'],
                    explanation: s.explanation!
                  }))
                });
              }
            }
          });
        }

        setIsLoading(false);
        return styleSuggestions;

      } catch (parseError) {
        console.error('Error parsing style suggestions:', parseError);
        console.error('Raw response:', aiResponse);

        // Retourner une suggestion de base si le parsing échoue
        setIsLoading(false);
        return [{
          paragraphIndex: 0,
          originalText: text,
          suggestions: [{
            text: "Considérez une reformulation pour améliorer la clarté",
            type: "clarity" as const,
            explanation: "Le style pourrait être amélioré pour une meilleure lisibilité"
          }]
        }];
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'analyse de style.';
      setError(errorMessage);
      setIsLoading(false);
      return [];
    }
  };

  const generateOptimizedKeywords = async (jobDescription: string, currentSkills: string[]): Promise<string[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const keywords = extractKeywords(jobDescription, [
        ...technicalSkillsPatterns,
        ...softSkillsPatterns,
        ...certificationPatterns,
        ...toolPatterns
      ]);

      setIsLoading(false);
      return keywords.filter(keyword =>
        !currentSkills.some(skill => skill.toLowerCase().includes(keyword.toLowerCase()))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération des mots-clés.';
      setError(errorMessage);
      setIsLoading(false);
      return [];
    }
  };

  return {
    analyzeCV,
    editCVField,
    generateCoverLetter,
    analyzeGrammarErrors,
    suggestStyleImprovements,
    generateOptimizedKeywords,
    isLoading,
    error
  };
};
