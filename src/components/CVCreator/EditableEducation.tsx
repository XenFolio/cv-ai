import React from 'react';
import { Minus } from 'lucide-react';
import { AIButton } from '../UI';

// Composant pour formation (diplôme, école, année) - Mode une colonne
interface EditableEducationSingleColumnProps {
  id: number;
  degree: string;
  school: string;
  year: string;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  onDegreeChange: (value: string) => void;
  onSchoolChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onRemove: () => void;
  isLoading: boolean;
  generateWithAI: (field: string, currentContent?: string) => Promise<void>;
  color: string;
}

export const EditableEducationSingleColumn: React.FC<EditableEducationSingleColumnProps> = ({
  id,
  degree,
  school,
  year,
  editingField,
  setEditingField,
  onDegreeChange,
  onSchoolChange,
  onYearChange,
  onRemove,
  isLoading,
  generateWithAI,
  color
}) => {
  const [showAIDegree, setShowAIDegree] = React.useState(false);
  const [showAISchool, setShowAISchool] = React.useState(false);
  const [showAIYear, setShowAIYear] = React.useState(false);

  const isEditingDegree = React.useMemo(() => editingField === `educationDegree-${id}`, [editingField, id]);
  const isEditingSchool = React.useMemo(() => editingField === `educationSchool-${id}`, [editingField, id]);
  const isEditingYear = React.useMemo(() => editingField === `educationYear-${id}`, [editingField, id]);

  const handleDegreeClick = React.useCallback(() => {
    setEditingField(`educationDegree-${id}`);
    setShowAIDegree(true);
  }, [setEditingField, id]);

  const handleSchoolClick = React.useCallback(() => {
    setEditingField(`educationSchool-${id}`);
    setShowAISchool(true);
  }, [setEditingField, id]);

  const handleYearClick = React.useCallback(() => {
    setEditingField(`educationYear-${id}`);
    setShowAIYear(true);
  }, [setEditingField, id]);

  const handleBlur = () => {
    setEditingField(null);
    setShowAIDegree(false);
    setShowAISchool(false);
    setShowAIYear(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingField(null);
      setShowAIDegree(false);
      setShowAISchool(false);
      setShowAIYear(false);
    }
  };

  return (
    <div className="relative mt-2">
      {/* Boutons à droite pendant l'édition */}
      {(isEditingDegree || isEditingSchool || isEditingYear) && (
        <div className="absolute right-0 top-0 flex gap-1">
          {showAIDegree && isEditingDegree && (
            <AIButton
              isLoading={isLoading}
              onClick={() => {
                generateWithAI('educationDegree', degree);
              }}
              title="Modifier avec IA"
            />
          )}
          {showAISchool && isEditingSchool && (
            <AIButton
              isLoading={isLoading}
              onClick={() => {
                generateWithAI('educationSchool', school);
              }}
              title="Modifier avec IA"
            />
          )}
          {showAIYear && isEditingYear && (
            <AIButton
              isLoading={isLoading}
              onClick={() => {
                generateWithAI('educationYear', year);
              }}
              title="Modifier avec IA"
            />
          )}
          <button
            onClick={onRemove}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200 hover:scale-110"
            title="Supprimer la formation"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-[2fr_2fr_1fr] gap-2">
        {/* Diplôme */}
        {isEditingDegree ? (
          <input
            type="text"
            value={degree}
            onChange={(e) => onDegreeChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="text-sm w-full border-b border-gray-400 focus:outline-none focus:border-violet-500"
            placeholder="Diplôme"
            autoFocus
          />
        ) : (
          <p
            className="editable-field text-sm cursor-pointer hover:bg-gray-100 p-1 rounded transition-all duration-200 hover:scale-105"
            onClick={handleDegreeClick}
            style={{
              color: `#${color}`
            }}
          >
            {degree}
          </p>
        )}

        {/* École */}
        {isEditingSchool ? (
          <input
            type="text"
            value={school}
            onChange={(e) => onSchoolChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="text-sm w-full border-b border-gray-400 focus:outline-none focus:border-violet-500"
            placeholder="École"
            autoFocus
          />
        ) : (
          <p
            className="editable-field text-sm cursor-pointer hover:bg-gray-100 p-1 rounded transition-all duration-200 hover:scale-105"
            onClick={handleSchoolClick}
            style={{
              color: `#${color}`
            }}
          >
            {school}
          </p>
        )}

        {/* Année */}
        {isEditingYear ? (
          <input
            type="text"
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="text-sm w-full border-b border-gray-400 focus:outline-none focus:border-violet-500"
            placeholder="Année"
            autoFocus
          />
        ) : (
          <p
            className="editable-field text-sm cursor-pointer hover:bg-gray-100 p-1 rounded transition-all duration-200 hover:scale-105"
            onClick={handleYearClick}
            style={{
              color: `#${color}`
            }}
          >
            {year}
          </p>
        )}
      </div>
    </div>
  );
};

// Composant pour formation (diplôme, école, année) - Mode deux colonnes
interface EditableEducationTwoColumnsProps {
  id: number;
  degree: string;
  school: string;
  year: string;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  onDegreeChange: (value: string) => void;
  onSchoolChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onRemove: () => void;
  isLoading: boolean;
  generateWithAI: (field: string, currentContent?: string) => Promise<void>;
  color: string;
}

export const EditableEducationTwoColumns: React.FC<EditableEducationTwoColumnsProps> = ({
  id,
  degree,
  school,
  year,
  editingField,
  setEditingField,
  onDegreeChange,
  onSchoolChange,
  onYearChange,
  onRemove,
  isLoading,
  generateWithAI,
  color
}) => {
  const [showAIDegree, setShowAIDegree] = React.useState(false);
  const [showAISchool, setShowAISchool] = React.useState(false);
  const [showAIYear, setShowAIYear] = React.useState(false);

  const isEditingDegree = React.useMemo(() => editingField === `educationDegree-${id}`, [editingField, id]);
  const isEditingSchool = React.useMemo(() => editingField === `educationSchool-${id}`, [editingField, id]);
  const isEditingYear = React.useMemo(() => editingField === `educationYear-${id}`, [editingField, id]);

  const handleDegreeClick = React.useCallback(() => {
    setEditingField(`educationDegree-${id}`);
    setShowAIDegree(true);
  }, [setEditingField, id]);

  const handleSchoolClick = React.useCallback(() => {
    setEditingField(`educationSchool-${id}`);
    setShowAISchool(true);
  }, [setEditingField, id]);

  const handleYearClick = React.useCallback(() => {
    setEditingField(`educationYear-${id}`);
    setShowAIYear(true);
  }, [setEditingField, id]);

  const handleBlur = () => {
    setEditingField(null);
    setShowAIDegree(false);
    setShowAISchool(false);
    setShowAIYear(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingField(null);
      setShowAIDegree(false);
      setShowAISchool(false);
      setShowAIYear(false);
    }
  };

  return (
    <div className="relative mt-2">
      {/* Boutons à droite pendant l'édition */}
      {(isEditingDegree || isEditingSchool || isEditingYear) && (
        <div className="absolute right-0 top-0 flex gap-1">
          {showAIDegree && isEditingDegree && (
            <AIButton
              isLoading={isLoading}
              onClick={() => {
                generateWithAI('educationDegree', degree);
              }}
              title="Modifier avec IA"
            />
          )}
          {showAISchool && isEditingSchool && (
            <AIButton
              isLoading={isLoading}
              onClick={() => {
                generateWithAI('educationSchool', school);
              }}
              title="Modifier avec IA"
            />
          )}
          {showAIYear && isEditingYear && (
            <AIButton
              isLoading={isLoading}
              onClick={() => {
                generateWithAI('educationYear', year);
              }}
              title="Modifier avec IA"
            />
          )}
          <button
            onClick={onRemove}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200 hover:scale-110"
            title="Supprimer la formation"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {/* Diplôme */}
        {isEditingDegree ? (
          <input
            type="text"
            value={degree}
            onChange={(e) => onDegreeChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="text-sm w-full border-b border-gray-400 focus:outline-none focus:border-violet-500"
            placeholder="Diplôme"
            autoFocus
          />
        ) : (
          <p
            className="editable-field text-sm cursor-pointer hover:bg-gray-100 p-1 rounded font-semibold transition-all duration-200 hover:scale-105"
            onClick={handleDegreeClick}
            style={{
              color: `#${color}`
            }}
          >
            {degree}
          </p>
        )}

        {/* École et Année */}
        <div className="flex items-center gap-2">
          {isEditingSchool ? (
            <input
              type="text"
              value={school}
              onChange={(e) => onSchoolChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="text-sm flex-1 border-b border-gray-400 focus:outline-none focus:border-violet-500"
              placeholder="École"
              autoFocus
            />
          ) : (
            <p
              className="editable-field text-sm cursor-pointer hover:bg-gray-100 p-1 rounded flex-1 transition-all duration-200 hover:scale-105"
              onClick={handleSchoolClick}
              style={{
                color: `#${color}`
              }}
            >
              {school}
            </p>
          )}

          {isEditingYear ? (
            <input
              type="text"
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="text-sm w-20 border-b border-gray-400 focus:outline-none focus:border-violet-500"
              placeholder="Année"
              autoFocus
            />
          ) : (
            <p
              className="editable-field text-sm cursor-pointer hover:bg-gray-100 p-1 rounded transition-all duration-200 hover:scale-105"
              onClick={handleYearClick}
              style={{
                color: `#${color}`
              }}
            >
              {year}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
