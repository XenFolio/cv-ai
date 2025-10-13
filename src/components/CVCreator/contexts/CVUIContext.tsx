import React, { createContext,  ReactNode } from 'react';
import type { SectionConfig } from '../types';

// Types pour l'interface utilisateur du CV
export interface CVUIType {
  // UI state
  editingField: string | null;
  setEditingField: React.Dispatch<React.SetStateAction<string | null>>;
  selectedSection: string | null;
  setSelectedSection: React.Dispatch<React.SetStateAction<string | null>>;

  // Sections state
  sections: SectionConfig[];
  toggleSectionVisibility: (sectionId: string) => void;
  setSectionsOrder: (sections: SectionConfig[]) => void;
  cleanupLayers: (sections: SectionConfig[]) => SectionConfig[];
  expandSection: (id: string) => void;
  contractSection: (id: string) => void;

  selectedTemplateName: string;
  selectedTemplate: string | null;

  // Skills library state
  showSkillsLibrary: boolean;
  setShowSkillsLibrary: () => void;
  selectedSkillsCategory: string;
  setSelectedSkillsCategory: (category: string) => void;
  availableSkillsCategories: string[];
  categorySkills: Array<{ id: number; name: string; category: string }>;
  searchSkillsQuery: string;
  setSearchSkillsQuery: (query: string) => void;
  skillsSearchResults: Array<{ id: number; name: string; category: string }>;
  openSkillsLibrary: () => void;
  closeSkillsLibrary: () => void;
  addSkillFromLibrary: (skill: { id: number; name: string; category: string }) => void;

  // Skills layout state
  skillsLayout: 'free' | '1col' | '2col' | '3col';
  setSkillsLayout: (layout: 'free' | '1col' | '2col' | '3col') => void;

  // AI and loading state
  generateWithAI: (field: string, currentContent?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  openAIError: string | null;
}

export const CVUIContext = createContext<CVUIType | undefined>(undefined);

interface CVUIProviderProps {
  children: ReactNode;
  value: CVUIType;
}

export const CVUIProvider: React.FC<CVUIProviderProps> = ({ children, value }) => {
  return (
    <CVUIContext.Provider value={value}>
      {children}
    </CVUIContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte de l'interface utilisateur du CV
export const useCVUI = (): CVUIType => {
  const context = React.useContext(CVUIContext);
  if (context === undefined) {
    throw new Error('useCVUI must be used within a CVUIProvider');
  }
  return context;
};
