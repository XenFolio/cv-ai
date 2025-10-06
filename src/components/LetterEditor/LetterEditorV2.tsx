import React, { useEffect, useCallback } from 'react';
import { BreadcrumbNavigation } from '../UI/BreadcrumbNavigation';
import { NavigationIcons } from '../UI/iconsData';
import { TemplateCarousel } from './TemplateCarousel';
import { LetterTemplateSkeleton } from './LetterTemplateSkeleton';
import { LinkDialog } from './LinkDialog';
import { EditorFooter } from './EditorFooter';
import { MarginModal } from './MarginModal';
import { NewToolbar } from './NewToolbar';
import { EditorContent } from './EditorContent';
import { NotificationToast } from './NotificationToast';
import { useLetterEditor } from '../../hooks/useLetterEditor';
import { useMarginManager } from '../../hooks/useMarginManager';
import { LetterExportService } from '../../services/LetterExportService';
import { useOpenAI, GrammarError, StyleSuggestion } from '../../hooks/useOpenAI';
import { useProfile } from '../../hooks/useProfile';
import { X, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import ATSReportExport from '../CVAnalysis/ATSReportExport';
import type { Template } from '../CVCreator/templates';

// Étendre l'interface Window pour les propriétés personnalisées
declare global {
  interface Window {
    originalHTMLForGrammar?: string;
  }
}

interface LetterEditorV2Props {
  onSave?: (content: string) => void;
  onExport?: (content: string, format: 'pdf' | 'docx' | 'html' | 'text') => void;
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

export const LetterEditorV2: React.FC<LetterEditorV2Props> = ({
  onSave,
  onExport,
  initialContent = '',
  formData,
}) => {
  // État pour le chargement des templates
  const [templatesLoading, setTemplatesLoading] = React.useState<boolean>(true);

  // États pour la modale d'analyse grammaticale
  const [showGrammarModal, setShowGrammarModal] = React.useState(false);
  const [grammarErrors, setGrammarErrors] = React.useState<GrammarError[]>([]);
  const [originalTextForGrammar, setOriginalTextForGrammar] = React.useState('');
  const [correctedTextForGrammar, setCorrectedTextForGrammar] = React.useState('');
  const [activeGrammarTab, setActiveGrammarTab] = React.useState<'correction' | 'suggestions'>('correction');
  const [styleSuggestions, setStyleSuggestions] = React.useState<StyleSuggestion[]>([]);

  // Hooks principaux
  const letterEditor = useLetterEditor({ initialContent, formData });
  const openAI = useOpenAI();
  const { profile, getFullName } = useProfile();
  const marginManager = useMarginManager({
    onMarginsChange: () => {
      // Synchroniser les marges avec le reste de l'application
    },
    showNotification: letterEditor.showNotification,
    editorRef: letterEditor.editorRef,
    editorContainerRef: letterEditor.editorContainerRef
  });

  // Effet pour gérer l'affichage/masquage des bordures
  useEffect(() => {
    const toggleBorder = () => {
      const letterContents = document.querySelectorAll('.letter-content');
      letterContents.forEach((element) => {
        if (letterEditor.showBorders) {
          (element as HTMLElement).style.border = '1px solid #9ca3af';
        } else {
          (element as HTMLElement).style.border = '1px solid transparent';
        }
      });
    };

    toggleBorder();
  }, [letterEditor.showBorders]);

  // Effet pour fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Ne pas fermer si on clique sur les boutons de la toolbar
      if (target.closest('.bg-white.rounded-t-lg')) {
        return;
      }

      if (letterEditor.showColorPicker && !target.closest('.color-picker')) {
        letterEditor.setShowColorPicker(false);
      }
      if (letterEditor.showFontSize && !target.closest('.font-size')) {
        letterEditor.setShowFontSize(false);
      }
      if (letterEditor.showFontFamily && !target.closest('.font-family')) {
        letterEditor.setShowFontFamily(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [letterEditor]);

  // Simuler le chargement des templates
  useEffect(() => {
    const timer = setTimeout(() => {
      setTemplatesLoading(false);
    }, 2000); // 2 secondes de chargement

    return () => clearTimeout(timer);
  }, []);

  // Export PDF (utilise LetterExportService)
  const exportToPDF = async () => {
    if (!letterEditor.editorRef.current) return;

    try {
      const content = letterEditor.editorRef.current.innerHTML;
      console.log('Contenu à exporter:', content);

      const currentTemplateData = letterEditor.templates[letterEditor.currentTemplate as keyof typeof letterEditor.templates];
      console.log('Template data:', currentTemplateData);

      await LetterExportService.exportToPDF(content, {
        format: 'pdf',
        filename: 'lettre-motivation.pdf',
        margins: marginManager.customMargins,
        showBorders: letterEditor.showBorders,
        allowMultiplePages: letterEditor.allowMultiplePages,
        template: currentTemplateData.style
      });

      if (onExport) {
        onExport(content, 'pdf');
      }

      letterEditor.showNotification('PDF exporté avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      letterEditor.showNotification('Erreur lors de l\'export PDF. Veuillez réessayer.', 'error');
    }
  };

  // Export en texte brut optimisé pour ATS
  const exportToText = () => {
    if (!letterEditor.editorRef.current) return;

    try {
      const content = letterEditor.editorRef.current.innerHTML;
      console.log('Contenu à exporter en texte:', content);

      LetterExportService.exportToText(content, {
        format: 'text',
        filename: 'lettre-motivation-ats.txt'
      });

      if (onExport) {
        onExport(content, 'text');
      }

      letterEditor.showNotification('Fichier texte ATS exporté avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'export texte:', error);
      letterEditor.showNotification('Erreur lors de l\'export texte. Veuillez réessayer.', 'error');
    }
  };

  // Export PDF optimisé pour ATS
  const exportToATSOptimizedPDF = async () => {
    if (!letterEditor.editorRef.current) return;

    try {
      const content = letterEditor.editorRef.current.innerHTML;
      console.log('Contenu à exporter en PDF ATS optimisé:', content);

      const currentTemplateData = letterEditor.templates[letterEditor.currentTemplate as keyof typeof letterEditor.templates];

      await LetterExportService.exportToATSOPtimizedPDF(content, {
        format: 'pdf',
        filename: 'lettre-motivation-ats-optimisee.pdf',
        margins: marginManager.customMargins,
        template: currentTemplateData.style
      });

      if (onExport) {
        onExport(content, 'pdf');
      }

      letterEditor.showNotification('PDF ATS optimisé exporté avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF ATS optimisé:', error);
      letterEditor.showNotification('Erreur lors de l\'export PDF ATS optimisé. Veuillez réessayer.', 'error');
    }
  };

  // Analyse ATS de la lettre
  const handleATSAnalysis = useCallback(async () => {
    if (!letterEditor.editorRef.current) return;

    try {
      // Importer dynamiquement les modules nécessaires
      const [{ generateQuickLetterATSAnalysis }] = await Promise.all([
        import('../CVCreator/modules/ExportModule').then(m => ({
          generateQuickLetterATSAnalysis: m.generateQuickLetterATSAnalysis
        }))
      ]);

    
      // Récupérer le contenu de la lettre
      const letterContent = letterEditor.content;
      const currentTemplateData = letterEditor.templates[letterEditor.currentTemplate as keyof typeof letterEditor.templates];

      // Créer un objet Template compatible pour l'analyse ATS des lettres
      const templateForATS: Template = {
        id: letterEditor.currentTemplate,
        name: currentTemplateData.name,
        description: `${currentTemplateData.name} - Template de lettre de motivation`,
        preview: currentTemplateData.preview,
        image: '',
        category: 'Lettre', // Catégorie par défaut pour les lettres
        atsScore: 85, // Score de base pour les lettres
        theme: { primaryColor: '#000000', font: currentTemplateData.style.fontFamily },
        layoutColumns: 1,
        sectionTitles: {
          profileTitle: '',
          experienceTitle: '',
          educationTitle: '',
          skillsTitle: '',
          languagesTitle: '',
          contactTitle: ''
        },
        sectionsOrder: []
      };

      // Générer l'analyse ATS spécifique pour les lettres
      const analysis = generateQuickLetterATSAnalysis(templateForATS, letterContent, formData || {});

      // Créer le modal pour afficher le rapport ATS
      const modalRoot = document.createElement('div');
      modalRoot.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;

      const { createElement } = await import('react');
      const { createRoot } = await import('react-dom/client');

      const modal = createElement('div', {
        style: {
          background: 'white',
          borderRadius: '12px',
          padding: '0',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }
      }, [
        // Bouton de fermeture
        createElement('button', {
          key: 'close',
          onClick: () => {
            document.body.removeChild(modalRoot);
          },
          style: {
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px'
          }
        }, '✕'),

        // En-tête
        createElement('div', {
          key: 'header',
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '12px 12px 0 0'
          }
        }, [
          createElement('h2', {
            key: 'title',
            style: { margin: 0, fontSize: '24px', fontWeight: 'bold' }
          }, 'Analyse ATS et Export PDF'),
          createElement('p', {
            key: 'subtitle',
            style: { margin: '8px 0 0 0', opacity: 0.9 }
          }, 'Rapport d\'optimisation pour les systèmes de suivi des candidatures')
        ]),

        // Contenu du rapport ATS
        createElement(ATSReportExport, {
          key: 'ats-report',
          analysis,
          candidateInfo: {
            name: getFullName() || (profile?.first_name && profile?.last_name)
              ? `${profile!.first_name} ${profile!.last_name}`
              : profile?.email || 'Utilisateur',
            email: profile?.email || '',
            position: profile?.profession || profile?.company || 'Professionnel'
          },
          jobInfo: {
            title: formData?.poste || 'Poste visé',
            company: formData?.entreprise || 'Entreprise',
            description: `Lettre de motivation pour le secteur ${formData?.secteur || 'Non spécifié'}`
          }
        })
      ]);

      const root = createRoot(modalRoot);
      root.render(modal);

      // Ajouter au DOM
      document.body.appendChild(modalRoot);

      // Fermer le modal quand on clique en dehors
      const handleClickOutside = (event: MouseEvent) => {
        if (event.target === modalRoot) {
          document.body.removeChild(modalRoot);
        }
      };

      modalRoot.addEventListener('click', handleClickOutside);

    } catch (error) {
      console.error('Erreur lors de l\'analyse ATS:', error);
      letterEditor.showNotification('Erreur lors de l\'analyse ATS. Veuillez réessayer.', 'error');
    }
  }, [letterEditor, formData, profile, getFullName]);

  // Gestionnaire d'action IA
  const handleAIAction = async () => {
    if (!letterEditor.editorRef.current) return;

    const currentContent = letterEditor.content.trim();

    try {
      if (!currentContent) {
        // Mode génération : pas de contenu existant
        if (!formData) {
          letterEditor.showNotification('Veuillez remplir les informations du formulaire dans l\'onglet Lettre pour générer une lettre.', 'warning');
          return;
        }

        // Vérifier si les informations minimales sont disponibles
        const hasAnyInfo = formData.poste.trim() || formData.entreprise.trim() || formData.secteur.trim() || formData.experience.trim();
        if (!hasAnyInfo) {
          letterEditor.showNotification('Veuillez remplir au moins une information (poste, entreprise, secteur ou expérience) pour générer une lettre.', 'warning');
          return;
        }

        letterEditor.showNotification('✍️ Génération de votre lettre avec IA...', 'info');

        const { generateLetterContent } = await import('../../services/LetterAIService');

        const generatedContent = await generateLetterContent(
          formData,
          openAI.editCVField
        );

        if (generatedContent) {
          // Post-traitement pour s'assurer que les sauts de ligne sont corrects (sans markdown)
          const formattedContent = generatedContent
            .replace(/\*\*/g, '') // Supprimer le markdown gras
            .replace(/\*/g, '') // Supprimer le markdown italique
            .replace(/\n\n+/g, '<br><br>') // Convertir double sauts de ligne en sauts visibles
            .replace(/\n/g, '<br>') // Convertir sauts de ligne simples en <br>
            .replace(/^/, '') // Pas de balise <p> au début
            .replace(/$/, ''); // Pas de balise </p> à la fin

          letterEditor.setContent(formattedContent);
          LetterExportService.saveToLocalStorage(formattedContent, letterEditor.currentTemplate);
          letterEditor.showNotification('✅ Lettre générée avec succès !', 'success');
        } else {
          letterEditor.showNotification('Erreur lors de la génération. Vérifiez la clé API.', 'error');
        }
      } else {
        // Mode amélioration : contenu existant
        letterEditor.showNotification('✍️ Amélioration de votre lettre avec IA...', 'info');

        const { improveTextWithAI, detectTone, detectLanguage, analyzeStructure, extractKeywords } =
          await import('../../services/LetterAIService');

        // Construire une analyse locale du document pour fournir du contexte à l'IA
        const documentAnalysis = {
          hasFormulePolitesse: /(cordialement|sincèrement|respectueusement)/i.test(currentContent),
          tone: detectTone(currentContent),
          language: detectLanguage(currentContent),
          structure: analyzeStructure(currentContent),
          existingKeywords: extractKeywords(currentContent)
        };

        const improvedContent = await improveTextWithAI(
          currentContent,
          documentAnalysis,
          '', // pas d'analyse stockée
          openAI.editCVField
        );

        if (improvedContent) {
          // Post-traitement pour s'assurer que les sauts de ligne sont corrects (sans markdown)
          const formattedContent = improvedContent
            .replace(/\*\*/g, '') // Supprimer le markdown gras
            .replace(/\*/g, '') // Supprimer le markdown italique
            .replace(/\n\n+/g, '<br><br>') // Convertir double sauts de ligne en sauts visibles
            .replace(/\n/g, '<br>') // Convertir sauts de ligne simples en <br>
            .replace(/^/, '') // Pas de balise <p> au début
            .replace(/$/, ''); // Pas de balise </p> à la fin

          letterEditor.setContent(formattedContent);
          LetterExportService.saveToLocalStorage(formattedContent, letterEditor.currentTemplate);
          letterEditor.showNotification('✅ Lettre améliorée avec succès !', 'success');
        } else {
          letterEditor.showNotification('Erreur lors de l\'amélioration. Vérifiez la clé API.', 'error');
        }
      }
    } catch (error) {
      console.error('Erreur IA:', error);
      letterEditor.showNotification('Erreur lors du traitement IA.', 'error');
    }
  };


  // Sauvegarder (utilise LetterExportService)
  const handleSave = () => {
    if (!letterEditor.editorRef.current) return;

    try {
      const content = letterEditor.editorRef.current.innerHTML;

      // Sauvegarder dans localStorage
      LetterExportService.saveToLocalStorage(content, letterEditor.currentTemplate);

      // Exporter en HTML
      const currentTemplateData = letterEditor.templates[letterEditor.currentTemplate as keyof typeof letterEditor.templates];

      LetterExportService.exportToHTML(content, {
        format: 'html',
        filename: `lettre-motivation-${new Date().toISOString().split('T')[0]}.html`,
        template: currentTemplateData.style,
        margins: marginManager.customMargins
      });

      if (onSave) {
        onSave(content);
      }

      letterEditor.showNotification('Lettre sauvegardée avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      letterEditor.showNotification('Erreur lors de la sauvegarde. Veuillez réessayer.', 'error');
    }
  };

  // Gestion des marges depuis les templates
  const openRulesModal = () => {
    const currentTemplateData = letterEditor.templates[letterEditor.currentTemplate as keyof typeof letterEditor.templates];
    marginManager.openMarginModal(currentTemplateData.style.padding);
  };

  // Gestionnaire de contenu
  const handleContentInput = (content: string) => {
    letterEditor.setContent(content);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Correction grammaticale avec analyse et modale
  const handleGrammarCheck = async () => {
    if (!letterEditor.editorRef.current) return;

    try {
      letterEditor.showNotification('🔍 Analyse grammaticale en cours...', 'info');

      // Récupérer le contenu actuel de l'éditeur
      const currentContent = letterEditor.editorRef.current.innerHTML;

      if (!currentContent.trim()) {
        letterEditor.showNotification('Aucun texte à analyser.', 'warning');
        return;
      }

      // Préserver les <br> en les marquant AVANT l'extraction du texte
      let markedContent = currentContent;
      let brIndex = 0;

      // Marquer chaque <br> avec un index unique pour préserver la position exacte
      markedContent = markedContent.replace(/<br[^>]*>/gi, () => `[[BR_MARKER_${brIndex++}]]`);

      // Marquer les fins de paragraphes
      markedContent = markedContent.replace(/<\/p>/gi, () => `[[P_MARKER_${brIndex++}]]`);
      markedContent = markedContent.replace(/<p[^>]*>/gi, ''); // Supprimer les balises <p> ouvrantes

      // Extraire le texte brut pour l'analyse en préservant les marqueurs
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = markedContent;
      let plainText = tempDiv.textContent || tempDiv.innerText || '';

      // Remplacer les marqueurs par des sauts de ligne pour l'IA
      plainText = plainText.replace(/\[\[BR_MARKER_\d+\]\]/gi, '\n');
      plainText = plainText.replace(/\[\[P_MARKER_\d+\]\]/gi, '\n\n');

      // Conserver le HTML original pour la restauration finale
      const originalHTML = currentContent;

      // Appeler la fonction d'analyse des erreurs grammaticales
      const analysisResult = await openAI.analyzeGrammarErrors(plainText);

      if (analysisResult && analysisResult.errors.length > 0) {
        // Améliorer les positions des erreurs en les recalculant par rapport au HTML
        const improvedErrors = analysisResult.errors.map(error => {
          // Chercher le texte de l'erreur dans le contenu HTML original
          const htmlContent = originalHTML;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;
          const fullHtmlText = tempDiv.textContent || tempDiv.innerText || '';

          // Trouver la position réelle dans le HTML
          const htmlPosition = fullHtmlText.indexOf(error.original);

          if (htmlPosition !== -1) {
            return {
              ...error,
              htmlPosition: {
                start: htmlPosition,
                end: htmlPosition + error.original.length
              }
            };
          }

          // Si pas trouvé, retourner l'erreur originale
          return error;
        });

        // Stocker les résultats améliorés pour la modale
        setGrammarErrors(improvedErrors);
        setOriginalTextForGrammar(plainText);
        setCorrectedTextForGrammar(analysisResult.correctedText);

        // Stocker aussi l'HTML original pour la restauration finale
        window.originalHTMLForGrammar = originalHTML;

        // Afficher la modale d'analyse
        setShowGrammarModal(true);
        letterEditor.showNotification(`✅ ${analysisResult.errors.length} erreur${analysisResult.errors.length > 1 ? 's' : ''} détectée${analysisResult.errors.length > 1 ? 's' : ''}`, 'info');
      } else {
        letterEditor.showNotification('✅ Aucune erreur détectée ! Votre texte est parfait.', 'success');
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse grammaticale:', error);
      letterEditor.showNotification('Erreur lors de l\'analyse grammaticale. Veuillez réessayer.', 'error');
    }
  };

  const handleStyleSuggestions = async () => {
    if (!letterEditor.editorRef.current) return;

    try {
      letterEditor.showNotification('💡 Analyse stylistique en cours...', 'info');

      // Récupérer le contenu actuel de l'éditeur
      const currentContent = letterEditor.editorRef.current.innerHTML;

      if (!currentContent.trim()) {
        letterEditor.showNotification('Aucun texte à analyser.', 'warning');
        return;
      }

      // Extraire le texte brut pour l'analyse
      const textContent = currentContent.replace(/<[^>]*>/g, '');

      // Appeler l'API pour les suggestions stylistiques
      const suggestions = await openAI.suggestStyleImprovements(textContent);

      if (suggestions && suggestions.length > 0) {
        setStyleSuggestions(suggestions);
        setOriginalTextForGrammar(textContent);
        setActiveGrammarTab('suggestions');
        setShowGrammarModal(true);
        letterEditor.showNotification(`💡 ${suggestions.length} suggestion${suggestions.length > 1 ? 's' : ''} stylistique${suggestions.length > 1 ? 's' : ''} disponible${suggestions.length > 1 ? 's' : ''}`, 'info');
      } else {
        letterEditor.showNotification('✅ Votre texte est déjà bien formulé !', 'success');
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse stylistique:', error);
      letterEditor.showNotification('Erreur lors de l\'analyse stylistique. Veuillez réessayer.', 'error');
    }
  };

  // Appliquer une seule correction
  const handleApplySingleCorrection = (error: GrammarError) => {
    if (!letterEditor.editorRef.current) return;

    try {
      // Méthode améliorée: faire un recherche/remplacement intelligent dans le HTML
      const currentHTML = letterEditor.editorRef.current.innerHTML;

      // Créer une fonction pour remplacer en préservant le HTML existant
      const replaceInHTML = (html: string, search: string, replace: string): string => {
        // Échapper les caractères spéciaux pour la recherche
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Chercher et remplacer seulement dans les parties texte (pas dans les balises)
        const regex = new RegExp(`(^|>)([^<]*?)(${escapedSearch})([^<]*?)(<|$)`, 'gi');

        let newHTML = html;
        let match;
        let replacements = 0;

        while ((match = regex.exec(html)) !== null && replacements < 1) { // Limiter à 1 remplacement
          const fullMatch = match[0];
          const beforeTag = match[1];
          const beforeText = match[2];
          const searchText = match[3];
          const afterText = match[4];
          const afterTag = match[5];

          // Vérifier que c'est bien le texte qu'on cherche (case insensitive)
          if (searchText.toLowerCase() === search.toLowerCase()) {
            const replacement = beforeTag + beforeText + replace + afterText + afterTag;
            newHTML = newHTML.replace(fullMatch, replacement);
            replacements++;
            break;
          }
        }

        return newHTML;
      };

      // Appliquer la correction dans le HTML
      const updatedHTML = replaceInHTML(currentHTML, error.original, error.correction);

      // Vérifier si le remplacement a fonctionné
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = updatedHTML;
      const updatedText = tempDiv.textContent || tempDiv.innerText || '';

      if (updatedText.includes(error.correction) && !updatedText.includes(error.original)) {
        // Succès: mettre à jour l'éditeur avec le HTML corrigé
        letterEditor.setContent(updatedHTML);
        LetterExportService.saveToLocalStorage(updatedHTML, letterEditor.currentTemplate);
      } else {
        // Échec: utiliser la méthode de repli (reconstruction complète)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = currentHTML;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';

        const correctedText = plainText.replace(
          new RegExp(error.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          error.correction
        );

        // Reconstruire le HTML en préservant les sauts de ligne
        let formattedContent = correctedText
          .replace(/\n\n+/g, '</p><p><br><br>')
          .replace(/\n/g, '<br>')
          .replace(/^/, '<p>')
          .replace(/$/, '</p>');

        formattedContent = formattedContent.replace(/<p><\/p>/g, '<p>&nbsp;</p>');
        formattedContent = formattedContent.replace(/<p><br><\/p>/g, '<p>&nbsp;</p>');
        formattedContent = formattedContent.replace(/<\/p><p>/g, '</p><br><br><p>');

        letterEditor.setContent(formattedContent);
        LetterExportService.saveToLocalStorage(formattedContent, letterEditor.currentTemplate);
      }

      // Retirer l'erreur de la liste (approche simplifiée)
      setGrammarErrors(prev => prev.filter(e => !(e.original === error.original && e.correction === error.correction)));

      // S'il n'y a plus d'erreurs, fermer la modale
      if (grammarErrors.length <= 1) {
        setShowGrammarModal(false);
        setGrammarErrors([]);
        setOriginalTextForGrammar('');
        setCorrectedTextForGrammar('');
        delete window.originalHTMLForGrammar;
      }

      letterEditor.showNotification('✅ Correction appliquée avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'application de la correction:', error);
      letterEditor.showNotification('Erreur lors de l\'application de la correction.', 'error');
    }
  };

  // Appliquer une suggestion stylistique individuelle
  const handleApplyStyleSuggestion = (paragraphIndex: number, suggestedText: string) => {
    if (!letterEditor.editorRef.current) return;

    try {
      const editor = letterEditor.editorRef.current;
      const currentHTML = editor.innerHTML;

      // Extraire le texte actuel de l'éditeur
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = currentHTML;
      const currentText = tempDiv.textContent || tempDiv.innerText || '';

      // Diviser le texte en paragraphes
      const paragraphs = currentText.split(/\n\n+/);

      // Vérifier que l'index du paragraphe est valide
      if (paragraphIndex >= 0 && paragraphIndex < paragraphs.length) {
        // Remplacer le paragraphe spécifique
        paragraphs[paragraphIndex] = suggestedText;

        // Reconstruire le texte complet
        const newText = paragraphs.join('\n\n');

        // Convertir en HTML en préservant la structure
        let formattedContent = newText
          .replace(/\n\n+/g, '</p><p><br><br>') // Doubles sauts de ligne = paragraphes
          .replace(/\n/g, '<br>') // Sauts simples = <br>
          .replace(/^/, '<p>') // Ajouter la première balise p
          .replace(/$/, '</p>'); // Ajouter la dernière balise p

        // Nettoyer les paragraphes vides mais préserver les <br> importants
        formattedContent = formattedContent.replace(/<p><\/p>/g, '<p>&nbsp;</p>');
        formattedContent = formattedContent.replace(/<p><br><\/p>/g, '<p>&nbsp;</p>');
        formattedContent = formattedContent.replace(/<p><br><br><\/p>/g, '<p>&nbsp;</p>');

        // S'assurer que les paragraphes consécutifs ont bien des <br> entre eux
        formattedContent = formattedContent.replace(/<\/p><p>/g, '</p><br><br><p>');

        // Mettre à jour l'éditeur
        letterEditor.setContent(formattedContent);
        LetterExportService.saveToLocalStorage(formattedContent, letterEditor.currentTemplate);

        // Retirer la suggestion appliquée de la liste
        setStyleSuggestions(prev => prev.filter((_, index) => index !== paragraphIndex));

        // Fermer la modale s'il n'y a plus de suggestions
        if (styleSuggestions.length <= 1) {
          setShowGrammarModal(false);
          setStyleSuggestions([]);
          setActiveGrammarTab('correction');
        }

        letterEditor.showNotification('✅ Suggestion stylistique appliquée avec succès !', 'success');
      } else {
        letterEditor.showNotification('❌ Impossible de trouver le paragraphe à modifier.', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de l\'application de la suggestion stylistique:', error);
      letterEditor.showNotification('❌ Erreur lors de l\'application de la suggestion.', 'error');
    }
  };

  // Appliquer toutes les corrections
  const handleApplyAllCorrections = () => {
    if (!letterEditor.editorRef.current) return;

    try {
      // Utiliser directement le texte corrigé fourni par l'IA
      // C'est plus fiable car l'IA a déjà appliqué toutes les corrections
      let formattedContent = correctedTextForGrammar;

      // Reconstruire le HTML en préservant TOUS les sauts de ligne de manière visible
      formattedContent = formattedContent
        .replace(/\n\n+/g, '</p><p><br><br>') // Doubles sauts de ligne = paragraphes séparés par des sauts visibles
        .replace(/\n/g, '<br>') // Sauts simples = <br>
        .replace(/^/, '<p>') // Ajouter la première balise p
        .replace(/$/, '</p>'); // Ajouter la dernière balise p

      // Nettoyer les paragraphes vides mais préserver les <br> importants
      formattedContent = formattedContent.replace(/<p><\/p>/g, '<p>&nbsp;</p>');
      formattedContent = formattedContent.replace(/<p><br><\/p>/g, '<p>&nbsp;</p>');
      formattedContent = formattedContent.replace(/<p><br><br><\/p>/g, '<p>&nbsp;</p>');

      // S'assurer que les paragraphes consécutifs ont bien des <br> entre eux pour l'espacement visuel
      formattedContent = formattedContent.replace(/<\/p><p>/g, '</p><br><br><p>');

      // Nettoyer les double <br> qui pourraient apparaître
      formattedContent = formattedContent.replace(/<br><br><br><br>/g, '<br><br>');
      formattedContent = formattedContent.replace(/<br><br><br>/g, '<br><br>');

      // Mettre à jour l'éditeur avec le contenu corrigé
      letterEditor.setContent(formattedContent);
      LetterExportService.saveToLocalStorage(formattedContent, letterEditor.currentTemplate);

      // Fermer la modale et vider les erreurs
      setShowGrammarModal(false);
      setGrammarErrors([]);
      setOriginalTextForGrammar('');
      setCorrectedTextForGrammar('');
      delete window.originalHTMLForGrammar;

      letterEditor.showNotification('✅ Toutes les corrections ont été appliquées avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'application des corrections:', error);
      letterEditor.showNotification('Erreur lors de l\'application des corrections.', 'error');
    }
  };



  // Fonction pour colorer le texte avec les erreurs - approche sans décalage
  const renderTextWithErrors = (text: string, errors: GrammarError[], onApplyCorrection?: (error: GrammarError) => void) => {
    if (errors.length === 0) return text;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Créer des erreurs améliorées avec des positions recalculées dans le texte actuel
    const improvedErrors = errors.map(error => {
      // Chercher le texte de l'erreur dans le texte fourni
      const position = text.indexOf(error.original);

      if (position !== -1) {
        return {
          ...error,
          position: {
            start: position,
            end: position + error.original.length
          }
        };
      }

      // Si pas trouvé, retourner l'erreur originale (elle ne sera pas surlignée)
      return error;
    }).filter(error => {
      // Garder seulement les erreurs qui ont été trouvées dans le texte
      const textSegment = text.substring(error.position.start, error.position.end);
      return textSegment === error.original || text.indexOf(error.original) !== -1;
    });

    // Trier les erreurs par position recalculée
    const sortedErrors = [...improvedErrors].sort((a, b) => a.position.start - b.position.start);

    const handleMouseMove = (e: React.MouseEvent, errorIndex: number) => {
      const tooltip = document.getElementById(`tooltip-${errorIndex}`);
      if (tooltip) {
        const rect = e.currentTarget.getBoundingClientRect();
        // Positionner le centre du tooltip exactement au centre du texte souligné
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 8}px`;
        // Le transform translate(-50%, -100%) déplace le tooltip pour le centrer horizontalement et le placer au-dessus
      }
    };

    sortedErrors.forEach((error, index) => {
      // Ajouter le texte avant l'erreur
      if (error.position.start > lastIndex) {
        elements.push(
          <span key={`text-${index}`} style={{ display: 'inline' }}>
            {text.substring(lastIndex, error.position.start)}
          </span>
        );
      }

      // Ajouter le texte avec l'erreur - approche ultra-simple pour un alignement parfait
      elements.push(
        <span
          key={`error-${index}`}
          className={`relative inline cursor-help group ${
            error.severity === 'critique' ? 'text-red-600' :
            error.severity === 'majeure' ? 'text-orange-600' :
            'text-blue-600'
          }`}
          style={{
            display: 'inline',
            textDecoration: 'underline',
            textDecorationColor: error.severity === 'critique' ? '#dc2626' :
                                 error.severity === 'majeure' ? '#ea580c' : '#2563eb',
            textDecorationThickness: '2px',
            textDecorationSkipInk: 'none',
            fontWeight: '500'
          }}
          title={`${error.type}: ${error.explanation}`}
          onMouseMove={(e) => handleMouseMove(e, index)}
        >
          {error.original}

          {/* Tooltip positionné dynamiquement */}
          <div
            id={`tooltip-${index}`}
            className="fixed opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-[9999] max-w-xs shadow-lg"
            style={{
              pointerEvents: 'none',
              left: '0px',
              top: '0px',
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2">
              <div className="font-semibold text-yellow-300 mb-1">{error.type}</div>
              <div className="mb-1">{error.explanation}</div>
              <div className="text-green-300 font-semibold">→ {error.correction}</div>
              {onApplyCorrection && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onApplyCorrection(error);
                  }}
                  className="mt-2 w-full px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                  style={{ pointerEvents: 'auto' }}
                  title="Appliquer cette correction"
                >
                  Appliquer
                </button>
              )}
            </div>
            {/* Flèche du tooltip */}
            <div
              className="absolute top-full left-1/2 w-0 h-0"
              style={{
                transform: 'translateX(-50%)',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #1f2937'
              }}
            />
          </div>
        </span>
      );

      lastIndex = error.position.end;
    });

    // Ajouter le reste du texte
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end" style={{ display: 'inline' }}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  const currentTemplateData = letterEditor.templates[letterEditor.currentTemplate as keyof typeof letterEditor.templates];

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      {/* Notification Toast */}
      <NotificationToast
        message={letterEditor.notification.message}
        type={letterEditor.notification.type}
        visible={letterEditor.notification.visible}
      />

      {/* Breadcrumb Navigation */}
      <div className="max-w-full mx-auto px-4 py-0">
        <BreadcrumbNavigation
          items={[
            {
              label: 'Accueil',
              icon: NavigationIcons.Home,
              onClick: () => letterEditor.setActiveTab('dashboard')
            },
            {
              label: 'Lettre',
              onClick: () => letterEditor.setActiveTab('letter-editor')
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
          <NewToolbar
            // Formatage
            currentFont={letterEditor.currentFontFamily}
            currentFontSize={letterEditor.currentFontSize}
            showFontFamily={letterEditor.showFontFamily}
            showFontSize={letterEditor.showFontSize}
            showColorPicker={letterEditor.showColorPicker}
            onFontChange={letterEditor.changeFontFamily}
            onFontSizeChange={letterEditor.changeFontSize}
            onColorChange={letterEditor.changeTextColor}
            onToggleFontFamily={letterEditor.toggleFontFamily}
            onToggleFontSize={letterEditor.toggleFontSize}
            onToggleColorPicker={letterEditor.toggleColorPicker}
            onFormatCommand={letterEditor.execCommand}
            onAlignCommand={(alignment) => letterEditor.execCommand(`justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`)}

            // Actions
            onUndo={() => document.execCommand('undo')}
            onRedo={() => document.execCommand('redo')}
            onInsertLink={letterEditor.insertLink}
            onInsertImage={letterEditor.insertImage}
            onAIAction={handleAIAction}
            onCheckGrammar={handleGrammarCheck}
            onStyleSuggestions={handleStyleSuggestions}
            isAILoading={openAI.isLoading}

            // Export
            onSave={handleSave}
            onExportPDF={exportToPDF}
            onExportText={exportToText}
            onExportATSOptimizedPDF={exportToATSOptimizedPDF}
            onATSAnalysis={handleATSAnalysis}
            
            // Options
            showSidebar={letterEditor.showSidebar}
            onToggleSidebar={letterEditor.toggleSidebar}
            showMarginGuides={letterEditor.showMarginGuides}
            onToggleMarginGuides={letterEditor.toggleMarginGuides}
            showBorders={letterEditor.showBorders}
            onToggleBorders={letterEditor.toggleBorders}
            onOpenRulesModal={openRulesModal}
            allowMultiplePages={letterEditor.allowMultiplePages}
            onToggleMultiplePages={letterEditor.toggleMultiplePages}
          />

          {/* Link Dialog */}
          <LinkDialog
            isVisible={letterEditor.showLinkDialog}
            linkUrl={letterEditor.linkUrl}
            linkText={letterEditor.linkText}
            onUrlChange={letterEditor.setLinkUrl}
            onTextChange={letterEditor.setLinkText}
            onConfirm={() => letterEditor.confirmLink((html) => letterEditor.execCommand('insertHTML', html))}
            onCancel={letterEditor.cancelLink}
          />

          {/* Margin Modal */}
          <MarginModal
            isVisible={marginManager.showMarginModal}
            margins={marginManager.customMargins}
            onSave={marginManager.saveMargins}
            onCancel={marginManager.closeMarginModal}
          />

          {/* Editor Content */}
          <div className={`bg-gray-50 relative flex-1 overflow-auto ${!letterEditor.showBorders ? 'letter-no-borders' : ''}`} style={{ width: '100%', minHeight: '400px' }} ref={letterEditor.editorContainerRef}>
            <EditorContent
              editorRef={letterEditor.editorRef}
              content={letterEditor.content}
              currentTemplate={currentTemplateData}
              showBorders={letterEditor.showBorders}
              onInput={handleContentInput}
              onPaste={handlePaste}
              initialContent={initialContent}
            />
          </div>

          {/* Footer */}
          <EditorFooter
            currentTemplateName={currentTemplateData.name}
            characterCount={letterEditor.editorRef.current?.innerHTML.length || 0}
            autoSaveEnabled={true}
          />
        </div>

        {/* Template Carousel OU Modale d'analyse grammaticale */}
        <div className={`w-full lg:w-1/3 order-first transition-all duration-300 ${letterEditor.showSidebar ? 'block' : 'hidden lg:block'}`}>
          {showGrammarModal ? (
            /* Modale d'analyse grammaticale (remplace le carousel) */
            <div className="bg-white rounded-lg shadow-lg">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <h2 className="text-xl font-bold">Correction Grammaticale</h2>
                  </div>
                  <button
                    onClick={() => setShowGrammarModal(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    title="Fermer l'analyse"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Contenu de l'analyse avec onglets */}
              <div className="p-4 max-h-[600px] overflow-y-auto">
                {/* Onglets */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setActiveGrammarTab('correction')}
                    className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                      activeGrammarTab === 'correction'
                        ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    🔍 Correction grammaticale
                  </button>
                  <button
                    onClick={() => setActiveGrammarTab('suggestions')}
                    className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                      activeGrammarTab === 'suggestions'
                        ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    💡 Suggestions stylistiques
                  </button>
                </div>

                {/* Contenu de l'onglet actif */}
                {activeGrammarTab === 'correction' && (
                  <div className="space-y-4">
                    {grammarErrors.length > 0 ? (
                      <>
                        {/* En-tête avec résumé */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4" />
                            {grammarErrors.length} erreur{grammarErrors.length > 1 ? 's' : ''} détectée{grammarErrors.length > 1 ? 's' : ''}
                          </h3>
                          <p className="text-sm text-blue-700">
                            Corrections des erreurs d'orthographe, de grammaire et de ponctuation uniquement.
                            Les expressions et le style personnel sont préservés.
                          </p>
                        </div>

                        {/* Texte avec erreurs surlignées */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800">📄 Votre lettre avec les erreurs</h4>
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-gray-600">Critique</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                <span className="text-gray-600">Majeure</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-gray-600">Mineure</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-serif text-sm p-3 bg-gray-50 rounded border border-gray-100" style={{ fontVariantLigatures: 'normal', textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
                            {renderTextWithErrors(originalTextForGrammar, grammarErrors, handleApplySingleCorrection)}
                          </div>
                        </div>

                        {/* Actions globales */}
                        <div className="flex gap-3">
                          <button
                            onClick={handleApplyAllCorrections}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Appliquer toutes les corrections
                          </button>
                          <button
                            onClick={() => setShowGrammarModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-green-600 text-lg font-semibold mb-2">✅ Aucune erreur détectée !</div>
                        <p className="text-gray-600">Votre texte ne contient aucune faute d'orthographe ou de grammaire.</p>
                        <button
                          onClick={() => setActiveGrammarTab('suggestions')}
                          className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Voir les suggestions stylistiques →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeGrammarTab === 'suggestions' && (
                  <div className="space-y-4">
                    {styleSuggestions.length > 0 ? (
                      <>
                        {/* En-tête des suggestions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4" />
                            {styleSuggestions.length} suggestion{styleSuggestions.length > 1 ? 's' : ''} stylistique{styleSuggestions.length > 1 ? 's' : ''}
                          </h3>
                          <p className="text-sm text-blue-700">
                            Améliorations proposées pour enrichir votre vocabulaire et renforcer l'impact de votre texte.
                          </p>
                        </div>

                        {/* Liste des suggestions par paragraphe */}
                        {styleSuggestions.map((suggestion, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Paragraphe {index + 1}</h4>

                            {/* Texte original */}
                            <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-100">
                              <p className="text-sm text-gray-600 font-medium mb-1">Original :</p>
                              <p className="text-sm text-gray-800 italic">"{suggestion.originalText}"</p>
                            </div>

                            {/* Suggestions */}
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600 font-medium">Suggestions :</p>
                              {suggestion.suggestions.map((sugg, suggIndex) => (
                                <div key={suggIndex} className="flex items-start justify-between p-3 bg-blue-50 rounded border border-blue-100">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        sugg.type === 'vocabulary' ? 'bg-purple-100 text-purple-700' :
                                        sugg.type === 'structure' ? 'bg-green-100 text-green-700' :
                                        sugg.type === 'clarity' ? 'bg-yellow-100 text-yellow-700' :
                                        sugg.type === 'impact' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                      }`}>
                                        {sugg.type}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-800 mb-1">"{sugg.text}"</p>
                                    <p className="text-xs text-gray-600">{sugg.explanation}</p>
                                  </div>
                                  <button
                                    onClick={() => handleApplyStyleSuggestion(index, sugg.text)}
                                    className="ml-2 p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                    title="Appliquer cette suggestion"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowGrammarModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Fermer
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-600 text-lg font-semibold mb-2">Analysez votre texte</div>
                        <p className="text-gray-500 mb-4">Cliquez sur le bouton ci-dessous pour obtenir des suggestions stylistiques personnalisées.</p>
                        <button
                          onClick={handleStyleSuggestions}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          💡 Analyser le style
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Template Carousel normal */
            <>
              {templatesLoading ? (
                <LetterTemplateSkeleton />
              ) : (
                <>
                  <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 rounded-t-lg shadow-lg">
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5" />
                      <h2 className="text-xl font-bold">Modèles de Lettres</h2>
                    </div>
                  </div>
                  <TemplateCarousel
                    currentTemplate={letterEditor.currentTemplate}
                    onTemplateSelect={(templateKey) => {
                      letterEditor.loadTemplate(templateKey);
                      // Réappliquer les marges après le changement de template
                      setTimeout(() => marginManager.reapplyMargins(), 100);
                    }}
                    formData={formData}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
