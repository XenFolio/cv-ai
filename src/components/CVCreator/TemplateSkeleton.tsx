import React from 'react';

export const TemplateSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 rounded-xl border border-violet-200 shadow-lg overflow-hidden">
      {/* Header du carousel avec contrôles */}
      <div className="bg-gradient-to-r from-violet-600 to-pink-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Icône skeleton */}
            <div className="w-5 h-5 bg-white/30 rounded animate-pulse" />
            <div className="h-6 w-32 bg-white/30 rounded animate-pulse" />
          </div>

          {/* Contrôles de navigation skeleton */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/30 rounded-full animate-pulse" />
            <div className="w-8 h-8 bg-white/30 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="h-5 w-48 bg-white/30 rounded-full mx-auto mt-2 animate-pulse" />
      </div>

      {/* Conteneur de templates skeleton */}
      <div className="h-[calc(100vh)] overflow-y-auto p-3 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div
            key={index}
            className="relative rounded-xl border-2 border-gray-200 bg-white shadow-lg overflow-hidden"
            style={{
              aspectRatio: '1 / 1.414'
            }}
          >
            {/* Overlay skeleton */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse" />

            {/* Badge ATS Score skeleton */}
            <div className="absolute top-2 right-2 z-20">
              <div className="w-12 h-6 bg-gray-300 rounded-full animate-pulse" />
            </div>

            {/* Bandeau skeleton */}
            <div className="absolute top-6 left-0 right-0 z-20 transform -rotate-12 origin-left">
              <div className="h-8 w-48 bg-gray-400 rounded-lg shadow-lg animate-pulse" />
            </div>

            {/* Badge catégorie skeleton */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="h-5 w-16 bg-violet-100 rounded-full animate-pulse" />
            </div>

            {/* Bouton télécharger skeleton */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="h-8 w-24 bg-gradient-to-r from-violet-300 to-purple-300 rounded-lg shadow-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};