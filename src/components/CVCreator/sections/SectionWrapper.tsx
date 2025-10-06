import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useCVCreator } from '../CVCreatorContext.hook';

interface SectionWrapperProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  position?: 'left' | 'right';
  alignment?: 'left' | 'center' | 'right';
  onSectionClick?: (sectionId: string) => void;
  hasAdjacentSection?: boolean;
  adjacentSectionColor?: string;
  hasIntersection?: boolean;
  isFullWidth?: boolean;
  width?: "full" | "half" | "1/3" | "2/3";
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  title,
  children,
  className = "",
  position,
  alignment = 'center',
  onSectionClick,
  hasAdjacentSection = false,
  adjacentSectionColor,
  hasIntersection = false,
  isFullWidth = false,
  width,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const { sectionColors, selectedSection } = useCVCreator();

  const currentColors = sectionColors[id] || { background: 'transparent' };

  // Vérifier si les sections adjacentes ont la même couleur
  const hasSameColorAsAdjacent = hasAdjacentSection && adjacentSectionColor === currentColors.background && currentColors.background !== '' && currentColors.background !== 'transparent';

  // Fonction pour extraire la première couleur d'un dégradé
  const extractFirstColorFromGradient = (gradient: string): string => {
    if (!gradient.includes('gradient')) return gradient;

    // Extraire la première couleur du dégradé (format: linear-gradient(to right, #color1, #color2, ...))
    const matches = gradient.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/);
    return matches ? matches[0] : gradient;
  };

  // Fonction pour ajuster la couleur de fond en fonction de la position
  const getAdjustedBackgroundColor = (baseColor: string, position?: 'left' | 'right') => {
    if (!position || hasSameColorAsAdjacent) return baseColor;

    // Si la couleur est transparente ou vide, on garde tel quel
    if (baseColor === 'transparent' || baseColor === '') return baseColor;

    // Si c'est un dégradé, extraire la première couleur pour les calculs
    const colorToProcess = extractFirstColorFromGradient(baseColor);

    // Convertir hex en RGB
    const hex = colorToProcess.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Pour la section de droite, assombrir très légèrement pour créer une séparation
    if (position === 'right') {
      const adjustedR = Math.max(0, r - 8);
      const adjustedG = Math.max(0, g - 8);
      const adjustedB = Math.max(0, b - 8);
      return `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;
    }

    return baseColor;
  };

  const adjustedBackgroundColor = getAdjustedBackgroundColor(
  currentColors.background === 'transparent' ? 'transparent' :
  (currentColors.background && typeof currentColors.background === 'string' && currentColors.background.includes('gradient')) ? currentColors.background :
  `#${currentColors.background}`,
  position
);

  // Padding harmonisé pour aligner les titres entre sections full et half width
  const paddingClass = 'px-4';

  // Classes pour l'effet d'intersection basées sur hasIntersection
  const intersectionClass = hasIntersection && !isFullWidth ? getIntersectionEffect() : '';

  // Fonction qui génère l'effet d'intersection
  function getIntersectionEffect(): string {
    if (!hasIntersection || isFullWidth || width === 'full') return '';
    
    // Effet d'intersection adapté selon la largeur et la position
    if (position === 'left') {
      // Section gauche : priorité visuelle avec ombre
      const shadowIntensity = width === '2/3' ? 'shadow-md' : 'shadow-sm';
      return `relative z-10 ${shadowIntensity}`;
    } else if (position === 'right') {
      // Section droite : superposition adaptée à la largeur
      const marginOffset = width === '1/3' ? '-ml-2' : width === '2/3' ? '-ml-1' : '-ml-1';
      return `relative z-0 ${marginOffset}`;
    }
    
    return '';
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: adjustedBackgroundColor === 'transparent' ? 'transparent' : adjustedBackgroundColor
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-section
      className={`relative group ${isDragging ? 'opacity-50' : ''} ${className} cursor-pointer hover:bg-violet-50 hover:border hover:border-violet-200 transition-all duration-200 h-full flex flex-col ${paddingClass} ${intersectionClass} ${selectedSection === id ? 'ring-2 ring-violet-500' : ''} ${!isFullWidth ? 'overflow-hidden' : ''} min-w-0`}
      onClick={(e) => {
        // Ne pas déclencher si on clique sur la poignée de drag
        if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
          return;
        }
        onSectionClick?.(id);
      }}
    >
      {/* Poignée de drag */}
      <div className="absolute top-1 left-1 flex gap-1 z-10">
        <div
          {...attributes}
          {...listeners}
          data-drag-handle
          className="p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 rounded-md shadow-sm"
          title={`Déplacer la section ${title}`}
        >
          <GripVertical className="w-3 h-3 text-gray-500" />
        </div>
      </div>

      {/* Contenu de la section */}
      <div className="pt-1 flex-1 w-full min-w-0" style={{ textAlign: alignment }}>
        <div className="w-full overflow-hidden">
          <div className="max-w-full break-words">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
