import React from 'react';
import { Type } from 'lucide-react';

interface FontSelectorProps {
  currentFont: string;
  onFontChange: (font: string) => void;
  showFontFamily: boolean;
  onToggleFontFamily: () => void;
}

const FONTS = [
  { name: 'Arial', value: 'Arial' },
  { name: 'Times New Roman', value: 'Times New Roman' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Verdana', value: 'Verdana' },
  { name: 'Helvetica', value: 'Helvetica' },
  { name: 'Courier New', value: 'Courier New' },
  { name: 'Impact', value: 'Impact' },
  { name: 'Comic Sans MS', value: 'Comic Sans MS' },
];

export const FontSelector: React.FC<FontSelectorProps> = ({
  currentFont,
  onFontChange,
  showFontFamily,
  onToggleFontFamily,
}) => {
  return (
    <div className="relative font-family">
      <button
        onClick={onToggleFontFamily}
        className="flex items-center gap-1 px-2 py-1 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
        title="Police de caractères"
      >
        <Type className="w-4 h-4" />
        <span className="text-sm">{currentFont}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showFontFamily && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="max-h-64 overflow-y-auto">
            {FONTS.map((font) => (
              <button
                key={font.value}
                onClick={() => onFontChange(font.value)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};