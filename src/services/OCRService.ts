// Schéma pour l'extraction de données CV
export const CV_SCHEMA = {
  identite: {
    nom: "string",
    titre: "string",
    photo: "string",
    adresse: "string",
    telephone: "string",
    email: "string",
    site_web: "string",
    linkedin: "string"
  },
  profil: "string",
  competences: ["string"],
  experiences: [{
    intitule_poste: "string",
    societe: "string",
    lieu: "string",
    periode: "string",
    description: "string",
    missions: ["string"]
  }],
  formations: [{
    etablissement: "string",
    lieu: "string",
    periode: "string",
    diplome: "string"
  }],
  formations_complementaires: [{
    intitule: "string",
    organisme: "string",
    annee: "string"
  }],
  distinctions: ["string"],
  interets: ["string"]
};

export interface CVData {
  identite: {
    nom: string;
    titre: string;
    photo: string;
    adresse: string;
    telephone: string;
    email: string;
    site_web: string;
    linkedin: string;
  };
  profil: string;
  competences: string[];
  experiences: Array<{
    intitule_poste: string;
    societe: string;
    lieu: string;
    periode: string;
    description: string;
    missions: string[];
  }>;
  formations: Array<{
    etablissement: string;
    lieu: string;
    periode: string;
    diplome: string;
  }>;
  formations_complementaires: Array<{
    intitule: string;
    organisme: string;
    annee: string;
  }>;
  distinctions: string[];
  interets: string[];
}

export interface OCRResult {
  success: boolean;
  data?: CVData;
  rawText?: string;
  error?: string;
}

class OCRService {
  private apiKey: string;
  private apiUrl: string;

  /**
   * Constructor for the OCRService class.
   * @param {string} [apiKey=import.meta.env.VITE_MISTRAL_API_KEY] - The API key for Mistral API.
   */
  constructor(apiKey: string = import.meta.env.VITE_MISTRAL_API_KEY) {
    this.apiKey = apiKey;
    this.apiUrl = "https://api.mistral.ai/v1/chat/completions";
  }

  /**
   * Vérifie si les données CV sont valides et non vides
   * @param {CVData} data - Les données CV à valider
   * @returns {boolean} - True si les données sont valides
   */
  private validateCVData(data: CVData): boolean {
    // Vérifier qu'on a au minimum un nom non vide et quelques infos pertinentes
    const hasName = Boolean(data.identite?.nom && data.identite.nom !== "N/A" && data.identite.nom.trim().length > 0);
    const hasSomeContent =
      (data.profil && data.profil !== "N/A" && data.profil.trim().length > 10) ||
      (data.competences && data.competences.length > 0 && data.competences.some(c => c !== "N/A" && c.trim().length > 0)) ||
      (data.experiences && data.experiences.length > 0) ||
      (data.formations && data.formations.length > 0);

    return hasName && hasSomeContent;
  }

  /**
   * Essaye de parser un texte brut en objet JSON.
   * Si le parsing échoue, affiche un avertissement dans la console et renvoie null.
   * @param {string} raw - Le texte brut à parser
   * @returns {CVData | null} - L'objet JSON parsé, ou null si l'opération a échoué
   */
  private tryParseJson(raw: string): CVData | null {
    try {
      // Nettoyer le texte (enlever markdown ```json ... ```)
      raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(raw);

      // Vérifier si c'est une réponse d'erreur
      if (parsed.error) {
        console.warn("Erreur détectée dans la réponse:", parsed.error);
        return null;
      }

      return parsed;
    } catch  {
      console.warn("Échec JSON.parse, contenu brut:", raw);
      return null;
    }
  }

  /**
   * Extract a CV from an image file using Mistral API.
   * @param {File} imageFile - The image file containing the CV to extract.
   * @returns {Promise<OCRResult>} - A promise resolving to an OCRResult object containing the extracted CV data, or null if the extraction failed.
   */
  async extractCVFromImage(imageFile: File): Promise<OCRResult> {
    try {
      // Lire l'image en base64
      const base64Data = await this.fileToBase64(imageFile);
      const mimeType = imageFile.type || 'image/png';

      const schema = JSON.stringify(CV_SCHEMA, null, 2);

      const body = {
        model: "pixtral-12b-2409",
        messages: [
          {
            role: "system",
            content: `Tu es un assistant OCR spécialisé dans l'extraction de données de CV. Analyse l'image fournie :

RÈGLE STRICTE: Tu ne dois JAMAIS inventer ou supposer des informations. Tu ne dois répondre que si tu peux lire CLAIREMENT et SANS AMBIGUÏTÉ les informations dans l'image.

1. Si l'image ne contient PAS clairement un CV (pas de nom, pas d'expériences, pas de formations clairement visibles), réponds UNIQUEMENT: {"error": "Ce document ne semble pas être un CV car je n'arrive pas à extraire des données exploitables"}

2. Si c'est bien un CV mais que certaines informations ne sont pas lisibles, mets ces champs à "N/A" ou vide [] pour les tableaux. N'INVENTE JAMAIS de valeurs.

3. Ne réponds que si tu peux extraire AU MOINS le nom et une expérience ou formation. Sinon, renvoie une erreur.

4. Renvoie UNIQUEMENT un JSON strict et valide conforme à ce schéma : ${schema}

ATTENTION: Toute invention de données (noms, emails, compétences, expériences, etc.) est STRICTEMENT INTERDITE.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Voici un CV à analyser, renvoie les données en JSON valide sans aucun texte supplémentaire." },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0
      };

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur API: ${response.status} - ${errorData.error?.message || 'Erreur inconnue'}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content?.trim() || "";

      const parsed = this.tryParseJson(rawText);

      if (parsed) {
        // Vérifier si les données sont valides (pas juste des champs vides ou "N/A")
        const hasValidData = this.validateCVData(parsed);

        if (hasValidData) {
          return {
            success: true,
            data: parsed,
            rawText
          };
        } else {
          return {
            success: false,
            rawText,
            error: "Ce document ne semble pas être un CV car je n'arrive pas à extraire des données exploitables"
          };
        }
      } else {
        return {
          success: false,
          rawText,
          error: "Impossible de parser le JSON extrait"
        };
      }

    } catch (error) {
      console.error("Erreur OCR:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue"
      };
    }
  }

  /**
   * Convertit un fichier en base64 string.
   * @param {File} file - Le fichier à convertir
   * @returns {Promise<string>} - Une promesse qui résout en base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1]; // enlever le préfixe data:
        resolve(base64Data);
      };
      reader.onerror = () => reject(new Error("Erreur lors de la lecture du fichier"));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Télécharge un objet JSON en tant que fichier JSON.
   * @param {CVData} data - Les données à télécharger
   * @param {string} [filename="cv-ocr.json"] - Le nom du fichier à télécharger
   */
  downloadJSON(data: CVData, filename: string = "cv-ocr.json"): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const ocrService = new OCRService();
