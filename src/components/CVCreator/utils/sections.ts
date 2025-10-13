// Helper function to get section display name
export const getSectionName = (sectionId: string): string => {
  const sectionNames: Record<string, string> = {
    'name': 'Nom',
    'profile': 'Profil',
    'contact': 'Contact',
    'experience': 'Expériences',
    'education': 'Formations',
    'skills': 'Compétences',
    'languages': 'Langues'
  };
  return sectionNames[sectionId] || sectionId;
};

// Fonction pour obtenir le nom d'affichage de la section
export const getSectionDisplayName = (sectionId: string | null): string => {
  if (!sectionId) return 'Page générale';

  const sectionNames: Record<string, string> = {
    'name': 'Nom',
    'profile': 'Profil',
    'contact': 'Contact',
    'experience': 'Expériences',
    'education': 'Formations',
    'skills': 'Compétences',
    'languages': 'Langues',
    'photo': 'Photo'
  };

  return sectionNames[sectionId] || sectionId;
};
