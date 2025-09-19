import React from 'react';
import GradientSpinLoader from './GradientSpinLoader';

interface PageLoaderProps {
  /** Message de chargement personnalisé */
  message?: string;
  /** Affichage minimal sans message */
  minimal?: boolean;
  /** Taille du loader */
  size?: number;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  message = "Chargement...",
  minimal = false,
  size = 64
}) => {
  if (minimal) {
    return (
      <div className="flex items-center justify-center p-8">
        <GradientSpinLoader size={size} className="opacity-75" />
      </div>
    );
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <GradientSpinLoader 
          size={size} 
          className="mx-auto mb-4 opacity-75" 
        />
        <p className="text-gray-600 text-sm animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default PageLoader;
