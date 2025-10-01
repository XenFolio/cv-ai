import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import html2pdf from 'html2pdf.js';
import { BreadcrumbNavigation } from '../UI/BreadcrumbNavigation';
import { NavigationIcons } from '../UI/iconsData';
import { useAppStore } from '../../store/useAppStore';
import { TemplateCarousel } from './TemplateCarousel';
import { EditorToolbar } from './EditorToolbar';
import { LinkDialog } from './LinkDialog';
import { EditorFooter } from './EditorFooter';
import { createTemplates } from '../../data/letterTemplates';
import { MarginModal } from './MarginModal';
import { FileText } from 'lucide-react';

interface LetterEditorProps {
  onSave?: (content: string) => void;
  onExport?: (content: string, format: 'pdf' | 'docx' | 'html') => void;
  initialContent?: string;
  formData?: {
    poste: string;
    entreprise: string;
    secteur: string;
    experience: string;
    motivation: string;
    competences: string;
  };
  onBack?: () => void;
}

export const LetterEditor: React.FC<LetterEditorProps> = ({
  onSave,
  onExport,
  initialContent = '',
  formData,
}) => {
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const [content, setContent] = useState(initialContent);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState('12pt');
  const [currentFontFamily, setCurrentFontFamily] = useState('Arial');
  const [currentTemplate, setCurrentTemplate] = useState('moderne');
  const [isPreview, setIsPreview] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showMarginGuides, setShowMarginGuides] = useState(false);
  const [showMarginModal, setShowMarginModal] = useState(false);
  const [allowMultiplePages, setAllowMultiplePages] = useState(false);
  const [showBorders, setShowBorders] = useState(true);
  const [customMargins, setCustomMargins] = useState({
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  });
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  }>({ message: '', type: 'info', visible: false });

  // Charger le contenu sauvegardé au démarrage
  useEffect(() => {
    if (!initialContent) {
      try {
        const savedData = localStorage.getItem('letter-editor-content');
        if (savedData) {
          const { content: savedContent, template } = JSON.parse(savedData);
          if (savedContent) {
            setContent(savedContent);
            if (template) {
              setCurrentTemplate(template);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      }
    }
  }, [initialContent]);

  // Appliquer les marges personnalisées sur l'éditeur et le preview (conversion mm -> px)
  useEffect(() => {
    // Appliquer les marges sur letter-container (pas letter-root)
    const applyMarginsToLetterContainer = () => {
      const letterContainers = document.querySelectorAll('.letter-container');
      letterContainers.forEach((container) => {
        // Appliquer les marges personnalisées (conversion mm -> px)
        (container as HTMLElement).style.paddingTop = `${customMargins.top * 3.78}px`;
        (container as HTMLElement).style.paddingRight = `${customMargins.right * 3.78}px`;
        (container as HTMLElement).style.paddingBottom = `${customMargins.bottom * 3.78}px`;
        (container as HTMLElement).style.paddingLeft = `${customMargins.left * 3.78}px`;
      });
    };

    // Appliquer les marges sur tous les letter-container
    applyMarginsToLetterContainer();
  }, [customMargins, editorRef, editorContainerRef]);

  // Gérer l'affichage/masquage des bordures sur letter-content
  useEffect(() => {
    const toggleBorder = () => {
      const letterContents = document.querySelectorAll('.letter-content');
      letterContents.forEach((element) => {
        if (showBorders) {
          (element as HTMLElement).style.border = '1px solid red';
        } else {
          (element as HTMLElement).style.border = '1px solid transparent';
        }
      });
    };

    toggleBorder();
  }, [showBorders]);

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Ne pas fermer si on clique sur les boutons de la toolbar
      if (target.closest('.bg-white.rounded-t-lg')) {
        return;
      }

      if (showColorPicker && !target.closest('.color-picker')) {
        setShowColorPicker(false);
      }
      if (showFontSize && !target.closest('.font-size')) {
        setShowFontSize(false);
      }
      if (showFontFamily && !target.closest('.font-family')) {
        setShowFontFamily(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker, showFontSize, showFontFamily]);

  // Notifications
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 4000);
  }, []);

  // Templates
  const templates = useMemo(() => createTemplates(formData), [formData]);

  // Commandes de formatage
  const execCommand = useCallback((command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();

      if (command === 'justifyLeft' || command === 'justifyCenter' || command === 'justifyRight' || command === 'justifyFull') {
        // Logique spéciale pour l'alignement - appliquer au bloc parent
        const selection = window.getSelection();
        let alignment = '';
        switch(command) {
          case 'justifyLeft': alignment = 'left'; break;
          case 'justifyCenter': alignment = 'center'; break;
          case 'justifyRight': alignment = 'right'; break;
          case 'justifyFull': alignment = 'justify'; break;
        }

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let element: HTMLElement | null = range.commonAncestorContainer as HTMLElement;

          // Si c'est un nœud texte, prendre le parent
          if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
            element = range.commonAncestorContainer.parentElement;
          }

          // Remonter jusqu'à trouver un élément bloc ou la div principale
          while (element && element !== editorRef.current) {
            const style = window.getComputedStyle(element);
            if (style.display === 'block' || style.display === 'flex' || element.tagName === 'DIV' || element.tagName === 'P') {
              element.style.textAlign = alignment;
              break;
            }
            element = element.parentElement;
          }

          // Si on n'a pas trouvé d'élément bloc, appliquer à la div principale
          if (!element || element === editorRef.current) {
            editorRef.current.style.textAlign = alignment;
          }
        }

        // Pour les alignements, mettre à jour le contenu sans perdre le curseur
        setContent(editorRef.current.innerHTML);
        return;
      } else {
        // Pour les autres commandes, utiliser execCommand normal
        document.execCommand(command, false, value);
      }

      setContent(editorRef.current.innerHTML);
    }
  }, []);

  const changeFontSize = useCallback((size: string) => {
    if (editorRef.current) {
      editorRef.current.focus();

      // Appliquer la taille au texte sélectionné
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = size;
        try {
          range.surroundContents(span);
        } catch  {
          // Si surroundContents échoue, utiliser la méthode execCommand
          document.execCommand('fontSize', false, '7');
          setTimeout(() => {
            const fontElements = editorRef.current?.querySelectorAll('font[size="7"]');
            fontElements?.forEach(element => {
              element.removeAttribute('size');
              (element as HTMLElement).style.fontSize = size;
            });
          }, 0);
        }
      } else {
        // Si pas de sélection, utiliser la méthode standard
        document.execCommand('fontSize', false, '7');
        const fontElements = editorRef.current?.querySelectorAll('font[size="7"]');
        fontElements?.forEach(element => {
          element.removeAttribute('size');
          (element as HTMLElement).style.fontSize = size;
        });
      }

      setCurrentFontSize(size);
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  const changeFontFamily = useCallback((family: string) => {
    if (editorRef.current) {
      editorRef.current.focus();

      // Appliquer la police au texte sélectionné
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontFamily = family;
        try {
          range.surroundContents(span);
        } catch  {
          // Si surroundContents échoue, utiliser execCommand comme fallback
          document.execCommand('fontName', false, family);
        }
      } else {
        // Si pas de sélection, utiliser execCommand
        document.execCommand('fontName', false, family);
      }

      setCurrentFontFamily(family);
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  const changeTextColor = useCallback((color: string) => {
    if (editorRef.current) {
      editorRef.current.focus();

      // Appliquer la couleur au texte sélectionné
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.color = color;
        try {
          range.surroundContents(span);
        } catch  {
          // Si surroundContents échoue, utiliser execCommand comme fallback
          document.execCommand('foreColor', false, color);
        }
      } else {
        // Si pas de sélection, utiliser execCommand
        document.execCommand('foreColor', false, color);
      }

      setContent(editorRef.current.innerHTML);
    }
  }, []);

  // Export PDF
  const exportToPDF = useCallback(async () => {
    if (!editorRef.current) return;

    try {
      console.log('Export PDF - allowMultiplePages:', allowMultiplePages);

      const currentTemplateData = templates[currentTemplate as keyof typeof templates];
      const currentTemplateStyle = currentTemplateData.style;

      const container = document.createElement('div');
      container.style.width = '210mm';
      container.style.margin = '0';
      container.style.padding = '0';
      container.style.background = 'white';
      container.style.position = 'relative';
      container.style.boxSizing = 'border-box';

      if (allowMultiplePages) {
        container.style.minHeight = '297mm';
      } else {
        container.style.height = '297mm';
        container.style.overflow = 'hidden';
      }

      if (showBorders) {
        container.style.border = '1px solid #ccc';
      }

      console.log('Container style:', container.style.cssText);

      // Définir la classe de base pour le container
      container.className = 'letter-container';

      // Appliquer les marges personnalisées directement sur le container (conversion mm -> px)
      const marginPx = {
        top: customMargins.top ,
        right: customMargins.right ,
        bottom: customMargins.bottom ,
        left: customMargins.left 
      };
      console.log('Marges en px:', marginPx);

      container.style.paddingTop = `${marginPx.top}px`;
      container.style.paddingRight = `${marginPx.right}px`;
      container.style.paddingBottom = `${marginPx.bottom}px`;
      container.style.paddingLeft = `${marginPx.left}px`;

      // Créer un wrapper pour le contenu (letter-content avec margin/padding 0)
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'letter-content' + (!showBorders ? ' letter-no-borders' : '');
      contentWrapper.style.width = '100%';
      contentWrapper.style.height = '100%';
      contentWrapper.style.boxSizing = 'border-box';
      contentWrapper.style.fontFamily = currentTemplateStyle.fontFamily;
      contentWrapper.style.fontSize = currentTemplateStyle.fontSize;
      contentWrapper.style.lineHeight = currentTemplateStyle.lineHeight;
      contentWrapper.style.color = currentTemplateStyle.color;
      contentWrapper.style.position = 'relative';

      if (allowMultiplePages) {
        contentWrapper.style.minHeight = '100%';
      } else {
        contentWrapper.style.height = '100%';
        contentWrapper.style.overflow = 'hidden';
      }

      // Prendre directement le contenu de letter-container
      const containerContent = editorRef.current.innerHTML;
      contentWrapper.innerHTML = containerContent;
      console.log('Container content for PDF:', containerContent);
      console.log('customMargins:', customMargins);
      container.appendChild(contentWrapper);

      // Injecter les styles CSS pour gérer les bordures et sauts de page dans le PDF
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        /* Supprimer les marges CSS par défaut mais garder celles appliquées par JavaScript */
        .letter-content {
          padding: 0 !important;
          border: none !important;
        }

        /* Supprimer toutes les bordures de templates dans le PDF */
        .letter-moderne,
        .letter-classique,
        .letter-creatif,
        .letter-minimaliste,
        .letter-executive {
          border: none !important;
        }

        .letter-startup-card {
          background: none !important;
          padding: 0 !important;
        }

        .letter-startup-content {
          border-radius: 0 !important;
          background: transparent !important;
        }

        /* Styles pour les sauts de page (toujours disponibles) */
        .force-new-page {
          page-break-before: always;
          break-before: page;
        }

        .no-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .avoid-after {
          page-break-after: avoid;
          break-after: avoid;
        }

        /* Éviter les coupures sur les éléments importants */
        h1, h2, h3, h4, h5, h6, img, table, blockquote, .letter-container {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* Pas de saut de page après ces éléments */
        .letter-container > div:last-child,
        .letter-moderne > div:last-child,
        .letter-classique > div:last-child,
        .letter-creatif > div:last-child,
        .letter-minimaliste > div:last-child,
        .letter-executive > div:last-child {
          page-break-after: avoid;
          break-after: avoid;
        }
      `;

      container.appendChild(styleSheet);

      const options = {
        margin: [0, 0, 0, 0],
        filename: 'lettre-motivation.pdf',
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

      console.log('PDF options:', options);

      // Utiliser la même configuration, seule la gestion des pages diffère
      await html2pdf().set(options).from(container).save();

      if (onExport) {
        onExport(editorRef.current.innerHTML, 'pdf');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
    }
  }, [onExport, currentTemplate, showBorders, templates, customMargins, allowMultiplePages]);

  // Charger un template
  const loadTemplate = useCallback((templateKey: string) => {
    setCurrentTemplate(templateKey);
    const templateData = createTemplates(formData);
    const newContent = templateData[templateKey as keyof typeof templateData].template;
    setContent(newContent);
  }, [formData]);

  // Sauvegarder
  const handleSave = useCallback(() => {
    if (!editorRef.current) return;

    try {
      const content = editorRef.current.innerHTML;

      const saveData = {
        content,
        timestamp: new Date().toISOString(),
        template: currentTemplate
      };

      localStorage.setItem('letter-editor-content', JSON.stringify(saveData));

      const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lettre de Motivation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
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
            body { margin: 0; padding: 20mm; }
            a { color: inherit; text-decoration: none; }
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
      
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lettre-motivation-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onSave) {
        onSave(content);
      }

      showNotification('Lettre sauvegardée avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showNotification('Erreur lors de la sauvegarde. Veuillez réessayer.', 'error');
    }
  }, [onSave, currentTemplate, showNotification]);

  // Gestion des liens
  const insertLink = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';

    if (selectedText) {
      setLinkText(selectedText);
    } else {
      setLinkText('');
    }
    setLinkUrl('');
    setShowLinkDialog(true);
  }, []);

  const confirmLink = useCallback(() => {
    if (linkUrl) {
      const link = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`;
      execCommand('insertHTML', link);
    }
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  }, [linkUrl, linkText, execCommand]);

  const insertImage = useCallback(() => {
    const imageUrl = prompt('URL de l\'image:');
    if (imageUrl) {
      const altText = prompt('Texte alternatif (optionnel):') || 'Image';
      const img = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
      execCommand('insertHTML', img);
    }
  }, [execCommand]);

  // Toggle handlers
  const togglePreview = useCallback(() => setIsPreview(!isPreview), [isPreview]);
  const toggleSidebar = useCallback(() => setShowSidebar(!showSidebar), [showSidebar]);
  const toggleFontFamily = useCallback(() => setShowFontFamily(!showFontFamily), [showFontFamily]);
  const toggleFontSize = useCallback(() => setShowFontSize(!showFontSize), [showFontSize]);
  const toggleColorPicker = useCallback(() => setShowColorPicker(!showColorPicker), [showColorPicker]);
  const toggleMarginGuides = useCallback(() => setShowMarginGuides(!showMarginGuides), [showMarginGuides]);
  const toggleBorders = useCallback(() => setShowBorders(!showBorders), [showBorders]);

  // Margin modal handlers
  const closeMarginModal = useCallback(() => setShowMarginModal(false), []);
  const saveMargins = useCallback((newMargins: typeof customMargins) => {
    setCustomMargins(newMargins);
    setShowMarginModal(false);
    showNotification('Marges mises à jour', 'success');
  }, [showNotification]);

  // Toggle handlers
  const toggleMultiplePages = useCallback(() => {
    const newValue = !allowMultiplePages;
    console.log('Toggle multiple pages:', allowMultiplePages, '->', newValue);
    setAllowMultiplePages(newValue);
  }, [allowMultiplePages]);

  
  // Settings modal handlers (pour les marges)
  const openRulesModal = useCallback(() => {
    // Récupérer les marges du template actuel
    const currentTemplateData = templates[currentTemplate as keyof typeof templates];
    const templatePadding = currentTemplateData.style.padding;

    // Parser le padding et convertir en pixels
    let newMargins = { top: 20, right: 20, bottom: 20, left: 20 };

    if (templatePadding) {
      const values = templatePadding.split(/\s+/).map(v => {
        const match = v.match(/(\d+)/);
        const value = match ? parseInt(match[1]) : 0;

        // Convertir en pixels si nécessaire
        if (v.includes('mm')) {
          // 1mm ≈ 3.78px (96 DPI)
          return Math.round(value * 3.78);
        }
        return value; // déjà en pixels
      });

      if (values.length === 1) {
        // Format: "20mm" -> toutes les marges
        newMargins = { top: values[0], right: values[0], bottom: values[0], left: values[0] };
      } else if (values.length === 2) {
        // Format: "20px 30px" -> vertical horizontal
        newMargins = { top: values[0], right: values[1], bottom: values[0], left: values[1] };
      } else if (values.length === 4) {
        // Format: "20px 30px 40px 30px" -> top right bottom left
        newMargins = { top: values[0], right: values[1], bottom: values[2], left: values[3] };
      }
    }

    setCustomMargins(newMargins);
    setShowMarginModal(true);
  }, [currentTemplate, templates]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Notification Toast */}
      {notification.visible && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform ${
          notification.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        } ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {notification.type === 'info' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="max-w-full mx-auto px-4 py-2">
        <BreadcrumbNavigation
          items={[
            {
              label: 'Accueil',
              icon: NavigationIcons.Home,
              onClick: () => setActiveTab('dashboard')
            },
            {
              label: 'Lettre',
              onClick: () => setActiveTab('letter-editor')
            },
            { label: 'Éditeur de Lettre', current: true }
          ]}
          showHome={false}
          animated={true}
          className="mb-4"
        />
      </div>

      <div className="max-w-full mx-auto h-screen flex flex-col lg:flex-row gap-4">
        {/* Éditeur */}
        <div className="flex-1 flex flex-col min-w-0 lg:w-2/3">
          {/* Toolbar */}
          <EditorToolbar
            onSave={handleSave}
            onExportPDF={exportToPDF}
            onUndo={() => document.execCommand('undo')}
            onRedo={() => document.execCommand('redo')}
            onTogglePreview={togglePreview}
            isPreview={isPreview}
            showSidebar={showSidebar}
            onToggleSidebar={toggleSidebar}
            onFormatCommand={execCommand}
            onInsertLink={insertLink}
            onInsertImage={insertImage}
            onFontChange={changeFontFamily}
            onFontSizeChange={changeFontSize}
            onColorChange={changeTextColor}
            currentFont={currentFontFamily}
            currentFontSize={currentFontSize}
            showFontFamily={showFontFamily}
            showFontSize={showFontSize}
            showColorPicker={showColorPicker}
            onToggleFontFamily={toggleFontFamily}
            onToggleFontSize={toggleFontSize}
            onToggleColorPicker={toggleColorPicker}
            showMarginGuides={showMarginGuides}
            onToggleMarginGuides={toggleMarginGuides}
            showBorders={showBorders}
            onToggleBorders={toggleBorders}
            onOpenRulesModal={openRulesModal}
            allowMultiplePages={allowMultiplePages}
            onToggleMultiplePages={toggleMultiplePages}
          />

          {/* Link Dialog */}
          <LinkDialog
            isVisible={showLinkDialog}
            linkUrl={linkUrl}
            linkText={linkText}
            onUrlChange={setLinkUrl}
            onTextChange={setLinkText}
            onConfirm={confirmLink}
            onCancel={() => setShowLinkDialog(false)}
          />

          {/* Margin Modal */}
          <MarginModal
            isVisible={showMarginModal}
            margins={customMargins}
            onSave={saveMargins}
            onCancel={closeMarginModal}
          />

          {/* Editor Content */}
          <div className={`bg-gray-50 relative flex-1 overflow-auto ${!showBorders ? 'letter-no-borders' : ''}`} style={{ width: '100%', minHeight: '400px' }} ref={editorContainerRef}>
            {isPreview ? (
              <div
                className={`outline-none bg-white shadow-lg mx-auto letter-container ${!showBorders ? 'letter-no-borders' : ''}`}
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  fontFamily: templates[currentTemplate as keyof typeof templates].style.fontFamily,
                  fontSize: templates[currentTemplate as keyof typeof templates].style.fontSize,
                  lineHeight: templates[currentTemplate as keyof typeof templates].style.lineHeight,
                  color: templates[currentTemplate as keyof typeof templates].style.color,
                  boxSizing: 'border-box',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <>

                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className={`letter-root outline-none bg-white shadow-lg mx-auto p-0`}
                  style={{
                    width: '210mm',
                    minHeight: '297mm',
                    fontFamily: templates[currentTemplate as keyof typeof templates].style.fontFamily,
                    fontSize: templates[currentTemplate as keyof typeof templates].style.fontSize,
                    lineHeight: templates[currentTemplate as keyof typeof templates].style.lineHeight,
                    color: templates[currentTemplate as keyof typeof templates].style.color,
                    boxSizing: 'border-box',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    position: 'relative',
                    zIndex: 5,
                    marginBottom: '20px'
                  }}
                  onInput={() => {
                    // Laisser le DOM gérer le contenu naturellement
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/plain');
                    document.execCommand('insertText', false, text);
                  }}
                  dangerouslySetInnerHTML={{ __html: initialContent || templates[currentTemplate as keyof typeof templates].template }}
                />
              </>
            )}
          </div>

          {/* Footer */}
          <EditorFooter
            currentTemplateName={templates[currentTemplate as keyof typeof templates].name}
            characterCount={editorRef.current?.innerHTML.length || 0}
            autoSaveEnabled={true}
          />
        </div>

        {/* Template Carousel */}
        <div className={`w-full lg:w-1/3 order-first transition-all duration-300 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 rounded-t-lg shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              <h2 className="text-xl font-bold">Modèles de Lettres</h2>
            </div>
          </div>
          <TemplateCarousel
            currentTemplate={currentTemplate}
            onTemplateSelect={loadTemplate}
            formData={formData}
          />
        </div>
      </div>
    </div>
  );
};
