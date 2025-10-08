import { useState } from 'react';
import { useSupabase } from './useSupabase';

export interface CVAnalysisRequest {
  content: string;
  jobDescription?: string;
  targetRole?: string;
  enableATSPro?: boolean; // Enable enhanced ATS Pro features
}

export interface LetterAnalysisRequest {
  content: string;
  jobDescription?: string;
  targetRole?: string;
  cvContent?: string; // CV content for better context
  enableATSPro?: boolean;
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

export interface LetterAnalysisResponse {
  overallScore: number;
  sections: {
    atsOptimization: number;
    keywordMatch: number;
    structure: number;
    content: number;
    persuasion: number; // Spécifique aux lettres
    personalization: number; // Spécifique aux lettres
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
  // Spécifique aux lettres
  storytelling: {
    effectiveness: number;
    hooks: string[];
    flow: string[];
    impact: string[];
  };
  personalizationAnalysis?: {
    companyName: boolean;
    recruiterName: boolean;
    specificProjects: boolean;
    culturalFit: boolean;
  };
  markdownAnalysis?: string;
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

export interface CoverLetterRequest {
  cvContent: string;
  jobDescription: string;
  companyInfo?: string;
  tone?: string;
  // Nouveau : informations du profil pour personnalisation
  profileInfo?: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
  };
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

// Enhanced function to call OpenAI API for CV ATS Pro analysis
const callOpenAIAPI_CV = async (content: string, targetRole?: string, jobDescription?: string, profile?: { openai_api_key?: string } | null): Promise<CVAnalysisResponse> => {
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
      // Parser la réponse Markdown pour extraire les vraies données d'analyse
      const parsedAnalysis = parseMarkdownAnalysis(aiResponse);
      return {
        ...parsedAnalysis,
        markdownAnalysis: aiResponse // Garder le contenu Markdown complet pour l'affichage
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

// Enhanced function to call OpenAI API for Letter ATS analysis
const callOpenAIAPI_Letter = async (content: string, targetRole?: string, jobDescription?: string, cvContent?: string, profile?: { openai_api_key?: string } | null): Promise<LetterAnalysisResponse> => {
  const apiKey = getApiKey(profile);

  if (!apiKey) {
    throw new Error('Clé API OpenAI non configurée. Veuillez l\'ajouter dans les paramètres.');
  }

  const prompt = `ANALYSE LETTRE DE MOTIVATION ATS PRO - FORMAT MARKDOWN/HTML

Tu es un expert en recrutement et analyse de lettres de motivation. Analyse cette lettre et réponds en format MARKDOWN avec du HTML quand c'est utile pour la mise en forme.

${targetRole ? `POSTE VISÉ : ${targetRole}` : 'ANALYSE GÉNÉRALE'}
${jobDescription ? `\nDESCRIPTION DE POSTE :\n${jobDescription}` : ''}
${cvContent ? `\nCV ASSOCIÉ (pour contexte) :\n${cvContent}` : ''}

LETTRE À ANALYSER :
${content}

STRUCTURE DE RÉPONSE SOUHAITÉE :

# Analyse Lettre de Motivation ATS Pro - ${targetRole || 'Analyse Générale'}

## 📊 Score Global : 85/100

### Scores par Section
- **Optimisation ATS** : 80/100
- **Correspondance Mots-clés** : 75/100
- **Structure** : 90/100
- **Contenu** : 85/100
- **Persuasion** : 80/100 (spécifique aux lettres)
- **Personnalisation** : 70/100 (spécifique aux lettres)

## 🎯 Points Forts de la Lettre
- Point fort 1 (persuasion, storytelling, etc.)
- Point fort 2
- Point fort 3
- Point fort 4

## 🔬 Points à Améliorer
- Faiblesse 1
- Faiblesse 2
- Faiblesse 3
- Faiblesse 4

## 💡 Recommandations pour la Lettre
1. **Recommandation 1** - Description détaillée
2. **Recommandation 2** - Description détaillée
3. **Recommandation 3** - Description détaillée

## 🎭 Analyse du Storytelling

### Accroches Efficaces
- Accroche 1
- Accroche 2

### Flux Narratif
- Point fort 1
- Point fort 2

### Impact Émotionnel
- Élément 1
- Élément 2

## 🔍 Analyse des Mots-clés Spécifiques

### Mots-clés Présents
- "mot1", "mot2", "mot3"

### Mots-clés Manquants
- "mot4", "mot5", "mot6"

### Suggestions pour la Lettre
- Ajouter : "mot7", "mot8", "mot9"

## 🎯 Analyse de Personnalisation
- **Nom de l'entreprise** : ✅/❌
- **Nom du recruteur** : ✅/❌
- **Projets spécifiques** : ✅/❌
- **Adéquation culturelle** : ✅/❌

## 🚀 Améliorations Prioritaires
<details>
<summary>🎯 Amélioration 1 (Priorité haute)</summary>
Description détaillée de l'amélioration suggérée
</details>

IMPORTANT : Utilise le format Markdown avec des balises HTML quand utile pour la mise en forme. Concentre-toi sur les aspects spécifiques aux lettres de motivation : persuasion, personnalisation, storytelling.`;

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
            content: 'Tu es un expert en analyse de lettres de motivation. Tu réponds en format Markdown avec HTML quand utile pour la mise en forme. Sois clair, structuré et facile à lire.'
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
      // Parser la réponse Markdown pour extraire les vraies données d'analyse
      const parsedAnalysis = parseMarkdownAnalysisLetter(aiResponse);
      return {
        ...parsedAnalysis,
        markdownAnalysis: aiResponse // Garder le contenu Markdown complet pour l'affichage
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
          content: 75,
          persuasion: 75,
          personalization: 70
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
        storytelling: {
          effectiveness: 75,
          hooks: ["Accroche à améliorer"],
          flow: ["Flux narratif"],
          impact: ["Impact à renforcer"]
        },
        personalizationAnalysis: {
          companyName: false,
          recruiterName: false,
          specificProjects: false,
          culturalFit: false
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

// Function to parse Markdown analysis response and extract structured data for CVs
const parseMarkdownAnalysis = (markdownResponse: string): CVAnalysisResponse => {
  try {
    const analysis: CVAnalysisResponse = {
      overallScore: 75,
      sections: {
        atsOptimization: 75,
        keywordMatch: 75,
        structure: 75,
        content: 75
      },
      recommendations: [],
      strengths: [],
      weaknesses: [],
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
      }
    };

    // Extraire le score global
    const scoreMatch = markdownResponse.match(/Score Global[:\s]*(\d+)\/?(\d+)?/i);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1]);
      const maxScore = scoreMatch[2] ? parseInt(scoreMatch[2]) : 100;
      analysis.overallScore = Math.round((score / maxScore) * 100);
    }

    // Extraire les scores par section
    const sectionScores = [
      { key: 'atsOptimization', patterns: [/Optimisation ATS[:\s]*(\d+)/i, /ATS Optimization[:\s]*(\d+)/i] },
      { key: 'keywordMatch', patterns: [/Correspondance Mots-clés[:\s]*(\d+)/i, /Keyword Match[:\s]*(\d+)/i] },
      { key: 'structure', patterns: [/Structure[:\s]*(\d+)/i] },
      { key: 'content', patterns: [/Contenu[:\s]*(\d+)/i, /Content[:\s]*(\d+)/i] }
    ];

    sectionScores.forEach(section => {
      for (const pattern of section.patterns) {
        const match = markdownResponse.match(pattern);
        if (match) {
          analysis.sections[section.key as keyof typeof analysis.sections] = parseInt(match[1]);
          break;
        }
      }
    });

    // Extraire les forces (points forts)
    const strengthsMatch = markdownResponse.match(/##?[🎯\s]*Forces?[🎯\s]*\n([\s\S]*?)(?=\n##|$)/iu);
    if (strengthsMatch) {
      const strengthsText = strengthsMatch[1];
      const strengthLines = strengthsText.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
      analysis.strengths = strengthLines.map(line => line.replace(/^[-•]\s*/, '').trim()).filter(s => s.length > 0);
    }

    // Extraire les faiblesses (points à améliorer)
    const weaknessesMatch = markdownResponse.match(/##?[🔬\s]*Points?[🔬\s]*\n([\s\S]*?)(?=\n##|$)/iu);
    if (weaknessesMatch) {
      const weaknessesText = weaknessesMatch[1];
      const weaknessLines = weaknessesText.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
      analysis.weaknesses = weaknessLines.map(line => line.replace(/^[-•]\s*/, '').trim()).filter(w => w.length > 0);
    }

    // Extraire les recommandations
    const recommendationsMatch = markdownResponse.match(/##?[💡\s]*Recommandations?[💡\s]*\n([\s\S]*?)(?=\n##|$)/iu);
    if (recommendationsMatch) {
      const recommendationsText = recommendationsMatch[1];
      const recommendationLines = recommendationsText.split('\n').filter(line =>
        line.trim().match(/^\d+\./) || line.trim().startsWith('-') || line.trim().startsWith('•')
      );
      analysis.recommendations = recommendationLines.map(line =>
        line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim()
      ).filter(r => r.length > 0);
    }

    // Extraire les mots-clés
    const keywordsFoundMatch = markdownResponse.match(/Mots-clés[:\s]*(Identifiés|Présents|Trouvés)?[:\s]*\n([\s\S]*?)(?=\n##|\n\n|$)/i);
    if (keywordsFoundMatch) {
      const keywordsText = keywordsFoundMatch[2];
      const keywords = keywordsText.match(/"([^"]+)"/g);
      if (keywords) {
        analysis.keywords.found = keywords.map(k => k.replace(/"/g, '')).filter(k => k.length > 0);
      }
    }

    const keywordsMissingMatch = markdownResponse.match(/Mots-clés[:\s]*Manquants?[:\s]*\n([\s\S]*?)(?=\n##|\n\n|$)/i);
    if (keywordsMissingMatch) {
      const keywordsText = keywordsMissingMatch[1];
      const keywords = keywordsText.match(/"([^"]+)"/g);
      if (keywords) {
        analysis.keywords.missing = keywords.map(k => k.replace(/"/g, '')).filter(k => k.length > 0);
      }
    }

    const suggestionsMatch = markdownResponse.match(/Suggestions[:\s]*\n([\s\S]*?)(?=\n##|\n\n|$)/i);
    if (suggestionsMatch) {
      const suggestionsText = suggestionsMatch[1];
      const suggestions = suggestionsText.match(/"([^"]+)"/g);
      if (suggestions) {
        analysis.keywords.suggestions = suggestions.map(k => k.replace(/"/g, '')).filter(k => k.length > 0);
      }
    }

    // Extraire les améliorations prioritaires
    const improvementsMatch = markdownResponse.match(/##?[🚀\s]*Amélioration?[🚀\s]*\n([\s\S]*?)(?=\n##|$)/iu);
    if (improvementsMatch) {
      const improvementsText = improvementsMatch[1];
      const detailMatches = improvementsText.match(/<details>[\s\S]*?<\/details>/g) || [];

      analysis.improvements = detailMatches.map((detail, index) => {
        const summaryMatch = detail.match(/<summary>(.*?)<\/summary>/);
        const descriptionMatch = detail.match(/<summary>.*?<\/summary>\s*(.*)/);

        return {
          title: summaryMatch ? summaryMatch[1].replace(/\(Priorité ([a-z]+)\)/i, '').trim() : `Amélioration ${index + 1}`,
          description: descriptionMatch ? descriptionMatch[1].trim() : '',
          priority: (summaryMatch && summaryMatch[1].toLowerCase().includes('haute')) ? 'high' :
                    (summaryMatch && summaryMatch[1].toLowerCase().includes('moyenne')) ? 'medium' : 'low'
        } as const;
      });
    }

    // Extraire le benchmarking marché
    const benchmarkMatch = markdownResponse.match(/##?[🏢\s]*Benchmarking?[🏢\s]*\n([\s\S]*?)(?=\n##|$)/iu);
    if (benchmarkMatch) {
      const benchmarkText = benchmarkMatch[1];

      // Extraire l'industrie et le rôle
      const industryMatch = benchmarkText.match(/\*\*Industrie\*\*[:\s]*([^\n]+)/i);
      const roleMatch = benchmarkText.match(/\*\*Poste\*\*[:\s]*([^\n]+)/i);
      const positionMatch = benchmarkText.match(/\*\*Positionnement\*\*[:\s]*([^\n]+)/i);

      if (industryMatch) analysis.marketBenchmarking!.industry = industryMatch[1].trim();
      if (roleMatch) analysis.marketBenchmarking!.role = roleMatch[1].trim();

      if (positionMatch) {
        const percentileMatch = positionMatch[1].match(/(\d+)e? percentile/i);
        if (percentileMatch) {
          analysis.marketBenchmarking!.percentile = parseInt(percentileMatch[1]);
        }
        const competitivenessMatch = positionMatch[1].match(/compétitivité\s+([a-z]+)/i);
        if (competitivenessMatch) {
          const comp = competitivenessMatch[1].toLowerCase();
          analysis.marketBenchmarking!.competitiveness =
            comp.includes('haut') ? 'high' : comp.includes('moy') ? 'medium' : 'low';
        }
      }
    }

    return analysis;
  } catch (error) {
    console.error('Error parsing markdown analysis:', error);
    // Retourner une analyse par défaut en cas d'erreur
    return {
      overallScore: 75,
      sections: {
        atsOptimization: 75,
        keywordMatch: 75,
        structure: 75,
        content: 75
      },
      recommendations: ["Erreur lors de l'analyse de la réponse IA"],
      strengths: ["Analyse IA générée"],
      weaknesses: ["Parsing limité"],
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
      }
    };
  }
};

// Function to parse Markdown analysis response and extract structured data for Letters
const parseMarkdownAnalysisLetter = (markdownResponse: string): LetterAnalysisResponse => {
  try {
    const analysis: LetterAnalysisResponse = {
      overallScore: 75,
      sections: {
        atsOptimization: 75,
        keywordMatch: 75,
        structure: 75,
        content: 75,
        persuasion: 75,
        personalization: 70
      },
      recommendations: [],
      strengths: [],
      weaknesses: [],
      keywords: {
        found: [],
        missing: [],
        suggestions: []
      },
      improvements: [],
      storytelling: {
        effectiveness: 75,
        hooks: [],
        flow: [],
        impact: []
      },
      personalizationAnalysis: {
        companyName: false,
        recruiterName: false,
        specificProjects: false,
        culturalFit: false
      }
    };

    // Extraire le score global
    const scoreMatch = markdownResponse.match(/Score Global[:\s]*(\d+)\/?(\d+)?/i);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1]);
      const maxScore = scoreMatch[2] ? parseInt(scoreMatch[2]) : 100;
      analysis.overallScore = Math.round((score / maxScore) * 100);
    }

    // Extraire les scores par section (incluant persuasion et personalisation)
    const sectionScores = [
      { key: 'atsOptimization', patterns: [/Optimisation ATS[:\s]*(\d+)/i, /ATS Optimization[:\s]*(\d+)/i] },
      { key: 'keywordMatch', patterns: [/Correspondance Mots-clés[:\s]*(\d+)/i, /Keyword Match[:\s]*(\d+)/i] },
      { key: 'structure', patterns: [/Structure[:\s]*(\d+)/i] },
      { key: 'content', patterns: [/Contenu[:\s]*(\d+)/i, /Content[:\s]*(\d+)/i] },
      { key: 'persuasion', patterns: [/Persuasion[:\s]*(\d+)/i] },
      { key: 'personalization', patterns: [/Personnalisation[:\s]*(\d+)/i, /Personalization[:\s]*(\d+)/i] }
    ];

    sectionScores.forEach(section => {
      for (const pattern of section.patterns) {
        const match = markdownResponse.match(pattern);
        if (match) {
          analysis.sections[section.key as keyof typeof analysis.sections] = parseInt(match[1]);
          break;
        }
      }
    });

    // Extraire les forces (points forts de la lettre)
    const strengthsMatch = markdownResponse.match(/##?[🎯\s]*Points?[🎯\s]*Forts?[\s\w]*\n([\s\S]*?)(?=\n##|$)/iu);
    if (strengthsMatch) {
      const strengthsText = strengthsMatch[1];
      const strengthLines = strengthsText.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
      analysis.strengths = strengthLines.map(line => line.replace(/^[-•]\s*/, '').trim()).filter(s => s.length > 0);
    }

    // Extraire les faiblesses (points à améliorer)
    const weaknessesMatch = markdownResponse.match(/##?[🔬\s]*Points?[🔬\s]*\n([\s\S]*?)(?=\n##|$)/iu);
    if (weaknessesMatch) {
      const weaknessesText = weaknessesMatch[1];
      const weaknessLines = weaknessesText.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
      analysis.weaknesses = weaknessLines.map(line => line.replace(/^[-•]\s*/, '').trim()).filter(w => w.length > 0);
    }

    // Extraire les recommandations
    const recommendationsMatch = markdownResponse.match(/##?[💡\s]*Recommandations?[\s\w]*\n([\s\S]*?)(?=\n##|$)/iu);
    if (recommendationsMatch) {
      const recommendationsText = recommendationsMatch[1];
      const recommendationLines = recommendationsText.split('\n').filter(line =>
        line.trim().match(/^\d+\./) || line.trim().startsWith('-') || line.trim().startsWith('•')
      );
      analysis.recommendations = recommendationLines.map(line =>
        line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim()
      ).filter(r => r.length > 0);
    }

    // Extraire les mots-clés
    const keywordsFoundMatch = markdownResponse.match(/Mots-clés[:\s]*(Présents|Identifiés|Trouvés)?[:\s]*\n([\s\S]*?)(?=\n##|\n\n|$)/iu);
    if (keywordsFoundMatch) {
      const keywordsText = keywordsFoundMatch[2];
      const keywords = keywordsText.match(/"([^"]+)"/g);
      if (keywords) {
        analysis.keywords.found = keywords.map(k => k.replace(/"/g, '')).filter(k => k.length > 0);
      }
    }

    const keywordsMissingMatch = markdownResponse.match(/Mots-clés[:\s]*Manquants?[:\s]*\n([\s\S]*?)(?=\n##|\n\n|$)/iu);
    if (keywordsMissingMatch) {
      const keywordsText = keywordsMissingMatch[1];
      const keywords = keywordsText.match(/"([^"]+)"/g);
      if (keywords) {
        analysis.keywords.missing = keywords.map(k => k.replace(/"/g, '')).filter(k => k.length > 0);
      }
    }

    const suggestionsMatch = markdownResponse.match(/Suggestions?[:\s]*\n([\s\S]*?)(?=\n##|\n\n|$)/iu);
    if (suggestionsMatch) {
      const suggestionsText = suggestionsMatch[1];
      const suggestions = suggestionsText.match(/"([^"]+)"/g);
      if (suggestions) {
        analysis.keywords.suggestions = suggestions.map(k => k.replace(/"/g, '')).filter(k => k.length > 0);
      }
    }

    // Extraire l'analyse du storytelling
    const storytellingMatch = markdownResponse.match(/##?[🎭\s]*Storytelling?[\s\w]*\n([\s\S]*?)(?=\n##|$)/iu);
    if (storytellingMatch) {
      const storytellingText = storytellingMatch[1];

      // Extraire les accroches
      const hooksMatch = storytellingText.match(/Accroches?[\s\w]*\n([\s\S]*?)(?=\n###|$)/iu);
      if (hooksMatch) {
        const hooksText = hooksMatch[1];
        const hooks = hooksText.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
        analysis.storytelling.hooks = hooks.map(line => line.replace(/^[-•]\s*/, '').trim()).filter(h => h.length > 0);
      }

      // Extraire le flux narratif
      const flowMatch = storytellingText.match(/Flux?[\s\w]*\n([\s\S]*?)(?=\n###|$)/iu);
      if (flowMatch) {
        const flowText = flowMatch[1];
        const flow = flowText.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
        analysis.storytelling.flow = flow.map(line => line.replace(/^[-•]\s*/, '').trim()).filter(f => f.length > 0);
      }

      // Extraire l'impact
      const impactMatch = storytellingText.match(/Impact?[\s\w]*\n([\s\S]*?)(?=\n###|$)/iu);
      if (impactMatch) {
        const impactText = impactMatch[1];
        const impact = impactText.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
        analysis.storytelling.impact = impact.map(line => line.replace(/^[-•]\s*/, '').trim()).filter(i => i.length > 0);
      }

      // Extraire l'effectivité
      const effectivenessMatch = storytellingText.match(/effectivité[:\s]*(\d+)/i);
      if (effectivenessMatch) {
        analysis.storytelling.effectiveness = parseInt(effectivenessMatch[1]);
      }
    }

    // Extraire l'analyse de personnalisation
    const personalizationMatch = markdownResponse.match(/##?[🎯\s]*Personnalisation?[\s\w]*\n([\s\S]*?)(?=\n##|$)/iu);
    if (personalizationMatch && analysis.personalizationAnalysis) {
      const personalizationText = personalizationMatch[1];

      analysis.personalizationAnalysis.companyName = personalizationText.includes('entreprise') && personalizationText.includes('✅');
      analysis.personalizationAnalysis.recruiterName = personalizationText.includes('recruteur') && personalizationText.includes('✅');
      analysis.personalizationAnalysis.specificProjects = personalizationText.includes('projets') && personalizationText.includes('✅');
      analysis.personalizationAnalysis.culturalFit = personalizationText.includes('culture') && personalizationText.includes('✅');
    }

    return analysis;
  } catch (error) {
    console.error('Error parsing markdown letter analysis:', error);
    // Retourner une analyse par défaut en cas d'erreur
    return {
      overallScore: 75,
      sections: {
        atsOptimization: 75,
        keywordMatch: 75,
        structure: 75,
        content: 75,
        persuasion: 75,
        personalization: 70
      },
      recommendations: ["Erreur lors de l'analyse de la réponse IA"],
      strengths: ["Analyse IA générée"],
      weaknesses: ["Parsing limité"],
      keywords: {
        found: [],
        missing: [],
        suggestions: []
      },
      improvements: [],
      storytelling: {
        effectiveness: 75,
        hooks: ["Erreur de parsing"],
        flow: ["Erreur de parsing"],
        impact: ["Erreur de parsing"]
      },
      personalizationAnalysis: {
        companyName: false,
        recruiterName: false,
        specificProjects: false,
        culturalFit: false
      }
    };
  }
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
      const result = await callOpenAIAPI_CV(
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

  /**
   * Analyze a cover letter content using OpenAI API.
   *
   * @param {LetterAnalysisRequest} request - Request object containing the letter content, target role, job description, and optional CV content.
   * @returns {Promise<LetterAnalysisResponse>} - Promise resolving with the analyzed letter content.
   * @throws {Error} - Error thrown if the request fails.
   */
  const analyzeLetter = async (request: LetterAnalysisRequest): Promise<LetterAnalysisResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await callOpenAIAPI_Letter(
        request.content,
        request.targetRole,
        request.jobDescription,
        request.cvContent,
        profile
      );

      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'analyse de la lettre de motivation';
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

  const generateCoverLetter = async (request: CoverLetterRequest): Promise<CoverLetterResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = getApiKey(profile);
      if (!apiKey) {
        throw new Error('Clé API OpenAI non configurée. Veuillez l\'ajouter dans les paramètres.');
      }

      // Utiliser les infos du profil pour personnaliser la lettre
      const candidateName = request.profileInfo?.name || 'Candidat';
      const candidateTitle = request.profileInfo?.title || 'Professionnel';

      const prompt = `Rédige une lettre de motivation professionnelle en te basant sur:

INFORMATIONS DU CANDIDAT:
- Nom: ${candidateName}
- Titre: ${candidateTitle}
${request.profileInfo?.email ? `- Email: ${request.profileInfo.email}` : ''}
${request.profileInfo?.location ? `- Localisation: ${request.profileInfo.location}` : ''}

CV DÉTAILLÉ: ${request.cvContent}
DESCRIPTION DU POSTE: ${request.jobDescription}
${request.companyInfo ? `ENTREPRISE: ${request.companyInfo}` : ''}
${request.tone ? `TON REQUIS: ${request.tone}` : ''}

CONSIGNES IMPORTANTES:
1. Personnalise la lettre avec le nom du candidat: ${candidateName}
2. Adapte le ton au profil de ${candidateTitle}
3. Si le nom n'est pas spécifié, utilise une formule professionnelle
4. Inclus une salutation appropriée avec le nom de l'entreprise si disponible
5. Structure la lettre avec introduction, corps et conclusion clairs

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
    analyzeLetter,
    editCVField,
    generateCoverLetter,
    analyzeGrammarErrors,
    suggestStyleImprovements,
    generateOptimizedKeywords,
    isLoading,
    error
  };
};
