import React, { useState, useEffect } from 'react';
import { DraggableToolbarContainer } from './DraggableToolbarGroup';
import { getToolbarGroups } from './ToolbarGroups';

interface ToolbarGroup {
  id: string;
  title: string;
  position: number;
  component: React.ReactNode;
}

interface NewToolbarProps {
  // Formatage
  currentFont: string;
  currentFontSize: string;
  showFontFamily: boolean;
  showFontSize: boolean;
  showColorPicker: boolean;
  onFontChange: (font: string) => void;
  onFontSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
  onToggleFontFamily: () => void;
  onToggleFontSize: () => void;
  onToggleColorPicker: () => void;
  onFormatCommand: (command: string) => void;
  onAlignCommand: (alignment: 'left' | 'center' | 'right' | 'justify') => void;

  // Actions
  onUndo: () => void;
  onRedo: () => void;
  onInsertLink: () => void;
  onInsertImage: () => void;
  onAIAction: () => void;

  // Export
  onSave: () => void;
  onExportPDF: () => void;
  onExportWord?: () => void;
  onExportText?: () => void;
  onAnalyzeTone?: () => void;
  onCheckGrammar?: () => void;
  onStyleSuggestions?: () => void;
  isAILoading?: boolean;

  // Options
  showSidebar: boolean;
  onToggleSidebar: () => void;
  showMarginGuides: boolean;
  onToggleMarginGuides: () => void;
  showBorders: boolean;
  onToggleBorders: () => void;
  onOpenRulesModal: () => void;
  allowMultiplePages: boolean;
  onToggleMultiplePages: () => void;
  isAILoading?: boolean;
}

export const NewToolbar: React.FC<NewToolbarProps> = (props) => {
  const [groups, setGroups] = useState<ToolbarGroup[]>(() => getToolbarGroups(props));

  const handleGroupsReorder = (reorderedGroups: ToolbarGroup[]) => {
    setGroups(reorderedGroups);

    // Sauvegarder l'ordre dans localStorage
    const groupOrder = reorderedGroups.map(group => group.id);
    localStorage.setItem('toolbar-group-order', JSON.stringify(groupOrder));
  };

  // Mettre à jour les groupes lorsque les props changent, en appliquant l'ordre sauvegardé si disponible
  useEffect(() => {
    const newGroups = getToolbarGroups(props);
    const savedOrder = localStorage.getItem('toolbar-group-order');
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder);
        const reorderedGroups = order.map((id: string) => {
          return newGroups.find((g: ToolbarGroup) => g.id === id);
        }).filter(Boolean) as ToolbarGroup[];
        if (reorderedGroups.length === newGroups.length) {
          setGroups(reorderedGroups.map((g: ToolbarGroup, index: number) => ({ ...g, position: index })));
          return;
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'ordre des groupes:', error);
      }
    }
    setGroups(newGroups);
  }, [props]);

  return (
    <div className="bg-white rounded-t-lg shadow-lg border-b border-gray-200 p-1.5">
      {/* En-tête de la toolbar */}
      <div className="flex items-center justify-between mb-1 px-1">
        <div className="text-xs font-medium text-gray-600">
          Barre d'outils personnalisable
        </div>
        <div className="text-xs text-gray-400">
          Glissez pour réorganiser
        </div>
      </div>

      {/* Conteneur des groupes déplaçables */}
      <DraggableToolbarContainer
        groups={groups}
        onGroupsReorder={handleGroupsReorder}
      />
    </div>
  );
};
