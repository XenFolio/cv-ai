import React, { useState, useEffect, useCallback } from 'react';
import { useOpenAI } from '../../hooks/useOpenAI';
import { useSupabase } from '../../hooks/useSupabase';
import { useLocalStorageCV } from '../../hooks/useLocalStorageCV';
import { useCVLibrary } from '../../hooks/useCVLibrary';
import { useCVSections } from '../../hooks/useCVSections';
import { CVTemplateCarousel } from './CVTemplateCarousel';
import { TemplateSkeleton } from './TemplateSkeleton';
import { CVCreatorProvider } from './CVCreatorContext.provider';
import { BreadcrumbNavigation } from '../UI/BreadcrumbNavigation';
import { useAppStore } from '../../store/useAppStore';
import { NavigationIcons } from '../UI/iconsData';
import { PreviewModule } from './modules/PreviewModule';
import { StyleControlsModule } from './modules/StyleControlsModule';

import type { CVExperience, CVSkill, CVLanguage, CVContent, CVEducation, SectionConfig } from './types';
import { templates, type Template } from './templates';

// SectionConfig interface removed - imported from types now


const availableFonts = ['Calibri', 'Georgia', 'Helvetica', 'Consolas', 'Times New Roman', 'Arial'];
const availableColors = [
  // Neutres
  { name: 'Noir', value: '000000', category: 'Neutres' },
  { name: 'Gris anthracite', value: '374151', category: 'Neutres' },
  { name: 'Gris ardoise', value: '64748B', category: 'Neutres' },
  { name: 'Gris clair', value: '94A3B8', category: 'Neutres' },
  
  // Bleus
  { name: 'Bleu nuit', value: '1E3A8A', category: 'Bleus' },
  { name: 'Bleu marine', value: '1E40AF', category: 'Bleus' },
  { name: 'Bleu royal', value: '2563EB', category: 'Bleus' },
  { name: 'Bleu ciel', value: '3B82F6', category: 'Bleus' },
  
  // Verts
  { name: 'Vert sapin', value: '064E3B', category: 'Verts' },
  { name: 'Vert forêt', value: '065F46', category: 'Verts' },
  { name: 'Émeraude', value: '059669', category: 'Verts' },
  { name: 'Vert menthe', value: '10B981', category: 'Verts' },
  
  // Violets
  { name: 'Violet profond', value: '581C87', category: 'Violets' },
  { name: 'Violet royal', value: '7C3AED', category: 'Violets' },
  { name: 'Violet clair', value: '8B5CF6', category: 'Violets' },
  { name: 'Lavande', value: 'A78BFA', category: 'Violets' },
  
  // Rouges
  { name: 'Bordeaux', value: '7F1D1D', category: 'Rouges' },
  { name: 'Rouge cardinal', value: 'DC2626', category: 'Rouges' },
  { name: 'Rouge corail', value: 'EF4444', category: 'Rouges' },
  { name: 'Rose', value: 'F87171', category: 'Rouges' },
  
  // Oranges
  { name: 'Orange brûlé', value: 'C2410C', category: 'Oranges' },
  { name: 'Orange vif', value: 'EA580C', category: 'Oranges' },
  { name: 'Orange clair', value: 'FB923C', category: 'Oranges' },
  { name: 'Pêche', value: 'FDBA74', category: 'Oranges' }
];

