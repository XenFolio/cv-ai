import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

interface EmptySlotProps {
  width?: "full" | "half" | "1/3" | "2/3";
  onExpand?: () => void;
  id: string;
  isDragging?: boolean;
}

export const EmptySlot: React.FC<EmptySlotProps> = ({
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
        ${widthClass} h-full
        ${paddingClass}
        relative transition-colors
        ${isOver ? "bg-violet-50" : "bg-gray-50/50"}
        ${isDragging ? 'opacity-50' : ''}
        border-2 border-dashed border-gray-300 rounded-lg
        min-h-[60px]
        flex items-center justify-center
        hover:border-violet-400 hover:bg-violet-50/30
        transition-all duration-200
      `}
    >
      {onExpand && (
        <button
          onClick={onExpand}
          className="p-2 text-violet-600 hover:text-violet-800 hover:bg-violet-100 rounded-lg transition-all duration-200 hover:scale-105"
          title="Ajouter une section"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}
      {!onExpand && (
        <div className="text-gray-400 text-sm">
          <Plus className="w-4 h-4 mx-auto mb-1" />
          Emplacement vide
        </div>
      )}
    </div>
  );
};