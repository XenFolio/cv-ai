import { useMemo } from 'react';
import type { CVContent, CVExperience, CVSkill, CVLanguage, CVEducation } from '../types';

interface UseCVCreatorContextProps {
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
  selectedTemplateName: string;
  selectedTemplate: string | null;

  // Sections state
  sections: any[];
  toggleSectionVisibility: (sectionId: string) => void;
  setSectionsOrder: (sections: any[]) => void;
  cleanupLayers: () => void;
  expandSection: (sectionId: string) => void;
  contractSection: (sectionId: string) => void;
  sectionColors: Record<string, any>;
  setSectionColors: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  updateSectionColor: (sectionId: string, type: 'foreground' | 'background', color: string) => void;
  updateSectionElementColor: (sectionId: string, elementType: string, color: string) => void;

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
  isLoading: boolean;
  error: string | null;
  openAIError: string | null;
}

export const useCVCreatorContext = (props: UseCVCreatorContextProps) => {
  const contextValue = useMemo(() => ({
    // Content state
    editableContent: props.editableContent,
    setEditableContent: props.setEditableContent,
    experiences: props.experiences,
    setExperiences: props.setExperiences,
    skills: props.skills,
    setSkills: props.setSkills,
    languages: props.languages,
    setLanguages: props.setLanguages,
    educations: props.educations,
    setEducations: props.setEducations,

    // Style state
    customFont: props.customFont,
    setCustomFont: props.setCustomFont,
    customColor: props.customColor,
    setCustomColor: props.setCustomColor,
    titleColor: props.titleColor,
    setTitleColor: props.setTitleColor,
    layoutColumns: props.layoutColumns,
    setLayoutColumns: props.setLayoutColumns,
    nameAlignment: props.nameAlignment,
    setNameAlignment: props.setNameAlignment,
    photoAlignment: props.photoAlignment,
    setPhotoAlignment: props.setPhotoAlignment,
    photoSize: props.photoSize,
    setPhotoSize: props.setPhotoSize,
    photoShape: props.photoShape,
    setPhotoShape: props.setPhotoShape,
    nameFontSize: props.nameFontSize,
    setNameFontSize: props.setNameFontSize,
    photoZoom: props.photoZoom,
    setPhotoZoom: props.setPhotoZoom,
    photoPositionX: props.photoPositionX,
    setPhotoPositionX: props.setPhotoPositionX,
    photoPositionY: props.photoPositionY,
    setPhotoPositionY: props.setPhotoPositionY,
    photoRotation: props.photoRotation,
    setPhotoRotation: props.setPhotoRotation,
    photoObjectFit: props.photoObjectFit,
    setPhotoObjectFit: props.setPhotoObjectFit,
    sectionSpacing: props.sectionSpacing,
    setSectionSpacing: props.setSectionSpacing,
    columnRatio: props.columnRatio,
    setColumnRatio: props.setColumnRatio,
    pageMarginHorizontal: props.pageMarginHorizontal,
    setPageMarginHorizontal: props.setPageMarginHorizontal,
    pageMarginVertical: props.pageMarginVertical,
    setPageMarginVertical: props.setPageMarginVertical,

    // UI state
    editingField: props.editingField,
    setEditingField: props.setEditingField,
    selectedSection: props.selectedSection,
    setSelectedSection: props.setSelectedSection,
    selectedTemplateName: props.selectedTemplateName,
    selectedTemplate: props.selectedTemplate,

    // Sections state
    sections: props.sections,
    toggleSectionVisibility: props.toggleSectionVisibility,
    setSectionsOrder: props.setSectionsOrder,
    cleanupLayers: props.cleanupLayers,
    expandSection: props.expandSection,
    contractSection: props.contractSection,
    sectionColors: props.sectionColors,
    setSectionColors: props.setSectionColors,
    updateSectionColor: props.updateSectionColor,
    updateSectionElementColor: props.updateSectionElementColor,

    // Actions
    addExperience: props.addExperience,
    removeExperience: props.removeExperience,
    addSkill: props.addSkill,
    removeSkill: props.removeSkill,
    addLanguage: props.addLanguage,
    removeLanguage: props.removeLanguage,
    addEducation: props.addEducation,
    removeEducation: props.removeEducation,
    generateWithAI: props.generateWithAI,

    // Data
    availableFonts: ['Calibri', 'Georgia', 'Helvetica', 'Consolas', 'Times New Roman', 'Arial'],
    availableColors: [
      { name: 'Noir', value: '000000', category: 'Neutres' },
      { name: 'Gris anthracite', value: '374151', category: 'Neutres' },
      { name: 'Bleu nuit', value: '1E3A8A', category: 'Bleus' },
      { name: 'Vert forêt', value: '065F46', category: 'Verts' },
      { name: 'Violet royal', value: '7C3AED', category: 'Violets' },
      { name: 'Bordeaux', value: '7F1D1D', category: 'Rouges' },
      { name: 'Orange brûlé', value: 'C2410C', category: 'Oranges' }
    ],
    isLoading: props.isLoading,
    error: props.error,
    openAIError: props.openAIError
  }), [props]);

  return contextValue;
};