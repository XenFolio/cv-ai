import React, { useEffect, useRef } from 'react';

type LetterTemplate = {
  style?: {
    fontFamily?: string;
    fontSize?: string;
    lineHeight?: string;
    color?: string;
  };
};

interface EditorContentProps {
  editorRef: React.RefObject<HTMLDivElement>;
  content: string;
  currentTemplate: LetterTemplate | undefined;
  showBorders: boolean;
  onInput: (content: string) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  initialContent?: string;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  editorRef,
  content,
  currentTemplate,
  showBorders,
  onInput,
  onPaste,
  initialContent,
}) => {
  const isInitializedRef = useRef(false);

  // Effet pour initialiser et mettre à jour le contenu
  useEffect(() => {
    if (editorRef.current) {
      // Si c'est la première initialisation
      if (!isInitializedRef.current) {
        editorRef.current.innerHTML = content || initialContent || '';
        isInitializedRef.current = true;
      } else {
        // Pour les mises à jour ultérieures (comme l'IA), ne remplacer que si le contenu a vraiment changé
        const currentHTML = editorRef.current.innerHTML;
        if (currentHTML !== content) {
          editorRef.current.innerHTML = content;
        }
      }
    }
  }, [content, initialContent, editorRef]);

/**
 * Renvoie les styles CSS pour le contenu de la lettre
 * en fonction du template actuel.
 * Les valeurs par défaut sont les suivantes:
 * - fontFamily: Arial
 * - fontSize: 12pt
 * - lineHeight: 1.6
 * - color: #333
 * - boxSizing: border-box
 * - width et height: 100%
 * - minHeight: 267mm (297mm - 30mm de marges)
 * - position: relative
 * - zIndex: 5
 * - overflow: visible
 * - border: 1px solid #e5e7eb si showBorders est à true, sinon 1px solid transparent
 * - backgroundColor: #ffffff
 * - padding et margin: 0
 */
  const getTemplateStyles = () => ({
    fontFamily: currentTemplate?.style?.fontFamily || 'Arial',
    fontSize: currentTemplate?.style?.fontSize || '12pt',
    lineHeight: currentTemplate?.style?.lineHeight || '1.6',
    color: currentTemplate?.style?.color || '#333',
    boxSizing: 'border-box' as const,
    width: '100%',
    height: '100%',
    minHeight: '267mm', // 297mm - 30mm de marges
    position: 'relative' as const,
    zIndex: 5,
    overflow: 'visible' as const,
    border: showBorders ? '1px solid #e5e7eb' : '1px solid transparent',
    backgroundColor: '#ffffff',
    padding: 0,
    margin: 0,
  });

  const handleInput = () => {
    const newContent = editorRef.current?.innerHTML || '';
    onInput(newContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Empêcher le comportement par défaut qui peut causer des problèmes
    if (e.key === 'Enter') {
      // Laisser le comportement normal de contentEditable
      // mais s'assurer qu'on ne perturbe pas le curseur
      setTimeout(() => {
        const newContent = editorRef.current?.innerHTML || '';
        onInput(newContent);
      }, 0);
    }
  };

  return (
    <div className="letter-root" style={{ width: '210mm', minHeight: '297mm', position: 'relative', margin: '0 auto', padding: '0' }}>
      <div className="letter-container" >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className={`letter-content outline-none bg-white mx-auto p-0`}
          style={getTemplateStyles()}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={onPaste}
        />
      </div>
    </div>
  );
};
