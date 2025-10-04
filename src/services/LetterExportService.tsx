import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, AlignmentType, UnderlineType } from 'docx';

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface TemplateStyle {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  color: string;
  padding?: string;
}

export interface TextRunOptions {
  text: string;
  size?: number;
  font?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: { type: UnderlineType };
}

export interface ExportOptions {
  format: 'pdf' | 'html' | 'docx' | 'text';
  filename?: string;
  margins?: Margins;
  showBorders?: boolean;
  allowMultiplePages?: boolean;
  template?: TemplateStyle;
}

export class LetterExportService {
  /**
   * Exporter une lettre en PDF
   */
  static async exportToPDF(
    content: string,
    options: ExportOptions
  ): Promise<void> {
    const {
      filename = 'lettre-motivation.pdf',
      margins = { top: 15, right: 15, bottom: 15, left: 15 },
      showBorders = false,
      allowMultiplePages = false,
      template
    } = options;

    console.log('Export PDF - allowMultiplePages:', allowMultiplePages);

    // Masquer l'état actuel des bordures
    const originalBorders: string[] = [];
    if (showBorders) {
      const letterContents = document.querySelectorAll('.letter-content');
      letterContents.forEach((element) => {
        const currentBorder = (element as HTMLElement).style.border;
        originalBorders.push(currentBorder);
        // Forcer les bordures visibles pendant l'export
        (element as HTMLElement).style.border = '1px solid transparent';
      });
    }

    try {
      // Créer le container pour l'export
      const container = this.createExportContainer(content, {
        margins,
        showBorders,
        allowMultiplePages,
        template
      });

      const pdfOptions = this.getPDFOptions({
        filename,
        allowMultiplePages
      });

      console.log('PDF options:', pdfOptions);

      // Générer le PDF
      await html2pdf().set(pdfOptions).from(container).save();

    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      throw new Error('Erreur lors de l\'export PDF. Veuillez réessayer.');
    } finally {
      // Restaurer l'état original des bordures
      if (showBorders) {
        const letterContents = document.querySelectorAll('.letter-content');
        letterContents.forEach((element, index) => {
          if (originalBorders[index] !== undefined) {
            (element as HTMLElement).style.border = originalBorders[index];
          }
        });
      }
    }
  }

