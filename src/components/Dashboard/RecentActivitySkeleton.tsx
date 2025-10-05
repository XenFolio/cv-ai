import React from 'react';

export const RecentActivitySkeleton: React.FC = () => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/30 mx-auto w-full shadow-sm">
      {/* Header avec shimmer */}
      <div className="relative overflow-hidden mb-4 bg-gradient-to-r from-violet-600 to-pink-500 p-2 px-4 rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        <div className="relative flex items-center justify-between">
          {/* Squelette du titre */}
          <div className="h-6 w-32 bg-white/30 rounded" />

          {/* Squelette de l'icône */}
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-white/30 rounded" />
            <div className="w-4 h-4 bg-white/30 rounded-full animate-spin" />
          </div>
        </div>
      </div>

      {/* Contenu avec shimmer */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="relative overflow-hidden flex items-start space-x-3 p-3 rounded-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/30 to-transparent animate-pulse" />

            <div className="relative flex items-start space-x-3">
              {/* Squelette de l'icône d'activité */}
              <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex-shrink-0" />

              <div className="flex-1 min-w-0">
                {/* Squelette du titre */}
                <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-3/4 mb-2" />

                {/* Squelette de la description */}
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mb-2" />

                {/* Squelette du footer avec temps et score */}
                <div className="flex items-center justify-between">
                  {/* Squelette du temps */}
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20" />

                  {/* Squelette du score */}
                  <div className="h-5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full w-12" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer avec shimmer */}
      <div className="relative overflow-hidden mt-4 pt-4 border-t border-gray-200/30 flex justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/20 to-transparent animate-pulse" />
        <div className="relative h-8 bg-gradient-to-r from-violet-400 to-pink-400 rounded-lg w-32" />
      </div>
    </div>
  );
};

// Ajouter l'animation shimmer si elle n'existe pas déjà
if (typeof document !== 'undefined') {
  const styleId = 'recent-activity-shimmer-style';
  if (!document.head.querySelector(`#${styleId}`)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      .animate-pulse {
        animation: shimmer 1.8s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  }
}