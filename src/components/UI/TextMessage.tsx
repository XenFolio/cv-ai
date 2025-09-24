import React, { useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface TextMessageProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  showAttachment?: boolean;
  className?: string;
  buttonOffset?: number; // <-- nouvelle prop
}

export const TextMessage: React.FC<TextMessageProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Écrivez votre message...",
  disabled = false,
  maxLength = 4000,
  showAttachment = false,
  className = "",
  buttonOffset = -2, // valeur par défaut (un poil plus haut)
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ajuster automatiquement la hauteur du textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSubmit();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && value.trim()) {
      onSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center gap-2 ${className}`}
    >
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl 
                     hover:border-violet-400 focus:outline-2 focus:outline-violet-500 
                     resize-none overflow-hidden transition-all duration-200 
                     bg-white/80 backdrop-blur-sm"
          rows={1}
          maxLength={maxLength}
          disabled={disabled}
        />

        {/* Bouton d'envoi intégré */}
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          style={{ transform: `translateY(${buttonOffset}px)` }} // <-- décalage dynamique
          className="absolute right-2 inset-y-0 my-auto 
                     flex items-center justify-center
                     w-10 h-10 
                     bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-full 
                     transition-all duration-200 
                     hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed 
                     disabled:hover:scale-100 shadow-lg hover:shadow-xl"
        >
          <Send size={18} className="stroke-2" />
        </button>
      </div>

      {/* Bouton d'attachement optionnel */}
      {showAttachment && (
        <div className="flex items-center">
          <button
            type="button"
            disabled={disabled}
            style={{ transform: `translateY(${buttonOffset}px)` }} // <-- décalage dynamique
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full 
                       flex items-center justify-center transition-all duration-200 
                       hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Paperclip size={16} />
          </button>
        </div>
      )}
    </form>
  );
};

export default TextMessage;
