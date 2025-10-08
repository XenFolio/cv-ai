import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { useLocalStorageCV } from '../../hooks/useLocalStorageCV';
import { useCVLibrary } from '../../hooks/useCVLibrary';
import { useCVSections } from '../../hooks/useCVSections';
import { templates } from './templates';
import {
  defaultCVContent,
  defaultExperiences,
  defaultSkills,
  defaultLanguages,
  defaultEducations
} from './constants';
import type { CVContent, CVExperience, CVSkill, CVLanguage, CVEducation } from './types';

export const useCVData = () => {
  const { profile, profileLoading } = useSupabase();
  const {
    saveToLocalStorage,
    loadFromLocalStorage,
    hasLocalData,
    lastSaved,
    autoSaveEnabled,
    setAutoSaveEnabled
  } = useLocalStorageCV();
  const { addCreatedCV } = useCVLibrary();
  const {
    sections,
    toggleSectionVisibility,
    setSectionsOrder: setSectionsOrderFunc,
    cleanupLayers,
    expandSection,
    contractSection
  } = useCVSections();

  // États principaux
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('');
  const [editableContent, setEditableContent] = useState<CVContent>(defaultCVContent);
  const [experiences, setExperiences] = useState<CVExperience[]>(defaultExperiences);
  const [skills, setSkills] = useState<CVSkill[]>(defaultSkills);
  const [languages, setLanguages] = useState<CVLanguage[]>(defaultLanguages);
  const [educations, setEducations] = useState<CVEducation[]>(defaultEducations);

  // États de style
  const [customFont, setCustomFont] = useState<string>('Calibri');
  const [customColor, setCustomColor] = useState<string>('000000');
  const [titleColor, setTitleColor] = useState<string>('000000');
  const [layoutColumns, setLayoutColumns] = useState<number>(1);
  const [nameAlignment, setNameAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [photoAlignment, setPhotoAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [photoSize, setPhotoSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [photoShape, setPhotoShape] = useState<'circle' | 'square' | 'rounded'>('circle');
  const [nameFontSize, setNameFontSize] = useState<number>(18);

  // États pour les ajustements d'image
  const [photoZoom, setPhotoZoom] = useState<number>(100);
  const [photoPositionX, setPhotoPositionX] = useState<number>(0);
  const [photoPositionY, setPhotoPositionY] = useState<number>(0);
  const [photoRotation, setPhotoRotation] = useState<number>(0);
  const [photoObjectFit, setPhotoObjectFit] = useState<'contain' | 'cover'>('contain');

  // États pour la mise en page
  const [sectionSpacing, setSectionSpacing] = useState<0 | 1 | 2 | 3 | 4>(1);
  const [columnRatio, setColumnRatio] = useState<'1/2-1/2' | '1/3-2/3' | '2/3-1/3'>('1/2-1/2');
  const [pageMarginHorizontal, setPageMarginHorizontal] = useState<number>(20);
  const [pageMarginVertical, setPageMarginVertical] = useState<number>(20);

  // États UI
  const [editingField, setEditingField] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // État pour les couleurs de section
  const [sectionColors, setSectionColors] = useState<Record<string, {
    background: string;
    title: string;
    content: string;
    input: string;
    button: string;
    aiButton: string;
    separator: string;
    border: string;
  }>>({});

  // Fonction pour mettre à jour les couleurs d'un élément de section
  const updateSectionElementColor = useCallback((sectionId: string, elementType: 'background' | 'title' | 'content' | 'input' | 'button' | 'aiButton' | 'separator' | 'border', color: string) => {
    setSectionColors(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [elementType]: color
      }
    }));
  }, []);

  // Fonction de compatibilité pour l'ancien système
  const updateSectionColor = useCallback((sectionId: string, type: 'foreground' | 'background', color: string) => {
    if (type === 'foreground') {
      updateSectionElementColor(sectionId, 'title', color);
    } else {
      updateSectionElementColor(sectionId, 'background', color);
    }
  }, [updateSectionElementColor]);

  // Pré-remplissage avec les données du profil utilisateur
  useEffect(() => {
    let profileData = profile;

    if (!profile && !profileLoading) {
      try {
        const savedSettings = localStorage.getItem('cvAssistantSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.profile) {
            profileData = {
              id: 'localStorage-profile',
              first_name: settings.profile.firstName || '',
              last_name: settings.profile.lastName || '',
              email: settings.profile.email || '',
              phone: settings.profile.phone || '',
              address: settings.profile.address || '',
              postal_code: settings.profile.postalCode || '',
              city: settings.profile.city || '',
              country: settings.profile.country || '',
              date_of_birth: settings.profile.dateOfBirth || '',
              nationality: settings.profile.nationality || '',
              linkedin: settings.profile.linkedIn || '',
              website: settings.profile.website || '',
              profession: settings.profile.profession || '',
              company: settings.profile.company || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
        }
      } catch (error) {
        console.error('Erreur lors de la lecture du localStorage:', error);
      }
    }

    if (profileData) {
      const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
      const contactParts = [];
      if (profileData.email) contactParts.push(profileData.email);
      if (profileData.phone) contactParts.push(profileData.phone);
      if (profileData.linkedin) contactParts.push(profileData.linkedin);
      const contactLine = contactParts.length > 0 ? contactParts.join(' • ') : defaultCVContent.contact;

      let profileContent = defaultCVContent.profileContent;
      if (profileData.profession && profileData.company) {
        profileContent = `${profileData.profession} chez ${profileData.company}. Professionnel expérimenté avec une expertise dans mon domaine d'activité.`;
      } else if (profileData.profession) {
        profileContent = `${profileData.profession} expérimenté avec une solide expertise dans mon domaine d'activité.`;
      }

      const newContent = {
        ...defaultCVContent,
        name: fullName || defaultCVContent.name,
        contact: contactLine,
        profileContent: profileContent
      };

      setEditableContent(newContent);

      if (profileData.profession && profileData.company) {
        const newExperience = [{
          id: 1,
          content: `${profileData.profession} - ${profileData.company} (Dates)`,
          details: '• Réalisation clé ou projet important dans ce poste.'
        }];
        setExperiences(newExperience);
      }

      if (profileData.profession) {
        const newEducation = [{
          id: 1,
          degree: `Formation en ${profileData.profession}`,
          school: '[École]',
          year: '[Année]'
        }];
        setEducations(newEducation);
      }
    }
  }, [profile, profileLoading]);

  // Chargement des données sauvegardées
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData && !profile && !profileLoading) {
      if (savedData.editableContent) setEditableContent(savedData.editableContent);
      if (savedData.experiences) setExperiences(savedData.experiences);
      if (savedData.skills) setSkills(savedData.skills);
      if (savedData.languages) setLanguages(savedData.languages);
      if (savedData.educations) setEducations(savedData.educations);
      if (savedData.customFont) setCustomFont(savedData.customFont);
      if (savedData.customColor) setCustomColor(savedData.customColor);
      if (savedData.titleColor) setTitleColor(savedData.titleColor);
      if (savedData.layoutColumns) setLayoutColumns(savedData.layoutColumns);
      if (savedData.nameAlignment) setNameAlignment(savedData.nameAlignment);
      if (savedData.photoAlignment) setPhotoAlignment(savedData.photoAlignment);
      if (savedData.photoSize) setPhotoSize(savedData.photoSize);
      if (savedData.photoShape) setPhotoShape(savedData.photoShape);
      if (savedData.nameFontSize) setNameFontSize(savedData.nameFontSize);
      if (savedData.selectedTemplateName) setSelectedTemplateName(savedData.selectedTemplateName);
      if (savedData.selectedTemplate) setSelectedTemplate(savedData.selectedTemplate);
      if (savedData.sectionColors) setSectionColors(savedData.sectionColors);

      if (savedData.sections && Array.isArray(savedData.sections)) {
        localStorage.setItem('cvSectionsOrder', JSON.stringify(savedData.sections));
        window.dispatchEvent(new Event('cvSectionsUpdated'));
      }
    }
  }, [loadFromLocalStorage, profile, profileLoading]);

  // Simulation du chargement des templates
  useEffect(() => {
    const timer = setTimeout(() => {
      setTemplatesLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Sauvegarde automatique
  useEffect(() => {
    if (autoSaveEnabled) {
      const savedSectionsData = localStorage.getItem('cvSectionsOrder');
      let currentSections = [];
      if (savedSectionsData) {
        try {
          currentSections = JSON.parse(savedSectionsData);
        } catch (e) {
          console.warn('Erreur lors de la lecture des sections:', e);
        }
      }

      const dataToSave = {
        editableContent,
        experiences,
        skills,
        languages,
        educations,
        customFont,
        customColor,
        titleColor,
        layoutColumns,
        nameAlignment,
        photoAlignment,
        photoSize,
        photoShape,
        nameFontSize,
        sections: currentSections,
        sectionColors: sectionColors || {},
        selectedTemplateName,
        selectedTemplate
      };

      saveToLocalStorage(dataToSave);
    }
  }, [
    editableContent,
    experiences,
    skills,
    languages,
    educations,
    customFont,
    customColor,
    titleColor,
    layoutColumns,
    nameAlignment,
    photoAlignment,
    photoSize,
    photoShape,
    nameFontSize,
    sectionColors,
    selectedTemplateName,
    selectedTemplate,
    saveToLocalStorage,
    autoSaveEnabled
  ]);

  // Gestion du clic en dehors des sections
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-section]') && !target.closest('button') && !target.closest('[data-controls]')) {
        setSelectedSection(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return {
    // États principaux
    editableContent,
    setEditableContent,
    experiences,
    setExperiences,
    skills,
    setSkills,
    languages,
    setLanguages,
    educations,
    setEducations,
    selectedTemplate,
    setSelectedTemplate,
    selectedTemplateName,
    setSelectedTemplateName,
    templatesLoading,
    error,
    setError,

    // États de style
    customFont,
    setCustomFont,
    customColor,
    setCustomColor,
    titleColor,
    setTitleColor,
    layoutColumns,
    setLayoutColumns,
    nameAlignment,
    setNameAlignment,
    photoAlignment,
    setPhotoAlignment,
    photoSize,
    setPhotoSize,
    photoShape,
    setPhotoShape,
    nameFontSize,
    setNameFontSize,
    photoZoom,
    setPhotoZoom,
    photoPositionX,
    setPhotoPositionX,
    photoPositionY,
    setPhotoPositionY,
    photoRotation,
    setPhotoRotation,
    photoObjectFit,
    setPhotoObjectFit,
    sectionSpacing,
    setSectionSpacing,
    columnRatio,
    setColumnRatio,
    pageMarginHorizontal,
    setPageMarginHorizontal,
    pageMarginVertical,
    setPageMarginVertical,

    // États UI
    editingField,
    setEditingField,
    selectedSection,
    setSelectedSection,
    sectionColors,
    setSectionColors,
    updateSectionColor,
    updateSectionElementColor,

    // Sections
    sections,
    toggleSectionVisibility,
    setSectionsOrder: setSectionsOrderFunc,
    cleanupLayers,
    expandSection,
    contractSection,

    // Données utilitaires
    hasLocalData,
    lastSaved,
    autoSaveEnabled,
    setAutoSaveEnabled,
    addCreatedCV,
    templates
  };
};
