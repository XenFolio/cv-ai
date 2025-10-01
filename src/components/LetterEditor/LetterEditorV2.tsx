import React, { useEffect } from 'react';
import { BreadcrumbNavigation } from '../UI/BreadcrumbNavigation';
import { NavigationIcons } from '../UI/iconsData';
import { TemplateCarousel } from './TemplateCarousel';
import { LinkDialog } from './LinkDialog';
import { EditorFooter } from './EditorFooter';
import { MarginModal } from './MarginModal';
import { NewToolbar } from './NewToolbar';
import { EditorContent } from './EditorContent';
import { NotificationToast } from './NotificationToast';
import { FileText } from 'lucide-react';
import { useLetterEditor } from '../../hooks/useLetterEditor';
import { useMarginManager } from '../../hooks/useMarginManager';
import { LetterExportService } from '../../services/LetterExportService';

interface LetterEditorV2Props {
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

export const LetterEditorV2: React.FC<LetterEditorV2Props> = ({
  onSave,
  onExport,
  initialContent = '',
  formData,
}) => {
  // Hooks principaux
  const letterEditor = useLetterEditor({ initialContent, formData });
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

            // Export
            onSave={handleSave}
            onExportPDF={exportToPDF}
            onTogglePreview={letterEditor.togglePreview}
            isPreview={letterEditor.isPreview}

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
              isPreview={letterEditor.isPreview}
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

        {/* Template Carousel */}
        <div className={`w-full lg:w-1/3 order-first transition-all duration-300 ${letterEditor.showSidebar ? 'block' : 'hidden lg:block'}`}>
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
        </div>
      </div>
    </div>
  );
};