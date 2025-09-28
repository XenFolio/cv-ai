import React, { useCallback } from 'react';
import { FileText } from 'lucide-react';
import { createTemplates, type TemplateData } from '../../data/letterTemplates';

interface TemplateCarouselProps {
  currentTemplate: string;
  onTemplateSelect: (templateKey: string) => void;
  formData?: {
    poste: string;
    entreprise: string;
    secteur: string;
    experience: string;
    motivation: string;
    competences: string;
  };
}

export const TemplateCarousel: React.FC<TemplateCarouselProps> = ({
  currentTemplate,
  onTemplateSelect,
  formData
}) => {
  const templates = createTemplates(formData);
  const templateKeys = Object.keys(templates) as (keyof TemplateData)[];

  const handleTemplateClick = useCallback((templateKey: keyof TemplateData) => {
    onTemplateSelect(templateKey);
  }, [onTemplateSelect]);

  return (
    <div className="w-full h-full flex flex-col">

      {/* Carousel Container */}
      <div className="flex-1 bg-gray-50 overflow-hidden">
        {/* Scrollable Container */}
        <div className="h-full overflow-y-auto overflow-x-hidden">
          <div className="p-4 space-y-4">
            {templateKeys.map((key) => (
              <div
                key={key}
                onClick={() => handleTemplateClick(key)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`w-full p-4 bg-white rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg select-none ${
                  currentTemplate === key
                    ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-[1.02]'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 hover:shadow-md'
                }`}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  minHeight: '140px'
                }}
              >
                {/* Template Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full transition-colors ${
                      currentTemplate === key ? 'bg-purple-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <h3 className={`font-semibold text-sm ${
                        currentTemplate === key ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        {templates[key].name}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mt-1">
                        {templates[key].preview}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono" style={{
                    fontFamily: templates[key].style.fontFamily.split(',')[0]
                  }}>
                    {templates[key].style.fontFamily.split(',')[0]}
                  </span>
                </div>

                {/* Preview Area */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div
                    className="text-xs text-gray-600 overflow-hidden"
                    style={{
                      height: '60px',
                      fontSize: '9px',
                      lineHeight: '1.3',
                      fontFamily: templates[key].style.fontFamily.split(',')[0],
                      color: templates[key].style.color
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: templates[key].template.substring(0, 150) + '...'
                      }}
                    />
                  </div>
                </div>

                {/* Style Indicators */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">Font:</span>
                    <span className="text-xs text-gray-600 font-medium">
                      {templates[key].style.fontSize}
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">Line:</span>
                    <span className="text-xs text-gray-600 font-medium">
                      {templates[key].style.lineHeight}
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div
                    className="w-3 h-3 rounded border border-gray-300"
                    style={{ backgroundColor: templates[key].style.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="text-xs text-gray-500 text-center">
          {templateKeys.length} templates disponibles • Cliquez pour appliquer
        </div>
      </div>
    </div>
  );
};