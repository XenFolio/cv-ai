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
  sectionsOrder: Array<{
    id: string;
    name: string;
    component: string;
    visible: boolean;
    layer?: number;
    order?: number;
    width?: 'full' | 'half';
    alignment?: 'left' | 'center' | 'right';
    topBorder?: boolean;
  }>;
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
    sectionsOrder: [
      { id: 'name', name: 'Nom', component: 'NameSection', visible: true, layer: 1, order: 0, width: 'full' as const, alignment: 'left', topBorder: false },
      { id: 'photo', name: 'Photo', component: 'PhotoSection', visible: false, layer: 2, order: 0, width: 'half' as const, alignment: 'left', topBorder: false },
      { id: 'profile', name: 'PROFIL', component: 'ProfileSection', visible: true, layer: 2, order: 1, width: 'full' as const, alignment: 'left', topBorder: false },
      { id: 'experience', name: 'EXPÉRIENCE', component: 'ExperienceSection', visible: true, layer: 4, order: 0, width: 'full' as const, alignment: 'left', topBorder: true },
      { id: 'contact', name: 'CONTACT', component: 'ContactSection', visible: true, layer: 4, order: 1, width: 'half' as const, alignment: 'left', topBorder: true },
      { id: 'education', name: 'FORMATION', component: 'EducationSection', visible: true, layer: 5, order: 0, width: 'half' as const, alignment: 'left', topBorder: true },
      { id: 'skills', name: 'COMPÉTENCES', component: 'SkillsSection', visible: true, layer: 3, order: 0, width: 'full' as const, alignment: 'left', topBorder: false },
      { id: 'languages', name: 'LANGUES', component: 'LanguagesSection', visible: true, layer: 5, order: 1, width: 'full' as const, alignment: 'left', topBorder: true }
    ]
  },
  {
    id: "2",
    name: "Créatif",
    description: "Un modèle visuel et audacieux pour les métiers artistiques.",
    category: "Créatif",
    atsScore: 70,
    preview: "bg-gradient-to-br from-yellow-50 to-amber-50",
    image: "/images/creatif.png",
    theme: { primaryColor: "49332c", font: "Helvetica" },
    layoutColumns: 1,
    sectionsOrder: [
      { id: 'name', name: 'Nom', component: 'NameSection', visible: true, layer: 1, order: 0, width: 'full' as const, alignment: 'center', topBorder: false },
      { id: 'photo', name: 'Photo', component: 'PhotoSection', visible: false, layer: 2, order: 0, width: 'full' as const, alignment: 'center', topBorder: false },
      { id: 'profile', name: 'À PROPOS DE MOI', component: 'ProfileSection', visible: true, layer: 2, order: 0, width: 'full' as const, alignment: 'left', topBorder: false },
      { id: 'contact', name: 'CONTACT', component: 'ContactSection', visible: true, layer: 3, order: 0, width: 'full' as const, alignment: 'center', topBorder: false },
      { id: 'experience', name: 'PARCOURS CRÉATIF', component: 'ExperienceSection', visible: true, layer: 4, order: 0, width: 'full' as const, alignment: 'left', topBorder: true },
      { id: 'education', name: 'FORMATION ARTISTIQUE', component: 'EducationSection', visible: true, layer: 5, order: 0, width: 'full' as const, alignment: 'left', topBorder: true },
      { id: 'skills', name: 'TALENTS & OUTILS', component: 'SkillsSection', visible: true, layer: 6, order: 0, width: 'full' as const, alignment: 'left', topBorder: true },
      { id: 'languages', name: 'LANGUES PARLÉES', component: 'LanguagesSection', visible: true, layer: 7, order: 0, width: 'full' as const, alignment: 'left', topBorder: true }
    ]
  },
  {
    id: "3",
    name: "Corporate",
    description: "Pour les candidatures sérieuses et formelles.",
    category: "Classique",
    atsScore: 85,
    preview: "bg-gradient-to-br from-gray-100 to-slate-100",
    image: "/images/corporate2.png",
    theme: { primaryColor: "0b3796ff", font: "Times New Roman" },
    layoutColumns: 1,
    sectionsOrder: [
      { id: 'name', name: 'Nom', component: 'NameSection', visible: true, layer: 1, order: 0, width: 'full' as const, alignment: 'center', topBorder: false },
      { id: 'profile', name: 'PROFIL PROFESSIONNEL', component: 'ProfileSection', visible: true, layer: 2, order: 0, width: 'full' as const, alignment: 'left', topBorder: false },
      { id: 'contact', name: 'CONTACT', component: 'ContactSection', visible: true, layer: 3, order: 0, width: 'full' as const, alignment: 'left', topBorder: false },
      { id: 'experience', name: 'EXPÉRIENCE PROFESSIONNELLE', component: 'ExperienceSection', visible: true, layer: 4, order: 0, width: 'full' as const, alignment: 'left', topBorder: true },
      { id: 'education', name: 'FORMATION ACADÉMIQUE', component: 'EducationSection', visible: true, layer: 5, order: 0, width: 'full' as const, alignment: 'left', topBorder: true },
      { id: 'skills', name: 'COMPÉTENCES Cléfs', component: 'SkillsSection', visible: true, layer: 6, order: 0, width: 'full' as const, alignment: 'left', topBorder: true },
      { id: 'languages', name: 'LANGUES ÉTRANGÈRES', component: 'LanguagesSection', visible: true, layer: 7, order: 0, width: 'full' as const, alignment: 'left', topBorder: true }
    ]
  },
  {
    id: "4",
    name: "Moderne Coloré",
    description: "Design contemporain avec des touches de couleur vive.",
    category: "Moderne",
    atsScore: 88,
    preview: "bg-gradient-to-br from-gray-50/20 to-white",
    image: "/images/modern2.png",
    theme: { primaryColor: "960d0dff", font: "Calibri" },
    layoutColumns: 1,
    sectionsOrder: [
      { id: 'name', name: 'Nom', component: 'NameSection', visible: true, layer: 1, order: 0, width: 'full' as const, alignment: 'left', topBorder: false },
      { id: 'contact', name: '', component: 'ContactSection', visible: true, layer: 2, order: 0, width: 'full' as const, alignment: 'center', topBorder: false },
      { id: 'profile', name: 'QUI SUIS-JE ?', component: 'ProfileSection', visible: true, layer: 3, order: 0, width: 'full' as const, alignment: 'left', topBorder: false },
      { id: 'experience', name: 'MON PARCOURS', component: 'ExperienceSection', visible: true, layer: 4, order: 0, width: 'full' as const, alignment: 'left', topBorder: true },
      { id: 'education', name: 'MES ÉTUDES', component: 'EducationSection', visible: true, layer: 5, order: 0, width: 'full' as const, alignment: 'left', topBorder: true },
      { id: 'skills', name: 'MES COMPÉTENCES', component: 'SkillsSection', visible: true, layer: 6, order: 0, width: 'full' as const, alignment: 'left', topBorder: true },
      { id: 'languages', name: 'MES LANGUES', component: 'LanguagesSection', visible: true, layer: 7, order: 0, width: 'full' as const, alignment: 'left', topBorder: true }
    ]
  },
  {
    id: "5",
    name: "Élégant B&W",
    description: "Style sobre en noir et blanc pour un look professionnel raffiné.",
    category: "Classique",
    atsScore: 92,
    preview: "bg-gradient-to-br from-gray-50/20 to-gray-50/80",
    image: "/images/elegant-bw2.png",
    theme: { primaryColor: "0F172A", font: "Georgia" },
    layoutColumns: 1,
    sectionsOrder: [
      { id: 'name', name: 'Nom', component: 'NameSection', visible: true, layer: 1, order: 0, width: 'full' as const, alignment: 'center', topBorder: false },
      { id: 'contact', name: '', component: 'ContactSection', visible: true, layer: 2, order: 0, width: 'full' as const, alignment: 'center', topBorder: false },
      { id: 'profile', name: 'PRÉSENTATION', component: 'ProfileSection', visible: true, layer: 3, order: 0, width: 'full' as const, alignment: 'left', topBorder: false },
      { id: 'experience', name: 'CARRIÈRE PROFESSIONNELLE', component: 'ExperienceSection', visible: true, layer: 4, order: 0, width: 'full' as const, alignment: 'left', topBorder: true },
      { id: 'education', name: 'CURSUS ACADÉMIQUE', component: 'EducationSection', visible: true, layer: 5, order: 0, width: 'full' as const, alignment: 'left', topBorder: true },
      { id: 'skills', name: 'EXPERTISE TECHNIQUE', component: 'SkillsSection', visible: true, layer: 6, order: 0, width: 'full' as const, alignment: 'left', topBorder: true },
      { id: 'languages', name: 'MAÎTRISE LINGUISTIQUE', component: 'LanguagesSection', visible: true, layer: 7, order: 0, width: 'full' as const, alignment: 'left', topBorder: true }
    ]
  },
  {
    id: "6",
    name: "Émeraude",
    description: "Style élégant avec en-tête verte émeraude pour un look professionnel moderne.",
    category: "Moderne",
    atsScore: 94,
    preview: "bg-white",
    image: "/images/emeraude2.png",
    theme: { primaryColor: "0D7D5C", font: "Calibri" },
    layoutColumns: 1,
    sectionsOrder: [
      { id: 'name', name: 'Nom', component: 'NameSection', visible: true, layer: 1, order: 0, width: 'full' as const, alignment: 'center', topBorder: false },
      { id: 'contact', name: '', component: 'ContactSection', visible: true, layer: 2, order: 0, width: 'full' as const, alignment: 'center', topBorder: false },
      { id: 'profile', name: 'PROFIL PROFESSIONNEL', component: 'ProfileSection', visible: true, layer: 3, order: 0, width: 'full' as const, alignment: 'left', topBorder: false },
      { id: 'experience', name: 'EXPÉRIENCE PROFESSIONNELLE', component: 'ExperienceSection', visible: true, layer: 4, order: 0, width: 'full' as const, alignment: 'left', topBorder: false },
      { id: 'education', name: 'FORMATION', component: 'EducationSection', visible: true, layer: 5, order: 0, width: 'full' as const, alignment: 'left', topBorder: false },
      { id: 'skills', name: 'COMPÉTENCES', component: 'SkillsSection', visible: true, layer: 6, order: 0, width: 'full' as const, alignment: 'left', topBorder: false },
      { id: 'languages', name: 'LANGUES', component: 'LanguagesSection', visible: true, layer: 7, order: 0, width: 'full' as const, alignment: 'left', topBorder: false }
    ]
  }
];
