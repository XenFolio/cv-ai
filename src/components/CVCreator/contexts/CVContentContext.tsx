import React, { createContext,  ReactNode } from 'react';
import type { CVExperience, CVSkill, CVLanguage, CVEducation, CVContent } from '../types';

// Types pour le contenu du CV
export interface CVContentType {
  editableContent: CVContent;
  setEditableContent: React.Dispatch<React.SetStateAction<CVContent>>;
  experiences: CVExperience[];
  setExperiences: React.Dispatch<React.SetStateAction<CVExperience[]>>;
  skills: CVSkill[];
  setSkills: React.Dispatch<React.SetStateAction<CVSkill[]>>;
  languages: CVLanguage[];
  setLanguages: React.Dispatch<React.SetStateAction<CVLanguage[]>>;
  educations: CVEducation[];
  setEducations: React.Dispatch<React.SetStateAction<CVEducation[]>>;

  // Actions
  addExperience: () => void;
  removeExperience: (id: number) => void;
  addSkill: () => void;
  removeSkill: (id: number) => void;
  addLanguage: () => void;
  removeLanguage: (id: number) => void;
  addEducation: () => void;
  removeEducation: (id: number) => void;
}

export const CVContentContext = createContext<CVContentType | undefined>(undefined);

interface CVContentProviderProps {
  children: ReactNode;
  value: CVContentType;
}

export const CVContentProvider: React.FC<CVContentProviderProps> = ({ children, value }) => {
  return (
    <CVContentContext.Provider value={value}>
      {children}
    </CVContentContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte du contenu du CV
export const useCVContent = (): CVContentType => {
  const context = React.useContext(CVContentContext);
  if (context === undefined) {
    throw new Error('useCVContent must be used within a CVContentProvider');
  }
  return context;
};
