import React, { createContext,  ReactNode } from 'react';

// Types pour le style du CV
export interface CVStyleType {
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
  setCapitalizeSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  updateSectionTopBorder: (sectionId: string, hasTopBorder: boolean) => void;
  sectionTopBorders: Record<string, boolean>;
  setSectionTopBorders: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  // Data
  availableFonts: string[];
  availableColors: Array<{ name: string; value: string; category: string }>;
}

export const CVStyleContext = createContext<CVStyleType | undefined>(undefined);

interface CVStyleProviderProps {
  children: ReactNode;
  value: CVStyleType;
}

export const CVStyleProvider: React.FC<CVStyleProviderProps> = ({ children, value }) => {
  return (
    <CVStyleContext.Provider value={value}>
      {children}
    </CVStyleContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte du style du CV
export const useCVStyle = (): CVStyleType => {
  const context = React.useContext(CVStyleContext);
  if (context === undefined) {
    throw new Error('useCVStyle must be used within a CVStyleProvider');
  }
  return context;
};
