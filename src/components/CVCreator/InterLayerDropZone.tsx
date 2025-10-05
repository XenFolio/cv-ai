import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface InterLayerDropZoneProps {
  index: number;
  isDragging: boolean;
  aboveLayerLeftColor?: string;
  aboveLayerRightColor?: string;
  belowLayerLeftColor?: string;
  columnRatio?: '1/2-1/2' | '1/3-2/3' | '2/3-1/3';
}

export const InterLayerDropZone: React.FC<InterLayerDropZoneProps> = ({
  index,
  isDragging,
  aboveLayerLeftColor,
  aboveLayerRightColor,
  
  columnRatio = '1/2-1/2',
}) => {
  const { setNodeRef: setLeftRef, isOver: isLeftOver } = useDroppable({ id: `inter-layer-${index}-left` });
  const { setNodeRef: setRightRef, isOver: isRightOver } = useDroppable({ id: `inter-layer-${index}-right` });

  // Fonction pour obtenir la largeur de la partie gauche selon le ratio
  const getLeftWidth = () => {
    switch (columnRatio) {
      case '1/3-2/3': return 'w-1/3';
      case '2/3-1/3': return 'w-2/3';
      case '1/2-1/2':
      default: return 'w-1/2';
    }
  };

  // Fonction pour obtenir la largeur de la partie droite selon le ratio
  const getRightWidth = () => {
    switch (columnRatio) {
      case '1/3-2/3': return 'w-2/3';
      case '2/3-1/3': return 'w-1/3';
      case '1/2-1/2':
      default: return 'w-1/2';
    }
  };

  // Fonction pour obtenir le libellé de la partie gauche
  const getLeftLabel = () => {
    switch (columnRatio) {
      case '1/3-2/3': return 'Nouveau layer (1/3)';
      case '2/3-1/3': return 'Nouveau layer (2/3)';
      case '1/2-1/2':
      default: return 'Nouveau layer (gauche)';
    }
  };

  // Fonction pour obtenir le libellé de la partie droite
  const getRightLabel = () => {
    switch (columnRatio) {
      case '1/3-2/3': return 'Nouveau layer (2/3)';
      case '2/3-1/3': return 'Nouveau layer (1/3)';
      case '1/2-1/2':
      default: return 'Nouveau layer (droite)';
    }
  };

  // Fonction pour obtenir la couleur de la bordure gauche
  const getLeftBorderColor = () => {
    switch (columnRatio) {
      case '1/3-2/3': return 'rgba(251, 191, 36, 0.3)';
      case '2/3-1/3': return 'rgba(251, 191, 36, 0.5)';
      case '1/2-1/2':
      default: return 'rgba(251, 191, 36, 0.3)';
    }
  };

  // Fonction pour obtenir la couleur de la bordure droite
  const getRightBorderColor = () => {
    switch (columnRatio) {
      case '1/3-2/3': return 'rgba(245, 158, 11, 0.5)';
      case '2/3-1/3': return 'rgba(245, 158, 11, 0.3)';
      case '1/2-1/2':
      default: return 'rgba(245, 158, 11, 0.3)';
    }
  };

  const leftWidthClass = getLeftWidth();
  const rightWidthClass = getRightWidth();
  const leftBorderColor = getLeftBorderColor();
  const rightBorderColor = getRightBorderColor();
  const leftLabel = getLeftLabel();
  const rightLabel = getRightLabel();

  return (
    <div className="w-full transition-all duration-300">
      <div className="flex items-stretch relative gap-0">
        {/* Partie gauche */}
        <div
          ref={setLeftRef}
          className={`
            ${leftWidthClass} transition-all duration-300 ease-in-out relative
            ${isDragging ? "opacity-100" : "opacity-0 hover:opacity-80"}
            my-0
            ${isDragging ? "h-3" : "h-1"}
          `}
          style={{
            backgroundColor: aboveLayerLeftColor ? `#${aboveLayerLeftColor}` : undefined,
            padding: 0,
            margin: 0,
            borderLeft: `2px solid ${leftBorderColor}`,
            borderRight: '1px solid rgba(251, 191, 36, 0.3)'
          }}
        >
          <div
            className={`
              w-full h-4 transition-all duration-300
              ${isLeftOver
                ? "bg-gradient-to-r from-white/40 to-white/20 scale-y-200 shadow-lg"
                : "bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 shadow-md"
              }
              ${isDragging ? "animate-pulse" : ""}
            `}
          />
          {/* Indicateur textuel pour la partie gauche */}
          {isLeftOver && isDragging && (
            <div className="absolute -top-6 left-1/4 transform -translate-x-1/2 bg-violet-600 text-white text-xs px-1 py-0.5 shadow-md whitespace-nowrap z-50">
              {leftLabel}
            </div>
          )}
        </div>

        {/* Partie droite */}
        <div
          ref={setRightRef}
          className={`
            ${rightWidthClass} transition-all duration-300 ease-in-out relative
            ${isDragging ? "opacity-100" : "opacity-0 hover:opacity-80"}
            my-0
            ${isDragging ? "h-3" : "h-1"}
          `}
          style={{
            backgroundColor: aboveLayerRightColor ? `#${aboveLayerRightColor}` : undefined,
            padding: 0,
            margin: 0,
            borderLeft: '1px solid rgba(245, 158, 11, 0.3)',
            borderRight: `2px solid ${rightBorderColor}`
          }}
        >
          <div
            className={`
              w-full h-full transition-all duration-300
              ${isRightOver
                ? "bg-gradient-to-r from-white/20 to-white/40 scale-y-200 shadow-lg"
                : "bg-gradient-to-r from-white/10 to-white/20 hover:from-white/20 hover:to-white/30 shadow-md"
              }
              ${isDragging ? "animate-pulse" : ""}
            `}
          />
          {/* Indicateur textuel pour la partie droite */}
          {isRightOver && isDragging && (
            <div className="absolute -top-6 right-1/4 transform translate-x-1/2 bg-purple-600 text-white text-xs px-1 py-0.5 shadow-md whitespace-nowrap z-50">
              {rightLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};