export interface LetterAnalysis {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface GrammarError {
  position: {
    start: number;
    end: number;
  };
  original: string;
  correction: string;
  type: 'orthographe' | 'grammaire' | 'conjugaison' | 'accord' | 'ponctuation' | 'style' | 'professionnel';
  explanation: string;
  severity?: 'critique' | 'majeure' | 'mineure';
}

export interface GrammarCheckResult {
  text: string;
  errors: GrammarError[];
}

export interface DocumentAnalysis {
  hasFormulePolitesse: boolean;
  tone: 'formal' | 'informal' | 'professional';
  language: 'french' | 'english';
  structure: {
    paragraphCount: number;
    hasIntroduction: boolean;
    hasConclusion: boolean;
  };
  existingKeywords: string[];
}

// Fonction d'analyse grammaticale PURE (sans modification du texte)
export const analyzeGrammarOnly = async (
  content: string,
  apiKey: string
): Promise<string | null> => {
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
            content: 'Tu es un outil d\'analyse grammaticale PURE. TA SEULE MISSION est d\'identifier les erreurs SANS RIEN MODIFIER DU TEXTE. Interdiction formelle de créer, inventer ou modifier le moindre mot. Réponds UNIQUEMENT avec le format JSON demandé.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.0, // Aucune créativité - analyse pure
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
    console.error('Erreur lors de l\'analyse grammaticale:', error);
    throw error;
  }
};

// Fonction d'analyse du ton et de l'équilibre
export const analyzeToneAndBalance = async (
  content: string,
  editCVField: (prompt: { prompt: string }) => Promise<string | null>,
  storedAnalysis: string = ''
): Promise<LetterAnalysis> => {
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim());

  const prompt = `Tu es un expert en analyse de contenu et en communication professionnelle.

Analyse cette lettre de motivation et fournis une évaluation détaillée :

CONTENU :
${content}

INSTRUCTIONS :
1. Analyse le ton général (formel, informel, professionnel, passionné, etc.)
2. Évalue l'équilibre entre les paragraphes
3. Vérifie la cohérence et la fluidité
4. Identifie les points forts et les points à améliorer
5. Donne une note globale sur 10
6. Fournis des conseils concrets pour améliorer la lettre

Réponds en formatant clairement avec des émojis pour chaque section.

IMPORTANT : Sois constructif et encourageur, même en signalant des points d'amélioration.${storedAnalysis ? `
- Analyse précédente du document :
${storedAnalysis}` : ''}`;

  try {
    const analysis = await editCVField({ prompt });

    if (analysis) {
      return {
        message: `${analysis}`,
        type: 'success'
      };
    } else {
      throw new Error('Pas de réponse de l\'IA');
    }
  } catch {
    // Analyse locale en fallback
    const localAnalysis = performLocalToneAnalysis(content, paragraphs);
    return {
      message: `📊 **Analyse de votre lettre**\n\n${localAnalysis}`,
      type: 'info'
    };
  }
};

