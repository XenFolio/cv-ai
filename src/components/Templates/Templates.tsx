import React, { useState } from 'react';
import { Eye, Star, Search, Award, Users, TrendingUp, Sparkles, FileText } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import { BreadcrumbNavigation } from '../UI/BreadcrumbNavigation';
import { NavigationIcons } from '../UI/iconsData';
import { useAppStore } from '../../store/useAppStore';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: string;
  atsScore: number;
  downloads: string;
  rating: number;
  tags: string[];
  wordFile: string;
  isPremium: boolean;
  industry: string;
}

// Types forts pour les profils utilisés dans les aperçus/exports
interface Experience {
  title: string;
  company: string;
  period: string;
  achievements: string[];
}

interface Profile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  profile: string;
  experiences: Experience[];
  skills: string[];
  education: string;
  languages: string;
}

// Données de profils centralisées (source de vérité unique pour l'aperçu et l'export)
// Désormais chaque domaine possède plusieurs profils pour varier l'aperçu entre templates.
const profilesData: Record<string, Profile[]> = {
  Tech: [{
    name: 'ALEXANDRE MARTIN',
    title: 'Développeur Full Stack Senior',
    email: 'alexandre.martin@email.com',
    phone: '+33 6 45 78 92 13',
    location: 'Lyon, France',
    profile: 'Développeur Full Stack avec 6 ans d\'expérience dans le développement d\'applications web modernes. Expert en React, Node.js et architectures cloud. Passionné par les technologies émergentes et l\'optimisation des performances.',
    experiences: [
      { title: 'Lead Developer Full Stack', company: 'TechInnovate', period: '2021-2024', achievements: ['• Développement d\'une plateforme SaaS utilisée par 50k+ utilisateurs', '• Réduction de 40% du temps de chargement via optimisation React', '• Management d\'une équipe de 4 développeurs'] },
      { title: 'Développeur Full Stack', company: 'StartupLab', period: '2019-2021', achievements: ['• Création de 15+ APIs REST avec Node.js et Express', '• Intégration de solutions de paiement (Stripe, PayPal)', '• Migration vers architecture microservices'] },
      { title: 'Développeur Frontend', company: 'WebAgency', period: '2018-2019', achievements: ['• Développement de 20+ sites web responsive', '• Amélioration SEO technique (+60% trafic organique)', '• Formation équipe aux bonnes pratiques React'] }
    ],
    skills: ['JavaScript ES6+', 'React/Redux', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Git', 'Jest/Cypress'],
    education: 'Master Informatique - École Supérieure d\'Informatique',
    languages: 'Français (Natif), Anglais (Courant), Espagnol (Intermédiaire)'
  }],
  Marketing: [{
    name: 'SOPHIE BERNARD',
    title: 'Chef de Projet Marketing Digital',
    email: 'sophie.bernard@email.com',
    phone: '+33 6 78 45 92 36',
    location: 'Paris, France',
    profile: 'Experte en marketing digital avec 7 ans d\'expérience dans la croissance d\'entreprises B2B et B2C. Spécialisée en SEO/SEA, analytics et automation marketing. Résultats prouvés : +150% de leads qualifiés.',
    experiences: [
      { title: 'Chef de Projet Marketing Digital', company: 'GrowthCorp', period: '2020-2024', achievements: ['• Augmentation de 180% du trafic organique en 2 ans', '• Gestion budget publicitaire 500k€/an (Google Ads, Facebook)', '• Mise en place CRM et parcours automation (HubSpot)'] },
      { title: 'Spécialiste SEO/SEA', company: 'DigitalBoost', period: '2018-2020', achievements: ['• Optimisation SEO pour 25+ clients (secteurs variés)', '• ROI moyen campagnes Google Ads : 320%', '• Formation équipes internes aux outils analytics'] },
      { title: 'Chargée de Marketing Digital', company: 'StartupMedia', period: '2017-2018', achievements: ['• Lancement stratégie social media (Instagram, LinkedIn)', '• Création contenu : blog, newsletters, vidéos', '• Analyse performance : Google Analytics, Data Studio'] }
    ],
    skills: ['Google Ads', 'Facebook Ads', 'SEO/SEM', 'Google Analytics', 'HubSpot', 'Mailchimp', 'Canva', 'WordPress', 'A/B Testing', 'Data Studio'],
    education: 'Master Marketing Digital - ESSEC Business School',
    languages: 'Français (Natif), Anglais (Courant), Italien (Notions)'
  }],
  Executive: [{
    name: 'PHILIPPE DUBOIS',
    title: 'Directeur Général',
    email: 'philippe.dubois@email.com',
    phone: '+33 6 12 89 45 67',
    location: 'Paris, France',
    profile: 'Leader expérimenté avec 15 ans d\'expérience en direction d\'entreprises technologiques. Expert en transformation digitale, développement international et management d\'équipes. Croissance moyenne : +45% CA annuel.',
    experiences: [
      { title: 'Directeur Général', company: 'TechGlobal SAS', period: '2019-2024', achievements: ['• Croissance CA de 12M€ à 35M€ en 5 ans', '• Expansion internationale : 8 nouveaux pays', '• Management direct de 150+ collaborateurs'] },
      { title: 'Directeur des Opérations', company: 'InnovCorp', period: '2015-2019', achievements: ['• Transformation digitale complète de l\'entreprise', '• Réduction coûts opérationnels de 25%', '• Mise en place processus qualité ISO 9001'] },
      { title: 'Directeur Commercial', company: 'SalesForce Europe', period: '2012-2015', achievements: ['• Développement réseau partenaires (50+ revendeurs)', '• Augmentation pipeline commercial de 200%', '• Formation et encadrement équipe 25 commerciaux'] }
    ],
    skills: ['Leadership', 'Stratégie d\'entreprise', 'Transformation digitale', 'Développement international', 'Négociation', 'Budget & Finance', 'Management', 'Innovation', 'Partenariats', 'M&A'],
    education: 'MBA - HEC Paris, Ingénieur - École Centrale',
    languages: 'Français (Natif), Anglais (Bilingue), Allemand (Courant)'
  }],
  Designer: [{
    name: 'CAMILLE ROUSSEAU',
    title: 'UX/UI Designer Senior',
    email: 'camille.rousseau@email.com',
    phone: '+33 6 34 67 89 12',
    location: 'Bordeaux, France',
    profile: 'Designer UX/UI passionnée avec 5 ans d\'expérience dans la création d\'expériences digitales innovantes. Expertise en design thinking, prototypage et recherche utilisateur. Portfolio : 30+ projets, 2M+ utilisateurs impactés.',
    experiences: [
      { title: 'Senior UX/UI Designer', company: 'DesignStudio Pro', period: '2021-2024', achievements: ['• Refonte UX app mobile : +85% satisfaction utilisateur', '• Design system pour 15+ produits digitaux', '• Recherche utilisateur : 200+ interviews, tests A/B'] },
      { title: 'UX/UI Designer', company: 'CreativeAgency', period: '2019-2021', achievements: ['• Conception interfaces pour startups et PME', '• Prototypage interactif avec Figma et Principle', '• Collaboration étroite équipes dev (Agile/Scrum)'] },
      { title: 'Designer Graphique', company: 'BrandFactory', period: '2018-2019', achievements: ['• Création identités visuelles pour 40+ marques', '• Design supports print et digital', '• Formation clients aux outils Adobe Creative Suite'] }
    ],
    skills: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'Principle', 'InVision', 'Miro', 'User Research', 'Prototyping'],
    education: 'Master Design Interactif - École Supérieure d\'Art et Design',
    languages: 'Français (Natif), Anglais (Courant), Japonais (Notions)'
  }],
  Data: [
  {
    name: 'THOMAS LEROY',
    title: 'Data Scientist Senior',
    email: 'thomas.leroy@email.com',
    phone: '+33 6 56 78 34 91',
    location: 'Toulouse, France',
    profile: 'Data Scientist avec 6 ans d\'expérience en machine learning et analyse prédictive. Expert en Python, R et déploiement de modèles en production. Projets réalisés : +50 modèles ML, économies générées : 2M€+.',
    experiences: [
      { title: 'Senior Data Scientist', company: 'DataCorp Analytics', period: '2020-2024', achievements: ['• Développement modèles prédictifs (churn, pricing, demand)', '• Mise en production 15+ modèles ML (AWS, Docker)', '• Économies générées : 2.5M€ via optimisation pricing'] },
      { title: 'Data Scientist', company: 'AI Solutions', period: '2018-2020', achievements: ['• Analyse de données clients (10M+ records)', '• Création dashboards interactifs (Tableau, Power BI)', '• Modèles de recommandation : +25% conversion'] },
      { title: 'Analyste Data', company: 'TechAnalytics', period: '2017-2018', achievements: ['• ETL et nettoyage de données massives', '• Rapports automatisés avec Python et SQL', '• Formation équipes métier aux outils BI'] }
    ],
    skills: ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Scikit-learn', 'Pandas', 'AWS', 'Docker', 'Tableau'],
    education: 'Master Data Science - Université Paris-Saclay',
    languages: 'Français (Natif), Anglais (Courant), Chinois (Notions)'
  },
  {
    name: 'NATHALIE DURAND',
    title: 'Senior Data Analyst',
    email: 'nathalie.durand@email.com',
    phone: '+33 6 22 44 66 88',
    location: 'Nantes, France',
    profile: 'Data Analyst senior spécialisée BI/Analytics avec 7 ans d\'expérience. Expertise en modélisation de données, visualisation et optimisation des tableaux de bord orientés KPIs.',
    experiences: [
      { title: 'Senior Data Analyst', company: 'InsightWorks', period: '2021-2024', achievements: ['• Déploiement d\'un data warehouse (Snowflake) multi-source', '• Industrialisation de dashboards Power BI (300+ utilisateurs)', '• Standardisation KPIs groupe et gouvernance des données'] },
      { title: 'Data Analyst', company: 'RetailChain', period: '2018-2021', achievements: ['• Optimisation des analyses ventes et stocks', '• Mise en place d\'alertes automatiques (anomalies, seuils)', '• Formation des équipes métiers aux outils BI'] },
      { title: 'BI Consultant', company: 'ConsultingData', period: '2016-2018', achievements: ['• Projets BI pour 10+ clients', '• Automatisation reporting hebdomadaire', '• Migration rapports Excel vers Power BI'] }
    ],
    skills: ['SQL', 'Power BI', 'Tableau', 'Python', 'DAX', 'ETL', 'Snowflake', 'Data Modeling', 'KPIs'],
    education: 'Master Statistiques et Décisionnel - Université de Nantes',
    languages: 'Français (Natif), Anglais (Courant)'
  }
  ],
  Finance: [{
    name: 'JULIEN MOREAU',
    title: 'Contrôleur de Gestion Senior',
    email: 'julien.moreau@email.com',
    phone: '+33 6 87 34 56 21',
    location: 'Marseille, France',
    profile: 'Contrôleur de gestion avec 9 ans d\'expérience en pilotage financier et optimisation des performances. Expert en budgets, reporting et analyse de rentabilité. Économies réalisées : 3M€+, amélioration marge : +12%.',
    experiences: [
      { title: 'Contrôleur de Gestion Senior', company: 'ManufacturingGroup', period: '2020-2024', achievements: ['• Pilotage budgétaire de 5 filiales (CA 80M€)', '• Mise en place tableaux de bord KPI temps réel', '• Optimisation processus : économies 1.2M€/an'] },
      { title: 'Contrôleur de Gestion', company: 'RetailChain SA', period: '2017-2020', achievements: ['• Analyse rentabilité par magasin (150 points de vente)', '• Reporting mensuel direction générale', '• Projet ERP : migration SAP réussie en 8 mois'] },
      { title: 'Analyste Financier Junior', company: 'AuditFirm', period: '2015-2017', achievements: ['• Contrôle interne et audit opérationnel', '• Analyse écarts budgétaires et recommandations', '• Formation utilisateurs outils de gestion'] }
    ],
    skills: ['Contrôle de gestion', 'SAP/ERP', 'Excel avancé', 'Power BI', 'Budgets & Prévisions', 'Analyse financière', 'KPI Management', 'Audit interne', 'Consolidation', 'Reporting'],
    education: 'Master Contrôle de Gestion - IAE Aix-Marseille',
    languages: 'Français (Natif), Anglais (Courant), Espagnol (Courant)'
  }]
};


