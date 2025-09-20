import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SectionWrapperProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  position?: 'left' | 'right';
  onSectionClick?: (sectionId: string) => void;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  title,
  children,
  className = "",
  position,
  onSectionClick
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-section
      className={`relative group ${isDragging ? 'opacity-50' : ''} ${className} cursor-pointer hover:bg-violet-50 hover:border hover:border-violet-200 rounded transition-all duration-200 h-full flex flex-col`}
      onClick={(e) => {
        // Ne pas déclencher si on clique sur la poignée de drag
        if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
          return;
        }
        onSectionClick?.(id);
      }}
    >
      {/* Poignée de drag positionnée au niveau du titre */}
      <div
        {...attributes}
        {...listeners}
        data-drag-handle
        className={`absolute top-0 p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-white/80 rounded-md shadow-sm ${
          position === 'right' ? 'right-0' : 'left-0'
        }`}
        title={`Déplacer la section ${title}`}
        style={{ top: '1px' }}
      >
        <GripVertical className="w-3 h-3 text-gray-500" />
      </div>
      
      {/* Contenu de la section */}
      <div className={`${position === 'right' ? 'pr-2' : 'pl-2'} pt-1 flex-1`}>
        {children}
      </div>
    </div>
  );
};
