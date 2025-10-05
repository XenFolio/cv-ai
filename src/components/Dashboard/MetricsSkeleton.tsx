import React from 'react';

export const MetricsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 shadow-sm"
        >
          {/* Animation de shimmer qui couvre toute la carte */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent animate-pulse" />

          {/* En-tête avec icône et change */}
          <div className="flex items-center justify-between mb-2">
            {/* Squelette de l'icône ronde avec gradient */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400" />

            {/* Squelette du badge de changement */}
            <div className="h-5 w-12 rounded-full bg-gray-200" />
          </div>

          {/* Contenu principal */}
          <div>
            {/* Squelette de la valeur */}
            <div className="mb-0.5 h-6 w-16 rounded bg-gray-300" />

            {/* Squelette du titre */}
            <div className="h-3 w-20 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Ajouter l'animation shimmer si elle n'existe pas déjà
if (typeof document !== 'undefined') {
  const styleId = 'metrics-shimmer-style';
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
        animation: shimmer 1.5s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  }
}