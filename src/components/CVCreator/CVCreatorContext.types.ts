import type { CVExperience, CVSkill, CVLanguage, CVEducation, CVContent } from './types';
import type { SectionConfig } from './types';

export interface CVCreatorContextType {
  // Content state
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

  // Style state
  customFont: string;
  setCustomFont: React.Dispatch<React.SetStateAction<string>>;
  customColor: string;
  setCustomColor: React.Dispatch<React.SetStateAction<string>>;
  titleColor: string;
  setTitleColor: React.Dispatch<React.SetStateAction<string>>;
  layoutColumns: number;
  setLayoutColumns: React.Dispatch<React.SetStateAction<number>>;
  nameAlignment: 'left' | 'center' | 'right';
  setNameAlignment: React.Dispatch<React.SetStateAction<'left' | 'center' | 'right'>>;
  photoAlignment: 'left' | 'center' | 'right';
  setPhotoAlignment: React.Dispatch<React.SetStateAction<'left' | 'center' | 'right'>>;
  photoSize: 'small' | 'medium' | 'large';
  setPhotoSize: React.Dispatch<React.SetStateAction<'small' | 'medium' | 'large'>>;
  photoShape: 'circle' | 'square' | 'rounded';
  setPhotoShape: React.Dispatch<React.SetStateAction<'circle' | 'square' | 'rounded'>>;
  nameFontSize: number;
  setNameFontSize: React.Dispatch<React.SetStateAction<number>>;
  photoZoom: number;
  setPhotoZoom: React.Dispatch<React.SetStateAction<number>>;
  photoPositionX: number;
  setPhotoPositionX: React.Dispatch<React.SetStateAction<number>>;
  photoPositionY: number;
  setPhotoPositionY: React.Dispatch<React.SetStateAction<number>>;
  photoRotation: number;
  setPhotoRotation: React.Dispatch<React.SetStateAction<number>>;
  photoObjectFit: 'contain' | 'cover';
  setPhotoObjectFit: React.Dispatch<React.SetStateAction<'contain' | 'cover'>>;
  sectionSpacing: 0 | 1 | 2 | 3 | 4;
  setSectionSpacing: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3 | 4>>;
  columnRatio: '1/2-1/2' | '1/3-2/3' | '2/3-1/3';
  setColumnRatio: React.Dispatch<React.SetStateAction<'1/2-1/2' | '1/3-2/3' | '2/3-1/3'>>;
  pageMarginHorizontal: number;
  setPageMarginHorizontal: React.Dispatch<React.SetStateAction<number>>;
  pageMarginVertical: number;
  setPageMarginVertical: React.Dispatch<React.SetStateAction<number>>;

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
  // Section colors state - granular per element type
  sectionColors: Record<string, {
    background: string;
    title: string;
    content: string;
    input: string;
    button: string;
    aiButton: string;
    separator: string;
    border: string;
  }>;
  setSectionColors: React.Dispatch<React.SetStateAction<Record<string, {
    background: string;
    title: string;
    content: string;
    input: string;
    button: string;
    aiButton: string;
    separator: string;
    border: string;
  }>>>;
  updateSectionElementColor: (sectionId: string, elementType: 'background' | 'title' | 'content' | 'input' | 'button' | 'aiButton' | 'separator' | 'border', color: string) => void;
  updateSectionCapitalization: (sectionId: string, capitalize: boolean) => void;
  capitalizeSections: Record<string, boolean>;
  selectedTemplateName: string;
  selectedTemplate: string | null;

  // Actions
  addExperience: () => void;
  removeExperience: (id: number) => void;
  addSkill: () => void;
  removeSkill: (id: number) => void;
  addLanguage: () => void;
  removeLanguage: (id: number) => void;
  addEducation: () => void;
  removeEducation: (id: number) => void;
  generateWithAI: (field: string, currentContent?: string) => Promise<void>;

  // Data
  availableFonts: string[];
  availableColors: Array<{ name: string; value: string; category: string }>;
  isLoading: boolean;
  error: string | null;
  openAIError: string | null;
}
