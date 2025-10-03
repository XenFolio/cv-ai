import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { createTemplates } from '../data/letterTemplates';

interface LetterEditorOptions {
  initialContent?: string;
  formData?: {
    poste: string;
    entreprise: string;
    secteur: string;
    experience: string;
    motivation: string;
    competences: string;
  };
}

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}

export const useLetterEditor = ({ initialContent = '', formData }: LetterEditorOptions = {}) => {
  const setActiveTab = useAppStore(s => s.setActiveTab);

  // État de l'éditeur
  const [content, setContent] = useState(initialContent);
  const [currentTemplate, setCurrentTemplate] = useState('moderne');
  
  // États UI
  const [showSidebar, setShowSidebar] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showMarginGuides, setShowMarginGuides] = useState(false);
  const [showBorders, setShowBorders] = useState(true);
  const [allowMultiplePages, setAllowMultiplePages] = useState(false);

  // État des polices
  const [currentFontSize, setCurrentFontSize] = useState('12pt');
  const [currentFontFamily, setCurrentFontFamily] = useState('Arial');

  // État des liens
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // État des notifications
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    visible: false
  });
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Templates
  const templates = useMemo(() => createTemplates(formData), [formData]);

  // Charger le contenu sauvegardé au démarrage
  useEffect(() => {
    // Toujours charger depuis localStorage si disponible, même avec initialContent
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
      } else if (initialContent) {
        // Utiliser initialContent seulement si rien dans localStorage
        setContent(initialContent);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      // En cas d'erreur, utiliser initialContent si disponible
      if (initialContent) {
        setContent(initialContent);
      }
    }

    // Nettoyage du timer au démontage
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [initialContent]);

  
  // Notifications
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info'| 'warning') => {
    // Nettoyer le timer précédent
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

        setNotification({ message, type, visible: true });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
      notificationTimeoutRef.current = null;
    }, 4000);
  }, []);

  // Templates
  const loadTemplate = useCallback((templateKey: string) => {
    setCurrentTemplate(templateKey);
    // On ne change plus le contenu, seulement le style est appliqué dynamiquement via currentTemplate
  }, []);

  // Toggle handlers
    const toggleSidebar = useCallback(() => setShowSidebar(prev => !prev), []);
  const toggleFontFamily = useCallback(() => setShowFontFamily(prev => !prev), []);
  const toggleFontSize = useCallback(() => setShowFontSize(prev => !prev), []);
  const toggleColorPicker = useCallback(() => setShowColorPicker(prev => !prev), []);
  const toggleMarginGuides = useCallback(() => setShowMarginGuides(prev => !prev), []);
  const toggleBorders = useCallback(() => setShowBorders(prev => !prev), []);
  const toggleMultiplePages = useCallback(() => setAllowMultiplePages(prev => !prev), []);

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

  const confirmLink = useCallback((onInsertHTML: (html: string) => void) => {
    if (linkUrl) {
      const link = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`;
      onInsertHTML(link);
    }
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  }, [linkUrl, linkText]);

  const cancelLink = useCallback(() => {
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  }, []);

  // Commandes de formatage
  const execCommand = useCallback((command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();

      if (command === 'justifyLeft' || command === 'justifyCenter' || command === 'justifyRight' || command === 'justifyFull') {
        // Logique spéciale pour l'alignement - n'affecte que la sélection
        const selection = window.getSelection();
        let alignment = '';
        switch(command) {
          case 'justifyLeft': alignment = 'left'; break;
          case 'justifyCenter': alignment = 'center'; break;
          case 'justifyRight': alignment = 'right'; break;
          case 'justifyFull': alignment = 'justify'; break;
        }

        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
          const range = selection.getRangeAt(0);

          // Créer une div autour de la sélection avec l'alignement
          const div = document.createElement('div');
          div.style.textAlign = alignment;

          try {
            // Envelopper la sélection dans la div alignée
            range.surroundContents(div);
          } catch {
            // Si surroundContents échoue, utiliser une approche différente
            const contents = range.extractContents();
            div.appendChild(contents);
            range.insertNode(div);
          }

          // Restaurer la sélection
          selection.removeAllRanges();
          selection.addRange(range);

        } else {
          // Si aucune sélection, utiliser la commande standard
          document.execCommand(command, false, value);
        }

        setContent(editorRef.current.innerHTML);
        return;
      } else {
        document.execCommand(command, false, value);
      }

      setContent(editorRef.current.innerHTML);
    }
  }, []);

  const changeFontSize = useCallback((size: string) => {
    if (editorRef.current) {
      editorRef.current.focus();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = size;
        try {
          range.surroundContents(span);
        } catch {
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

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontFamily = family;
        try {
          range.surroundContents(span);
        } catch {
          document.execCommand('fontName', false, family);
        }
      } else {
        document.execCommand('fontName', false, family);
      }

      setCurrentFontFamily(family);
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  const changeTextColor = useCallback((color: string) => {
    if (editorRef.current) {
      editorRef.current.focus();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.color = color;
        try {
          range.surroundContents(span);
        } catch {
          document.execCommand('foreColor', false, color);
        }
      } else {
        document.execCommand('foreColor', false, color);
      }

      setContent(editorRef.current.innerHTML);
    }
  }, []);

  const insertImage = useCallback(() => {
    const imageUrl = prompt('URL de l\'image:');
    if (imageUrl) {
      const altText = prompt('Texte alternatif (optionnel):') || 'Image';
      const img = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
      execCommand('insertHTML', img);
    }
  }, [execCommand]);

  return {
    // État
    content,
    currentTemplate,
    showSidebar,
    showColorPicker,
    showFontSize,
    showFontFamily,
    showLinkDialog,
    showMarginGuides,
    showBorders,
    allowMultiplePages,
    currentFontSize,
    currentFontFamily,
    linkUrl,
    linkText,
    notification,

    // Refs
    editorRef,
    editorContainerRef,

    // Données dérivées
    templates,

    // Actions
    setContent,
    setCurrentTemplate,
    setActiveTab,
    showNotification,
    loadTemplate,

    // Toggle actions
    toggleSidebar,
    toggleFontFamily,
    toggleFontSize,
    toggleColorPicker,
    toggleMarginGuides,
    toggleBorders,
    toggleMultiplePages,

    // Actions UI
    setShowColorPicker,
    setShowFontSize,
    setShowFontFamily,

    // Actions liens
    insertLink,
    confirmLink,
    cancelLink,
    setLinkUrl,
    setLinkText,

    // Actions formatage
    execCommand,
    changeFontSize,
    changeFontFamily,
    changeTextColor,
    insertImage,

    // Setters
    setCurrentFontSize,
    setCurrentFontFamily,

    // Actions
    saveToLocalStorage: useCallback(() => {
      try {
        const dataToSave = {
          content,
          template: currentTemplate
        };
        localStorage.setItem('letter-editor-content', JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }, [content, currentTemplate]),
  };
};
