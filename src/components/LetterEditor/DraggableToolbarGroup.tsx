import React, { useState, useEffect } from 'react';
import { GripVertical, Plus } from 'lucide-react';

interface DropZoneProps {
  position: number;
  onDrop: (e: React.DragEvent, position: number) => void;
  onDragOver: (e: React.DragEvent, position: number) => void;
  isVisible: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ position, onDrop, onDragOver, isVisible }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsHovered(true);
    onDragOver(e, position);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(true);
    onDragOver(e, position);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    onDrop(e, position);
  };

  return (
    <div
      className={`
        w-2 h-12 mx-0.5 flex items-center justify-center transition-all duration-200 cursor-pointer
        ${isVisible || isHovered
          ? 'bg-indigo-500 rounded animate-pulse shadow shadow-indigo-500/50 w-4'
          : 'hover:bg-gray-300 hover:bg-opacity-30 rounded '
        }
      `}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {(isVisible || isHovered) && <Plus className="w-2 h-2 text-white" />}
    </div>
  );
};

interface DraggableToolbarGroupProps {
  groupId: string;
  children: React.ReactNode;
  title?: string;
  position: number;
  isDragging?: boolean;
  onDragStart?: (groupId: string) => void;
  onDragEnd?: () => void;
}

export const DraggableToolbarGroup: React.FC<DraggableToolbarGroupProps> = ({
  groupId,
  children,
  title,
  position,
  isDragging = false,
  onDragStart,
  onDragEnd,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isDragging]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('groupId', groupId);
    e.dataTransfer.setData('currentPosition', position.toString());

    if (onDragStart) {
      onDragStart(groupId);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Laisser les drop zones gérer l'insertion
  };

  return (
    <div
      draggable
      className={`
        relative flex items-center bg-gray-50 rounded px-1 py-0.5 m-0.5
        border border-gray-200 transition-all duration-200
        ${isHovered ? 'shadow-md' : 'shadow-sm'}
        ${isDragging ? 'opacity-50 scale-95' : 'hover:bg-gray-100'}
        cursor-grab active:cursor-grabbing
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Poignée de déplacement */}
      <div
        className="flex items-center justify-center mr-0.5 cursor-grab active:cursor-grabbing"
        title={`Déplacer ${title || 'ce groupe'}`}
      >
        <GripVertical className="w-3 h-3 text-gray-400 hover:text-gray-600" />
      </div>

      {/* Contenu du groupe */}
      <div className="flex items-center gap-0.5">
        {children}
      </div>

      {/* Titre du groupe (optionnel) */}
      {title && isHovered && !isDragging && (
        <div className="absolute -top-4 left-0 text-xs text-gray-500 whitespace-nowrap bg-white px-0.5 rounded shadow">
          {title}
        </div>
      )}
    </div>
  );
};

interface ToolbarGroup {
  id: string;
  title: string;
  component: React.ReactNode;
  position: number;
}

interface DraggableToolbarContainerProps {
  groups: ToolbarGroup[];
  onGroupsReorder?: (groups: ToolbarGroup[]) => void;
}

export const DraggableToolbarContainer: React.FC<DraggableToolbarContainerProps> = ({
  groups,
  onGroupsReorder,
}) => {
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<number>(-1);
  const [groupOrder, setGroupOrder] = useState<string[]>(() =>
    groups.map(g => g.id)
  );

  // Synchroniser groupOrder avec les groups reçus en props
  useEffect(() => {
    setGroupOrder(groups.map(g => g.id));
  }, [groups]);

  const handleDragStart = (groupId: string) => {
    console.log('Drag start:', groupId);
    setDraggedGroup(groupId);
    setActiveDropZone(-1);
  };

  const handleDragEnd = () => {
    console.log('Drag end');
    setDraggedGroup(null);
    setActiveDropZone(-1);
  };

  const handleDragOver = (e: React.DragEvent, position: number) => {
    if (draggedGroup) {
      e.preventDefault();
      setActiveDropZone(position);
    }
  };

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();

    const draggedGroupId = e.dataTransfer.getData('groupId');

    if (draggedGroupId && draggedGroup === draggedGroupId) {
      console.log(`Moving ${draggedGroupId} to position ${position}`);

      // Créer le nouvel ordre
      const newOrder = [...groupOrder];
      const currentIndex = newOrder.indexOf(draggedGroupId);

      if (currentIndex !== -1) {
        // Retirer de la position actuelle
        newOrder.splice(currentIndex, 1);

        // Ajuster la nouvelle position si on déplace vers la droite
        let adjustedPosition = position;
        if (position > currentIndex) {
          adjustedPosition = position - 1;
        }

        // Insérer à la nouvelle position
        newOrder.splice(adjustedPosition, 0, draggedGroupId);

        setGroupOrder(newOrder);

        // Créer la nouvelle liste de groupes ordonnée
        const reorderedGroups = newOrder.map((id, index) => {
          const group = groups.find(g => g.id === id);
          if (!group) return null;
          return { ...group, position: index };
        }).filter((group): group is ToolbarGroup => group !== null);

        console.log('Reordered groups:', reorderedGroups.map(g => ({ id: g.id, position: g.position })));

        if (onGroupsReorder) {
          onGroupsReorder(reorderedGroups);
        }
      }
    }

    setActiveDropZone(-1);
  };

  // Trier les groupes selon l'ordre actuel
  const sortedGroups = groupOrder.map(id =>
    groups.find(g => g.id === id)
  ).filter(Boolean);

  return (
    <div
      className="flex flex-wrap items-start gap-y-0 p-0 bg-gray-100 rounded-lg min-h-[56px] relative border border-dashed border-gray-300"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      {sortedGroups.map((group, index) => (
        <React.Fragment key={group?.id}>
          <DraggableToolbarGroup
            groupId={group!.id}
            title={group!.title}
            position={index}
            isDragging={draggedGroup === group!.id}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {group!.component}
          </DraggableToolbarGroup>

          <DropZone
            position={index}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            isVisible={activeDropZone === index}
          />
        </React.Fragment>
      ))}

      {/* Message si aucun groupe */}
      {sortedGroups.length === 0 && (
        <div className="text-gray-400 text-center py-2 px-2 flex-1">
          Faites glisser des groupes ici
        </div>
      )}
    </div>
  );
};
