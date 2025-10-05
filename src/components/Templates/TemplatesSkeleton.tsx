import React from 'react';
import { Search, Award, Users, TrendingUp, Sparkles, FileText } from 'lucide-react';

export const TemplatesSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="text-left">
        <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-4" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Featured Banner skeleton */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg animate-pulse flex items-center justify-center">
              <FileText className="w-6 h-6 text-white/50" />
            </div>
            <div>
              <div className="h-6 w-48 bg-white/20 rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="h-8 w-8 bg-white/20 rounded animate-pulse mx-auto mb-1" />
              <div className="h-3 w-16 bg-white/10 rounded animate-pulse mx-auto" />
            </div>
            <div className="text-center">
              <div className="h-8 w-12 bg-white/20 rounded animate-pulse mx-auto mb-1" />
              <div className="h-3 w-20 bg-white/10 rounded animate-pulse mx-auto" />
            </div>
            <div className="text-center">
              <div className="h-8 w-6 bg-white/20 rounded animate-pulse mx-auto mb-1" />
              <div className="h-3 w-12 bg-white/10 rounded animate-pulse mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Professional Features skeleton */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="text-center">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse mx-auto mb-2" />
              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse mx-auto mb-1" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters skeleton */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-300 rounded animate-pulse" />
            <div className="w-full h-9 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Templates Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/30 overflow-hidden"
          >
            {/* Template Preview skeleton */}
            <div className="relative bg-white m-4 rounded-lg shadow-sm overflow-hidden" style={{ aspectRatio: '1 / 1.414' }}>
              {/* Premium Badge skeleton */}
              <div className="absolute top-2 left-2 z-10">
                <div className="h-6 w-16 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full animate-pulse" />
              </div>

              {/* ATS Score skeleton */}
              <div className="absolute top-2 right-2 z-10">
                <div className="h-6 w-12 bg-white/90 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
                </div>
              </div>

              {/* CV Content skeleton */}
              <div className="p-3 h-full flex flex-col">
                {/* Header skeleton */}
                <div className="text-center mb-2 pb-2 border-b border-gray-200">
                  <div className="h-4 w-32 bg-gray-300 rounded animate-pulse mx-auto mb-1" />
                  <div className="h-3 w-40 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
                  <div className="h-3 w-36 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
                  <div className="h-3 w-28 bg-gray-200 rounded animate-pulse mx-auto" />
                </div>

                {/* Profile skeleton */}
                <div className="mb-2">
                  <div className="h-3 w-32 bg-gray-300 rounded animate-pulse mb-1" />
                  <div className="space-y-1">
                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-4/5 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>

                {/* Experience skeleton */}
                <div className="mb-2">
                  <div className="h-3 w-40 bg-gray-300 rounded animate-pulse mb-1" />
                  <div className="space-y-1">
                    <div>
                      <div className="h-3 w-36 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="space-y-0.5">
                        <div className="h-3 w-4/5 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Compétences skeleton */}
                <div className="mb-2">
                  <div className="h-3 w-36 bg-gray-300 rounded animate-pulse mb-1" />
                  <div className="flex flex-wrap gap-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                </div>

                {/* Formation skeleton */}
                <div className="mb-1">
                  <div className="h-3 w-16 bg-gray-300 rounded animate-pulse mb-1" />
                  <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Langues skeleton */}
                <div>
                  <div className="h-3 w-16 bg-gray-300 rounded animate-pulse mb-1" />
                  <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA skeleton */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/30">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-300 to-pink-300 rounded-2xl animate-pulse mx-auto mb-4 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white/50" />
          </div>

          <div className="h-6 w-64 bg-gray-300 rounded animate-pulse mx-auto mb-3" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto mb-6" />

          <div className="h-11 w-64 bg-gradient-to-r from-violet-300 to-pink-300 rounded-xl animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  );
};