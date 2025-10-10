export const availableFonts = ['Calibri', 'Georgia', 'Helvetica', 'Consolas', 'Times New Roman', 'Arial'];

export const availableColors = [
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

export const defaultCVContent = {
  name: '[VOTRE NOM]',
  contact: '[Votre Email] • [Votre Téléphone] • [LinkedIn]',
  contactTitle: 'CONTACT',
  profileTitle: 'PROFIL',
  profileContent: 'Résumé de votre profil et de vos objectifs.',
  experienceTitle: 'EXPÉRIENCE PROFESSIONNELLE',
  educationTitle: 'FORMATION',
  skillsTitle: 'COMPÉTENCES',
  languagesTitle: 'LANGUES'
};

export const defaultExperiences = [
  { id: 1, content: '[Poste] - [Entreprise] (Dates)', details: '• Réalisation clé ou projet important.' }
];

export const defaultSkills = [
  { id: 1, content: 'Compétence 1' },
  { id: 2, content: 'Compétence 2' },
  { id: 3, content: 'Compétence 3' }
];

export const defaultLanguages = [
  { id: 1, name: 'Français', level: 'Natif' },
  { id: 2, name: 'Anglais', level: 'Courant' }
];

export const defaultEducations = [
  { id: 1, degree: '[Diplôme]', school: '[École]', year: '[Année]' }
];