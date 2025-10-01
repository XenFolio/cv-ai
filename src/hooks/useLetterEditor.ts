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
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

export const useLetterEditor = ({ initialContent = '', formData }: LetterEditorOptions = {}) => {
  const setActiveTab = useAppStore(s => s.setActiveTab);

  // État de l'éditeur
  const [content, setContent] = useState(initialContent);
  const [currentTemplate, setCurrentTemplate] = useState('moderne');
  const [isPreview, setIsPreview] = useState(false);

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

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Templates
  const templates = useMemo(() => createTemplates(formData), [formData]);

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

  // Notifications
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 4000);
  }, []);

  // Templates
  const loadTemplate = useCallback((templateKey: string) => {
    setCurrentTemplate(templateKey);
    const templateData = createTemplates(formData);
    const newContent = templateData[templateKey as keyof typeof templateData].template;
    setContent(newContent);
  }, [formData]);

  // Toggle handlers
  const togglePreview = useCallback(() => setIsPreview(prev => !prev), []);
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
        // Logique spéciale pour l'alignement
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

          if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
            element = range.commonAncestorContainer.parentElement;
          }

          while (element && element !== editorRef.current) {
            const style = window.getComputedStyle(element);
            if (style.display === 'block' || style.display === 'flex' || element.tagName === 'DIV' || element.tagName === 'P') {
              element.style.textAlign = alignment;
              break;
            }
            element = element.parentElement;
          }

          if (!element || element === editorRef.current) {
            editorRef.current.style.textAlign = alignment;
          }
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
    isPreview,
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
    togglePreview,
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
  };
};