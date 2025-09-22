import { useState, useEffect, useCallback, useRef } from 'react';
import type { CVContent, CVExperience, CVSkill, CVLanguage, CVEducation, SectionConfig } from '../components/CVCreator/types';

// Type pour les couleurs granulaires par section
interface SectionColors {
  background: string;
  title: string;
  content: string;
  input: string;
  button: string;
  aiButton: string;
  separator: string;
  border: string;
}

interface CVData {
  editableContent: CVContent;
  experiences: CVExperience[];
  skills: CVSkill[];
  languages: CVLanguage[];
  educations: CVEducation[];
  customFont: string;
  customColor: string;
  titleColor: string;
  layoutColumns: number;
  nameAlignment: 'left' | 'center' | 'right';
  photoAlignment?: 'left' | 'center' | 'right';
  photoSize?: 'small' | 'medium' | 'large';
  photoShape?: 'circle' | 'square' | 'rounded';
  nameFontSize?: number;
  sections: SectionConfig[];
  sectionColors: Record<string, SectionColors>;
  selectedTemplateName: string;
  selectedTemplate: string | null;
  lastSaved: string;
}

const CV_STORAGE_KEY = 'cvCreatorData';
const AUTO_SAVE_DELAY = 2000; // 2 secondes

export const useLocalStorageCV = () => {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sauvegarder les données dans localStorage
  const saveToLocalStorage = useCallback((data: Partial<CVData>) => {
    if (!autoSaveEnabled) return;

    try {
      const existingData = localStorage.getItem(CV_STORAGE_KEY);
      const currentData: CVData = existingData ? JSON.parse(existingData) : {};
      
      const updatedData: CVData = {
        ...currentData,
        ...data,
        lastSaved: new Date().toISOString()
      };

      localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(updatedData));
      setLastSaved(new Date());
      console.log('CV sauvegardé automatiquement dans localStorage');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans localStorage:', error);
    }
  }, [autoSaveEnabled]);

  // Sauvegarder avec délai (debounce)
  const debouncedSave = useCallback((data: Partial<CVData>) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const timeout = setTimeout(() => {
      saveToLocalStorage(data);
    }, AUTO_SAVE_DELAY);

    saveTimeoutRef.current = timeout;
  }, [saveToLocalStorage]);

  // Charger les données depuis localStorage
  const loadFromLocalStorage = useCallback((): CVData | null => {
    try {
      const savedData = localStorage.getItem(CV_STORAGE_KEY);
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log('Données CV chargées depuis localStorage');
        return data;
      }
    } catch (error) {
      console.error('Erreur lors du chargement depuis localStorage:', error);
    }
    return null;
  }, []);

  // Supprimer les données sauvegardées
  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(CV_STORAGE_KEY);
      setLastSaved(null);
      console.log('Données CV supprimées du localStorage');
    } catch (error) {
      console.error('Erreur lors de la suppression du localStorage:', error);
    }
  }, []);

  // Vérifier si des données existent
  const hasLocalData = useCallback((): boolean => {
    try {
      const savedData = localStorage.getItem(CV_STORAGE_KEY);
      return savedData !== null;
    } catch {
      return false;
    }
  }, []);

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveToLocalStorage: debouncedSave,
    loadFromLocalStorage,
    clearLocalStorage,
    hasLocalData,
    autoSaveEnabled,
    setAutoSaveEnabled,
    lastSaved
  };
};
