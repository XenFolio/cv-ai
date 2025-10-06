import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

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
        allowMultiplePages,
        margins
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
   * Exporter une lettre en PDF optimisé pour les systèmes ATS
   */
  static async exportToATSOPtimizedPDF(
    content: string,
    options: ExportOptions
  ): Promise<void> {
    const {
      filename = 'lettre-motivation-ats-optimisee.pdf',
      margins = { top: 20, right: 20, bottom: 20, left: 20 },
      template
    } = options;

    try {
      // Convertir le contenu en texte optimisé pour ATS
      const atsOptimizedContent = this.convertHTMLToATSOptimizedText(content);

      // Créer un container spécifique pour l'export ATS
      const container = document.createElement('div');
      container.style.width = '210mm';
      container.style.minHeight = '297mm';
      container.style.margin = '0 auto';
      container.style.padding = `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`;
      container.style.background = 'white';
      container.style.fontFamily = template?.fontFamily || 'Arial, sans-serif';
      container.style.fontSize = template?.fontSize || '12pt';
      container.style.lineHeight = '1.6';
      container.style.color = '#000000';
      container.style.whiteSpace = 'pre-wrap';
      container.style.overflowWrap = 'break-word';
      container.style.boxSizing = 'border-box';
      container.style.position = 'relative';

      // Appliquer le contenu optimisé
      container.innerHTML = `
        <div style="page-break-inside: avoid;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
            <h1 style="color: #333; font-size: 18pt; margin: 0; font-weight: bold;">LETTRE DE MOTIVATION - OPTIMISÉE ATS</h1>
            <p style="color: #666; font-size: 10pt; margin: 5px 0 0 0;">Format texte brut compatible avec les systèmes de suivi des candidatures</p>
          </div>
        </div>
        <div style="font-family: monospace; font-size: 11pt; line-height: 1.5; color: #000;">
          ${atsOptimizedContent.replace(/\n/g, '<br>').replace(/\s{2,}/g, ' ')}
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 8pt; color: #666; text-align: center;">
          Généré le ${new Date().toLocaleDateString('fr-FR')} par CV ATS Assistant v4.2<br>
          Ce document est optimisé pour les systèmes de suivi des candidatures (ATS)
        </div>
      `;

      // Options PDF optimisées pour l'export ATS
      const pdfOptions = {
        margin: [0, 0, 0, 0],
        filename,
        image: {
          type: 'jpeg',
          quality: 0.98
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          letterRendering: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.force-new-page',
          avoid: '.no-break'
        }
      };

      // Générer le PDF
      await html2pdf().set(pdfOptions).from(container).save();

      console.log('PDF ATS optimisé généré avec succès');

    } catch (error) {
      console.error('Erreur lors de l\'export PDF ATS optimisé:', error);
      throw new Error('Erreur lors de l\'export PDF ATS optimisé. Veuillez réessayer.');
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
    container.style.padding = `0px`;
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
    margins: Margins;
  }) {
    const { filename, allowMultiplePages, margins } = options;

    return {
      margin: [margins.top, margins.right, margins.bottom, margins.left],
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
          const textRun = new TextRun({
            text: textContent,
            size: fontSize,
            font: fontFamily,
            color: template?.color || '000000',
            bold: this.isBold(childElement),
            italics: this.isItalic(childElement),
            underline: this.isUnderline(childElement) ? { type: 'single' } : undefined,
          });

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

      // Amélioration : Extraire et préserver la structure sémantique
      let structuredContent = this.extractStructuredContent(tempDiv);

      // Nettoyer et formater le texte
      structuredContent = this.cleanTextForATS(structuredContent);

      // Réorganiser pour optimisation ATS
      structuredContent = this.optimizeTextForATS(structuredContent);

      return structuredContent;
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
    // Supprimer les caractères non imprimables et les espaces excessifs
    text = text.replace(/\p{Cc}/gu, '');
    text = text.replace(/\s+/g, ' ').trim();

    // Normaliser les sauts de ligne
    text = text.replace(/\r\n/g, '\n');
    text = text.replace(/\r/g, '\n');

    // Améliorer la structure des paragraphes pour les lettres de motivation
    // Reconnaître les fins de phrases et ajouter des sauts de ligne appropriés
    text = text.replace(/([.!?])\s+([A-ZÀÂÉÈÊËÎÏÔÙÛÇ])/g, '$1\n\n$2');

    // Préserver les salutations et formules de politesse
    const salutations = [
      /madame,? monsieur,?/gi,
      /monsieur,? madame,?/gi,
      /à l'attention de/gi,
      /cher monsieur,?/gi,
      /chère madame,?/gi
    ];

    salutations.forEach(salutation => {
      text = text.replace(salutation, (match) => match.toUpperCase() + '\n');
    });

    // Préserver les formules de politesse
    const closings = [
      /cordialement,?/gi,
      /sincères salutations,?/gi,
      /bien à vous,?/gi,
      /dans l'attende de votre réponse,?/gi,
      /restant à votre disposition,?/gi
    ];

    closings.forEach(closing => {
      text = text.replace(closing, (match) => '\n' + match.charAt(0).toUpperCase() + match.slice(1));
    });

    // Corriger les abréviations courantes dans les lettres
    text = text.replace(/\b(Mr|Mme|Dr|Prof|etc|vs|i\.e|e\.g|N\.B|c\.à\.d)\./gi, '$1');

    // Nettoyer les espaces multiples après les sauts de ligne
    text = text.replace(/\n\s+/g, '\n');

    // S'assurer qu'il n'y a pas plus de 2 sauts de ligne consécutifs
    text = text.replace(/\n{3,}/g, '\n\n');

    // Nettoyer les espaces au début et fin des lignes
    text = text.split('\n').map(line => line.trim()).join('\n');

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

    // Ajouter un en-tête standardisé pour les ATS
    optimizedContent += `LETTRE DE MOTIVATION - OPTIMISÉE POUR LES SYSTÈMES ATS\n`;
    optimizedContent += `${'='.repeat(60)}\n\n`;

    if (isCoverLetter) {
      // Extraire et structurer les informations clés pour les lettres
      const structuredInfo = this.extractLetterStructure(lines);

      if (structuredInfo.contactInfo) {
        optimizedContent += `INFORMATIONS DE CONTACT:\n${structuredInfo.contactInfo}\n\n`;
      }

      if (structuredInfo.recipient) {
        optimizedContent += `DESTINATAIRE:\n${structuredInfo.recipient}\n\n`;
      }

      if (structuredInfo.subject) {
        optimizedContent += `OBJET: ${structuredInfo.subject}\n\n`;
      }

      // Rechercher des mots-clés spécifiques aux lettres de motivation
      const keywords = this.extractATSKeywords(text);
      if (keywords.length > 0) {
        optimizedContent += `MOTS-CLÉS PERTINENTS: ${keywords.join(', ')}\n\n`;
      }

      // Ajouter le contenu structuré
      optimizedContent += `CONTENU DE LA LETTRE:\n${structuredInfo.mainContent}\n\n`;

      if (structuredInfo.closing) {
        optimizedContent += `FORMULE DE POLITESSE:\n${structuredInfo.closing}\n\n`;
      }
    } else {
      // Pour les autres documents, ajouter les mots-clés si présents
      const keywords = this.extractATSKeywords(text);
      if (keywords.length > 0) {
        optimizedContent += `MOTS-CLÉS PRINCIPAUX: ${keywords.join(', ')}\n\n`;
      }
    }

    // Ajouter le contenu original formaté
    optimizedContent += lines.join('\n\n');

    // Ajouter une section de métadonnées pour les ATS
    optimizedContent += `\n\n${'='.repeat(60)}\n`;
    optimizedContent += `MÉTADONNÉES D'OPTIMISATION ATS:\n`;
    optimizedContent += `- Format: Texte brut optimisé\n`;
    optimizedContent += `- Encodage: UTF-8\n`;
    optimizedContent += `- Date de génération: ${new Date().toLocaleDateString('fr-FR')}\n`;
    optimizedContent += `- Type: Lettre de motivation\n`;

    // S'assurer que le contenu n'est pas trop long pour les ATS
    if (optimizedContent.length > 8000) {
      optimizedContent = optimizedContent.substring(0, 8000) + '\n\n[Contenu optimisé pour la lisibilité ATS]';
    }

    return optimizedContent;
  }

  /**
   * Extraire la structure d'une lettre de motivation pour l'optimisation ATS
   */
  private static extractLetterStructure(lines: string[]): {
    contactInfo?: string;
    recipient?: string;
    subject?: string;
    mainContent: string;
    closing?: string;
  } {
    const result = {
      contactInfo: '',
      recipient: '',
      subject: '',
      mainContent: '',
      closing: ''
    };

    let currentSection = 'header';
    const mainContentLines: string[] = [];
    let hasFoundRecipient = false;
    let hasFoundContent = false;
    let hasFoundClosing = false;

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Vérifier si c'est une information de contact (email, téléphone, etc.)
      if (currentSection === 'header' &&
          (trimmedLine.includes('@') ||
           /\d{10,}/.test(trimmedLine.replace(/\s/g, '')) ||
           trimmedLine.toLowerCase().includes('téléphone') ||
           trimmedLine.toLowerCase().includes('email'))) {
        result.contactInfo += trimmedLine + '\n';
        return;
      }

      // Vérifier si c'est un destinataire (salutation)
      if (!hasFoundRecipient && this.isSalutation(trimmedLine)) {
        result.recipient = trimmedLine;
        hasFoundRecipient = true;
        currentSection = 'content';
        return;
      }

      // Vérifier si c'est un objet ou référence
      if (hasFoundRecipient && !hasFoundContent &&
          (trimmedLine.toLowerCase().includes('objet:') ||
           trimmedLine.toLowerCase().includes('réf:') ||
           trimmedLine.toLowerCase().includes('poste:'))) {
        result.subject = trimmedLine;
        return;
      }

      // Vérifier si c'est une formule de politesse
      if (!hasFoundClosing && this.isClosing(trimmedLine)) {
        result.closing = trimmedLine;
        hasFoundClosing = true;
        currentSection = 'closing';
        return;
      }

      // Ajouter au contenu principal
      if (hasFoundRecipient && !hasFoundClosing && trimmedLine.length > 0) {
        if (!hasFoundContent) {
          hasFoundContent = true;
        }
        mainContentLines.push(trimmedLine);
      }

      // Ajouter les lignes après la formule de politesse (signature)
      if (hasFoundClosing && trimmedLine.length > 0) {
        result.closing += '\n' + trimmedLine;
      }
    });

    // Assembler le contenu principal
    result.mainContent = mainContentLines.join('\n\n');

    // Nettoyer les résultats
    Object.keys(result).forEach(key => {
      if (result[key as keyof typeof result]) {
        result[key as keyof typeof result] = result[key as keyof typeof result].trim();
      }
    });

    return result;
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
   * Extraire le contenu structuré pour l'optimisation ATS
   */
  private static extractStructuredContent(element: HTMLElement): string {
    let content = '';

    // Parcourir les éléments enfants de manière structurée
    Array.from(element.children).forEach(child => {
      const childElement = child as HTMLElement;
      const tagName = childElement.tagName.toLowerCase();
      const text = childElement.textContent?.trim() || '';

      if (!text) return;

      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
          content += `\n${text.toUpperCase()}\n${'='.repeat(text.length)}\n`;
          break;
        case 'p':
        case 'div':
          // Vérifier si c'est une salutation ou formule de politesse
          if (this.isSalutation(text)) {
            content += `\n${text}\n`;
          } else if (this.isClosing(text)) {
            content += `\n\n${text}\n`;
          } else {
            content += `${text}\n\n`;
          }
          break;
        case 'br':
          content += '\n';
          break;
        case 'ul':
        case 'ol': {
          const listItems = childElement.querySelectorAll('li');
          listItems.forEach(li => {
            const itemText = li.textContent?.trim();
            if (itemText) {
              content += `• ${itemText}\n`;
            }
          });
          content += '\n';
          break;
        }
        default:
          // Pour les autres éléments, extraire le texte
          content += `${text} `;
      }
    });

    return content.trim();
  }

  /**
   * Vérifier si le texte est une salutation
   */
  private static isSalutation(text: string): boolean {
    const salutations = [
      'madame, monsieur,', 'monsieur, madame,', 'à l\'attention de',
      'cher monsieur,', 'chère madame,', 'madame,', 'monsieur,',
      'bonjour,', 'bonsoir,'
    ];
    return salutations.some(salutation =>
      text.toLowerCase().includes(salutation.toLowerCase())
    );
  }

  /**
   * Vérifier si le texte est une formule de politesse
   */
  private static isClosing(text: string): boolean {
    const closings = [
      'cordialement,', 'sincères salutations,', 'bien à vous,',
      'dans l\'attente de votre réponse,', 'restant à votre disposition,',
      'avec mes salutations,', 'respectueusement,'
    ];
    return closings.some(closing =>
      text.toLowerCase().includes(closing.toLowerCase())
    );
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
