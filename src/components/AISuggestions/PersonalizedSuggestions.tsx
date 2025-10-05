import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  TrendingUp,
  Target,
  Award,
  Filter,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  Circle,
  BookOpen,
  Users,
  Lightbulb,
  Briefcase,
  BarChart3,
  GraduationCap,
  Network,
  MessageSquare,
  Code
} from 'lucide-react';
import { personalizedAIService, PersonalizedSuggestion, UserProfile } from '../../services/PersonalizedAIService';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useSupabase } from '../../hooks/useSupabase';

interface PersonalizedSuggestionsProps {
  userId?: string;
  onSuggestionAction?: (suggestion: PersonalizedSuggestion) => void;
  compact?: boolean;
}

// Initial categories data
const initialCategories = [
  { id: 'all', label: 'Toutes', icon: Brain, count: 0 },
  { id: 'technical', label: 'Technique', icon: Code, count: 0 },
  { id: 'soft_skill', label: 'Soft Skills', icon: Users, count: 0 },
  { id: 'career_growth', label: 'Carrière', icon: TrendingUp, count: 0 },
  { id: 'industry_specific', label: 'Industrie', icon: Briefcase, count: 0 },
  { id: 'compensation', label: 'Salaire', icon: BarChart3, count: 0 }
];

const PersonalizedSuggestions: React.FC<PersonalizedSuggestionsProps> = ({
  onSuggestionAction,
  compact = false
}) => {
  const { profile } = useSupabase();
  const [suggestions, setSuggestions] = useState<PersonalizedSuggestion[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [completedSuggestions, setCompletedSuggestions] = useState<Set<string>>(new Set());
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [categories, setCategories] = useState(initialCategories);

  const types = [
    { id: 'all', label: 'Tous types' },
    { id: 'skill', label: 'Compétences' },
    { id: 'experience', label: 'Expérience' },
    { id: 'education', label: 'Formation' },
    { id: 'networking', label: 'Réseautage' },
    { id: 'certification', label: 'Certification' },
    { id: 'career_path', label: 'Parcours' },
    { id: 'interview', label: 'Entretien' },
    { id: 'resume', label: 'CV' }
  ];

  const initializeUserProfile = useCallback(async () => {
    if (!profile) return;

    try {
      setLoading(true);

      // Initialize user profile with Supabase data
      const userProfileData: Partial<UserProfile> = {
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || '',
        currentRole: profile.profession || '',
        currentCompany: profile.company || '',
        experience: 0, // Default since not available in Supabase profile
        skills: [], // Default since not available in Supabase profile
        industry: '', // Default since not available in Supabase profile
        targetRole: '', // Default since not available in Supabase profile
        location: `${profile.city || ''} ${profile.country || ''}`.trim() || '',
        careerGoals: [], // Default since not available in Supabase profile
        preferredIndustries: [] // Default since not available in Supabase profile
      };

      const initializedProfile = await personalizedAIService.initializeUserProfile(userProfileData);
      setUserProfile(initializedProfile);
    } catch (error) {
      console.error('Error initializing user profile:', error);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const loadSuggestions = useCallback(async () => {
    if (!userProfile) return;

    try {
      const personalizedSuggestions = await personalizedAIService.getPersonalizedSuggestions();
      setSuggestions(personalizedSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  }, [userProfile]);

  useEffect(() => {
    initializeUserProfile();
  }, [profile, initializeUserProfile]);

  useEffect(() => {
    if (userProfile) {
      loadSuggestions();
    }
  }, [userProfile, loadSuggestions]);

  // Update category counts when suggestions change
  useEffect(() => {
    const updatedCategories = initialCategories.map(category => ({
      ...category,
      count: category.id === 'all'
        ? suggestions.length
        : suggestions.filter(s => s.category === category.id).length
    }));
    setCategories(updatedCategories);
  }, [suggestions]);

  const filteredSuggestions = suggestions.filter(suggestion => {
    const categoryMatch = selectedCategory === 'all' || suggestion.category === selectedCategory;
    const typeMatch = selectedType === 'all' || suggestion.type === selectedType;
    return categoryMatch && typeMatch;
  });

  const handleSuggestionAction = useCallback((suggestion: PersonalizedSuggestion, action: 'start' | 'complete' | 'dismiss') => {
    if (action === 'complete') {
      setCompletedSuggestions(prev => new Set(prev).add(suggestion.id));
    }
    onSuggestionAction?.(suggestion);
  }, [onSuggestionAction]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      skill: <Code className="w-4 h-4" />,
      experience: <Briefcase className="w-4 h-4" />,
      education: <GraduationCap className="w-4 h-4" />,
      networking: <Network className="w-4 h-4" />,
      certification: <Award className="w-4 h-4" />,
      career_path: <TrendingUp className="w-4 h-4" />,
      interview: <MessageSquare className="w-4 h-4" />,
      resume: <BookOpen className="w-4 h-4" />
    };
    return iconMap[type] || <Lightbulb className="w-4 h-4" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-amber-600 bg-amber-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card variant="default" className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Analyse de votre profil...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card variant="default" className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>Suggestions IA</span>
            </h3>
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
              {filteredSuggestions.length}
            </span>
          </div>

          {filteredSuggestions.slice(0, 3).map((suggestion) => (
            <div key={suggestion.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900 mb-1">
                    {suggestion.title}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {suggestion.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionAction(suggestion, 'start')}
                  className="ml-2"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {filteredSuggestions.length > 3 && (
            <Button variant="ghost" size="sm" fullWidth>
              Voir toutes les suggestions ({filteredSuggestions.length - 3} de plus)
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span>Recommandations IA Personnalisées</span>
            </h2>
            <p className="text-gray-600 mt-2">
              Basées sur votre profil, votre expérience et les tendances du marché
            </p>
          </div>

          <Button
            variant="outline"
            onClick={loadSuggestions}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Rafraîchir</span>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{suggestions.length}</div>
            <div className="text-sm text-gray-600">Suggestions</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {suggestions.filter(s => s.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">Priorité haute</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {Math.round(suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length)}%
            </div>
            <div className="text-sm text-gray-600">Confiance moyenne</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{completedSuggestions.size}</div>
            <div className="text-sm text-gray-600">Complétées</div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card variant="default" className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtres:</span>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {category.icon && <category.icon className="w-3 h-3" />}
                  <span>{category.label}</span>
                  {category.count > 0 && (
                    <span className="text-xs opacity-75">({category.count})</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSuggestions.map((suggestion) => (
          <Card
            key={suggestion.id}
            variant="default"
            className={`p-6 transition-all duration-200 hover:shadow-lg ${
              completedSuggestions.has(suggestion.id) ? 'opacity-75' : ''
            } ${expandedSuggestion === suggestion.id ? 'ring-2 ring-indigo-500' : ''}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  suggestion.type === 'skill' ? 'bg-blue-100 text-blue-600' :
                  suggestion.type === 'certification' ? 'bg-green-100 text-green-600' :
                  suggestion.type === 'career_path' ? 'bg-purple-100 text-purple-600' :
                  suggestion.type === 'interview' ? 'bg-amber-100 text-amber-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {getTypeIcon(suggestion.type)}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {suggestion.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority === 'high' ? 'Haute priorité' :
                       suggestion.priority === 'medium' ? 'Priorité moyenne' : 'Basse priorité'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(suggestion.confidence)}`}>
                      {suggestion.confidence}% confiance
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(suggestion.difficulty)}`}>
                      {suggestion.difficulty === 'beginner' ? 'Débutant' :
                       suggestion.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {suggestion.estimatedTimeToComplete}
                    </span>
                  </div>

                  {/* Personalized Reason */}
                  <div className="p-3 bg-indigo-50 rounded-lg mb-3">
                    <p className="text-xs text-indigo-800">
                      <strong>Pour vous:</strong> {suggestion.personalizedReason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col items-end space-y-2 ml-3">
                {completedSuggestions.has(suggestion.id) ? (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Circle className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Action Steps (Expanded) */}
            {expandedSuggestion === suggestion.id && (
              <div className="space-y-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Étapes d'action</span>
                  </h4>
                  <ol className="space-y-2">
                    {suggestion.actionSteps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Resources */}
                {suggestion.resources.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Ressources recommandées</span>
                    </h4>
                    <div className="space-y-2">
                      {suggestion.resources.slice(0, 3).map((resource, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-sm text-gray-900">{resource.title}</h5>
                              <p className="text-xs text-gray-600">{resource.description}</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {resource.cost === 'free' ? 'Gratuit' :
                               resource.cost === 'paid' ? 'Payant' : 'Freemium'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Market Demand */}
                {suggestion.marketDemand && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Demande du marché</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-green-600 font-medium">
                          {suggestion.marketDemand.demand_level === 'high' ? 'Élevée' :
                           suggestion.marketDemand.demand_level === 'medium' ? 'Moyenne' : 'Faible'}
                        </span>
                        <span className="text-green-700 ml-1">
                          ({suggestion.marketDemand.growth_projection})
                        </span>
                      </div>
                      <div>
                        <span className="text-green-600 font-medium">
                          Impact salarial: {suggestion.marketDemand.salary_impact}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedSuggestion(
                    expandedSuggestion === suggestion.id ? null : suggestion.id
                  )}
                  className="flex items-center space-x-2"
                >
                  {expandedSuggestion === suggestion.id ? 'Moins de détails' : 'Voir les détails'}
                  <ChevronRight className={`w-3 h-3 transition-transform ${
                    expandedSuggestion === suggestion.id ? 'rotate-90' : ''
                  }`} />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                {!completedSuggestions.has(suggestion.id) && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSuggestionAction(suggestion, 'dismiss')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Ignorer
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSuggestionAction(suggestion, 'start')}
                    >
                      Commencer
                    </Button>
                  </>
                )}
                {completedSuggestions.has(suggestion.id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCompletedSuggestions(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(suggestion.id);
                        return newSet;
                      });
                    }}
                  >
                    Marquer comme non terminé
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredSuggestions.length === 0 && (
        <Card variant="default" className="p-8 text-center">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune suggestion trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            Essayez d'ajuster vos filtres ou de rafraîchir les suggestions.
          </p>
          <Button variant="outline" onClick={() => {
            setSelectedCategory('all');
            setSelectedType('all');
          }}>
            Réinitialiser les filtres
          </Button>
        </Card>
      )}
    </div>
  );
};

export default PersonalizedSuggestions;