// (Déplacé après generateRealisticHTML pour éviter les problèmes de portée)

type ProfileKey = keyof typeof profilesData;

const getProfileKey = (templateName: string): ProfileKey => {
  let key: ProfileKey = 'Tech';
  if (templateName.includes('Marketing')) key = 'Marketing';
  else if (templateName.includes('Executive')) key = 'Executive';
  else if (templateName.includes('Designer')) key = 'Designer';
  else if (templateName.includes('Data')) key = 'Data';
  else if (templateName.includes('Finance')) key = 'Finance';
  return key;
};

const getProfileColor = (profileKey: ProfileKey): string => {
  return profileKey === 'Tech' ? '#3B82F6'
    : profileKey === 'Marketing' ? '#EC4899'
    : profileKey === 'Executive' ? '#6B7280'
    : profileKey === 'Designer' ? '#8B5CF6'
    : profileKey === 'Data' ? '#10B981'
    : '#F59E0B';
};

// Sélection déterministe d'un profil parmi plusieurs en fonction de l'id du template
const hashString = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
};

const pickProfile = (profileKey: ProfileKey, seed: string): Profile | undefined => {
  const list = profilesData[profileKey];
  if (!list || list.length === 0) return undefined;
  const s = seed && seed.trim().length > 0 ? seed : String(Math.random());
  const idx = list.length === 1 ? 0 : hashString(s) % list.length;
  return list[idx];
};