// Génération simple de contenu HTML avec IA
export const generateLetterContent = async (
  formData: {
    poste: string;
    entreprise: string;
    secteur: string;
    experience: string;
    motivation: string;
    competences: string;
  },
  editCVField: (prompt: { prompt: string }) => Promise<string | null>,
  profileInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    profession?: string;
  }
): Promise<string> => {
  // Générer des informations par défaut si les champs sont vides
  const defaultExperience = formData.experience.trim() || `Professionnel expérimenté avec de solides compétences dans le domaine du ${formData.secteur || 'numérique'}. Capable de m'adapter rapidement aux nouveaux défis et technologies.`;
  const defaultMotivation = formData.motivation.trim() || `Recherche activement à mettre mes compétences au service d'une entreprise innovante. Désireux de contribuer au succès de projets ambitieux et de développer de nouvelles compétences dans un environnement stimulant.`;
  const defaultCompetences = formData.competences.trim() || `Compétences professionnelles, autonomie, rigueur, excellent esprit d'équipe, capacité d'adaptation, résolution de problèmes, communication efficace.`;
  const defaultSecteur = formData.secteur.trim() || `secteur du numérique et de la communication`;

  // Utiliser les informations du profil si disponibles
  const candidateName = profileInfo?.fullName || (formData.poste ? 'Candidat pour poste de ' + formData.poste : 'Professionnel qualifié');
  const candidateProfession = profileInfo?.profession || formData.poste || 'Professionnel';
  const candidateContact = profileInfo ? [
    profileInfo.email && `Email: ${profileInfo.email}`,
    profileInfo.phone && `Téléphone: ${profileInfo.phone}`,
    profileInfo.address && `Adresse: ${profileInfo.address}`,
    profileInfo.city && profileInfo.postalCode && `Ville: ${profileInfo.city} ${profileInfo.postalCode}`,
    profileInfo.country && `Pays: ${profileInfo.country}`
  ].filter(Boolean).join('\n') : '';

  // Informations de l'entreprise si disponibles
  const companyInfo = formData.entreprise ? `
- Nom de l'entreprise : ${formData.entreprise}
${formData.secteur ? `- Secteur d'activité : ${formData.secteur}` : ''}` : '';

  // Créer les coordonnées complètes du candidat
  const candidateFullContact = candidateContact ?
    candidateContact.replace(/Email: /g, '').replace(/Téléphone: /g, '').replace(/Adresse: /g, '').replace(/Ville: /g, '').replace(/Pays: /g, '').split('\n').filter(line => line.trim()).join('<br>') :
    `${candidateName}<br>${candidateProfession}<br>Email: [email@example.com]<br>Téléphone: [numéro]<br>[Ville], [Code Postal]`;

  const prompt = `Créez une lettre de motivation professionnelle en HTML avec ces éléments :

Coordonnées du candidat :
- Nom complet : ${candidateName}
- Profession : ${candidateProfession}
${candidateContact ? `- Informations de contact :\n${candidateContact}` : ''}

${companyInfo ? `INFORMATIONS DE L'ENTREPRISE :${companyInfo}` : '- Entreprise cible : Non spécifiée'}
- Secteur d'activité : ${defaultSecteur}
- Expérience professionnelle : ${defaultExperience}
- Motivation : ${defaultMotivation}
- Compétences clés : ${defaultCompetences}

Structure requise :
1. **TRÈS IMPORTANT : En-tête en HAUT de la lettre avec coordonnées complètes**

   <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
     <!-- Coordonnées du candidat (gauche) -->
     <div style="text-align: left; line-height: 1.4;">
       <strong>${candidateName}</strong><br>
       ${candidateProfession}<br>
       ${candidateFullContact}
     </div>

     <!-- Coordonnées de l'entreprise (droite) -->
     <div style="text-align: right; line-height: 1.4;">
       <strong>${formData.entreprise || '[NOM DE L\'ENTREPRISE]'}</strong><br>
       ${formData.secteur ? `${formData.secteur}<br>` : ''}
       Service des Ressources Humaines<br>
       [Adresse de l'entreprise]<br>
       [Ville], [Code Postal]
     </div>
   </div>

2. **Saut de ligne**
3. Date et objet
4. Formule d'appel
5. Corps de lettre (3 paragraphes)
6. Formule de politesse
7. **Signature SEULEMENT avec le nom** : ${candidateName}

Format HTML : utilisez <p> pour les paragraphes, <strong> pour emphasis, <br><br> pour sauts de ligne.

⚠️ CRUCIAL : L'en-tête avec les coordonnées doit être la PREMIÈRE chose visible, bien structurée avec le candidat à gauche et l'entreprise à droite. Les coordonnées n'apparaîtront nulle part ailleurs.

Générez uniquement le code HTML complet.`;

  try {
    console.log('🚀 Envoi du prompt à l\'IA pour génération de lettre...');
    console.log('📝 Longueur du prompt:', prompt.length, 'caractères');

    const generatedContent = await editCVField({ prompt });

    console.log('📥 Réponse reçue de l\'IA:', generatedContent ? 'Succès' : 'Échec');
    console.log('📏 Longueur de la réponse:', generatedContent?.length || 0, 'caractères');

    if (generatedContent) {
      console.log('🔍 Début de la réponse:', generatedContent.substring(0, 200) + '...');
    }

    if (!generatedContent) {
      throw new Error('Pas de réponse de l\'IA');
    }

    let cleanedContent = generatedContent.trim();

    // Nettoyer les guillemets
    if (cleanedContent.startsWith('"') && cleanedContent.endsWith('"')) {
      cleanedContent = cleanedContent.slice(1, -1);
    }

    // Si pas de HTML, convertir en HTML simple
    if (!cleanedContent.includes('<')) {
      cleanedContent = cleanedContent
        .split(/\n\n+/)
        .map(p => `<p>${p.trim()}</p>`)
        .join('<br><br>');
    }

    return cleanedContent;
  } catch (error) {
    console.error('Erreur lors de la génération:', error);
    throw error;
  }
};


// Amélioration de texte avec IA
export const improveTextWithAI = async (
  selectedText: string,
  documentAnalysis: DocumentAnalysis,
  storedAnalysis: string,
  editCVField: (prompt: { prompt: string }) => Promise<string | null>,
  profileInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    profession?: string;
  }
): Promise<string> => {
  // Créer le prompt pour l'IA avec contexte
  // Utiliser les informations du profil si disponibles
  const candidateInfo = profileInfo ? `
- Nom du candidat : ${profileInfo.fullName || 'Non spécifié'}
- Profession : ${profileInfo.profession || 'Non spécifiée'}
- Email : ${profileInfo.email || 'Non spécifié'}
- Téléphone : ${profileInfo.phone || 'Non spécifié'}
${profileInfo.address ? `- Adresse : ${profileInfo.address}` : ''}
${profileInfo.city && profileInfo.postalCode ? `- Ville : ${profileInfo.city} ${profileInfo.postalCode}` : ''}
${profileInfo.country ? `- Pays : ${profileInfo.country}` : ''}` : '';

  const contextPrompt = `Tu es un expert en rédaction professionnelle et amélioration de textes. Rédige comme un humain passionné et authentique, pas comme une IA robotique.

CONTEXTE DU DOCUMENT :
- Type de document : Lettre de motivation professionnelle${candidateInfo ? `
INFORMATIONS DU CANDIDAT :${candidateInfo}` : ''}
- Ton détecté : ${documentAnalysis.tone === 'formal' ? 'Formel' : documentAnalysis.tone === 'informal' ? 'Informel' : 'Professionnel'}${storedAnalysis ? `
- Analyse précédente du document :
${storedAnalysis}` : ''}
- Langue : ${documentAnalysis.language === 'french' ? 'Français' : 'Anglais'}
- Structure : ${documentAnalysis.structure.paragraphCount} paragraphes
- Contient formule de politesse : ${documentAnalysis.hasFormulePolitesse ? 'Oui' : 'Non'}
- Mots-clés existants : ${documentAnalysis.existingKeywords.join(', ')}

TEXTE À AMÉLIORER :
"${selectedText}"

INSTRUCTIONS SPÉCIFIQUES :
1. Écris comme un humain passionné par le métier, pas comme une IA
2. Utilise des phrases fluides et naturelles avec une longueur variée
3. Intègre des mots de liaison naturels (en effet, de plus, ainsi, cependant)
4. Sois professionnel mais accessible, évite le jargon excessif
5. Ajoute de l'authenticité avec des expressions naturelles et spontanées
6. Structure les paragraphes de manière logique et agréable à lire
7. Vérifie la grammaire et l'orthographe de manière subtile
8. Conserve le sens original mais améliore l'impact et la clarté
9. Évite les formules clichées et les expressions trop génériques
10. Réponds UNIQUEMENT avec le texte amélioré, sans guillemets ni explications

STYLE VISÉ : Naturel, authentique, professionnel mais humain, comme un candidat passionné qui écrit sincèrement.

IMPORTANT : Réponds seulement avec le texte amélioré, rien d'autre.`;

  try {
    // Appel réel à l'API OpenAI
    const improvedText = await editCVField({ prompt: contextPrompt });

    if (improvedText) {
      // Post-traitement pour nettoyer le texte
      let cleanedText = improvedText.trim();

      // Supprimer les guillemets en début et fin de texte
      if (cleanedText.startsWith('"')) {
        cleanedText = cleanedText.substring(1);
      }
      if (cleanedText.endsWith('"')) {
        cleanedText = cleanedText.slice(0, -1);
      }

      // Supprimer les guillemets doubles en début et fin
      if (cleanedText.startsWith('«')) {
        cleanedText = cleanedText.substring(1);
      }
      if (cleanedText.endsWith('»')) {
        cleanedText = cleanedText.slice(0, -1);
      }

      return cleanedText.trim();
    } else {
      throw new Error('Pas de réponse de l\'IA');
    }
  } catch (error) {
    console.error('Erreur lors de l\'appel IA:', error);
    throw error;
  }
};

// Analyse locale du ton et de l'équilibre
const performLocalToneAnalysis = (content: string, paragraphs: string[]): string => {
  const wordCount = content.split(/\s+/).length;
  const avgParagraphLength = paragraphs.length > 0 ? wordCount / paragraphs.length : 0;

  // Détection du ton
  const formalWords = /(madame|monsieur|je vous prie|veuillez|sincèrement|respectueusement|cordialement)/gi;
  const passionateWords = /(passionné|enthousiaste|motivé|désireux|eager|excited)/gi;
  const informalWords = /(salut|copain|super|génial|cool)/gi;

  const formalCount = (content.match(formalWords) || []).length;
  const passionateCount = (content.match(passionateWords) || []).length;
  const informalCount = (content.match(informalWords) || []).length;

  let tone = 'Professionnel';
  if (formalCount > passionateCount && formalCount > informalCount) {
    tone = 'Formel';
  } else if (passionateCount > formalCount && passionateCount > informalCount) {
    tone = 'Passionné';
  } else if (informalCount > 0) {
    tone = 'Informel';
  }

  // Analyse de l'équilibre
  let balanceAnalysis = 'Équilibré';
  if (paragraphs.length < 3) {
    balanceAnalysis = 'Trop court (manque de développement)';
  } else if (paragraphs.length > 8) {
    balanceAnalysis = 'Trop long (risque de perdre l\'attention)';
  } else if (avgParagraphLength < 20) {
    balanceAnalysis = 'Paragraphes trop courts';
  } else if (avgParagraphLength > 150) {
    balanceAnalysis = 'Paragraphes trop longs';
  }

  let score = 7;
  if (tone === 'Professionnel') score += 1;
  if (balanceAnalysis === 'Équilibré') score += 1;
  if (wordCount >= 150 && wordCount <= 400) score += 1;
  score = Math.min(10, Math.max(1, score));

  return `**Ton détecté :** ${tone}
**Équilibre :** ${balanceAnalysis}
**Longueur :** ${wordCount} mots, ${paragraphs.length} paragraphes
**Note :** ${score}/10

${score >= 8 ? '✅ **Excellente lettre !**' : score >= 6 ? '👍 **Bonne lettre, quelques améliorations possibles**' : '📝 **Lettre à améliorer**'}

${balanceAnalysis.includes('Trop') ? '💡 *Conseil : Ajustez la longueur pour un meilleur impact.*' : ''}
${tone === 'Informel' ? '💡 *Conseil : Rendez le ton plus professionnel.*' : ''}`;
};

// Génération/régénération de lettre à partir du contenu existant
export const regenerateLetterFromContent = async (
  existingContent: string,
  formData: {
    poste: string;
    entreprise: string;
    secteur: string;
    experience: string;
    motivation: string;
    competences: string;
  } | null,
  editCVField: (prompt: { prompt: string }) => Promise<string | null>,
  profileInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    profession?: string;
  }
): Promise<string> => {
  let prompt = `Tu es un expert en rédaction de lettres de motivation professionnelles et persuasives.`;

  // Utiliser les informations du profil si disponibles (définies ici pour tous les cas)
  const candidateName = profileInfo?.fullName || 'Candidat';
  const candidateContact = profileInfo ? [
    profileInfo.email && `Email: ${profileInfo.email}`,
    profileInfo.phone && `Téléphone: ${profileInfo.phone}`,
    profileInfo.address && `Adresse: ${profileInfo.address}`,
    profileInfo.city && profileInfo.postalCode && `Ville: ${profileInfo.city} ${profileInfo.postalCode}`
  ].filter(Boolean).join('\n') : '';

  // Déclarer candidateProfession avec une valeur par défaut pour qu'elle soit accessible dans toute la fonction
  let candidateProfession = profileInfo?.profession || 'Professionnel';

  if (formData && formData.poste.trim() && formData.entreprise.trim()) {
    // Utiliser les données du formulaire si disponibles
    candidateProfession = profileInfo?.profession || formData.poste;

    prompt += `

DONNÉES DISPONIBLES :
- Nom du candidat : ${candidateName}
- Profession : ${candidateProfession}
${candidateContact ? `- Coordonnées :\n${candidateContact}` : ''}
- Poste visé : ${formData.poste}
- Entreprise : ${formData.entreprise}
- Secteur d'activité : ${formData.secteur}
- Expérience : ${formData.experience}
- Motivation : ${formData.motivation}
- Compétences : ${formData.competences}`;

    if (existingContent.trim()) {
      prompt += `

CONTENU EXISTANT À AMÉLIORER/RÉÉCRIRE :
${existingContent}

RÉÉCRIS complètement cette lettre en utilisant les données ci-dessus pour l'enrichir, mais garde l'essence et améliore la qualité.`;
    } else {
      prompt += `

GÉNÈRE une nouvelle lettre complète avec ces données.`;
    }
  } else if (existingContent.trim()) {
    // Pas de formData, mais contenu existant - analyser et améliorer
    const analysis = analyzeStructure(existingContent);
    const tone = detectTone(existingContent);
    const keywords = extractKeywords(existingContent);

    prompt += `

CONTENU EXISTANT À ANALYSER ET AMÉLIORER :
${existingContent}

ANALYSE DU CONTENU :
- Ton détecté : ${tone === 'formal' ? 'Formel' : tone === 'informal' ? 'Informel' : 'Professionnel'}
- Structure : ${analysis.paragraphCount} paragraphes
- Mots-clés : ${keywords.join(', ')}

RÉÉCRIS complètement cette lettre en analysant automatiquement les informations (poste, entreprise, secteur) depuis le contenu existant. Si certaines informations sont manquantes, utilise des données génériques appropriées pour ce secteur.`;
  } else {
    // Ni formData ni contenu - génération basique
    prompt += `

GÉNÈRE une lettre de motivation complète et professionnelle avec des informations génériques. L'utilisateur n'a pas fourni de données spécifiques, donc utilise des exemples appropriés.`;
  }

  // Créer les coordonnées complètes du candidat
  const candidateFullContact = candidateContact ?
    candidateContact.replace(/Email: /g, '').replace(/Téléphone: /g, '').replace(/Adresse: /g, '').replace(/Ville: /g, '').replace(/Pays: /g, '').split('\n').filter(line => line.trim()).join('<br>') :
    `${candidateName}<br>${candidateProfession}<br>Email: [email@example.com]<br>Téléphone: [numéro]<br>[Ville], [Code Postal]`;

  prompt += `

STRUCTURE DE LA LETTRE :
1. **TRÈS IMPORTANT : En-tête en HAUT de la lettre avec coordonnées complètes**

   <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
     <!-- Coordonnées du candidat (gauche) -->
     <div style="text-align: left; line-height: 1.4;">
       <strong>${candidateName}</strong><br>
       ${candidateProfession}<br>
       ${candidateFullContact}
     </div>

     <!-- Coordonnées de l'entreprise (droite) -->
     <div style="text-align: right; line-height: 1.4;">
       <strong>${formData && formData.entreprise ? formData.entreprise : '[NOM DE L\'ENTREPRISE]'}</strong><br>
       ${formData && formData.secteur ? `${formData.secteur}<br>` : ''}
       Service des Ressources Humaines<br>
       [Adresse de l'entreprise]<br>
       [Ville], [Code Postal]
     </div>
   </div>

2. **Saut de ligne**
3. Date et objet
4. Formule d'appel
5. Corps de la lettre (3-4 paragraphes)
6. Formule de politesse
7. **Signature SEULEMENT avec le nom** : ${candidateName}

⚠️ CRUCIAL : L'en-tête avec les coordonnées doit être la PREMIÈRE chose visible, bien structurée avec le candidat à gauche et l'entreprise à droite. Les coordonnées n'apparaîtront nulle part ailleurs.

STYLE RECHERCHÉ :
- Professionnel et moderne
- Authentique et passionné
- Claire et structurée
- Persuasif sans être agressif
- Adapté au secteur détecté/automatique

CONSIGNES IMPORTANTES :
1. Utilise un langage professionnel mais accessible
2. Mettre en valeur l'expérience pertinente pour ce poste
3. Montrer la connaissance de l'entreprise
4. Inclure des mots-clés pertinents pour les ATS
5. Garder un ton enthousiaste mais professionnel
6. Éviter les formules clichées et trop génériques
7. Respecter les conventions des lettres de motivation françaises

FORMAT : Renvoie UNIQUEMENT le contenu HTML de la lettre complète, sans aucun commentaire ni explication. Structure avec des paragraphes <p> et sauts de ligne appropriés.

IMPORTANT : Utilise le formatage HTML suivant :
- <p> pour les paragraphes
- <br> pour les sauts de ligne
- <strong> pour le texte important
- <em> pour l'emphase légère
- <div> avec style="text-align: right;" pour les éléments alignés à droite
- <br><br> pour les sauts de paragraphes`;

  try {
    const generatedContent = await editCVField({ prompt });

    if (generatedContent) {
      // Nettoyer le contenu généré
      let cleanedContent = generatedContent.trim();

      // Vérifier si c'est du JSON (parfois l'IA retourne du JSON mal formé)
      try {
        const parsed = JSON.parse(cleanedContent);
        if (typeof parsed === 'object' && parsed.response) {
          cleanedContent = parsed.response;
        } else if (typeof parsed === 'object' && parsed.content) {
          cleanedContent = parsed.content;
        } else if (typeof parsed === 'string') {
          cleanedContent = parsed;
        }
      } catch {
        // Ce n'est pas du JSON, continuer normalement
      }

      // Supprimer les guillemets s'ils existent
      if (cleanedContent.startsWith('"') && cleanedContent.endsWith('"')) {
        cleanedContent = cleanedContent.slice(1, -1);
      }

      // Si le contenu ne contient pas de balises HTML, le formater
      if (!cleanedContent.includes('<p>') && !cleanedContent.includes('<br>')) {
        // Convertir les paragraphes (double saut de ligne) en <p>
        cleanedContent = cleanedContent.split(/\n\n+/).map(paragraph =>
          `<p>${paragraph.trim()}</p>`
        ).join('\n');

        // Convertir les sauts de ligne simples en <br>
        cleanedContent = cleanedContent.replace(/\n/g, '<br>');
      } else {
        // S'il y a déjà du HTML, juste convertir les sauts de ligne restants
        cleanedContent = cleanedContent.replace(/\n/g, '<br>');
      }

      return cleanedContent;
    } else {
      throw new Error('Pas de réponse de l\'IA');
    }
  } catch (error) {
    console.error('Erreur lors de la régénération du contenu:', error);
    throw error;
  }
};

// Fonctions d'analyse contextuelle
export const detectTone = (text: string): 'formal' | 'informal' | 'professional' => {
  if (/(madame|monsieur|je vous prie|veuillez|sincèrement)/i.test(text)) return 'formal';
  if (/(salut|copain|super|génial)/i.test(text)) return 'informal';
  return 'professional';
};

export const detectLanguage = (text: string): 'french' | 'english' => {
  return /(le|la|les|de|du|des|et|est|dans|pour|avec|que|qui|ce|se|ne|me|te|lui|leur)/i.test(text) ? 'french' : 'english';
};

export const analyzeStructure = (text: string) => {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  return {
    paragraphCount: paragraphs.length,
    hasIntroduction: paragraphs.length > 0 && paragraphs[0].length < 200,
    hasConclusion: paragraphs.length > 0 && /(cordialement|sincèrement|bien à vous)/i.test(paragraphs[paragraphs.length - 1])
  };
};

export const extractKeywords = (text: string): string[] => {
  const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
  return [...new Set(words)].slice(0, 10);
};
