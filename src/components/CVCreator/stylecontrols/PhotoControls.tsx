import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, Circle, Square,  ZoomIn, ZoomOut, RotateCw, Move, RotateCcw, Maximize, Frame } from 'lucide-react';

interface PhotoControlsProps {
  photoShape: 'circle' | 'square' | 'rounded';
  setPhotoShape: (shape: 'circle' | 'square' | 'rounded') => void;
  photoSize: 'small' | 'medium' | 'large';
  setPhotoSize: (size: 'small' | 'medium' | 'large') => void;
  photoAlignment: 'left' | 'center' | 'right';
  setPhotoAlignment: (alignment: 'left' | 'center' | 'right') => void;
  photoObjectFit: 'contain' | 'cover';
  setPhotoObjectFit: (objectFit: 'contain' | 'cover') => void;
  photoZoom: number;
  setPhotoZoom: (zoom: number) => void;
  photoPositionX: number;
  setPhotoPositionX: (x: number) => void;
  photoPositionY: number;
  setPhotoPositionY: (y: number) => void;
  photoRotation: number;
  setPhotoRotation: (rotation: number) => void;
  handleResetAdjustments: () => void;
}

export const PhotoControls: React.FC<PhotoControlsProps> = ({
  photoShape,
  setPhotoShape,
  photoSize,
  setPhotoSize,
  photoAlignment,
  setPhotoAlignment,
  photoObjectFit,
  setPhotoObjectFit,
  photoZoom,
  setPhotoZoom,
  photoPositionX,
  setPhotoPositionX,
  photoPositionY,
  setPhotoPositionY,
  photoRotation,
  setPhotoRotation,
  handleResetAdjustments
}) => {
  return (
    <div className="space-y-4">
      {/* Première ligne de contrôles */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium mb-2">Forme photo</label>
          <div className="flex gap-1">
            <div
              onClick={() => setPhotoShape('circle')}
              className={`p-1 rounded transition-all duration-200 ${photoShape === 'circle'
                ? 'bg-violet-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-violet-100'
                }`}
              title="Photo ronde"
            >
              <Circle className="w-4 h-4" />
            </div>
            <div
              onClick={() => setPhotoShape('square')}
              className={`p-1 rounded transition-all duration-200 ${photoShape === 'square'
                ? 'bg-violet-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-violet-100'
                }`}
              title="Photo carrée"
            >
              <Square className="w-4 h-4" />
            </div>
            <div
              onClick={() => setPhotoShape('rounded')}
              className={`p-1 rounded transition-all duration-200 ${photoShape === 'rounded'
                ? 'bg-violet-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-violet-100'
                }`}
              title="Photo arrondie"
            >
              <div className="w-4 h-4 border border-current rounded" />
            </div>
          </div>
        </div>

        {/* Taille photo */}
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium mb-2">Taille photo</label>
          <div className="flex gap-1">
            <div
              onClick={() => setPhotoSize('small')}
              className={`px-2 py-1 rounded text-xs transition-all duration-200 ${photoSize === 'small'
                ? 'bg-violet-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-violet-100'
                }`}
              title="Petite photo"
            >
              S
            </div>
            <div
              onClick={() => setPhotoSize('medium')}
              className={`px-2 py-1 rounded text-xs transition-all duration-200 ${photoSize === 'medium'
                ? 'bg-violet-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-violet-100'
                }`}
              title="Photo moyenne"
            >
              M
            </div>
            <div
              onClick={() => setPhotoSize('large')}
              className={`px-2 py-1 rounded text-xs transition-all duration-200 ${photoSize === 'large'
                ? 'bg-violet-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-violet-100'
                }`}
              title="Grande photo"
            >
              L
            </div>
          </div>
        </div>

        {/* Alignement photo */}
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium mb-2">Alignement photo</label>
          <div className="flex gap-1">
            <div
              onClick={() => setPhotoAlignment('left')}
              className={`p-1 rounded transition-all duration-200 ${photoAlignment === 'left'
                ? 'bg-violet-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-violet-100'
                }`}
              title="Photo à gauche"
            >
              <AlignLeft className="w-4 h-4" />
            </div>
            <div
              onClick={() => setPhotoAlignment('center')}
              className={`p-1 rounded transition-all duration-200 ${photoAlignment === 'center'
                ? 'bg-violet-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-violet-100'
                }`}
              title="Photo centrée"
            >
              <AlignCenter className="w-4 h-4" />
            </div>
            <div
              onClick={() => setPhotoAlignment('right')}
              className={`p-1 rounded transition-all duration-200 ${photoAlignment === 'right'
                ? 'bg-violet-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-violet-100'
                }`}
              title="Photo à droite"
            >
              <AlignRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <label className="block text-sm font-medium mb-2">Ajustement</label>
          <div className="flex gap-1">
            <div
              onClick={() => setPhotoObjectFit(photoObjectFit === 'contain' ? 'cover' : 'contain')}
              className={`p-1 rounded transition-all duration-200 ${photoObjectFit === 'contain'
                ? 'bg-violet-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-violet-100'
                }`}
              title={photoObjectFit === 'contain'
                ? "Basculer vers mode couvrir (remplir l'espace)"
                : "Basculer vers mode contenir (image complète visible)"
              }
            >
              {photoObjectFit === 'contain' ? (
                <Frame className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deuxième ligne - Ajustements d'image */}
      <div className="flex items-start gap-4 pt-4 border-t border-violet-200">
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium mb-2">Zoom ({photoZoom}%)</label>
          <div className="flex gap-1">
            <div
              onClick={() => setPhotoZoom(Math.max((photoZoom || 100) - 10, 50))}
              className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
              title="Dézoomer"
            >
              <ZoomOut className="w-4 h-4" />
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={photoZoom}
              onChange={(e) => setPhotoZoom(parseInt(e.target.value))}
              className="w-16 h-6"
              title="Ajuster le zoom"
            />
            <div
              onClick={() => setPhotoZoom(Math.min((photoZoom || 100) + 10, 200))}
              className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
              title="Zoomer"
            >
              <ZoomIn className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <label className="block text-sm font-medium mb-2">Position X ({photoPositionX}px)</label>
          <div className="flex gap-1">
            <div
              onClick={() => setPhotoPositionX((photoPositionX || 0) - 5)}
              className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
              title="Déplacer à gauche"
            >
              <Move className="w-4 h-4 transform -rotate-90" />
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={photoPositionX}
              onChange={(e) => setPhotoPositionX(parseInt(e.target.value))}
              className="w-16 h-6"
              title="Ajuster position horizontale"
            />
            <div
              onClick={() => setPhotoPositionX((photoPositionX || 0) + 5)}
              className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
              title="Déplacer à droite"
            >
              <Move className="w-4 h-4 transform rotate-90" />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <label className="block text-sm font-medium mb-2">Position Y ({photoPositionY}px)</label>
          <div className="flex gap-1">
            <div
              onClick={() => setPhotoPositionY((photoPositionY || 0) - 5)}
              className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
              title="Déplacer vers le haut"
            >
              <Move className="w-4 h-4" />
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={photoPositionY}
              onChange={(e) => setPhotoPositionY(parseInt(e.target.value))}
              className="w-16 h-6"
              title="Ajuster position verticale"
            />
            <div
              onClick={() => setPhotoPositionY((photoPositionY || 0) + 5)}
              className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
              title="Déplacer vers le bas"
            >
              <Move className="w-4 h-4 transform rotate-180" />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <label className="block text-sm font-medium mb-2">Rotation ({photoRotation}°)</label>
          <div className="flex gap-1">
            <div
              onClick={() => setPhotoRotation((photoRotation || 0) - 15)}
              className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
              title="Rotation gauche"
            >
              <RotateCw className="w-4 h-4 transform scale-x-[-1]" />
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={photoRotation}
              onChange={(e) => setPhotoRotation(parseInt(e.target.value))}
              className="w-16 h-6"
              title="Ajuster la rotation"
            />
            <div
              onClick={() => setPhotoRotation((photoRotation || 0) + 15)}
              className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
              title="Rotation droite"
            >
              <RotateCw className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <label className="block text-sm font-medium mb-2">Réinitialiser</label>
          <div className="flex gap-1">
            <div
              onClick={handleResetAdjustments}
              className="p-1 rounded transition-all duration-200 bg-white text-gray-600 hover:bg-violet-100 hover:text-violet-700"
              title="Réinitialiser les styles de la photo"
            >
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};