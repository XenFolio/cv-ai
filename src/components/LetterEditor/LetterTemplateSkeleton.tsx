import React from 'react';
import { FileText } from 'lucide-react';

export const LetterTemplateSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header du Template Carousel skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 rounded-t-lg shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <FileText className="w-5 h-5" />
          <div className="h-6 w-32 bg-white/30 rounded animate-pulse" />
        </div>
      </div>

      {/* Carousel Container skeleton */}
      <div className="flex-1 bg-gray-50 overflow-hidden">
        {/* Scrollable Container skeleton */}
        <div className="h-full overflow-y-auto overflow-x-hidden">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div
                key={index}
                className="w-full p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm"
                style={{
                  minHeight: '140px'
                }}
              >
                {/* Template Header skeleton */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />
                    <div>
                      <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mb-1" />
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse font-mono" />
                </div>

                {/* Preview Area skeleton */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div
                    className="text-xs text-gray-600 overflow-hidden"
                    style={{
                      height: '60px',
                      fontSize: '9px',
                      lineHeight: '1.3'
                    }}
                  >
                    {/* Skeleton lines for preview text */}
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
                    </div>
                  </div>
                </div>

                {/* Style Indicators skeleton */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-6 bg-gray-300 rounded animate-pulse" />
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-6 bg-gray-300 rounded animate-pulse" />
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  <div className="w-3 h-3 bg-gray-300 rounded border border-gray-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="p-3 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="h-3 w-40 bg-gray-200 rounded animate-pulse mx-auto" />
      </div>
    </div>
  );
};