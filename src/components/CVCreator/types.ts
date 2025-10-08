import React from 'react';

// Types pour le contenu du CV
export interface CVContent {
  name: string;
  contact: string;
  contactTitle: string;
  profileTitle: string;
  profileContent: string;
  experienceTitle: string;
  educationTitle: string;
  skillsTitle: string;
  languagesTitle: string;
  photo?: string; // URL de la photo en base64 ou URL
}

export interface CVExperience {
  id: number;
  content: string;
  details: string;
}

export interface CVSkill {
  id: number;
  content: string;
}

export interface CVLanguage {
  id: number;
  name: string;
  level: string;
}

export interface CVEducation {
  id: number;
  degree: string;
  school: string;
  year: string;
}



export interface SectionConfig {
  id: string;
  name: string;
  component: string;
  visible: boolean;
  layer: number;
  order: number;                // ordre dans le layer (0 = gauche, 1 = droite)
  width?: "full" | "half" | "1/3" | "2/3";      // largeur visuelle
  alignment?: 'left' | 'center' | 'right';     // alignement du contenu
}


// Interface pour les props du composant CVPreview
export interface CVPreviewProps {
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
  editingField: string | null;
  setEditingField: React.Dispatch<React.SetStateAction<string | null>>;
  customFont?: string;
  setCustomFont?: React.Dispatch<React.SetStateAction<string>>;
  customColor?: string;
  setCustomColor?: React.Dispatch<React.SetStateAction<string>>;
  titleColor?: string;
  setTitleColor?: React.Dispatch<React.SetStateAction<string>>;
  layoutColumns?: number;
  setLayoutColumns?: React.Dispatch<React.SetStateAction<number>>;
  nameAlignment?: 'left' | 'center' | 'right';
  setNameAlignment?: React.Dispatch<React.SetStateAction<'left' | 'center' | 'right'>>;
  photoAlignment?: 'left' | 'center' | 'right';
  setPhotoAlignment?: React.Dispatch<React.SetStateAction<'left' | 'center' | 'right'>>;
  photoSize?: 'small' | 'medium' | 'large';
  setPhotoSize?: React.Dispatch<React.SetStateAction<'small' | 'medium' | 'large'>>;
  photoShape?: 'circle' | 'square' | 'rounded';
  setPhotoShape?: React.Dispatch<React.SetStateAction<'circle' | 'square' | 'rounded'>>;
  nameFontSize?: number;
  setNameFontSize?: React.Dispatch<React.SetStateAction<number>>;
  // Nouveaux props pour les ajustements d'image
  photoZoom?: number;
  setPhotoZoom?: React.Dispatch<React.SetStateAction<number>>;
  photoPositionX?: number;
  setPhotoPositionX?: React.Dispatch<React.SetStateAction<number>>;
  photoPositionY?: number;
  setPhotoPositionY?: React.Dispatch<React.SetStateAction<number>>;
  photoRotation?: number;
  setPhotoRotation?: React.Dispatch<React.SetStateAction<number>>;
  photoObjectFit?: 'contain' | 'cover';
  setPhotoObjectFit?: React.Dispatch<React.SetStateAction<'contain' | 'cover'>>;
  selectedSection?: string | null;
  setSelectedSection?: React.Dispatch<React.SetStateAction<string | null>>;
  availableFonts?: string[];
  availableColors?: Array<{
    name: string;
    value: string;
    category: string;
  }>;
  addExperience: () => void;
  removeExperience: (id: number) => void;
  addSkill: () => void;
  removeSkill: (id: number) => void;
  addLanguage: () => void;
  removeLanguage: (id: number) => void;
  addEducation: () => void;
  removeEducation: (id: number) => void;
  generateWithAI: (field: string, currentContent?: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
  openAIError?: string | null;
  setSectionsOrder?: (sections: SectionConfig[]) => void;
  templateName?: string;
}

// Interface pour les props des sections individuelles
export interface BaseSectionProps {
  editableContent: CVContent;
  setEditableContent: React.Dispatch<React.SetStateAction<CVContent>>;
  editingField: string | null;
  setEditingField: React.Dispatch<React.SetStateAction<string | null>>;
  customColor: string;
  titleColor: string;
  generateWithAI: (field: string, currentContent?: string) => Promise<void>;
  isLoading: boolean;
  sectionId: string;
}

export interface ExperienceSectionProps extends BaseSectionProps {
  experiences: CVExperience[];
  setExperiences: React.Dispatch<React.SetStateAction<CVExperience[]>>;
  addExperience: () => void;
  removeExperience: (id: number) => void;
}

export interface EducationSectionProps extends BaseSectionProps {
  educations: CVEducation[];
  setEducations: React.Dispatch<React.SetStateAction<CVEducation[]>>;
  addEducation: () => void;
  removeEducation: (id: number) => void;
}

export interface SkillsSectionProps extends BaseSectionProps {
  skills: CVSkill[];
  setSkills: React.Dispatch<React.SetStateAction<CVSkill[]>>;
  addSkill: () => void;
  removeSkill: (id: number) => void;
}

export interface LanguagesSectionProps extends BaseSectionProps {
  languages: CVLanguage[];
  setLanguages: React.Dispatch<React.SetStateAction<CVLanguage[]>>;
  addLanguage: () => void;
  removeLanguage: (id: number) => void;
}

export interface NameSectionProps extends BaseSectionProps {
  nameAlignment: 'left' | 'center' | 'right';
  nameFontSize: number;
}

export interface PhotoSectionProps extends BaseSectionProps {
  photoAlignment: 'left' | 'center' | 'right';
  photoSize: 'small' | 'medium' | 'large';
  photoShape: 'circle' | 'square' | 'rounded';
  photoZoom: number;
  photoPositionX: number;
  photoPositionY: number;
  photoRotation: number;
  photoObjectFit: 'contain' | 'cover';
}

export type ProfileSectionProps = BaseSectionProps;

export type ContactSectionProps = BaseSectionProps;