export const Templates: React.FC = () => {
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  // État pour la modale d'aperçu A4
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  
  const { templates, loading, error } = useSupabase();

  // Adapter les données Supabase au format attendu par le composant
  const adaptedTemplates = React.useMemo(() => templates.map(template => ({
    id: template.id,
    name: template.name,
    category: template.category,
    description: template.description,
    preview: template.preview_color,
    atsScore: template.ats_score,
    downloads: template.downloads,
    rating: template.rating,
    tags: template.tags,
    wordFile: `${template.name.toLowerCase().replace(/\s+/g, '_')}.docx`,
    isPremium: template.is_premium,
    industry: template.industry
  })), [templates]);

  // Fallback vers des données statiques si pas de templates Supabase
  const fallbackTemplates = React.useMemo(() => [
    {
      id: '1',
      name: 'CV Tech Senior Pro',
      category: 'Développement',
      description: 'Template optimisé pour les développeurs seniors avec sections dédiées aux projets techniques',
      preview: 'bg-gradient-to-br from-blue-100 to-indigo-100',
      atsScore: 96,
      downloads: '3.2k',
      rating: 4.9,
      tags: ['Senior', 'Full Stack', 'ATS Optimisé', 'Projets'],
      wordFile: 'cv-tech-senior-pro.docx',
      isPremium: true,
      industry: 'Tech'
    },
    {
      id: '2',
      name: 'CV Marketing Digital Elite',
      category: 'Marketing',
      description: 'Design moderne pour les professionnels du marketing digital avec focus sur les KPIs',
      preview: 'bg-gradient-to-br from-pink-100 to-rose-100',
      atsScore: 94,
      downloads: '2.8k',
      rating: 4.8,
      tags: ['Marketing', 'Digital', 'KPIs', 'Créatif'],
      wordFile: 'cv-marketing-digital-elite.docx',
      isPremium: true,
      industry: 'Marketing'
    },
    {
      id: '3',
      name: 'CV Executive Premium',
      category: 'Management',
      description: 'Template élégant pour postes de direction avec mise en avant du leadership',
      preview: 'bg-gradient-to-br from-gray-100 to-slate-100',
      atsScore: 95,
      downloads: '1.9k',
      rating: 4.9,
      tags: ['Executive', 'Leadership', 'Premium', 'Direction'],
      wordFile: 'cv-executive-premium.docx',
      isPremium: true,
      industry: 'Management'
    },
    {
      id: '4',
      name: 'CV Designer UX/UI',
      category: 'Design',
      description: 'Template créatif pour designers avec espace portfolio et projets visuels',
      preview: 'bg-gradient-to-br from-violet-100 to-purple-100',
      atsScore: 91,
      downloads: '4.1k',
      rating: 4.7,
      tags: ['UX/UI', 'Portfolio', 'Créatif', 'Projets'],
      wordFile: 'cv-designer-ux-ui.docx',
      isPremium: false,
      industry: 'Design'
    },
    {
      id: '5',
      name: 'CV Data Scientist',
      category: 'Data Science',
      description: 'Optimisé pour les data scientists avec sections techniques et certifications',
      preview: 'bg-gradient-to-br from-emerald-100 to-teal-100',
      atsScore: 97,
      downloads: '1.5k',
      rating: 4.8,
      tags: ['Data Science', 'Analytics', 'Python', 'ML'],
      wordFile: 'cv-data-scientist.docx',
      isPremium: true,
      industry: 'Data'
    },
    {
      id: '6',
      name: 'CV Finance Corporate',
      category: 'Finance',
      description: 'Template professionnel pour le secteur financier avec focus sur les résultats',
      preview: 'bg-gradient-to-br from-amber-100 to-orange-100',
      atsScore: 93,
      downloads: '2.1k',
      rating: 4.6,
      tags: ['Finance', 'Corporate', 'Résultats', 'Professionnel'],
      wordFile: 'cv-finance-corporate.docx',
      isPremium: true,
      industry: 'Finance'
    },
    {
      id: '7',
      name: 'CV Startup Founder',
      category: 'Startup',
      description: 'Pour entrepreneurs et fondateurs avec focus sur l\'innovation et les réalisations',
      preview: 'bg-gradient-to-br from-red-100 to-pink-100',
      atsScore: 92,
      downloads: '1.3k',
      rating: 4.7,
      tags: ['Startup', 'Innovation', 'Leadership', 'Entrepreneuriat'],
      wordFile: 'cv-startup-founder.docx',
      isPremium: true,
      industry: 'Startup'
    },
    {
      id: '8',
      name: 'CV Consultant Senior',
      category: 'Conseil',
      description: 'Template pour consultants avec focus sur les missions et résultats',
      preview: 'bg-gradient-to-br from-cyan-100 to-blue-100',
      atsScore: 94,
      downloads: '1.7k',
      rating: 4.8,
      tags: ['Conseil', 'Senior', 'Missions', 'Résultats'],
      wordFile: 'cv-consultant-senior.docx',
      isPremium: true,
      industry: 'Conseil'
    },
    {
      id: '9',
      name: 'CV Product Manager Moderne',
      category: 'Produit',
      description: 'Style moderne et professionnel avec mise en avant des impacts et KPIs produits',
      preview: 'bg-gradient-to-br from-slate-100 to-sky-100',
      atsScore: 95,
      downloads: '2.4k',
      rating: 4.8,
      tags: ['Product', 'KPIs', 'Roadmap', 'Leadership'],
      wordFile: 'cv-product-manager-moderne.docx',
      isPremium: true,
      industry: 'Produit'
    }
  ], []);
 
  // Ajout d'un template supplémentaire professionnel et visuellement soigné
  // Remarque: ce template apparaît via les données de secours (fallback)
  // lorsqu'il n'y a pas encore de données Supabase.

  // Utiliser les templates Supabase ou fallback
  const displayTemplates = adaptedTemplates.length > 0 ? adaptedTemplates : fallbackTemplates;

  // Générer les catégories dynamiquement depuis les templates
  const categories = React.useMemo(() => {
    if (!displayTemplates || displayTemplates.length === 0) return ['Tous'];
    
    const uniqueCategories = Array.from(new Set(displayTemplates.map(template => template.category)));
    return ['Tous', ...uniqueCategories.sort()];
  }, [displayTemplates]);

  const filteredTemplates = displayTemplates
    .filter(template => {
      const matchesCategory = selectedCategory === 'Tous' || template.category === selectedCategory;
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'ats':
          return b.atsScore - a.atsScore;
        case 'downloads':
          return parseInt(b.downloads.replace('k', '')) - parseInt(a.downloads.replace('k', ''));
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popular':
        default:
          return parseInt(b.downloads.replace('k', '')) - parseInt(a.downloads.replace('k', ''));
      }
    });

 // Afficher un état de chargement
 if (loading) {
   return (
     <div className="space-y-8">
       <div className="text-left">
         <BreadcrumbNavigation
           items={[
             {
               label: 'Accueil',
               icon: NavigationIcons.Home,
               onClick: () => setActiveTab('dashboard')
             },
             
             { label: 'Modèles', current: true }
           ]}
           showHome={false}
           className="justify-start mb-4"
         />
         <p className="text-gray-600 max-w-2xl mx-auto">Chargement des templates...</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {[1, 2, 3, 4, 5, 6].map((i) => (
           <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/30 overflow-hidden animate-pulse">
             <div className="h-48 bg-gray-200" />
             <div className="p-6 space-y-4">
               <div className="h-4 bg-gray-200 rounded w-3/4" />
               <div className="h-3 bg-gray-200 rounded w-full" />
               <div className="h-3 bg-gray-200 rounded w-1/2" />
             </div>
           </div>
         ))}
       </div>
     </div>
   );
 }

 // Afficher une erreur si nécessaire
 if (error && adaptedTemplates.length === 0) {
   return (
     <div className="space-y-8">
       <div className="text-center">
         <BreadcrumbNavigation
           items={[
             {
               label: 'Accueil',
               icon: NavigationIcons.Home,
               onClick: () => setActiveTab('dashboard')
             },
             { label: 'Modèles', current: true }
           ]}
           showHome={false}
           className="justify-start mb-4"
         />
         <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-2xl mx-auto">
           <p className="text-red-600">Erreur lors du chargement des templates: {error}</p>
           <p className="text-sm text-red-500 mt-2">Utilisation des templates par défaut.</p>
         </div>
       </div>
     </div>
   );
 }
 
 
 const generateRealisticHTML = (template: Template, seed?: string) => {
  // Utiliser les données centralisées
  const profileKey = getProfileKey(template.name);
  const profile = pickProfile(profileKey, seed ?? template.id)!;
  const color = getProfileColor(profileKey);
  
  // Analyser dynamiquement le template pour détecter les émojis et styles
  const templatePreview = (() => {
    return (
      <>
        {/* Header */}
        <div className="text-center mb-2 pb-2 border-b border-gray-200">
          <div className="font-bold text-sm mb-1" style={{ color }}>{profile.name}</div>
          <div className="text-xs text-gray-600 font-medium">{profile.title}</div>
          <div className="text-xs text-gray-500 mt-1">
            📧 {profile.email} | 📱 {profile.phone}
          </div>
          <div className="text-xs text-gray-500">📍 {profile.location}</div>
        </div>
      </>
    );
  })();

  // Convertir le JSX en string pour analyser le contenu
  const templateString = JSON.stringify(templatePreview);
  
  // Détecter la présence d'émojis dans le template
  const hasEmojis = /📧|📱|📍|💼|🎯|⚡|🚀|💡|🔧|🎨|📊|💰/.test(templateString);
  
  return { profile, color, hasEmojis };
};

