import { Plus, } from 'lucide-react';
import React from 'react';
import { AIButton } from '../UI';

interface EditableFieldWithLayoutProps {
  title: string;
  value: string;
  isEditing: boolean;
  isLoading: boolean;
  colors: {
    title: string;
    text: string;
  };
  isTitleCapitalized: boolean;
  onEdit: () => void;
  onAdd: () => void;
  onGenerateWithAI: () => void;
  onLayoutChange: (layout: string) => void;
  showAddButton?: boolean;
  showEditButton?: boolean;
  selectedLayout?: string;
}



const EditableFieldWithLayout: React.FC<EditableFieldWithLayoutProps> = ({
  title,
  isLoading,
  colors,
  isTitleCapitalized,
  onEdit,
  onAdd,
  onGenerateWithAI,

  showAddButton = false,
  showEditButton = true,
}) => {

  return (
    <div className="group flex items-center gap-1">
      <h4
        className="text-sm font-semibold cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors duration-200"
        onClick={onEdit}
        style={{
          color: `#${colors.title}`,
          textTransform: isTitleCapitalized ? 'uppercase' : 'none'
        }}
      >
        {title}
      </h4>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
        {showEditButton && (
          <AIButton
            isLoading={isLoading}
            onClick={onGenerateWithAI}
            title="Modifier avec IA"
          />
        )}


        {/* Bouton bibliothèque */}
        {/* <div
          onClick={onLibraryOpen}
          className="p-1 rounded hover:bg-violet-50 transition-colors duration-200"
          title="Bibliothèque de compétences"
          style={{
            color: `#${colors.title}`
          }}
        >
          <BookOpen size={14} className='hover:text-violet-600' />
        </div> */}

        {showAddButton && (
          <div
            onClick={onAdd}
            className="p-1 rounded hover:bg-violet-50 transition-colors duration-200"
            title="Ajouter"
            style={{
              color: `#${colors.title}`
            }}
          >
            <Plus size={14} className='hover:text-violet-600' />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableFieldWithLayout;
