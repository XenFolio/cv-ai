import { NavigationIcons } from '../components/UI/iconsData';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ComponentType<{ className?: string; size?: string | number; color?: string }>;
  current?: boolean;
  onClick?: () => void;
}

// Hook pour générer des breadcrumbs automatiquement
export const useBreadcrumb = () => {
  const generateFromPath = (path: string, customLabels?: Record<string, string>): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean);
    const labels: Record<string, string> = {
      'dashboard': 'Tableau de bord',
      'cv': 'CV',
      'creator': 'Créer un CV',
      'analyze': 'Analyser mon CV',
      'lettre': 'Lettre',
      'chat': 'Assistant IA',
      'letter-editor': 'Éditeur',
      'templates': 'Modèles',
      'coach': 'Coach IA',
      'coaching': 'Coaching Personnalisé',
      'chat-cv': 'Conseils CV',
      'chat-general': 'Carrière',
      'library': 'Mes Documents',
      'jobs': 'Offres d\'emploi',
      'job-search': 'Recherche d\'emploi',
      'settings': 'Paramètres',
      'profile': 'Profil',
      'billing': 'Facturation',
      'tarifs': 'Premium',
      'analysis': 'Analyse ATS',
      'optimization': 'Optimisation',
      'export': 'Export',
      ...customLabels
    };

    return segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      const label = labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

      return {
        label,
        path,
        current: index === segments.length - 1
      };
    });
  };

  const generateFromTitle = (title: string, basePath = '/'): BreadcrumbItem[] => {
    return [
      {
        label: 'Accueil',
        icon: NavigationIcons.Home,
        path: '/'
      },
      {
        label: title,
        path: basePath,
        current: true
      }
    ];
  };

  return { generateFromPath, generateFromTitle };
};
