import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Target,
  Award,
  Clock,
  Star,
  Zap,
  BarChart3,
  Users,
  BookOpen,
  Network,
  GraduationCap,
  Briefcase,
  Lightbulb,
  ChevronRight,
  RefreshCw,
  Calendar,
  MapPin,
  Building,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  MessageSquare,
  FileText,
  Sparkles
} from 'lucide-react';
import { personalizedAIService, PersonalizedSuggestion, UserProfile, LearningPath, CareerPath } from '../../services/PersonalizedAIService';
import { useSupabase } from '../../hooks/useSupabase';
import PersonalizedSuggestions from './PersonalizedSuggestions';
import EnhancedAIChat from './EnhancedAIChat';
import Card from '../UI/Card';
import Button from '../UI/Button';

interface AIDashboardProps {
  userId?: string;
  compact?: boolean;
}

const AIDashboard: React.FC<AIDashboardProps> = ({ userId, compact = false }) => {
  const { profile } = useSupabase();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [suggestions, setSuggestions] = useState<PersonalizedSuggestion[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [marketInsights, setMarketInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'learning' | 'career' | 'chat'>('overview');
  const [progress, setProgress] = useState({
    completedSuggestions: 0,
    inProgressSuggestions: 0,
    skillAcquisition: {} as Record<string, number>,
    overallProgress: 0
  });

  useEffect(() => {
    initializeDashboard();
  }, [profile]);

  const initializeDashboard = async () => {
    if (!profile) return;

    try {
      setLoading(true);

      // Initialize user profile
      const profileData: Partial<UserProfile> = {
        name: profile.full_name || '',
        currentRole: profile.current_role || '',
        currentCompany: profile.current_company || '',
        experience: profile.experience_years || 0,
        skills: profile.skills || [],
        industry: profile.industry || '',
        targetRole: profile.target_role || '',
        location: profile.location || '',
        careerGoals: profile.career_goals || [],
        preferredIndustries: profile.preferred_industries || []
      };

      const initializedProfile = await personalizedAIService.initializeUserProfile(profileData);
      setUserProfile(initializedProfile);

      // Load all data
      const [personalizedSuggestions, userProgress] = await Promise.all([
        personalizedAIService.getPersonalizedSuggestions(),
        personalizedAIService.getProgress()
      ]);

      setSuggestions(personalizedSuggestions);
      setProgress(userProgress);

      // Load additional data if needed
      if (initializedProfile.targetRole) {
        const [paths, insights] = await Promise.all([
          personalizedAIService.getCareerPaths(initializedProfile.currentRole),
          personalizedAIService.getMarketInsights(initializedProfile.industry || 'Technology', initializedProfile.currentRole)
        ]);
        setCareerPaths(paths);
        setMarketInsights(insights);
      }

    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  if (loading) {
    return (
      <Card variant="default" className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Initialisation de votre coach IA...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card variant="default" className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <span>Coach IA</span>
            </h3>
            <Button variant="outline" size="sm" onClick={initializeDashboard}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{suggestions.length}</div>
              <div className="text-xs text-gray-600">Suggestions</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {Math.round(suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length) || 0}%
              </div>
              <div className="text-xs text-gray-600">Confiance</div>
            </div>
          </div>

          {/* Top Suggestions */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 text-sm">Priorités du moment</h4>
            {suggestions.slice(0, 2).map((suggestion) => (
              <div key={suggestion.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-gray-900 mb-1">
                      {suggestion.title}
                    </h5>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {suggestion.description}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority === 'high' ? 'Haute' : suggestion.priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Button variant="primary" size="sm" fullWidth onClick={() => setActiveTab('chat')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Discuter
            </Button>
            <Button variant="outline" size="sm" fullWidth onClick={() => setActiveTab('suggestions')}>
              Voir tout
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span>Bienvenue, {userProfile?.name || 'Utilisateur'}!</span>
            </h2>
            <p className="text-gray-600 mt-2">
              Votre coach IA a analysé votre profil et vous a préparé {suggestions.length} recommandations personnalisées
            </p>
          </div>
          <Button variant="outline" onClick={initializeDashboard}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Profile Overview */}
        {userProfile && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">{userProfile.currentRole}</div>
                <div className="text-xs text-gray-600">{userProfile.experience} ans d'expérience</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Building className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">{userProfile.currentCompany || 'Non spécifié'}</div>
                <div className="text-xs text-gray-600">{userProfile.industry || 'Industrie'}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">{userProfile.location || 'Non spécifié'}</div>
                <div className="text-xs text-gray-600">Localisation</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Target className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">{userProfile.targetRole || 'Non spécifié'}</div>
                <div className="text-xs text-gray-600">Objectif de carrière</div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{suggestions.length}</div>
            <div className="text-sm text-blue-700">Suggestions actives</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {suggestions.filter(s => s.priority === 'high').length}
            </div>
            <div className="text-sm text-green-700">Priorités hautes</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {Math.round(suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length) || 0}%
            </div>
            <div className="text-sm text-amber-700">Confiance moyenne</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{progress.completedSuggestions}</div>
            <div className="text-sm text-purple-700">Objectifs atteints</div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default" className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('chat')}>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Discuter avec l'IA</h3>
            <p className="text-sm text-gray-600 mb-4">
              Posez des questions et obtenez des conseils personnalisés
            </p>
            <Button variant="primary" size="sm">
              Commencer
            </Button>
          </div>
        </Card>

        <Card variant="default" className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('learning')}>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Parcours d'apprentissage</h3>
            <p className="text-sm text-gray-600 mb-4">
              Développez les compétences clés pour votre carrière
            </p>
            <Button variant="primary" size="sm">
              Explorer
            </Button>
          </div>
        </Card>

        <Card variant="default" className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('career')}>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Parcours de carrière</h3>
            <p className="text-sm text-gray-600 mb-4">
              Planifiez votre évolution professionnelle
            </p>
            <Button variant="primary" size="sm">
              Planifier
            </Button>
          </div>
        </Card>
      </div>

      {/* Top Suggestions Preview */}
      <Card variant="default" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recommandations prioritaires</h3>
          <Button variant="outline" size="sm" onClick={() => setActiveTab('suggestions')}>
            Voir tout
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.slice(0, 4).map((suggestion) => (
            <div key={suggestion.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    suggestion.type === 'skill' ? 'bg-blue-100 text-blue-600' :
                    suggestion.type === 'certification' ? 'bg-green-100 text-green-600' :
                    suggestion.type === 'career_path' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Target className="w-4 h-4" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm">{suggestion.title}</h4>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                  {suggestion.priority === 'high' ? 'Haute' : suggestion.priority === 'medium' ? 'Moyenne' : 'Basse'}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {suggestion.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{suggestion.estimatedTimeToComplete}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>{suggestion.confidence}%</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Market Insights */}
      {marketInsights && (
        <Card variant="default" className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights marché</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Compétences les plus demandées</h4>
              <div className="space-y-2">
                {marketInsights.skillDemand
                  .filter((skill: any) => skill.demand_level === 'high')
                  .slice(0, 3)
                  .map((skill: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{skill.skill}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-green-600">+{skill.growth_rate}%</span>
                        <span className="text-xs text-blue-600">+{skill.salary_premium}% salaire</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Fourchettes salariales</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Débutant</span>
                  <span className="text-sm font-medium">{formatNumber(marketInsights.salary_range.entry)}k€</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Confirmé</span>
                  <span className="text-sm font-medium">{formatNumber(marketInsights.salary_range.mid)}k€</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Senior</span>
                  <span className="text-sm font-medium">{formatNumber(marketInsights.salary_range.senior)}k€</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'suggestions':
        return <PersonalizedSuggestions userId={userId} />;
      case 'chat':
        return (
          <div className="h-[calc(100vh-200px)]">
            <EnhancedAIChat
              userId={userId}
              onBack={() => setActiveTab('overview')}
              context={userProfile ? {
                currentRole: userProfile.currentRole,
                targetRole: userProfile.targetRole,
                experience: userProfile.experience,
                skills: userProfile.skills,
                industry: userProfile.industry
              } : undefined}
            />
          </div>
        );
      default:
        return renderOverview();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
    { id: 'chat', label: 'Discussion IA', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card variant="default" className="p-2">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default AIDashboard;