  /**
   * Exporter une lettre en HTML
   */
  static exportToHTML(
    content: string,
    options: ExportOptions
  ): void {
    const {
      filename = 'lettre-motivation.html',
      template,
      margins = { top: 0, right: 0, bottom: 0, left: 0 }
    } = options;

    const htmlContent = this.generateHTMLDocument(content, {
      template,
      margins
    });

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Exporter une lettre en Word (DOCX)
   */
  static async exportToWord(
    content: string,
    options: ExportOptions
  ): Promise<void> {
    const {
      filename = 'lettre-motivation.docx',
      template,
      margins = { top: 15, right: 15, bottom: 15, left: 15 }
    } = options;

    try {
      // Parser le contenu HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');

      // Créer les paragraphes à partir du contenu HTML
      const paragraphs = this.parseContentToParagraphs(doc.body, template);

      // Créer le document Word
      const wordDoc = new Document({
        sections: [{
          properties: {
            page: {
              // Marges en twips (1 inch = 1440 twips)
              margin: {
                top: this.convertMmToTwips(margins.top),
                right: this.convertMmToTwips(margins.right),
                bottom: this.convertMmToTwips(margins.bottom),
                left: this.convertMmToTwips(margins.left),
              }
            }
          },
          children: paragraphs
        }]
      });

      // Générer le blob DOCX
      const docxBlob = await Packer.toBlob(wordDoc);

      // Télécharger le fichier
      const url = URL.createObjectURL(docxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors de l\'export Word:', error);
      throw new Error('Erreur lors de l\'export Word. Veuillez réessayer.');
    }
  }

  /**
   * Exporter une lettre en texte brut optimisé pour ATS
   */
  static exportToText(
    content: string,
    options: ExportOptions
  ): void {
    const { filename = 'lettre-motivation-ats.txt' } = options;

    try {
      // Convertir le contenu HTML en texte brut
      const textContent = this.convertHTMLToATSOptimizedText(content);

      // Créer le blob texte
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });

      // Télécharger le fichier
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors de l\'export texte:', error);
      throw new Error('Erreur lors de l\'export texte. Veuillez réessayer.');
    }
  }

  /**
   * Sauvegarder le contenu dans localStorage
   */
  static saveToLocalStorage(
    content: string,
    templateName: string
  ): void {
    const saveData = {
      content,
      timestamp: new Date().toISOString(),
      template: templateName
    };

    localStorage.setItem('letter-editor-content', JSON.stringify(saveData));
  }

  /**
   * Créer le container pour l'export PDF
   */
  private static createExportContainer(
    content: string,
    options: {
      margins: Margins;
      showBorders: boolean;
      allowMultiplePages: boolean;
      template?: TemplateStyle;
    }
  ): HTMLDivElement {
    const { margins, showBorders,  template } = options;

    // Créer le container avec les marges configurées
    const container = document.createElement('div');
    container.style.width = '210mm';
    container.style.minHeight = '297mm';
    container.style.margin = '0 auto';
    // Appliquer les marges comme padding pour correspondre à l'éditeur
    container.style.padding = `${margins.top * 2.8}px ${margins.right * 2.8}px ${margins.bottom * 2.8}px ${margins.left * 2.8}px`;
    container.style.background = 'white';
    container.style.boxSizing = 'border-box';
    container.style.position = 'relative';
    container.className = 'letter-container';

    

    // Appliquer les styles du template si fourni (SAUF le padding pour éviter le double)
    if (template) {
      container.style.fontFamily = template.fontFamily;
      container.style.fontSize = template.fontSize;
      container.style.lineHeight = template.lineHeight;
      container.style.color = template.color;
      // Ne pas appliquer template.padding ici pour éviter le double avec les marges
    }

    // Insérer le contenu
    container.innerHTML = content;

    // Forcer l'affichage des bordures si demandé
    if (showBorders) {
      const letterContents = container.querySelectorAll('.letter-content');
      letterContents.forEach((element) => {
        (element as HTMLElement).style.border = '1px solid transparent';
      });

      // Modifier la bordure de l'élément context s'il existe
      const contextElement = container.querySelector('.letter-context');
      if (contextElement) {
        (contextElement as HTMLElement).style.border = '1px solid transparent';
      }
    }

    console.log('Container créé avec margins directes en mm:', margins);
    console.log('Contenu inséré, longueur:', content.length);

    return container;
  }
  /**
   * Obtenir les options pour html2pdf
   */
  private static getPDFOptions(options: {
    filename: string;
    allowMultiplePages: boolean;
  }) {
    const { filename, allowMultiplePages } = options;

    return {
      margin: [0, 0, 0, 0],
      filename,
      image: {
        type: 'jpeg',
        quality: 0.98
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: {
        mode: allowMultiplePages ? ['css', 'legacy'] : ['avoid-all', 'css', 'legacy'],
        before: '.force-new-page',
        avoid: '.no-break'
      }
    };
  }

  /**
   * Parser le contenu HTML en paragraphes Word
   */
  private static parseContentToParagraphs(
    element: HTMLElement,
    template?: TemplateStyle
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    const fontSize = this.parseFontSize(template?.fontSize || '12pt');
    const fontFamily = template?.fontFamily || 'Arial';

    // Traiter tous les éléments enfants
    Array.from(element.children).forEach(child => {
      const childElement = child as HTMLElement;
      if (childElement.tagName === 'DIV' || childElement.tagName === 'P') {
        const textContent = childElement.textContent || '';
        const alignment = this.parseAlignment(childElement);

        if (textContent.trim()) {
          const textRunOptions: TextRunOptions = {
            text: textContent,
            size: fontSize,
            font: fontFamily,
            color: template?.color || '000000',
            bold: this.isBold(childElement),
            italic: this.isItalic(childElement),
          };

          if (this.isUnderline(childElement)) {
            textRunOptions.underline = { type: UnderlineType.SINGLE };
          }

          const textRun = new TextRun(textRunOptions);

          paragraphs.push(new Paragraph({
            children: [textRun],
            alignment: alignment,
            spacing: { after: 200 }, // 12pt after paragraph
          }));
        }
      } else if (childElement.tagName === 'BR') {
        // Ajouter un paragraphe vide pour les sauts de ligne
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: '', size: fontSize, font: fontFamily })],
          spacing: { after: 100 },
        }));
      }
    });

    // Si aucun paragraphe n'a été créé, ajouter le texte brut
    if (paragraphs.length === 0) {
      const textContent = element.textContent || '';
      if (textContent.trim()) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({
            text: textContent,
            size: fontSize,
            font: fontFamily,
            color: template?.color || '000000',
          })],
          spacing: { after: 200 },
        }));
      }
    }

    return paragraphs;
  }

  /**
   * Convertir les mm en twips (unité Word)
   */
  private static convertMmToTwips(mm: number): number {
    // 1 mm = 56.6929 twips
    return Math.round(mm * 56.6929);
  }

  /**
   * Parser la taille de police en points
   */
  private static parseFontSize(fontSize: string): number {
    const match = fontSize.match(/(\d+)/);
    return match ? parseInt(match[1]) * 2 : 24; // Convertir en demi-points
  }

  /**
   * Parser l'alignement
   */
  private static parseAlignment(element: HTMLElement) {
    const style = (element as HTMLElement).style.textAlign;
    switch (style) {
      case 'center':
        return AlignmentType.CENTER;
      case 'right':
        return AlignmentType.RIGHT;
      case 'justify':
        return AlignmentType.JUSTIFIED;
      default:
        return AlignmentType.LEFT;
    }
  }

  /**
   * Vérifier si le texte est en gras
   */
  private static isBold(element: HTMLElement): boolean {
    return element.tagName === 'B' || element.tagName === 'STRONG' ||
           element.style.fontWeight === 'bold' || element.style.fontWeight === '700';
  }

  /**
   * Vérifier si le texte est en italique
   */
  private static isItalic(element: HTMLElement): boolean {
    return element.tagName === 'I' || element.tagName === 'EM' ||
           element.style.fontStyle === 'italic';
  }

  /**
   * Vérifier si le texte est souligné
   */
  private static isUnderline(element: HTMLElement): boolean {
    return element.tagName === 'U' || element.style.textDecoration === 'underline';
  }

  
  /**
   * Générer le document HTML complet
   */
  private static generateHTMLDocument(
    content: string,
    options: {
      template?: TemplateStyle;
      margins: Margins;
    }
  ): string {
    const { template, margins } = options;

    const fontFamily = template?.fontFamily || 'Arial, sans-serif';
    const fontSize = template?.fontSize || '12pt';
    const lineHeight = template?.lineHeight || '1.6';
    const color = template?.color || '#333';

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lettre de Motivation</title>
    <style>
        body {
            font-family: ${fontFamily};
            font-size: ${fontSize};
            line-height: ${lineHeight};
            color: ${color};
            max-width: 210mm;
            margin: 0 auto;
            padding: ${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px;
            background: white;
            border: 2px solid #e5e7eb;
        }
        b, strong { font-weight: bold; }
        i, em { font-style: italic; }
        u { text-decoration: underline; }
        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-justify { text-align: justify; }
        ul, ol { margin: 1em 0; padding-left: 2em; }
        li { margin: 0.5em 0; }
        a { color: #0066cc; text-decoration: underline; }
        a:hover { color: #004499; }
        img { max-width: 100%; height: auto; margin: 10px 0; }
        [style*="color"] { }
        [style*="font-size"] { }
        [style*="font-family"] { }
        [style*="background"] { }
        @media print {
            body { margin: 0; padding: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm; }
            a { color: inherit; text-decoration: none; }
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
  }

  /**
   * Convertir le contenu HTML en texte brut optimisé pour ATS
   */
  private static convertHTMLToATSOptimizedText(htmlContent: string): string {
    try {
      // Créer un élément temporaire pour parser le HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // Extraire le texte brut
      let textContent = tempDiv.textContent || tempDiv.innerText || '';

      // Nettoyer et formater le texte
      textContent = this.cleanTextForATS(textContent);

      // Réorganiser pour optimisation ATS
      textContent = this.optimizeTextForATS(textContent);

      return textContent;
    } catch (error) {
      console.error('Erreur lors de la conversion HTML vers texte:', error);
      // En cas d'erreur, retourner une version nettoyée du contenu
      return this.cleanTextForATS(htmlContent);
    }
  }

  /**
   * Nettoyer le texte pour le format ATS
   */
  private static cleanTextForATS(text: string): string {
    // Supprimer les espaces multiples et les sauts de ligne excessive
    text = text.replace(/\s+/g, ' ').trim();

    // Reconstruire les paragraphes avec des sauts de ligne doubles
    // Identifier les paragraphes en cherchant des mots qui commencent par une majuscule après un point
    text = text.replace(/\. ([A-Z])/g, '.\n\n$1');

    // Ajouter des sauts de ligne pour améliorer la lisibilité
    text = text.replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2');

    // Corriger les abreviations communes
    text = text.replace(/\b(Mr|Mrs|Dr|Prof|etc|vs|i\.e|e\.g)\./gi, '$1');

    return text.trim();
  }

  /**
   * Optimiser le texte pour les systèmes ATS
   */
  private static optimizeTextForATS(text: string): string {
    // Pour optimiser pour les ATS, nous allons essayer d'extraire des informations clés
    // seulement si c'est clairement un document professionnel/candidature

    const lines = text.split('\n').filter(line => line.trim());
    const fullText = lines.join(' ').toLowerCase();

    // Détecter si c'est une lettre de motivation ou CV
    const isCoverLetter = this.detectIfCoverLetter(fullText);

    let optimizedContent = '';

    if (isCoverLetter) {
      // Rechercher des mots-clés seulement pour les lettres de motivation
      const keywords = this.extractATSKeywords(text);

      if (keywords.length > 0) {
        optimizedContent += `COMPÉTENCES ET EXPÉRIENCE CLÉS: ${keywords.join(', ')}\n\n`;
      }
    }

    // Ajouter le contenu original
    optimizedContent += lines.join('\n\n');

    // S'assurer que le contenu n'est pas trop long
    if (optimizedContent.length > 5000) {
      optimizedContent = optimizedContent.substring(0, 5000) + '\n\n[Contenu tronqué pour optimisation]';
    }

    return optimizedContent;
  }

  /**
   * Extraire les mots-clés pertinents pour les ATS
   */
  private static extractATSKeywords(text: string): string[] {
    // Mots-clés ATS courants en contexte professionnel français
    const commonATSKeywords = [
      // Compétences techniques
      'javascript', 'python', 'java', 'react', 'node.js', 'html', 'css', 'sql',
      'php', 'c#', 'c++', 'typescript', 'vue.js', 'angular', 'docker', 'kubernetes',
      'aws', 'azure', 'git', 'agile', 'scrum', 'devops', 'ci/cd', 'api', 'rest',

      // Compétences générales
      'gestion de projet', 'analyse', 'développement', 'conception', 'optimisation',
      'maintenance', 'support', 'formation', 'communication', 'leadership',
      'résolution de problèmes', 'travail d\'équipe', 'gestion du temps',

      // Domaines
      'informatique', 'développement web', 'mobile', 'data', 'intelligence artificielle',
      'machine learning', 'cybersécurité', 'réseaux', 'base de données', 'cloud',

      // Soft skills
      'autonomie', 'rigueur', 'adaptabilité', 'créativité', 'esprit d\'analyse'
    ];

    const foundKeywords: string[] = [];
    const lowerText = text.toLowerCase();

    // Chercher les mots-clés présents dans le texte
    for (const keyword of commonATSKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
      }
    }

    // Limiter à 10 mots-clés pour éviter la surcharge
    return foundKeywords.slice(0, 10);
  }

  /**
   * Détecter si le texte est probablement une lettre de motivation
   */
  private static detectIfCoverLetter(text: string): boolean {
    // Marqueurs typiques d'une lettre de motivation
    const coverLetterMarkers = [
      // Salutations formelles
      'madame', 'monsieur', 'cher', 'chère', 'responsable',

      // Références au poste
      'poste', 'candidature', 'candidat', 'recrute', 'position',
      'recherche', 'intéresse', 'postule', 'sac poste de',

      // Formules de politesse et conclusion
      'cordialement', 'sincères', 'veuillez', 'cordialect',
      'bien à vous', 'dans l\'attente', 'resté à votre disposition',

      // Context professionnel
      'expérience', 'compétences', 'qualifications', 'profil',
      'motivé', 'enthousiaste', 'aptitudes',

      // Contexte entreprise
      'entreprise', 'société', 'organisme', 'structure'
    ];

    // Compter le nombre de marqueurs présents
    let foundMarkers = 0;
    for (const marker of coverLetterMarkers) {
      if (text.includes(marker)) {
        foundMarkers++;
      }
    }

    // Au moins 3 marqueurs pour considérer que c'est une lettre
    return foundMarkers >= 3;
  }
}
