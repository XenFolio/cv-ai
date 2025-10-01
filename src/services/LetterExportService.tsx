import html2pdf from 'html2pdf.js';

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
  format: 'pdf' | 'html' | 'docx';
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

    // Créer une container simple comme avant
    const container = document.createElement('div');
    container.style.width = '210mm';
    container.style.minHeight = '297mm';
    container.style.margin = '0 auto';
    container.style.padding = '0'; // PAS de marges dans le container
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
}
