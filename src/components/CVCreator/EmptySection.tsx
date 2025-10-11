import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Expand } from 'lucide-react';

interface EmptySectionProps {
  width?: "full" | "half" | "1/3" | "2/3";
  onExpand?: () => void;
  id: string;
  isDragging?: boolean;
}

export const EmptySection: React.FC<EmptySectionProps> = ({
  width = "full",
  onExpand,
  id,
  isDragging,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const getWidthClass = () => {
    switch (width) {
      case "half": return "w-1/2";
      case "1/3": return "w-1/3";
      case "2/3": return "w-2/3";
      case "full":
      default: return "w-full";
    }
  };

  const widthClass = getWidthClass();

  // Padding harmonisé pour correspondre aux sections réelles
  const paddingClass = width === "full" ? "px-0" : "px-4";

  return (
    <div
      ref={setNodeRef}
      className={`
        ${widthClass}
        ${paddingClass}
        relative transition-colors
        ${isOver ? "bg-violet-50" : "bg-transparent"}
        ${isDragging ? 'opacity-50' : ''}
        border border-transparent rounded-lg
        flex items-center justify-center min-h-[60px]
        hover:border hover:border-dashed hover:border-violet-400 hover:bg-violet-50/30
        transition-all duration-200
      `}
    >
      {onExpand && (
        <div
          onClick={onExpand}
          className="opacity-0 hover:opacity-100 p-2 text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded-lg transition-all duration-200 hover:scale-105"
          title="Ajouter une section"
        >
          <Expand className="w-5 h-5" />
        </div>
      )}
      {!onExpand && (
        <div className="opacity-0 hover:opacity-100 text-gray-400 text-sm transition-opacity duration-200">
          <Expand className="w-4 h-4 mx-auto mb-1" />
          Emplacement vide
        </div>
      )}
    </div>
  );
};