import React from 'react';
import { Type } from 'lucide-react';

interface FontSizeSelectorProps {
  currentFontSize: string;
  onFontSizeChange: (size: string) => void;
  showFontSize: boolean;
  onToggleFontSize: () => void;
}

const FONT_SIZES = [
  { label: '8pt', value: '8pt' },
  { label: '9pt', value: '9pt' },
  { label: '10pt', value: '10pt' },
  { label: '11pt', value: '11pt' },
  { label: '12pt', value: '12pt' },
  { label: '14pt', value: '14pt' },
  { label: '16pt', value: '16pt' },
  { label: '18pt', value: '18pt' },
  { label: '20pt', value: '20pt' },
  { label: '22pt', value: '22pt' },
  { label: '24pt', value: '24pt' },
  { label: '28pt', value: '28pt' },
  { label: '32pt', value: '32pt' },
  { label: '36pt', value: '36pt' },
  { label: '48pt', value: '48pt' },
];

export const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({
  currentFontSize,
  onFontSizeChange,
  showFontSize,
  onToggleFontSize,
}) => {
  return (
    <div className="relative font-size">
      <button
        onClick={onToggleFontSize}
        className="flex items-center gap-1 px-2 py-1 text-gray-700 hover:bg-purple-100 hover:text-indigo-600 rounded transition-all duration-200"
        title="Taille de police"
      >
        <Type className="w-4 h-4" />
        <span className="text-sm">{currentFontSize}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showFontSize && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="max-h-48 overflow-y-auto">
            {FONT_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => onFontSizeChange(size.value)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  currentFontSize === size.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};