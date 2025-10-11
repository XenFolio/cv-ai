import React from 'react';
import { Columns, RectangleVertical } from 'lucide-react';
import { CustomSelect } from '../CustomSelect';
import type { SectionConfig } from '../types';

interface LayoutControlsProps {
  layoutColumns: number;
  setLayoutColumns: (columns: number) => void;
  columnRatio: '1/2-1/2' | '1/3-2/3' | '2/3-1/3';
  setColumnRatio: (ratio: '1/2-1/2' | '1/3-2/3' | '2/3-1/3') => void;
  sections: SectionConfig[];
  setSectionsOrder: (sections: SectionConfig[]) => void;
  cleanupLayers: (sections: SectionConfig[]) => SectionConfig[];
}

export const LayoutControls: React.FC<LayoutControlsProps> = ({
  layoutColumns,
  setLayoutColumns,
  columnRatio,
  setColumnRatio,
  sections,
  setSectionsOrder,
  cleanupLayers
}) => {
  const handleColumnToggle = () => {
    const newColumns = layoutColumns === 1 ? 2 : 1;
    setLayoutColumns(newColumns);

    // Ajuster automatiquement la disposition des sections selon le ratio de colonnes
    if (sections && setSectionsOrder) {
      if (newColumns === 2) {
        // Passer en mode 2 colonnes selon le ratio sélectionné
        const updatedSections = sections.map(section => {
          if (section.id === 'name' || section.id === 'profile' || section.id === 'skills') {
            return { ...section, width: 'full' as const };
          } else {
            // Appliquer le ratio de colonnes
            if (columnRatio === '1/3-2/3') {
              return { ...section, width: section.order === 0 ? '1/3' as const : '2/3' as const };
            } else if (columnRatio === '2/3-1/3') {
              return { ...section, width: section.order === 0 ? '2/3' as const : '1/3' as const };
            } else {
              // Par défaut 1/2-1/2
              return { ...section, width: 'half' as const };
            }
          }
        });
        setSectionsOrder(cleanupLayers(updatedSections));
      } else {
        // Passer en mode 1 colonne : toutes les sections en full
        const updatedSections = sections.map(section => ({
          ...section,
          width: 'full' as const
        }));
        setSectionsOrder(cleanupLayers(updatedSections));
      }
    }
  };

  const handleRatioChange = (value: string) => {
    const newRatio = value as '1/2-1/2' | '1/3-2/3' | '2/3-1/3';
    setColumnRatio(newRatio);

    // Appliquer immédiatement le nouveau ratio aux sections existantes
    if (sections && setSectionsOrder) {
      const updatedSections = sections.map(section => {
        if (section.id === 'name' || section.id === 'profile' || section.id === 'skills') {
          return { ...section, width: 'full' as const };
        } else {
          // Appliquer le nouveau ratio à toutes les autres sections
          if (newRatio === '1/3-2/3') {
            return { ...section, width: section.order === 0 ? '1/3' as const : '2/3' as const };
          } else if (newRatio === '2/3-1/3') {
            return { ...section, width: section.order === 0 ? '2/3' as const : '1/3' as const };
          } else {
            return { ...section, width: 'half' as const };
          }
        }
      });
      setSectionsOrder(cleanupLayers(updatedSections));
    }
  };

  return (
    <div className="flex-shrink-0">
      <div>
        <label className="block text-sm font-medium mb-2">Mise en page</label>
      </div>
      <div className="flex gap-2 top-2">
        <div className="">
          <div
            onClick={handleColumnToggle}
            className="cursor-pointer leading-none p-0 flex items-center justify-center w-7 h-8 rounded-md text-sm font-medium transition-all bg-violet-500 text-white shadow-md hover:bg-violet-600 hover:shadow-lg"
            title={layoutColumns === 1 ? "Passer à deux colonnes" : "Passer à une colonne"}
          >
            {layoutColumns === 1 ? (
              <Columns className="w-4 h-4" />
            ) : (
              <RectangleVertical className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Combo ratio colonnes - visible seulement en mode 2 colonnes */}
        {layoutColumns === 2 && (
          <div className="w-full">
            <CustomSelect
              value={columnRatio}
              onChange={handleRatioChange}
              options={[
                { value: '1/2-1/2', label: '1/2-1/2' },
                { value: '1/3-2/3', label: '1/3-2/3' },
                { value: '2/3-1/3', label: '2/3-1/3' }
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
};