export const CVCreator: React.FC = () => {
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('');
  const [customFont, setCustomFont] = useState<string>('Calibri');
  const [customColor, setCustomColor] = useState<string>('000000');
  const [titleColor, setTitleColor] = useState<string>('000000');
  const [layoutColumns, setLayoutColumns] = useState<number>(1);
  const [nameAlignment, setNameAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [photoAlignment, setPhotoAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [photoSize, setPhotoSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [photoShape, setPhotoShape] = useState<'circle' | 'square' | 'rounded'>('circle');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [nameFontSize, setNameFontSize] = useState<number>(18);
  // États pour les ajustements d'image
  const [photoZoom, setPhotoZoom] = useState<number>(100);
  const [photoPositionX, setPhotoPositionX] = useState<number>(0);
  const [photoPositionY, setPhotoPositionY] = useState<number>(0);
  const [photoRotation, setPhotoRotation] = useState<number>(0);
  const [photoObjectFit, setPhotoObjectFit] = useState<'contain' | 'cover'>('contain');
  const [sectionSpacing, setSectionSpacing] = useState<0 | 1 | 2 | 3 | 4>(1);
  const [columnRatio, setColumnRatio] = useState<'1/2-1/2' | '1/3-2/3' | '2/3-1/3'>('1/2-1/2');
  const [pageMarginHorizontal, setPageMarginHorizontal] = useState<number>(20);
  const [pageMarginVertical, setPageMarginVertical] = useState<number>(20);
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
  // État pour la capitalisation des sections
  const [capitalizeSections, setCapitalizeSections] = useState<Record<string, boolean>>({});
  // État pour les traits de séparation en haut des sections
  const [sectionTopBorders, setSectionTopBorders] = useState<Record<string, boolean>>({});

  // État pour la bibliothèque de compétences (centralisé)
  const [skillsLibraryState, setSkillsLibraryState] = useState({
    showSkillsLibrary: false,
    selectedCategory: '',
    availableCategories: [] as string[],
    categorySkills: [] as Array<{ id: number; name: string; category: string }>,
    searchQuery: '',
    searchResults: [] as Array<{ id: number; name: string; category: string }>
  });

  // État pour la disposition des compétences
  const [skillsLayout, setSkillsLayout] = useState<'free' | '1col' | '2col' | '3col'>('free');

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

  // Fonction pour mettre à jour la capitalisation d'une section
  const updateSectionCapitalization = useCallback((sectionId: string, capitalize: boolean) => {
    setCapitalizeSections(prev => ({
      ...prev,
      [sectionId]: capitalize
    }));
  }, []);

  // Fonction pour mettre à jour les traits de séparation en haut d'une section
  const updateSectionTopBorder = useCallback((sectionId: string, hasTopBorder: boolean) => {
    setSectionTopBorders(prev => ({
      ...prev,
      [sectionId]: hasTopBorder
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

  // Déclaration du state skills AVANT toute utilisation
  const [skills, setSkills] = useState<CVSkill[]>([
    { id: 1, content: 'Compétence 1' },
    { id: 2, content: 'Compétence 2' },
    { id: 3, content: 'Compétence 3' }
  ]);

  // Fonctions pour la bibliothèque de compétences
  const closeSkillsLibrary = useCallback(() => {
    setSkillsLibraryState(prev => ({ ...prev, showSkillsLibrary: false }));
  }, []);

  const loadSkillsForCategory = useCallback((category: string) => {
    const skillsByCategory: Record<string, Array<{ id: number; name: string; category: string }>> = {
      'Développement': [
        { id: 1, name: 'JavaScript', category: 'Développement' },
        { id: 2, name: 'React', category: 'Développement' },
        { id: 3, name: 'TypeScript', category: 'Développement' },
        { id: 4, name: 'Node.js', category: 'Développement' },
        { id: 5, name: 'Python', category: 'Développement' },
        { id: 6, name: 'HTML/CSS', category: 'Développement' },
        { id: 7, name: 'Git', category: 'Développement' },
        { id: 8, name: 'Docker', category: 'Développement' }
      ],
      'Marketing': [
        { id: 9, name: 'Google Analytics', category: 'Marketing' },
        { id: 10, name: 'SEO/SEM', category: 'Marketing' },
        { id: 11, name: 'Social Media', category: 'Marketing' },
        { id: 12, name: 'Content Marketing', category: 'Marketing' },
        { id: 13, name: 'Email Marketing', category: 'Marketing' }
      ],
      'Finance': [
        { id: 14, name: 'Excel', category: 'Finance' },
        { id: 15, name: 'Modélisation financière', category: 'Finance' },
        { id: 16, name: 'Analyse de risque', category: 'Finance' },
        { id: 17, name: 'Bloomberg', category: 'Finance' },
        { id: 18, name: 'SAP', category: 'Finance' }
      ],
      'Design': [
        { id: 19, name: 'Photoshop', category: 'Design' },
        { id: 20, name: 'Illustrator', category: 'Design' },
        { id: 21, name: 'Figma', category: 'Design' },
        { id: 22, name: 'Sketch', category: 'Design' }
      ],
      'Communication': [
        { id: 23, name: 'Rédaction', category: 'Communication' },
        { id: 24, name: 'Présentation', category: 'Communication' },
        { id: 25, name: 'Négociation', category: 'Communication' },
        { id: 26, name: 'Gestion de projet', category: 'Communication' }
      ],
      'Management': [
        { id: 27, name: 'Leadership', category: 'Management' },
        { id: 28, name: 'Management d\'équipe', category: 'Management' },
        { id: 29, name: 'Stratégie', category: 'Management' },
        { id: 30, name: 'Prise de décision', category: 'Management' }
      ],
      'Data': [
        { id: 31, name: 'SQL', category: 'Data' },
        { id: 32, name: 'Tableau', category: 'Data' },
        { id: 33, name: 'Power BI', category: 'Data' },
        { id: 34, name: 'Machine Learning', category: 'Data' }
      ],
      'Autres': [
        { id: 35, name: 'Anglais', category: 'Autres' },
        { id: 36, name: 'Espagnol', category: 'Autres' },
        { id: 37, name: 'Résolution de problèmes', category: 'Autres' }
      ]
    };

    const categorySkills = skillsByCategory[category] || [];

    setSkillsLibraryState(prev => ({
      ...prev,
      categorySkills,
      searchResults: categorySkills
    }));
  }, []);

  const openSkillsLibrary = useCallback(() => {
    // Initialiser les catégories disponibles
    const categories = ['Développement', 'Marketing', 'Finance', 'Design', 'Communication', 'Management', 'Data', 'Autres'];

    setSkillsLibraryState(prev => ({
      ...prev,
      showSkillsLibrary: true,
      availableCategories: categories,
      selectedCategory: categories[0] || ''
    }));

    // Charger les compétences pour la première catégorie
    loadSkillsForCategory(categories[0] || '');
  }, [loadSkillsForCategory]);

  const searchSkills = useCallback((query: string) => {
    setSkillsLibraryState(prev => ({ ...prev, searchQuery: query }));

    if (!query.trim()) {
      setSkillsLibraryState(prev => ({ ...prev, searchResults: prev.categorySkills }));
      return;
    }

    const allSkills: Array<{ id: number; name: string; category: string }> = [
      ...skillsLibraryState.categorySkills,
      // Ajouter d'autres compétences si nécessaire
    ];

    const filtered = allSkills.filter(skill =>
      skill.name.toLowerCase().includes(query.toLowerCase())
    );

    setSkillsLibraryState(prev => ({ ...prev, searchResults: filtered }));
  }, [skillsLibraryState.categorySkills]);

  const setSelectedSkillsCategory = useCallback((category: string) => {
    setSkillsLibraryState(prev => ({ ...prev, selectedCategory: category }));
    loadSkillsForCategory(category);
  }, [loadSkillsForCategory]);

  const addSkillFromLibrary = useCallback((skill: { id: number; name: string; category: string }) => {
    // Vérifier si la compétence n'est pas déjà ajoutée
    const skillExists = skills.some(s => s.content === skill.name);
    if (!skillExists) {
      const newId = skills.length > 0 ? Math.max(...skills.map(s => s.id)) + 1 : 1;
      setSkills(prev => [...prev, { id: newId, content: skill.name }]);
    }
  }, [skills]);

  // Hook pour la gestion des sections
  const {
    sections,
    toggleSectionVisibility,
    setSectionsOrder: setSectionsOrderFunc,
    cleanupLayers,
    expandSection,
    contractSection
  } = useCVSections();

  // Log pour déboguer
  console.log('Sections from hook:', sections);

  // Gérer le clic en dehors des sections pour désélectionner
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Vérifier si le clic est en dehors des sections et des contrôles
      if (!target.closest('[data-section]') && !target.closest('button') && !target.closest('[data-controls]')) {
        setSelectedSection(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [editableContent, setEditableContent] = useState<CVContent>({
    name: '[VOTRE NOM]',
    contact: '[Votre Email] • [Votre Téléphone] • [LinkedIn]',
    contactTitle: 'CONTACT',
    profileTitle: 'PROFIL',
    profileContent: 'Résumé de votre profil et de vos objectifs.',
    experienceTitle: 'EXPÉRIENCE PROFESSIONNELLE',
    educationTitle: 'FORMATION',
    skillsTitle: 'COMPÉTENCES TECHNIQUES',
    languagesTitle: 'LANGUES'
  });

  // Hook pour récupérer les données du profil utilisateur
  const { profile, profileLoading } = useSupabase();

  // Hook pour la sauvegarde automatique dans localStorage
  const {
    saveToLocalStorage,
    loadFromLocalStorage,
    hasLocalData,
    lastSaved,
    autoSaveEnabled,
    setAutoSaveEnabled
  } = useLocalStorageCV();

  // Hook pour la bibliothèque CV
  const { addCreatedCV } = useCVLibrary();

  const [experiences, setExperiences] = useState<CVExperience[]>([
    { id: 1, content: '[Poste] - [Entreprise] (Dates)', details: '• Réalisation clé ou projet important.' }
  ]);

  const [languages, setLanguages] = useState<CVLanguage[]>([
    { id: 1, name: 'Français', level: 'Natif' },
    { id: 2, name: 'Anglais', level: 'Courant' }
  ]);

  const [educations, setEducations] = useState<CVEducation[]>([
    { id: 1, degree: '[Diplôme]', school: '[École]', year: '[Année]' }
  ]);

  const [editingField, setEditingField] = useState<string | null>(null);
  const { editCVField, isLoading, error: openAIError } = useOpenAI();

  // Effet pour pré-remplir le CV avec les données du profil utilisateur
  useEffect(() => {
    console.log('CVCreator useEffect - Profile:', profile);
    console.log('CVCreator useEffect - ProfileLoading:', profileLoading);
    
    // Essayer de récupérer les données depuis localStorage si pas de profil Supabase
    let profileData = profile;
    
    if (!profile && !profileLoading) {
      console.log('CVCreator - Pas de profil Supabase, tentative de récupération depuis localStorage');
      try {
        const savedSettings = localStorage.getItem('cvAssistantSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          console.log('CVCreator - Settings complets:', settings);
          if (settings.profile) {
            console.log('CVCreator - Données trouvées dans localStorage:', settings.profile);
            console.log('CVCreator - firstName:', settings.profile.firstName);
            console.log('CVCreator - lastName:', settings.profile.lastName);
            console.log('CVCreator - profession:', settings.profile.profession);
            console.log('CVCreator - company:', settings.profile.company);
            
            // Convertir le format localStorage vers le format Supabase
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
            console.log('CVCreator - ProfileData converti:', profileData);
          }
        }
      } catch (error) {
        console.error('CVCreator - Erreur lors de la lecture du localStorage:', error);
      }
    }
    
    if (profileData) {
      console.log('CVCreator - Pré-remplissage avec les données du profil:', profileData);
      
      // Construire le nom complet
      const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
      console.log('CVCreator - Nom complet:', fullName);
      
      // Construire la ligne de contact
      const contactParts = [];
      if (profileData.email) contactParts.push(profileData.email);
      if (profileData.phone) contactParts.push(profileData.phone);
      if (profileData.linkedin) contactParts.push(profileData.linkedin);
      const contactLine = contactParts.length > 0 ? contactParts.join(' • ') : '[Votre Email] • [Votre Téléphone] • [LinkedIn]';
      console.log('CVCreator - Ligne de contact:', contactLine);
      
      // Construire le contenu du profil professionnel
      let profileContent = 'Résumé de votre profil et de vos objectifs.';
      if (profileData.profession && profileData.company) {
        profileContent = `${profileData.profession} chez ${profileData.company}. Professionnel expérimenté avec une expertise dans mon domaine d'activité.`;
      } else if (profileData.profession) {
        profileContent = `${profileData.profession} expérimenté avec une solide expertise dans mon domaine d'activité.`;
      }
      console.log('CVCreator - Contenu profil:', profileContent);

      // Créer le nouveau contenu sans dépendre de l'état actuel editableContent
      // pour éviter la dépendance circulaire
      const defaultContent = {
        name: '[VOTRE NOM]',
        contact: '[Votre Email] • [Votre Téléphone] • [LinkedIn]',
        contactTitle: 'CONTACT',
        profileTitle: 'PROFIL PROFESSIONNEL',
        profileContent: 'Résumé de votre profil et de vos objectifs.',
        experienceTitle: 'EXPÉRIENCE PROFESSIONNELLE',
        educationTitle: 'FORMATION',
        skillsTitle: 'COMPÉTENCES TECHNIQUES',
        languagesTitle: 'LANGUES'
      };

      const newContent = {
        ...defaultContent,
        name: fullName || defaultContent.name,
        contact: contactLine,
        profileContent: profileContent
      };
      
      console.log('CVCreator - Nouveau contenu:', newContent);
      setEditableContent(newContent);

      // Mettre à jour l'expérience professionnelle si on a des infos
      if (profileData.profession && profileData.company) {
        const newExperience = [{
          id: 1,
          content: `${profileData.profession} - ${profileData.company} (Dates)`,
          details: '• Réalisation clé ou projet important dans ce poste.'
        }];
        console.log('CVCreator - Nouvelle expérience:', newExperience);
        setExperiences(newExperience);
      }

      // Mettre à jour la formation si on a des infos
      if (profileData.profession) {
        const newEducation = [{
          id: 1,
          degree: `Formation en ${profileData.profession}`,
          school: '[École]',
          year: '[Année]'
        }];
        console.log('CVCreator - Nouvelle formation:', newEducation);
        setEducations(newEducation);
      }
    } else {
      console.log('CVCreator - Aucune donnée de profil disponible');
    }
  }, [profile, profileLoading]);

  // Effet pour charger les données sauvegardées au démarrage
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData && !profile && !profileLoading) {
      console.log('Chargement des données CV depuis localStorage', savedData);
      
      if (savedData.editableContent) {
        setEditableContent(savedData.editableContent);
      }
      if (savedData.experiences) {
        setExperiences(savedData.experiences);
      }
      if (savedData.skills) {
        setSkills(savedData.skills);
      }
      if (savedData.languages) {
        setLanguages(savedData.languages);
      }
      if (savedData.educations) {
        setEducations(savedData.educations);
      }
      if (savedData.customFont) {
        setCustomFont(savedData.customFont);
      }
      if (savedData.customColor) {
        setCustomColor(savedData.customColor);
      }
      if (savedData.titleColor) {
        setTitleColor(savedData.titleColor);
      }
      if (savedData.layoutColumns) {
        setLayoutColumns(savedData.layoutColumns);
      }
      if (savedData.nameAlignment) {
        setNameAlignment(savedData.nameAlignment);
      }
      if (savedData.photoAlignment) {
        setPhotoAlignment(savedData.photoAlignment);
      }
      if (savedData.photoSize) {
        setPhotoSize(savedData.photoSize);
      }
      if (savedData.photoShape) {
        setPhotoShape(savedData.photoShape);
      }
      if (savedData.nameFontSize) {
        setNameFontSize(savedData.nameFontSize);
      }
      if (savedData.selectedTemplateName) {
        setSelectedTemplateName(savedData.selectedTemplateName);
      }
      if (savedData.selectedTemplate) {
        setSelectedTemplate(savedData.selectedTemplate);
      }
      if (savedData.sectionColors) {
        setSectionColors(savedData.sectionColors);
      }
      // Restaurer les sections et layers dans le hook useCVSections
      if (savedData.sections && Array.isArray(savedData.sections)) {
        console.log('Restauration des sections:', savedData.sections);
        localStorage.setItem('cvSectionsOrder', JSON.stringify(savedData.sections));
        // Forcer le rechargement du composant DraggableSections
        window.dispatchEvent(new Event('cvSectionsUpdated'));
      }
    }
  }, [loadFromLocalStorage, profile, profileLoading]);

  // Simuler le chargement des templates
  useEffect(() => {
    const timer = setTimeout(() => {
      setTemplatesLoading(false);
    }, 2000); // 2 secondes de chargement

    return () => clearTimeout(timer);
  }, []);

  // Effet pour sauvegarder automatiquement les modifications
  useEffect(() => {
    if (autoSaveEnabled) {
      // Récupérer les sections actuelles depuis useCVSections
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

  const generateWithAI = async (field: string, currentContent?: string) => {
    // Réinitialiser l'erreur au début de la fonction
    setError(null);

    try {
      // Déterminer le prompt en fonction du champ
      let prompt = '';
      switch (field) {
        case 'name':
          prompt = "Génère un nom professionnel pour un CV. Réponds uniquement avec le nom, sans texte supplémentaire.";
          break;
        case 'contact':
          prompt = "Génère une ligne de contact professionnelle pour un CV au format '[Email] • [Téléphone] • [LinkedIn]'. Réponds uniquement avec la ligne de contact, sans texte supplémentaire.";
          break;
        case 'contactTitle':
          prompt = "Génère un titre de section pour les informations de contact dans un CV. Réponds uniquement avec le titre, sans texte supplémentaire.";
          break;
        case 'profileTitle':
          prompt = "Génère un titre de section pour le profil professionnel dans un CV. Réponds uniquement avec le titre, sans texte supplémentaire.";
          break;
        case 'profileContent':
          prompt = "Génère un résumé professionnel très concis en un seul paragraphe de maximum 2 phrases pour un CV. Le résumé doit être percutant et synthétique. Réponds uniquement avec le texte du résumé, sans balises HTML, sans <p>, sans texte supplémentaire.";
          break;
        case 'experienceTitle':
          prompt = "Génère un titre de section pour l'expérience professionnelle dans un CV. Réponds uniquement avec le titre, sans texte supplémentaire.";
          break;
        case 'experienceContent':
          prompt = "Génère une entrée d'expérience professionnelle au format '[Poste] - [Entreprise] (Dates)'. Réponds uniquement avec l'entrée, sans texte supplémentaire.";
          break;
        case 'experienceDetails':
          prompt = "Génère une réalisation clé ou un projet important pour une expérience professionnelle dans un CV. Commence avec '• '. Réponds uniquement avec la réalisation, sans texte supplémentaire.";
          break;
        case 'educationTitle':
          prompt = "Génère un titre de section pour la formation dans un CV. Réponds uniquement avec le titre, sans texte supplémentaire.";
          break;
        case 'educationDegree':
          prompt = "Génère un nom de diplôme pour un CV. Réponds uniquement avec le nom du diplôme, sans texte supplémentaire.";
          break;
        case 'educationSchool':
          prompt = "Génère un nom d'école ou d'université pour un CV. Réponds uniquement avec le nom de l'établissement, sans texte supplémentaire.";
          break;
        case 'educationYear':
          prompt = "Génère une année ou période d'études pour un CV (ex: 2020, 2018-2020). Réponds uniquement avec l'année, sans texte supplémentaire.";
          break;
        case 'skillsTitle':
          prompt = "Génère un titre de section pour les compétences techniques dans un CV. Réponds uniquement avec le titre, sans texte supplémentaire.";
          break;
        case 'languagesTitle':
          prompt = "Génère un titre de section pour les langues dans un CV. Réponds uniquement avec le titre, sans texte supplémentaire.";
          break;
        case 'skillContent':
          prompt = "Génère une compétence technique pertinente pour un CV. Réponds uniquement avec la compétence, sans texte supplémentaire.";
          break;
        default:
          // Gérer les langues étrangères
          if (field.startsWith('languageName-')) {
            prompt = "Génère le nom d'une langue étrangère pour un CV. Réponds uniquement avec le nom de la langue, sans texte supplémentaire.";
          } else if (field.startsWith('languageLevel-')) {
            prompt = "Génère un niveau de compétence pour une langue étrangère dans un CV. Réponds uniquement avec le niveau (par exemple: Courant, Intermédiaire, Débutant), sans texte supplémentaire.";
          } else {
            return;
          }
      }

      // Si du contenu actuel est fourni, combiner avec le prompt
      if (currentContent && currentContent.trim()) {
        prompt = `${prompt} Voici le contenu actuel à améliorer ou modifier : "${currentContent}"`;
      }

      // Appeler l'API OpenAI
      const aiResponse = await editCVField({ prompt });

      if (aiResponse) {
        // Gérer les différents types de champs
        if (field === 'experienceContent' && currentContent) {
          // Trouver l'expérience correspondante et la mettre à jour
          const expToUpdate = experiences.find(exp => exp.content === currentContent);
          if (expToUpdate) {
            setExperiences(prev => prev.map(exp =>
              exp.id === expToUpdate.id ? { ...exp, content: aiResponse } : exp
            ));
          }
        } else if (field === 'experienceDetails' && currentContent) {
          // Trouver l'expérience correspondante et mettre à jour les détails
          const expToUpdate = experiences.find(exp => exp.details === currentContent);
          if (expToUpdate) {
            setExperiences(prev => prev.map(exp =>
              exp.id === expToUpdate.id ? { ...exp, details: aiResponse } : exp
            ));
          }
        } else if (field === 'skillContent' && currentContent) {
          // Trouver la compétence correspondante et la mettre à jour
          const skillToUpdate = skills.find(skill => skill.content === currentContent);
          if (skillToUpdate) {
            setSkills(prev => prev.map(skill =>
              skill.id === skillToUpdate.id ? { ...skill, content: aiResponse } : skill
            ));
          }
        } else if (field.startsWith('languageLevel-') && currentContent) {
          // Extraire l'ID de la langue et mettre à jour le niveau
          const langId = parseInt(field.split('-')[1]);
          setLanguages(prev => prev.map(lang =>
            lang.id === langId ? { ...lang, level: aiResponse } : lang
          ));
        } else if (field === 'educationDegree' && currentContent) {
          // Trouver la formation correspondante et mettre à jour le diplôme
          const eduToUpdate = educations.find(edu => edu.degree === currentContent);
          if (eduToUpdate) {
            setEducations(prev => prev.map(edu =>
              edu.id === eduToUpdate.id ? { ...edu, degree: aiResponse } : edu
            ));
          }
        } else if (field === 'educationSchool' && currentContent) {
          // Trouver la formation correspondante et mettre à jour l'école
          const eduToUpdate = educations.find(edu => edu.school === currentContent);
          if (eduToUpdate) {
            setEducations(prev => prev.map(edu =>
              edu.id === eduToUpdate.id ? { ...edu, school: aiResponse } : edu
            ));
          }
        } else if (field === 'educationYear' && currentContent) {
          // Trouver la formation correspondante et mettre à jour l'année
          const eduToUpdate = educations.find(edu => edu.year === currentContent);
          if (eduToUpdate) {
            setEducations(prev => prev.map(edu =>
              edu.id === eduToUpdate.id ? { ...edu, year: aiResponse } : edu
            ));
          }
        } else {
          // Mettre à jour le contenu éditable avec la réponse de l'IA
          setEditableContent(prev => ({ ...prev, [field]: aiResponse }));
        }
      } else {
        // En cas d'erreur, définir un message d'erreur
        setError('Erreur lors de la génération avec IA. Veuillez vérifier votre clé API OpenAI dans les paramètres.');
      }
    } catch (error) {
      console.error('Erreur lors de la génération avec IA:', error);
      // En cas d'erreur, on affiche un message à l'utilisateur
      setError('Erreur lors de la génération avec IA: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      // Réinitialiser le message d'erreur après 5 secondes
      setTimeout(() => setError(null), 5000);
    }
  };


  

  

  const addExperience = useCallback(() => {
    const newId = experiences.length > 0 ? Math.max(...experiences.map(exp => exp.id)) + 1 : 1;
    setExperiences(prev => [...prev, { id: newId, content: '[Poste] - [Entreprise] (Dates)', details: '• Réalisation clé ou projet important.' }]);
  }, [experiences]);

  const removeExperience = useCallback((id: number) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  }, []);

  const addSkill = useCallback(() => {
    const newId = skills.length > 0 ? Math.max(...skills.map(skill => skill.id)) + 1 : 1;
    setSkills(prev => [...prev, { id: newId, content: 'Nouvelle compétence' }]);
  }, [skills]);

  const removeSkill = useCallback((id: number) => {
    setSkills(prev => prev.filter(skill => skill.id !== id));
  }, []);

  const addLanguage = useCallback(() => {
    const newId = languages.length > 0 ? Math.max(...languages.map(lang => lang.id)) + 1 : 1;
    setLanguages(prev => [...prev, { id: newId, name: 'Nouvelle langue', level: 'Niveau' }]);
  }, [languages]);

  const removeLanguage = useCallback((id: number) => {
    setLanguages(prev => prev.filter(lang => lang.id !== id));
  }, []);

  const addEducation = useCallback(() => {
    const newId = educations.length > 0 ? Math.max(...educations.map(edu => edu.id)) + 1 : 1;
    setEducations(prev => [...prev, { id: newId, degree: '[Diplôme]', school: '[École]', year: '[Année]' }]);
  }, [educations]);

  const removeEducation = useCallback((id: number) => {
    setEducations(prev => prev.filter(edu => edu.id !== id));
  }, []);

  // Fonction d'export
  const handleDownload = useCallback(async () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      const { generateCVDocument } = await import('./ExportModule');

      await generateCVDocument(
        template,
        editableContent,
        experiences,
        languages,
        educations,
        addCreatedCV
      );
    } catch (error) {
      console.error('Erreur lors du téléchargement du CV:', error);
    }
  }, [selectedTemplate, editableContent, experiences, languages, educations, addCreatedCV]);

  // Fonction d'analyse ATS et export PDF
  const handleATSAnalysis = useCallback(async () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      // Importer les fonctions nécessaires
      const { generateQuickATSAnalysis } = await import('./ExportModule');
      const ATSReportExportModule = await import('../CVAnalysis/ATSReportExport');

      // Préparer les données CV pour l'analyse
      const getSkillsByCategory = (category: string): string[] => {
        switch (category) {
          case 'Développement': return ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'SQL', 'Git', 'Docker'];
          case 'Marketing': return ['Google Analytics', 'SEO/SEM', 'Social Media', 'Content Marketing', 'Email Marketing', 'CRM'];
          case 'Finance': return ['Excel', 'Modélisation financière', 'Analyse de risque', 'Bloomberg', 'SAP'];
          default: return ['Communication', 'Travail d\'équipe', 'Résolution de problèmes', 'Adaptabilité'];
        }
      };

      const skills = getSkillsByCategory(template.category);
      const cvData = {
        name: editableContent.name,
        contact: editableContent.contact,
        profileContent: editableContent.profileContent,
        experiences,
        skills: skills.map((skill, index) => ({ id: index + 1, content: skill })),
        languages,
        educations,
        industry: template.category,
        customFont: 'Calibri',
        customColor: '000000',
        templateName: template.name
      };

      // Générer l'analyse ATS
      const analysis = generateQuickATSAnalysis(template, cvData);

      // Préparer les informations candidat
      const candidateInfo = {
        name: editableContent.name,
        email: editableContent.contact.includes('@') ? editableContent.contact.split(' ').find(s => s.includes('@')) : '',
        position: editableContent.profileTitle
      };

      // Créer une modal pour afficher l'export ATS
      const modalRoot = document.createElement('div');
      modalRoot.id = 'ats-export-modal';
      document.body.appendChild(modalRoot);

      // Importer React et ReactDOM dynamiquement
      const { createElement } = await import('react');
      const { createRoot } = await import('react-dom/client');

      // Créer le composant d'export ATS
      const ATSExportComponent = ATSReportExportModule.default;
      const exportComponent = createElement(ATSExportComponent, {
        analysis,
        candidateInfo,
        jobInfo: {
          title: editableContent.profileTitle,
          company: 'Entreprise Cible'
        }
      });

      // Créer la modal avec le composant
      const modal = createElement('div', {
        style: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        },
        onClick: (e: React.MouseEvent) => {
          if (e.target === e.currentTarget) {
            document.body.removeChild(modalRoot);
          }
        }
      },
        createElement('div', {
          style: {
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            width: '90%'
          }
        }, [
          createElement('button', {
            key: 'close',
            onClick: () => document.body.removeChild(modalRoot),
            style: {
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }
          }, '✕'),
          createElement('h2', {
            key: 'title',
            style: {
              margin: '0 0 20px 0',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333'
            }
          }, 'Analyse ATS et Export PDF'),
          exportComponent
        ])
      );

      const root = createRoot(modalRoot);
      root.render(modal);

    } catch (error) {
      console.error('Erreur lors de l\'analyse ATS:', error);
      alert('Une erreur est survenue lors de l\'analyse ATS. Veuillez réessayer.');
    }
  }, [selectedTemplate, editableContent, experiences, languages, educations]);

  const handleDownloadTemplate = useCallback(async (template: Template) => {
    try {
      const { generateCVDocument } = await import('./ExportModule');

      await generateCVDocument(
        template,
        editableContent,
        experiences,
        languages,
        educations,
        addCreatedCV
      );
    } catch (error) {
      console.error('Erreur lors du téléchargement du template:', error);
    }
  }, [editableContent, experiences, languages, educations, addCreatedCV]);

  // Context value for provider
  const contextValue = {
    // Content state
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

    // Style state
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

    // UI state
    editingField,
    setEditingField,
    selectedSection,
    setSelectedSection,
    selectedTemplateName,
    selectedTemplate,
    // Sections state
    sections,
    toggleSectionVisibility,
    setSectionsOrder: setSectionsOrderFunc,
    cleanupLayers,
    expandSection,
    contractSection,
    sectionColors,
    setSectionColors,
    updateSectionColor,
    updateSectionElementColor,
    updateSectionCapitalization,
    capitalizeSections,
    setCapitalizeSections,
    updateSectionTopBorder,
    sectionTopBorders,
    setSectionTopBorders,

    // Skills library state
    showSkillsLibrary: skillsLibraryState.showSkillsLibrary,
    setShowSkillsLibrary: closeSkillsLibrary,
    selectedSkillsCategory: skillsLibraryState.selectedCategory,
    setSelectedSkillsCategory,
    availableSkillsCategories: skillsLibraryState.availableCategories,
    categorySkills: skillsLibraryState.categorySkills,
    searchSkillsQuery: skillsLibraryState.searchQuery,
    setSearchSkillsQuery: searchSkills,
    skillsSearchResults: skillsLibraryState.searchResults,
    openSkillsLibrary,
    closeSkillsLibrary,
    addSkillFromLibrary,

    // Skills layout state
    skillsLayout,
    setSkillsLayout,

    // Actions
    addExperience,
    removeExperience,
    addSkill,
    removeSkill,
    addLanguage,
    removeLanguage,
    addEducation,
    removeEducation,
    generateWithAI,

    // Data
    availableFonts,
    availableColors,
    isLoading,
    error,
    openAIError
  };

  // Effet pour sauvegarder l'état du layout dans localStorage
  React.useEffect(() => {
    if (autoSaveEnabled) {
      const layoutState = {
        layoutColumns,
        columnRatio,
        sectionSpacing
      };
      try {
        localStorage.setItem('cvCreatorState', JSON.stringify(layoutState));
      } catch (e) {
        console.warn('[CVCreator] Échec sauvegarde layout state:', e);
      }
    }
  }, [layoutColumns, columnRatio, sectionSpacing, autoSaveEnabled]);

  return (
    <CVCreatorProvider value={contextValue}>
      <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header responsive */}
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-3 py-1 sm:py-1">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            {/* Breadcrumb et sauvegarde sur la même ligne pour desktop */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
              <BreadcrumbNavigation
                items={[
                  {
                    label: 'Accueil',
                    icon: NavigationIcons.Home,
                    onClick: () => setActiveTab('dashboard')
                  },
                  {
                    label: 'CV',
                    onClick: () => setActiveTab('cv')
                  },
                  { label: 'Créateur de CV', current: true }
                ]}
                className="text-sm"
                showHome={false}
              />

              {/* Indicateur de sauvegarde automatique - sur la même ligne que breadcrumb */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 ml-0 sm:ml-4">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSaveEnabled}
                      onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:border-gray-500 dark:focus:ring-gray-500"
                    />
                    Sauvegarde auto
                  </label>
                </div>

                {lastSaved && (
                  <time className="text-xs text-gray-500 dark:text-gray-400">
                    Dernière sauvegarde : {lastSaved.toLocaleTimeString()}
                  </time>
                )}

                {hasLocalData() && (
                  <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" aria-hidden="true"></span>
                    Données sauvegardées
                  </div>
                )}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center space-x-2 self-start">
              <button
                onClick={handleATSAnalysis}
                className="w-9 h-9 bg-transparent text-green-600 border rounded border-green-600 hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                aria-label="Analyse ATS et Export PDF"
                title="Analyse ATS et Export PDF"
              >
                <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button
                onClick={handleDownload}
                className="w-9 h-9 bg-transparent text-violet-600 border rounded border-violet-600 hover:bg-violet-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                aria-label="Télécharger le CV"
              >
                <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2  0 01-2 2z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

      <div className="p-2 grid grid-cols-1 lg:grid-cols-12 gap-1">

        <div className="lg:col-span-9 flex gap-2">
          {/* Contrôles de style à gauche */}
          <aside className="w-80 flex-shrink-0">
            <StyleControlsModule />
          </aside>

          {/* Aperçu dynamique en temps réel */}
          <section className="flex-1">
            <PreviewModule
              setSectionsOrder={setSectionsOrderFunc}
              templates={templates.map(t => ({ id: t.id, name: t.name, preview: t.preview }))}
            />
          </section>

        </div>

        <aside className="lg:col-span-3">
          {templatesLoading ? (
            <TemplateSkeleton />
          ) : (
            <CVTemplateCarousel
              templates={templates}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={(templateId, templateName) => {
                setSelectedTemplate(templateId);
                setSelectedTemplateName(templateName);
                const template = templates.find(t => t.id === templateId);
                if (template) {
                  // Appliquer automatiquement le thème du template
                  setCustomColor(template.theme.primaryColor);
                  setTitleColor(template.theme.primaryColor);
                  setCustomFont(template.theme.font);
                  // Définir l'alignement du nom selon le template
                  if (template.name === "Minimaliste") {
                    setNameAlignment('center');
                  } else {
                    setNameAlignment('center');
                  }
                  // Appliquer le nombre de colonnes du template
                  setLayoutColumns(template.layoutColumns);
                  // Appliquer les titres de sections du template
                  setEditableContent(prev => ({
                    ...prev,
                    profileTitle: template.sectionTitles.profileTitle,
                    experienceTitle: template.sectionTitles.experienceTitle,
                    educationTitle: template.sectionTitles.educationTitle,
                    skillsTitle: template.sectionTitles.skillsTitle,
                    languagesTitle: template.sectionTitles.languagesTitle,
                    contactTitle: template.sectionTitles.contactTitle
                  }));
                  // Appliquer l'ordre des sections du template
                  if (setSectionsOrderFunc && Array.isArray(template.sectionsOrder)) {
                    try {
                      // Ajouter les propriétés manquantes (layer et order) à chaque section
                      const sectionsWithOrder = template.sectionsOrder.map((section, index) => {
                        // Type assertion to access properties that may exist on template sections
                        const templateSection = section as unknown as Record<string, unknown>;
                        return {
                          ...section,
                          layer: (templateSection.layer as number) ?? 1,
                          order: index + 1
                        } as SectionConfig;
                      });
                      setSectionsOrderFunc(sectionsWithOrder);
                    } catch (error) {
                      console.warn('Erreur lors de l\'application de l\'ordre des sections:', error);
                    }
                  }
                }
                // Appliquer les traits de séparation du template
                if (template?.sectionTopBorders) {
                  setSectionTopBorders(template.sectionTopBorders);
                } else {
                  // Réinitialiser si pas défini dans le template
                  setSectionTopBorders({});
                }
              }}
              onDownloadTemplate={handleDownloadTemplate}
            />
          )}

        </aside>
      </div>
      </main>
    </CVCreatorProvider>
  );
};
