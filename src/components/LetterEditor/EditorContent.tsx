import React from 'react';

interface EditorContentProps {
  editorRef: React.RefObject<HTMLDivElement>;
  content: string;
  isPreview: boolean;
  currentTemplate: any;
  showBorders: boolean;
  onInput: (content: string) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  initialContent?: string;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  editorRef,
  content,
  isPreview,
  currentTemplate,
  showBorders,
  onInput,
  onPaste,
  initialContent,
}) => {
  const getTemplateStyles = () => ({
    fontFamily: currentTemplate?.style?.fontFamily || 'Arial',
    fontSize: currentTemplate?.style?.fontSize || '12pt',
    lineHeight: currentTemplate?.style?.lineHeight || '1.6',
    color: currentTemplate?.style?.color || '#333',
    boxSizing: 'border-box' as const,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    width: '210mm',
    minHeight: '297mm',
    position: 'relative' as const,
    zIndex: 5,
    marginBottom: '20px',
  });

  if (isPreview) {
    return (
      <div
        className={`outline-none bg-white shadow-lg mx-auto letter-container ${!showBorders ? 'letter-no-borders' : ''}`}
        style={getTemplateStyles()}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      className={`letter-root outline-none bg-white shadow-lg mx-auto p-0`}
      style={getTemplateStyles()}
      onInput={() => {
        const newContent = editorRef.current?.innerHTML || '';
        onInput(newContent);
      }}
      onPaste={onPaste}
      dangerouslySetInnerHTML={{
        __html: initialContent || currentTemplate?.template || ''
      }}
    />
  );
};