import React, { useState } from 'react';
import { Brain, Target, TrendingUp, Award, User, Star, ArrowRight, CheckCircle, Clock, Lightbulb, MessageSquare, Calendar, Download, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { BreadcrumbNavigation } from '../UI/BreadcrumbNavigation';
import { NavigationIcons } from '../UI/iconsData';
import { useAppStore } from '../../store/useAppStore';

interface CoachingProps {
  onNavigate?: (tab: string) => void;
}

interface CoachingSession {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  category: string;
  completed: boolean;
  progress: number;
}

interface UserProfile {
  level: 'junior' | 'senior' | 'expert';
  industry: string;
  targetRole: string;
  weaknesses: string[];
  strengths: string[];
  goals: string[];
}

export const Coaching: React.FC<CoachingProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showPlanningGuide, setShowPlanningGuide] = useState(false);

  // Profil utilisateur simulé basé sur les données d'analyse précédentes
  const userProfile: UserProfile = {
    level: 'senior',
    industry: 'Développement',
    targetRole: 'Lead Developer',
    weaknesses: ['Mots-clés techniques insuffisants', 'Manque de métriques quantifiables', 'Soft skills peu développées'],
    strengths: ['Expérience solide', 'Formation complète', 'Projets diversifiés'],
    goals: ['Améliorer le score ATS', 'Optimiser pour les postes de leadership', 'Développer le personal branding']
  };

  const coachingSessions: CoachingSession[] = [
    {
      id: '1',
      title: 'Optimisation des mots-clés techniques',
      description: 'Apprenez à identifier et intégrer les mots-clés essentiels pour votre secteur',
      duration: '25 min',
      difficulty: 'Intermédiaire',
      category: 'ATS',
      completed: false,
      progress: 0
    },
    {
      id: '2',
      title: 'Quantifier vos réalisations',
      description: 'Transformez vos expériences en résultats mesurables et impactants',
      duration: '30 min',
      difficulty: 'Intermédiaire',
      category: 'Contenu',
      completed: true,
      progress: 100
    },
    {
      id: '3',
      title: 'Développer votre leadership',
      description: 'Mettez en avant vos compétences de management et de leadership',
      duration: '35 min',
      difficulty: 'Avancé',
      category: 'Leadership',
      completed: false,
      progress: 60
    },
    {
      id: '4',
      title: 'Personal branding pour développeurs',
      description: 'Créez une identité professionnelle forte et cohérente',
      duration: '40 min',
      difficulty: 'Avancé',
      category: 'Branding',
      completed: false,
      progress: 0
    },
    {
      id: '5',
      title: 'Soft skills pour les profils techniques',
      description: 'Valorisez vos compétences interpersonnelles dans un CV technique',
      duration: '20 min',
      difficulty: 'Débutant',
      category: 'Soft Skills',
      completed: false,
      progress: 30
    },
    {
      id: '6',
      title: 'Structurer un CV pour postes senior',
      description: 'Organisez votre CV pour refléter votre niveau d\'expérience',
      duration: '45 min',
      difficulty: 'Avancé',
      category: 'Structure',
      completed: false,
      progress: 0
    }
  ];

  const categories = [
    { id: 'all', label: 'Tous', count: coachingSessions.length },
    { id: 'ATS', label: 'Optimisation ATS', count: coachingSessions.filter(s => s.category === 'ATS').length },
    { id: 'Contenu', label: 'Contenu', count: coachingSessions.filter(s => s.category === 'Contenu').length },
    { id: 'Leadership', label: 'Leadership', count: coachingSessions.filter(s => s.category === 'Leadership').length },
    { id: 'Branding', label: 'Personal Branding', count: coachingSessions.filter(s => s.category === 'Branding').length }
  ];

  const filteredSessions = activeCategory === 'all' 
    ? coachingSessions 
    : coachingSessions.filter(session => session.category === activeCategory);

  const completedSessions = coachingSessions.filter(s => s.completed).length;
  const totalProgress = Math.round(coachingSessions.reduce((acc, s) => acc + s.progress, 0) / coachingSessions.length);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-emerald-100 text-emerald-700';
      case 'Intermédiaire': return 'bg-amber-100 text-amber-700';
      case 'Avancé': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'from-emerald-500 to-teal-500';
    if (progress > 50) return 'from-blue-500 to-cyan-500';
    if (progress > 0) return 'from-amber-500 to-orange-500';
    return 'from-gray-300 to-gray-400';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <BreadcrumbNavigation
            items={[
              {
                label: 'Accueil',
                icon: NavigationIcons.Home,
                onClick: () => setActiveTab('dashboard')
              },
              {
                label: 'Coach IA',
                onClick: () => setActiveTab('coach')
              },
              { label: 'Coaching IA Personnalisé', current: true }
            ]}
            showHome={false}
            className="justify-start"
          />
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl animate-scaleIn flex-shrink-0">
            <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
        <p className="text-gray-600 max-w-2xl">
          Programme de coaching adapté à votre profil et vos objectifs professionnels
        </p>
      </div>

      {/* User Profile Summary */}
      <div className="bg-gradient-to-br from-violet-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 rounded-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Bonjour {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user?.email?.split('@')[0] || 'Utilisateur' : user?.email?.split('@')[0] || 'Utilisateur'} ! 👋</h3>
                <p className="text-white/90">Profil {userProfile.level} en {userProfile.industry}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{totalProgress}%</div>
              <div className="text-white/80 text-sm">Progression globale</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Objectif</span>
              </div>
              <p className="text-white/90 text-sm">{userProfile.targetRole}</p>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Sessions complétées</span>
              </div>
              <p className="text-white/90 text-sm">{completedSessions} sur {coachingSessions.length}</p>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Temps investi</span>
              </div>
              <p className="text-white/90 text-sm">{completedSessions * 30} minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Based on Profile */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/30">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Lightbulb className="w-6 h-6 text-violet-600" />
          <span>Recommandations personnalisées</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userProfile.weaknesses.slice(0, 3).map((weakness, index) => {
            const relatedSession = coachingSessions.find(s => 
              weakness.includes('mots-clés') ? s.category === 'ATS' :
              weakness.includes('métriques') ? s.category === 'Contenu' :
              weakness.includes('soft') ? s.category === 'Soft Skills' : false
            );
            
            return (
              <div key={index} className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-6 border border-violet-200/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-violet-200 text-violet-700 rounded-full">
                    Priorité haute
                  </span>
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-2">Point d'amélioration</h4>
                <p className="text-sm text-gray-600 mb-4">{weakness}</p>
                
                {relatedSession && (
                  <button
                    onClick={() => console.log('Session sélectionnée:', relatedSession)}
                    className="w-full bg-gradient-to-r from-violet-600 to-pink-600 text-white py-2 rounded-lg text-sm font-medium hover:from-violet-700 hover:to-pink-700 transition-all duration-200 hover:scale-105"
                  >
                    Session recommandée
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeCategory === category.id
                ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg scale-105'
                : 'bg-white/70 text-gray-600 hover:bg-violet-50 hover:text-violet-600 border border-gray-200/30 hover:scale-105'
            }`}
          >
            <span>{category.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeCategory === category.id ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Coaching Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/30 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(session.difficulty)}`}>
                      {session.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{session.duration}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{session.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{session.description}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Progression</span>
                  <span className="text-xs font-bold text-gray-900">{session.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(session.progress)} transition-all duration-1000`}
                    style={{ width: `${session.progress}%` }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between mb-4">
                {session.completed ? (
                  <div className="flex items-center space-x-2 text-emerald-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Terminé</span>
                  </div>
                ) : session.progress > 0 ? (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">En cours</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">À commencer</span>
                  </div>
                )}
                
                <span className="text-xs font-medium px-2 py-1 bg-violet-100 text-violet-700 rounded-full">
                  {session.category}
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => console.log('Session démarrée:', session)}
                className="w-full bg-gradient-to-r from-violet-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-violet-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
              >
                {session.completed ? (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Revoir</span>
                  </>
                ) : session.progress > 0 ? (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Continuer</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" />
                    <span>Commencer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/30">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Actions rapides</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onNavigate?.('chat')}
            className="bg-gradient-to-br from-violet-500 to-pink-500 text-white p-6 rounded-2xl hover:from-violet-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 text-left"
          >
            <MessageSquare className="w-8 h-8 mb-3" />
            <h4 className="font-semibold mb-2">Chat avec l'IA</h4>
            <p className="text-sm text-white/90">Conseils emploi personnalisés</p>
          </button>
          
          <button 
            onClick={() => setShowPlanningGuide(true)}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 hover:scale-105 text-left"
          >
            <Calendar className="w-8 h-8 mb-3" />
            <h4 className="font-semibold mb-2">Planifier session</h4>
            <p className="text-sm text-white/90">Organisez votre temps</p>
          </button>
          
          <button className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-6 rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 hover:scale-105 text-left">
            <TrendingUp className="w-8 h-8 mb-3" />
            <h4 className="font-semibold mb-2">Voir progression</h4>
            <p className="text-sm text-white/90">Suivez vos progrès</p>
          </button>
          
          <button className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6 rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 hover:scale-105 text-left">
            <Download className="w-8 h-8 mb-3" />
            <h4 className="font-semibold mb-2">Certificat</h4>
            <p className="text-sm text-white/90">Téléchargez vos acquis</p>
          </button>
        </div>
      </div>

      {/* Planning Guide Modal */}
      {showPlanningGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-pink-600 p-8 text-white relative overflow-hidden rounded-t-3xl">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Guide de Planification</h2>
                      <p className="text-white/90 text-lg">Organisez efficacement vos sessions de coaching</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPlanningGuide(false)}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Hero Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-2xl p-6 text-center border border-violet-200/50 hover:shadow-lg transition-all duration-300">
                  <div className="text-3xl font-bold text-violet-600 mb-2">15-45</div>
                  <div className="text-sm text-violet-700 font-medium">min/session</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-6 text-center border border-blue-200/50 hover:shadow-lg transition-all duration-300">
                  <div className="text-3xl font-bold text-blue-600 mb-2">2-3</div>
                  <div className="text-sm text-blue-700 font-medium">sessions/semaine</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl p-6 text-center border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">100%</div>
                  <div className="text-sm text-emerald-700 font-medium">personnalisé</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 text-center border border-amber-200/50 hover:shadow-lg transition-all duration-300">
                  <div className="text-3xl font-bold text-amber-600 mb-2">7</div>
                  <div className="text-sm text-amber-700 font-medium">jours/semaine</div>
                </div>
              </div>

              {/* Planning Steps */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Évaluez votre temps</h3>
                  <p className="text-gray-600 text-sm mb-4">Identifiez vos créneaux libres dans la semaine</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white/80 rounded-lg p-3 text-sm">
                      <span>Matin (7h-12h)</span>
                      <span className="font-medium text-blue-600">2-3 sessions</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/80 rounded-lg p-3 text-sm">
                      <span>Après-midi (13h-18h)</span>
                      <span className="font-medium text-blue-600">1-2 sessions</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/80 rounded-lg p-3 text-sm">
                      <span>Soir (19h-22h)</span>
                      <span className="font-medium text-blue-600">1 session</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-6 border border-violet-200/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Priorisez vos besoins</h3>
                  <p className="text-gray-600 text-sm mb-4">Commencez par vos points faibles identifiés</p>
                  <div className="space-y-2">
                    {userProfile.weaknesses.slice(0, 3).map((weakness, index) => (
                      <div key={index} className="flex items-start space-x-3 bg-white/80 rounded-lg p-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Planifiez régulièrement</h3>
                  <p className="text-gray-600 text-sm mb-4">Créez une routine d'apprentissage durable</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 bg-white/80 rounded-lg p-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>2-3 sessions/semaine</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/80 rounded-lg p-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Sessions de 20-45 min</span>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/80 rounded-lg p-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Même heure chaque jour</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Planning Template */}
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200/50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <span>Planning Hebdomadaire Recommandé</span>
                </h3>
                
                <div className="hidden lg:block">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                      <div key={day} className="text-center font-semibold text-gray-700 py-3 bg-gradient-to-br from-violet-100 to-pink-100 rounded-lg">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {[
                      { session: 'Mots-clés ATS', time: '8h-8h30', color: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500' },
                      { session: 'Repos', time: '', color: 'bg-gray-100 text-gray-500' },
                      { session: 'Quantifier résultats', time: '19h-19h30', color: 'bg-violet-100 text-violet-800 border-l-4 border-violet-500' },
                      { session: 'Repos', time: '', color: 'bg-gray-100 text-gray-500' },
                      { session: 'Leadership', time: '8h-8h45', color: 'bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500' },
                      { session: 'Personal Branding', time: '10h-10h40', color: 'bg-pink-100 text-pink-800 border-l-4 border-pink-500' },
                      { session: 'Révision', time: '14h-14h30', color: 'bg-amber-100 text-amber-800 border-l-4 border-amber-500' }
                    ].map((item, index) => (
                      <div key={index} className={`p-4 rounded-lg text-center hover:shadow-md transition-all duration-200 ${item.color}`}>
                        <div className="font-semibold text-sm mb-1">{item.session}</div>
                        {item.time && <div className="text-xs opacity-80">{item.time}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile/Tablet View */}
                <div className="lg:hidden space-y-4">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => {
                    const sessions = [
                      { session: 'Mots-clés ATS', time: '8h-8h30', color: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500' },
                      { session: 'Repos', time: '', color: 'bg-gray-100 text-gray-500' },
                      { session: 'Quantifier résultats', time: '19h-19h30', color: 'bg-violet-100 text-violet-800 border-l-4 border-violet-500' },
                      { session: 'Repos', time: '', color: 'bg-gray-100 text-gray-500' },
                      { session: 'Leadership', time: '8h-8h45', color: 'bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500' },
                      { session: 'Personal Branding', time: '10h-10h40', color: 'bg-pink-100 text-pink-800 border-l-4 border-pink-500' },
                      { session: 'Révision', time: '14h-14h30', color: 'bg-amber-100 text-amber-800 border-l-4 border-amber-500' }
                    ];
                    const sessionData = sessions[index];
                    
                    return (
                      <div key={day} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="font-bold text-gray-800 mb-3 text-center bg-gradient-to-r from-violet-100 to-pink-100 rounded-lg py-2">
                          {day}
                        </div>
                        {sessionData && (
                          <div className={`p-3 rounded-lg text-center ${sessionData.color}`}>
                            <div className="font-semibold text-sm mb-1">{sessionData.session}</div>
                            {sessionData.time && <div className="text-xs opacity-75">{sessionData.time}</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tips Section */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/30">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                  <span>Conseils pour Réussir</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Commencez petit</h4>
                        <p className="text-gray-600 text-sm">15-20 min/session au début</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Même heure chaque jour</h4>
                        <p className="text-gray-600 text-sm">Créez une habitude durable</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Un objectif par session</h4>
                        <p className="text-gray-600 text-sm">Focus sur un point d'amélioration</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Célébrez vos progrès</h4>
                        <p className="text-gray-600 text-sm">Récompensez-vous après chaque session</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Suivez votre progression</h4>
                        <p className="text-gray-600 text-sm">Notez vos apprentissages</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Posez des questions</h4>
                        <p className="text-gray-600 text-sm">Utilisez le chat IA pour clarifier</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => setShowPlanningGuide(false)}
                  className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-violet-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Commencer ma planification</span>
                </button>
                <button
                  onClick={() => setShowPlanningGuide(false)}
                  className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};