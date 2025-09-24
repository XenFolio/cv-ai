import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import LoadingState from '../UI/LoadingState';

interface PageLoaderProps {
  /** Message de chargement personnalisé */
  message?: string;
  /** Affichage minimal sans message */
  minimal?: boolean;
  /** Taille du loader */
  size?: number;
  /** Style du loader */
  variant?: 'brand' | 'simple' | 'dots';
}

const PageLoader: React.FC<PageLoaderProps> = ({
  message = "Chargement...",
  minimal = false,
  size = 64,
  variant = 'brand'
}) => {
  // Utiliser le nouveau composant LoadingState pour une meilleure expérience
  if (variant === 'skeleton') {
    return <LoadingState message={message} variant="skeleton" />;
  }

  if (variant === 'pulse') {
    return <LoadingState message={message} variant="pulse" />;
  }

  if (minimal) {
    return <LoadingState message={message} variant="spinner" size="sm" className="p-8" />;
  }

  // Garder le design original pour le variant 'brand' mais amélioré
  if (variant === 'brand') {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div
              className="animate-spin mx-auto"
              style={{
                width: size,
                height: size,
                background: `conic-gradient(from 0deg, #4f46e5 0deg, #7c3aed 90deg, #4f46e5 180deg, #7c3aed 270deg, #4f46e5 360deg)`,
                borderRadius: '50%',
                mask: `radial-gradient(circle at center, transparent ${size * (0.5 - 0.1)}px, black ${size * (0.5 - 0.1 + 0.05)}px)`,
                WebkitMask: `radial-gradient(circle at center, transparent ${size * (0.5 - 0.1)}px, black ${size * (0.5 - 0.1 + 0.05)}px)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-700 text-sm font-medium animate-pulse">{message}</p>
          <div className="mt-4 flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback au spinner simple
  return <LoadingState message={message} variant="spinner" />;
};

export default PageLoader;
