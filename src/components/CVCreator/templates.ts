export interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  image: string;
  category: string;
  atsScore: number;
  theme: { primaryColor: string; font: string };
  layoutColumns: number;
  sectionTitles: {
    profileTitle: string;
    experienceTitle: string;
    educationTitle: string;
    skillsTitle: string;
    languagesTitle: string;
    contactTitle: string;
  };
  sectionsOrder: Array<{
    id: string;
    name: string;
    component: string;
    visible: boolean;
    layer?: number;
    order?: number;
    width?: 'full' | 'half';
  }>;
  sectionTopBorders?: Record<string, boolean>;
}

export const templates: Template[] = [
  {
    id: "1",
    name: "Minimaliste",
    description: "CV clair et sobre, idéal pour les profils tech.",
    category: "Moderne",
    atsScore: 90,
    preview: "bg-white",
    image: "/images/minimalist.png",
    theme: { primaryColor: "2E3A59", font: "Calibri" },
    layoutColumns: 2,
    sectionTitles: {
      profileTitle: "PROFIL",
      experienceTitle: "EXPÉRIENCE",
      educationTitle: "FORMATION",
      skillsTitle: "COMPÉTENCES",
      languagesTitle: "LANGUES",
      contactTitle: "CONTACT"
    },
    sectionsOrder: [
      { id: 'name', name: 'Nom', component: 'NameSection', visible: true, layer: 1, order: 0, width: 'full' as const },
      { id: 'photo', name: 'Photo', component: 'PhotoSection', visible: false, layer: 2, order: 0, width: 'half' as const },
      { id: 'profile', name: 'Profil', component: 'ProfileSection', visible: true, layer: 2, order: 1, width: 'full' as const },
      { id: 'experience', name: 'Expérience', component: 'ExperienceSection', visible: true, layer: 4, order: 0, width: 'full' as const },
      { id: 'contact', name: 'Contact', component: 'ContactSection', visible: true, layer: 4, order: 1, width: 'half' as const },
      { id: 'education', name: 'Formation', component: 'EducationSection', visible: true, layer: 5, order: 0, width: 'half' as const },
      { id: 'skills', name: 'Compétences', component: 'SkillsSection', visible: true, layer: 3, order: 0, width: 'full' as const },
      { id: 'languages', name: 'Langues', component: 'LanguagesSection', visible: true, layer: 5, order: 1, width: 'full' as const }
    ],
    sectionTopBorders: {
      'experience': true,
      'contact': true,
      'education': true,
      'languages': true
    }
  },
  {
    id: "2",
    name: "Créatif",
    description: "Un modèle visuel et audacieux pour les métiers artistiques.",
    category: "Créatif",
    atsScore: 70,
    preview: "bg-gradient-to-br from-yellow-100 to-amber-100",
    image: "/images/creatif.png",
    theme: { primaryColor: "49332c", font: "Helvetica" },
    layoutColumns: 1,
    sectionTitles: {
      profileTitle: "À PROPOS DE MOI",
      experienceTitle: "PARCOURS CRÉATIF",
      educationTitle: "FORMATION ARTISTIQUE",
      skillsTitle: "TALENTS & OUTILS",
      languagesTitle: "LANGUES PARLÉES",
      contactTitle: "CONTACT"
    },
    sectionsOrder: [
      { id: 'profile', name: 'À propos de moi', component: 'ProfileSection', visible: true, layer: 1, order: 0, width: 'full' as const },
      { id: 'contact', name: 'Contact', component: 'ContactSection', visible: true, layer: 2, order: 0, width: 'full' as const },
      { id: 'skills', name: 'Talents & Outils', component: 'SkillsSection', visible: true, layer: 3, order: 0, width: 'full' as const },
      { id: 'experience', name: 'Parcours Créatif', component: 'ExperienceSection', visible: true, layer: 4, order: 0, width: 'full' as const },
      { id: 'education', name: 'Formation Artistique', component: 'EducationSection', visible: true, layer: 5, order: 0, width: 'half' as const },
      { id: 'languages', name: 'Langues Parlées', component: 'LanguagesSection', visible: true, layer: 5, order: 1, width: 'half' as const }
    ]
  },
  {
    id: "3",
    name: "Corporate",
    description: "Pour les candidatures sérieuses et formelles.",
    category: "Classique",
    atsScore: 85,
    preview: "bg-gradient-to-br from-gray-100 to-slate-100",
    image: "/images/corporate.png",
    theme: { primaryColor: "111827", font: "Times New Roman" },
    layoutColumns: 1,
    sectionTitles: {
      profileTitle: "PROFIL PROFESSIONNEL",
      experienceTitle: "EXPÉRIENCE PROFESSIONNELLE",
      educationTitle: "FORMATION ACADÉMIQUE",
      skillsTitle: "COMPÉTENCES TECHNIQUES",
      languagesTitle: "LANGUES ÉTRANGÈRES",
      contactTitle: "CONTACT"
    },
    sectionsOrder: [
      { id: 'name', name: 'Nom', component: 'NameSection', visible: true, layer: 1, order: 0, width: 'full' as const },
      { id: 'photo', name: 'Photo', component: 'PhotoSection', visible: true, layer: 2, order: 0, width: 'full' as const },
      { id: 'profile', name: 'Profil Professionnel', component: 'ProfileSection', visible: true, layer: 2, order: 1, width: 'full' as const },
      { id: 'contact', name: 'Contact', component: 'ContactSection', visible: true, layer: 3, order: 0, width: 'full' as const },
      { id: 'experience', name: 'Expérience Professionnelle', component: 'ExperienceSection', visible: true, layer: 4, order: 0, width: 'full' as const },
      { id: 'education', name: 'Formation Académique', component: 'EducationSection', visible: true, layer: 5, order: 0, width: 'full' as const },
      { id: 'skills', name: 'Compétences Techniques', component: 'SkillsSection', visible: true, layer: 6, order: 0, width: 'half' as const },
      { id: 'languages', name: 'Langues Étrangères', component: 'LanguagesSection', visible: true, layer: 6, order: 1, width: 'half' as const }
    ]
  },
  {
    id: "4",
    name: "Moderne Coloré",
    description: "Design contemporain avec des touches de couleur vive.",
    category: "Moderne",
    atsScore: 88,
    preview: "bg-gradient-to-br from-violet-100 to-purple-100",
    image: "/images/modern.png",
    theme: { primaryColor: "7C3AED", font: "Calibri" },
    layoutColumns: 1,
    sectionTitles: {
      profileTitle: "QUI SUIS-JE ?",
      experienceTitle: "MON PARCOURS",
      educationTitle: "MES ÉTUDES",
      skillsTitle: "MES COMPÉTENCES",
      languagesTitle: "MES LANGUES",
      contactTitle: "CONTACT"
    },
    sectionsOrder: [
      { id: 'name', name: 'Nom', component: 'NameSection', visible: true, layer: 1, order: 0, width: 'full' as const },
      { id: 'photo', name: 'Photo', component: 'PhotoSection', visible: true, layer: 2, order: 0, width: 'full' as const },
      { id: 'profile', name: 'Qui suis-je ?', component: 'ProfileSection', visible: true, layer: 2, order: 1, width: 'full' as const },
      { id: 'contact', name: 'Contact', component: 'ContactSection', visible: true, layer: 3, order: 0, width: 'full' as const },
      { id: 'skills', name: 'Mes Compétences', component: 'SkillsSection', visible: true, layer: 4, order: 0, width: 'full' as const },
      { id: 'experience', name: 'Mon Parcours', component: 'ExperienceSection', visible: true, layer: 5, order: 0, width: 'full' as const },
      { id: 'languages', name: 'Mes Langues', component: 'LanguagesSection', visible: true, layer: 6, order: 0, width: 'half' as const },
      { id: 'education', name: 'Mes Études', component: 'EducationSection', visible: true, layer: 6, order: 1, width: 'half' as const }
    ]
  },
  {
    id: "5",
    name: "Élégant B&W",
    description: "Style sobre en noir et blanc pour un look professionnel raffiné.",
    category: "Classique",
    atsScore: 92,
    preview: "bg-gradient-to-br from-gray-100 to-gray-200",
    image: "/images/elegant-bw.png",
    theme: { primaryColor: "0F172A", font: "Georgia" },
    layoutColumns: 1,
    sectionTitles: {
      profileTitle: "PRÉSENTATION",
      experienceTitle: "CARRIÈRE PROFESSIONNELLE",
      educationTitle: "CURSUS ACADÉMIQUE",
      skillsTitle: "EXPERTISE TECHNIQUE",
      languagesTitle: "MAÎTRISE LINGUISTIQUE",
      contactTitle: "CONTACT"
    },
    sectionsOrder: [
      { id: 'name', name: 'Nom', component: 'NameSection', visible: true, layer: 1, order: 0, width: 'full' as const },
      { id: 'photo', name: 'Photo', component: 'PhotoSection', visible: true, layer: 2, order: 0, width: 'full' as const },
      { id: 'profile', name: 'Présentation', component: 'ProfileSection', visible: true, layer: 2, order: 1, width: 'full' as const },
      { id: 'experience', name: 'Carrière Professionnelle', component: 'ExperienceSection', visible: true, layer: 3, order: 0, width: 'full' as const },
      { id: 'education', name: 'Cursus Académique', component: 'EducationSection', visible: true, layer: 4, order: 0, width: 'full' as const },
      { id: 'skills', name: 'Expertise Technique', component: 'SkillsSection', visible: true, layer: 5, order: 0, width: 'half' as const },
      { id: 'languages', name: 'Maîtrise Linguistique', component: 'LanguagesSection', visible: true, layer: 5, order: 1, width: 'half' as const }
    ]
  },
  {
    id: "6",
    name: "Émeraude",
    description: "Style élégant avec des accents émeraude pour un look professionnel moderne.",
    category: "Moderne",
    atsScore: 94,
    preview: "bg-[#fbf9f4]",
    image: "/images/emeraude.png",
    theme: { primaryColor: "10B981", font: "Georgia" },
    layoutColumns: 1,
    sectionTitles: {
      profileTitle: "PROFIL PERSONNEL",
      experienceTitle: "EXPÉRIENCES CLÉS",
      educationTitle: "PARCOURS ÉDUCATIF",
      skillsTitle: "SAVOIR-FAIRE",
      languagesTitle: "COMPÉTENCES LINGUISTIQUES",
      contactTitle: "CONTACT"
    },
    sectionsOrder: [
      { id: 'name', name: 'Nom', component: 'NameSection', visible: true, layer: 1, order: 0, width: 'full' as const },
      { id: 'photo', name: 'Photo', component: 'PhotoSection', visible: true, layer: 2, order: 0, width: 'full' as const },
      { id: 'profile', name: 'Profil Personnel', component: 'ProfileSection', visible: true, layer: 2, order: 1, width: 'full' as const },
      { id: 'contact', name: 'Contact', component: 'ContactSection', visible: true, layer: 3, order: 0, width: 'full' as const },
      { id: 'experience', name: 'Expériences Clés', component: 'ExperienceSection', visible: true, layer: 4, order: 0, width: 'full' as const },
      { id: 'skills', name: 'Savoir-faire', component: 'SkillsSection', visible: true, layer: 5, order: 0, width: 'full' as const },
      { id: 'education', name: 'Parcours Éducatif', component: 'EducationSection', visible: true, layer: 6, order: 0, width: 'full' as const },
      { id: 'languages', name: 'Compétences Linguistiques', component: 'LanguagesSection', visible: true, layer: 7, order: 0, width: 'full' as const }
    ]
  }
];