// Génère un HTML autonome stylé au format A4 pour l'aperçu/export
const buildA4Html = (template: Template, seed?: string): string => {
  const { profile, color, hasEmojis } = generateRealisticHTML(template, seed);
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${template.name} — A4</title>
      <style>
        @page { size: A4; margin: 0; }
        html, body { height: 100%; overflow: hidden; }
        body { margin: 0; background: #ffffff; font-family: Arial, sans-serif; color: #333; }
        .page { width: 210mm; height: 297mm; overflow: hidden; margin: 0 auto; background: #fff; padding: 18mm 18mm 20mm 18mm; box-sizing: border-box; }
        .header { text-align: ${template.name.toLowerCase().includes('minimalist') || template.name.toLowerCase().includes('minimaliste') ? 'left' : 'center'}; margin-bottom: 14px; }
        .name { font-size: 20pt; font-weight: bold; color: ${color}; margin-bottom: 6px; }
        .contact { font-size: 10pt; color: #666; }
        .section { margin: 14px 0; }
        .section-title { font-size: 11pt; font-weight: bold; color: ${color}; margin-bottom: 8px; text-transform: uppercase; }
        .job-title { font-size: 10.5pt; font-weight: 600; color: #333; margin-bottom: 2px; }
        .company { font-size: 10pt; color: #666; margin-bottom: 6px; }
        .date { color: #888; }
        ul { margin: 6px 0 0 18px; padding: 0; }
        li { margin-bottom: 4px; font-size: 10pt; }
        .skills { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
        .skill { background: #f3f4f6; padding: 5px 10px; border-radius: 14px; font-size: 10pt; color: #333; }
        @media print { body { background: #fff; } .page { box-shadow: none; margin: 0; } }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="name">${profile.name}</div>
          <div class="contact">${hasEmojis ? '📧 ' : ''}${profile.email}${hasEmojis ? ' | 📱 ' : ' • '}${profile.phone}</div>
          ${hasEmojis
            ? `<div class="contact">📍 ${profile.location}</div>`
            : `<div class="contact">${profile.location}</div>`}
        </div>
        <div class="section">
          <div class="section-title">PROFIL PROFESSIONNEL</div>
          <p style="margin:0; font-size:10.5pt; line-height:1.45;">${profile.profile}</p>
        </div>
        <div class="section">
          <div class="section-title">EXPÉRIENCE PROFESSIONNELLE</div>
          ${profile.experiences.map((exp: Experience) => `
            <div style="margin-bottom:10px;">
              <div class="job-title">${exp.title}</div>
              <div class="company">${exp.company} • <span class="date">${exp.period}</span></div>
              <ul>
                ${exp.achievements.map((ach: string) => `<li>${ach}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        <div class="section">
          <div class="section-title">COMPÉTENCES TECHNIQUES</div>
          <div class="skills">
            ${profile.skills.map((skill: string) => `<span class="skill">${skill}</span>`).join(' ')}
          </div>
        </div>
        <div class="section">
          <div class="section-title">FORMATION</div>
          <div class="job-title">${profile.education}</div>
        </div>
        <div class="section">
          <div class="section-title">LANGUES</div>
          <p style="margin:0; font-size:10.5pt;">${profile.languages}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Ouvre un nouvel onglet avec l'export HTML A4 (aperçu imprimable)
const handlePreviewHtmlA4 = (template: Template, seed?: string) => {
  const html = buildA4Html(template, seed);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
};

const handleDownloadFormat = (template: Template, format: 'word' | 'html' | 'txt' | 'pdf') => {
   try {
     const { profile, color, hasEmojis } = generateRealisticHTML(template);
     let content = '';
     let filename = '';
     let mimeType = '';

     switch (format) {
        case 'word':
          content = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
            <head>
              <meta charset="utf-8">
              <title>${template.name}</title>
              <style>
                body { font-family: 'Calibri', sans-serif; margin: 40px; line-height: 1.6; color: #333; }
                .header { text-align: ${template.name.toLowerCase().includes('minimalist') || template.name.toLowerCase().includes('minimaliste') ? 'left' : 'center'}; margin-bottom: 30px; }
                .name { font-size: 28px; font-weight: bold; color: ${color}; margin-bottom: 10px; }
                .contact { font-size: 14px; color: #666; }
                .section { margin-bottom: 25px; }
                .section-title { font-size: 16px; font-weight: bold; color: ${color}; margin-bottom: 15px; text-transform: uppercase; }
                .job-title { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 5px; }
                .company { font-size: 13px; color: #666; margin-bottom: 10px; }
                .date { color: #888; }
                ul { margin: 10px 0; padding-left: 20px; }
                li { margin-bottom: 5px; font-size: 13px; }
                .skills { margin: 10px 0; }
                .skill { background: #f3f4f6; padding: 4px 8px; font-size: 12px; color: #333; margin-right: 5px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="name">${profile.name}</div>
                <div class="contact">${hasEmojis ? '📧 ' : ''}${profile.email}${hasEmojis ? ' • 📱 ' : ' • '}${profile.phone}${hasEmojis ? ' • 📍 ' : ' • '}${profile.location}</div>
              </div>
              
              <div class="section">
                <div class="section-title">PROFIL PROFESSIONNEL</div>
                <p>${profile.profile}</p>
              </div>

              <div class="section">
                <div class="section-title">EXPÉRIENCE PROFESSIONNELLE</div>
                ${profile.experiences.map(exp => `
                  <div style="margin-bottom: 20px;">
                    <div class="job-title">${exp.title}</div>
                    <div class="company">${exp.company} • <span class="date">${exp.period}</span></div>
                    <ul>
                      ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>

              <div class="section">
                <div class="section-title">COMPÉTENCES TECHNIQUES</div>
                <div class="skills">
                  ${profile.skills.map(skill => `<span class="skill">${skill}</span>`).join(' ')}
                </div>
              </div>

              <div class="section">
                <div class="section-title">FORMATION</div>
                <div class="job-title">${profile.education}</div>
              </div>

              <div class="section">
                <div class="section-title">LANGUES</div>
                <p>${profile.languages}</p>
              </div>
            </body>
            </html>
          `;
          filename = `${template.name.replace(/\s+/g, '_').toLowerCase()}.doc`;
          mimeType = 'application/msword';
          break;

        case 'pdf':
          content = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>${template.name}</title>
              <style>
                @page { margin: 2cm; }
                body { font-family: Arial, sans-serif; margin: 0; line-height: 1.6; color: #333; }
                .header { text-align: ${template.name.toLowerCase().includes('minimalist') || template.name.toLowerCase().includes('minimaliste') ? 'left' : 'center'}; border-bottom: 3px solid ${color}; padding-bottom: 20px; margin-bottom: 30px; }
                .name { font-size: 24px; font-weight: bold; color: ${color}; margin-bottom: 10px; }
                .contact { font-size: 14px; color: #666; }
                .section { margin-bottom: 25px; }
                .section-title { font-size: 16px; font-weight: bold; color: ${color}; margin-bottom: 15px; text-transform: uppercase; border-bottom: 2px solid ${color}; padding-bottom: 5px; }
                .job-title { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 5px; }
                .company { font-size: 13px; color: #666; margin-bottom: 10px; }
                .date { color: #888; }
                ul { margin: 10px 0; padding-left: 20px; }
                li { margin-bottom: 5px; font-size: 13px; }
                .skills { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
                .skill { background: #f3f4f6; padding: 6px 12px; border-radius: 15px; font-size: 12px; color: #333; margin: 2px; }
              </div>

              <div class="section">
                <div class="section-title">EXPÉRIENCE PROFESSIONNELLE</div>
                ${profile.experiences.map(exp => `
                  <div style="margin-bottom: 20px;">
                    <div class="job-title">${exp.title}</div>
                    <div class="company">${exp.company} • <span class="date">${exp.period}</span></div>
                    <ul>
                      ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>

              <div class="section">
                <div class="section-title">COMPÉTENCES TECHNIQUES</div>
                <div class="skills">
                  ${profile.skills.map(skill => `<span class="skill">${skill}</span>`).join(' ')}
                </div>
              </div>

              <div class="section">
                <div class="section-title">FORMATION</div>
                <div class="job-title">${profile.education}</div>
              </div>

              <div class="section">
                <div class="section-title">LANGUES</div>
                <p>${profile.languages}</p>
              </div>
            </body>
            </html>
          `;
          filename = `${template.name.replace(/\s+/g, '_').toLowerCase()}.html`;
          mimeType = 'text/html';
          break;

        case 'html':
          content = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${template.name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
                .header { text-align: ${template.name.toLowerCase().includes('minimalist') || template.name.toLowerCase().includes('minimaliste') ? 'left' : 'center'}; margin-bottom: 30px; }
                .name { font-size: 28px; font-weight: bold; color: ${color}; margin-bottom: 10px; }
                .contact { font-size: 14px; color: #666; }
                .section { margin-bottom: 25px; }
                .section-title { font-size: 16px; font-weight: bold; color: ${color}; margin-bottom: 15px; text-transform: uppercase; }
                .job-title { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 5px; }
                .company { font-size: 13px; color: #666; margin-bottom: 10px; }
                .date { color: #888; }
                ul { margin: 10px 0; padding-left: 20px; }
                li { margin-bottom: 5px; font-size: 13px; }
                .skills { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
                .skill { background: #f3f4f6; padding: 6px 12px; border-radius: 15px; font-size: 12px; color: #333; margin: 2px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="name">${profile.name}</div>
                <div class="contact">${hasEmojis ? '📧 ' : ''}${profile.email}${hasEmojis ? ' | 📱 ' : ' • '}${profile.phone}</div>
                ${hasEmojis ? `<div class="contact">📍 ${profile.location}</div>` : `<div class="contact">${profile.location}</div>`}
              </div>
              
              <div class="section">
                <div class="section-title">PROFIL PROFESSIONNEL</div>
                <p>${profile.profile}</p>
              </div>

              <div class="section">
                <div class="section-title">EXPÉRIENCE PROFESSIONNELLE</div>
                ${profile.experiences.map(exp => `
                  <div style="margin-bottom: 20px;">
                    <div class="job-title">${exp.title}</div>
                    <div class="company">${exp.company} • <span class="date">${exp.period}</span></div>
                    <ul>
                      ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>

              <div class="section">
                <div class="section-title">COMPÉTENCES TECHNIQUES</div>
                <div class="skills">
                  ${profile.skills.map(skill => `<span class="skill">${skill}</span>`).join(' ')}
                </div>
              </div>

              <div class="section">
                <div class="section-title">FORMATION</div>
                <div class="job-title">${profile.education}</div>
              </div>

              <div class="section">
                <div class="section-title">LANGUES</div>
                <p>${profile.languages}</p>
              </div>
            </body>
            </html>
          `;
          filename = `${template.name.replace(/\s+/g, '_').toLowerCase()}.html`;
          mimeType = 'text/html';
          break;


        case 'txt':
          content = `
${template.name.toUpperCase()}

[VOTRE NOM]
[Email] • [Téléphone] • [Ville] • [LinkedIn]

CONTACT
📧 [votre.email@exemple.com]
📱 [+33 X XX XX XX XX]
📍 [Votre Ville, Pays]
💼 [LinkedIn: linkedin.com/in/votre-profil]

PROFIL PROFESSIONNEL
[Décrivez votre profil professionnel en 2-3 lignes, en mettant l'accent sur vos compétences clés et votre expérience dans le domaine ${template.category.toLowerCase()}.]

EXPÉRIENCE PROFESSIONNELLE

[Titre du Poste]
[Nom de l'Entreprise] • [Dates]
• Réalisation majeure avec impact quantifiable (ex: +25% de performance)
• Projet important utilisant les technologies ${template.tags.slice(0, 3).join(', ')}
• Leadership d'équipe ou initiative stratégique

[Poste Précédent]
[Entreprise Précédente] • [Dates]
• Accomplissement significatif avec métriques précises
• Amélioration de processus ou innovation

COMPÉTENCES TECHNIQUES
${template.tags.join(' • ')}

FORMATION
[Diplôme]
[École/Université] • [Année]

LANGUES
Français (Natif) • Anglais (Courant) • [Autre langue]
          `;
          filename = `${template.name.replace(/\s+/g, '_').toLowerCase()}.txt`;
          mimeType = 'text/plain';
          break;
      }

      // Créer et télécharger le fichier
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };


  const handlePreview = (template: Template, seed?: string) => {
    // Ouvre une modale avec un aperçu HTML A4 intégré
    const html = buildA4Html(template, seed);
    setPreviewTitle(template.name);
    setPreviewHtml(html);
    setPreviewOpen(true);
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 95) return 'bg-emerald-500';
    if (score >= 90) return 'bg-blue-500';
    if (score >= 85) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      {/* Modale d'aperçu A4 */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900 truncate">Aperçu A4 — {previewTitle}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Fermer
                </button>
              </div>
            </div>
            <div className="bg-gray-100 p-4 overflow-auto" style={{ maxHeight: '85vh' }}>
              <div className="flex justify-center">
                <iframe
                  title="Aperçu A4"
                  srcDoc={previewHtml}
                  className="bg-white shadow"
                  style={{ width: '210mm', height: '297mm', border: 'none' }}
                  scrolling="no"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="text-left">
        <BreadcrumbNavigation
          items={[
            {
              label: 'Accueil',
              icon: NavigationIcons.Home,
              onClick: () => setActiveTab('dashboard')
            },
            
            { label: 'Modèles', current: true }
          ]}
          showHome={false}
          className="justify-start mb-4"
        />
        <p className="text-gray-600 max-w-2xl">
          Collection de templates professionnels au format Word, optimisés ATS et prêts à télécharger
        </p>
      </div>

      {/* Featured Banner - Version compacte et professionnelle */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Templates Word Premium</h3>
              <p className="text-slate-300 text-sm">Collection professionnelle optimisée ATS</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">95%</div>
              <div className="text-slate-300 text-xs">Score ATS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">15k+</div>
              <div className="text-slate-300 text-xs">Téléchargements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">8</div>
              <div className="text-slate-300 text-xs">Secteurs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Features - Version compacte */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-slate-600" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">Certifié ATS</h4>
            <p className="text-xs text-gray-600">Compatible systèmes RH</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">Validé RH</h4>
            <p className="text-xs text-gray-600">Approuvé professionnels</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-slate-600" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">Performance</h4>
            <p className="text-xs text-gray-600">+40% réponses positives</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-slate-600" />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">IA Optimisé</h4>
            <p className="text-xs text-gray-600">Amélioration continue</p>
          </div>
        </div>
      </div>

      {/* Search and Filters - Version compacte */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="popular">Populaires</option>
            <option value="rating">Notés</option>
            <option value="ats">Score ATS</option>
            <option value="downloads">Téléchargés</option>
            <option value="name">A-Z</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTemplates.map((template, idx) => (
          <div
            key={template.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/30 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
          >
            {/* Template Preview - Format A4 */}
            <div className="relative bg-white m-4 rounded-lg shadow-sm overflow-hidden" style={{ aspectRatio: '1 / 1.414' }}>
              {/* Premium Badge */}
              {template.isPremium && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full flex items-center space-x-1 text-xs font-bold">
                    <Star className="w-3 h-3" />
                    <span>Premium</span>
                  </div>
                </div>
              )}

              {/* ATS Score */}
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                  <div className={"w-2 h-2 rounded-full " + getScoreBadgeColor(template.atsScore)} />
                  <span className="text-xs font-bold text-gray-800">{template.atsScore}%</span>
                </div>
              </div>
              {/* CV Content - Réaliste et conforme ATS */}
              <div className="p-3 h-full flex flex-col text-xs">
                {(() => {
                  // Utiliser les données et helpers centralisés
                  const profileKey = getProfileKey(template.name);
                  const profile = pickProfile(profileKey, `${template.id}-${idx}`)!;
                  const color = getProfileColor(profileKey);

                  return (
                    <>
                      {/* Header */}
                      <div className="text-center mb-2 pb-2 border-b border-gray-200">
                        <div className="font-bold text-sm mb-1" style={{ color }}>{profile.name}</div>
                        <div className="text-xs text-gray-600 font-medium">{profile.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          📧 {profile.email} | 📱 {profile.phone}
                        </div>
                        <div className="text-xs text-gray-500">📍 {profile.location}</div>
                      </div>
                      
                      {/* Profile */}
                      <div className="mb-2">
                        <div className="font-semibold text-xs mb-1" style={{ color }}>PROFIL PROFESSIONNEL</div>
                        <div className="text-xs text-gray-700 leading-tight">{profile.profile}</div>
                      </div>
                      
                      {/* Experience */}
                      <div className="mb-2">
                        <div className="font-semibold text-xs mb-1" style={{ color }}>EXPÉRIENCE PROFESSIONNELLE</div>
                        <div className="space-y-1">
                          {profile.experiences.slice(0, 2).map((exp: Experience, idx: number) => (
                            <div key={idx}>
                              <div className="font-medium text-xs">{exp.title}</div>
                              <div className="text-xs text-gray-600">{exp.company} • {exp.period}</div>
                              <div className="text-xs text-gray-700 mt-0.5">
                                {exp.achievements.slice(0, 2).map((achievement: string, i: number) => (
                                  <div key={i}>{achievement}</div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Compétences */}
                      <div className="mb-2">
                        <div className="font-semibold text-xs mb-1" style={{ color }}>COMPÉTENCES TECHNIQUES</div>
                        <div className="flex flex-wrap gap-0.5">
                          {profile.skills.slice(0, 8).map((skill: string) => (
                            <span key={skill} className="bg-gray-100 px-1 py-0.5 rounded text-xs">{skill}</span>
                          ))}
                        </div>
                      </div>

                      {/* Formation */}
                      <div className="mb-1">
                        <div className="font-semibold text-xs mb-1" style={{ color }}>FORMATION</div>
                        <div className="text-xs text-gray-700">{profile.education}</div>
                      </div>

                      {/* Langues */}
                      <div>
                        <div className="font-semibold text-xs mb-1" style={{ color }}>LANGUES</div>
                        <div className="text-xs text-gray-700">{profile.languages}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-4">
                <button
                  onClick={() => handlePreview(template, `${template.id}-${idx}`)}
                  className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors hover:scale-110"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePreviewHtmlA4(template, `${template.id}-${idx}`)}
                    className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-medium"
                    title="Aperçu HTML A4"
                  >
                    A4
                  </button>
                  <button
                    onClick={() => handleDownloadFormat(template, 'word')}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                    title="Télécharger Word"
                  >
                    DOC
                  </button>
                  <button
                    onClick={() => handleDownloadFormat(template, 'html')}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                    title="Télécharger HTML"
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => handleDownloadFormat(template, 'txt')}
                    className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs font-medium"
                    title="Télécharger TXT"
                  >
                    TXT
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun template trouvé</h3>
          <p className="text-gray-600 mb-6">
            Essayez de modifier vos critères de recherche ou de filtrage
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Tous');
            }}
            className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-violet-700 hover:to-pink-700 transition-all duration-200 hover:scale-105"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/30">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Besoin d'un template personnalisé ?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Notre IA peut créer un template sur mesure basé sur votre profil et vos objectifs professionnels
          </p>
          
          <button className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-8 py-4 rounded-xl font-medium hover:from-violet-700 hover:to-pink-700 transition-all duration-200 hover:scale-105">
            Créer un template personnalisé
          </button>
        </div>
      </div>
    </div>
  );
};
