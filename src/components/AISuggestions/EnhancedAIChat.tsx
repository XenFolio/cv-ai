import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ArrowLeft,
  Download,
  FileText,
  Brain,
  Target,
  TrendingUp,
  Lightbulb,
  BookOpen,
  Users,
  Network,
  GraduationCap,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Clock,
  Zap,
  MessageSquare,
  Mic,
  Volume2,
  VolumeX,
  Copy,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import { personalizedAIService, PersonalizedSuggestion, UserProfile } from '../../services/PersonalizedAIService';
import { useOpenAI } from '../../hooks/useOpenAI';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Card from '../UI/Card';
import Button from '../UI/Button';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'action_plan' | 'resource' | 'progress';
  suggestions?: PersonalizedSuggestion[];
  metadata?: Record<string, unknown>;
}

interface EnhancedAIChatProps {
  onBack: () => void;
  userId?: string;
  mode?: 'general' | 'career_coaching' | 'skill_development' | 'interview_prep' | 'resume_review';
  title?: string;
  description?: string;
  context?: {
    currentRole?: string;
    targetRole?: string;
    experience?: number;
    skills?: string[];
    industry?: string;
  };
}

const QuickActionButtons = [
  { id: 'career_path', label: 'Parcours de carrière', icon: TrendingUp, color: 'purple' },
  { id: 'skill_gap', label: 'Analyse des compétences', icon: Target, color: 'blue' },
  { id: 'interview_prep', label: 'Préparation entretien', icon: MessageSquare, color: 'green' },
  { id: 'resume_optimization', label: 'Optimisation CV', icon: FileText, color: 'amber' },
  { id: 'networking', label: 'Stratégie réseau', icon: Users, color: 'pink' },
  { id: 'learning_path', label: 'Parcours apprentissage', icon: BookOpen, color: 'indigo' }
];

const EnhancedAIChat: React.FC<EnhancedAIChatProps> = ({
  onBack,
  userId,
  mode = 'general',
  title = "Coach de Carrière IA Avancé",
  description = "Votre assistant personnel avec suggestions personnalisées",
  context
}) => {
  const { editCVField, isLoading, error } = useOpenAI();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [suggestions, setSuggestions] = useState<PersonalizedSuggestion[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationMode, setConversationMode] = useState<string>(mode);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    initializeChat();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const initializeChat = useCallback(async () => {
    try {
      // Initialize user profile
      if (context) {
        const profileData: Partial<UserProfile> = {
          currentRole: context.currentRole || '',
          targetRole: context.targetRole || '',
          experience: context.experience || 0,
          skills: context.skills || [],
          industry: context.industry || ''
        };

        const initializedProfile = await personalizedAIService.initializeUserProfile(profileData);
        setUserProfile(initializedProfile);

        // Load personalized suggestions
        const personalizedSuggestions = await personalizedAIService.getPersonalizedSuggestions();
        setSuggestions(personalizedSuggestions);
      }

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: getWelcomeMessage(mode),
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  }, [context, mode]);

  const getWelcomeMessage = (currentMode: string): string => {
    const messages: Record<string, string> = {
      general: `Bonjour ! Je suis votre coach de carrière IA avancé. J'analyserai votre profil pour vous fournir des recommandations personnalisées.

🎯 **Mes capacités :**
- Analyse de vos compétences et identification des écarts
- Recommandations de parcours de carrière
- Préparation aux entretiens personnalisée
- Optimisation de votre CV et LinkedIn
- Stratégies de réseautage professionnel
- Plans d'apprentissage adaptés à votre style

Comment puis-je vous aider aujourd'hui ?`,
      career_coaching: `Bonjour ! Je suis spécialisé en coaching de carrière. Ensemble, nous allons :

🚀 **Analyser votre situation actuelle :**
- Forces et faiblesses
- Opportunités de marché
- Alignement avec vos objectifs

📈 **Développer une stratégie :**
- Parcours de carrière optimal
- Compétences à acquérir
- Calendrier réaliste

Quelles sont vos objectifs de carrière à court et moyen terme ?`,
      skill_development: `Bonjour ! Je vous aiderai à développer un plan d'apprentissage personnalisé.

📚 **Mon approche :**
- Analyse de vos compétences actuelles
- Identification des compétences demandées
- Recommandations de ressources adaptées
- Suivi de votre progression

Sur quelles compétences souhaitez-vous vous concentrer en priorité ?`,
      interview_prep: `Bonjour ! Je vais vous préparer pour vos entretiens avec des exercices personnalisés.

🎭 **Préparation complète :**
- Questions techniques et comportementales
- Simulations d'entretien
- Feedback personnalisé
- Stratégies de réponse

Quel type de poste visez-vous et avez-vous des entretiens prévus ?`,
      resume_review: `Bonjour ! Je vais analyser et optimiser votre CV pour maximiser son impact.

📄 **Optimisation complète :**
- Analyse ATS et compatibilité
- Mots-clés pertinents
- Structure percutante
- Mise en valeur de vos réalisations

Pouvez-vous me partager votre CV ou me parler de votre expérience ?`
    };

    return messages[currentMode] || messages.general;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Enhanced prompt with user context
      let enhancedPrompt = content;

      if (userProfile) {
        enhancedPrompt = `CONTEXTE UTILISATEUR :
- Rôle actuel: ${userProfile.currentRole}
- Expérience: ${userProfile.experience} ans
- Compétences: ${userProfile.skills.join(', ')}
- Industrie: ${userProfile.industry}
- Objectif: ${userProfile.targetRole || 'Non spécifié'}

QUESTION UTILISATEUR :
${content}

INSTRUCTIONS POUR L'IA :
Répondez de manière personnalisée en tenant compte du contexte de l'utilisateur.
Fournissez des recommandations spécifiques et actionnables.
Incluez des exemples concrets quand c'est pertinent.
Adaptez votre niveau de détail à l'expérience de l'utilisateur.`;
      }

      const response = await editCVField({ prompt: enhancedPrompt });

      if (response) {
        const botMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, botMessage]);

        // Follow up with relevant suggestions
        await provideRelevantSuggestions(response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Je suis désolé, j'ai rencontré une erreur. Pouvez-vous réessayer votre question ?",
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const provideRelevantSuggestions = async (lastResponse: string) => {
    if (!userProfile) return;

    // Analyze the response to provide relevant suggestions
    const relevantSuggestions = suggestions.filter(suggestion => {
      const content = lastResponse.toLowerCase();
      const suggestionText = suggestion.title.toLowerCase() + ' ' + suggestion.description.toLowerCase();

      // Simple keyword matching - in production, this would use more sophisticated NLP
      return content.split(' ').some(word => suggestionText.includes(word)) ||
             suggestionText.split(' ').some(word => content.includes(word));
    });

    if (relevantSuggestions.length > 0) {
      const suggestionMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "🎯 **Suggestions basées sur notre conversation :**",
        timestamp: new Date(),
        type: 'suggestion',
        suggestions: relevantSuggestions.slice(0, 3)
      };
      setMessages(prev => [...prev, suggestionMessage]);
    }
  };

  const handleQuickAction = async (actionId: string) => {
    const action = QuickActionButtons.find(a => a.id === actionId);
    if (!action) return;

    const actionMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Je veux ${action.label.toLowerCase()}`,
      timestamp: new Date(),
      type: 'action_plan'
    };

    setMessages(prev => [...prev, actionMessage]);
    setIsTyping(true);

    try {
      // Generate contextual response based on action
      let response = '';
      switch (actionId) {
        case 'career_path':
          response = await generateCareerPathResponse();
          break;
        case 'skill_gap':
          response = await generateSkillGapResponse();
          break;
        case 'interview_prep':
          response = await generateInterviewPrepResponse();
          break;
        case 'resume_optimization':
          response = await generateResumeOptimizationResponse();
          break;
        case 'networking':
          response = await generateNetworkingResponse();
          break;
        case 'learning_path':
          response = await generateLearningPathResponse();
          break;
        default:
          response = "Je vais vous aider avec cette demande.";
      }

      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type: 'action_plan'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error handling quick action:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const generateCareerPathResponse = async (): Promise<string> => {
    if (!userProfile) return "Pour vous proposer un parcours de carrière, j'ai besoin de connaître votre rôle actuel et vos objectifs.";

    const careerPaths = await personalizedAIService.getCareerPaths(userProfile.currentRole);

    let response = `🚀 **Parcours de carrière pour ${userProfile.currentRole}**

Voici les options d'évolution professionnelle que j'ai identifiées pour vous :

`;

    careerPaths.forEach((path, index) => {
      response += `\n### ${index + 1}. ${path.currentRole} → ${path.targetRole}
- **Durée estimée :** ${path.timeline}
- **Progression salariale :** ${path.salaryProgression[0]}k → ${path.salaryProgression[path.salaryProgression.length - 1]}k
- **Difficulté :** ${path.transitionDifficulty === 'easy' ? 'Facile' : path.transitionDifficulty === 'medium' ? 'Moyenne' : 'Difficile'}
- **Perspectives :** ${path.marketOutlook === 'growing' ? 'En croissance' : path.marketOutlook === 'stable' ? 'Stable' : 'En déclin'}

**Compétences clés requises :** ${path.requiredSkills.join(', ')}

**Actions recommandées :**
${path.recommendedActions.map(action => `- ${action}`).join('\n')}

`;
    });

    response += `\nQuelle option vous intéresse le plus ou souhaitez-vous plus de détails sur l'une d'entre elles ?`;
    return response;
  };

  const generateSkillGapResponse = async (): Promise<string> => {
    if (!userProfile) return "J'ai besoin de connaître vos compétences actuelles pour analyser les écarts.";

    const marketInsight = await personalizedAIService.getMarketInsights(
      userProfile.industry || 'Technology',
      userProfile.currentRole
    );

    let response = `🎯 **Analyse des écarts de compétences**

**Vos compétences actuelles :**
${userProfile.skills.map(skill => `- ${skill}`).join('\n')}

`;

    if (marketInsight) {
      response += `**Compétences très demandées dans votre secteur :**
${marketInsight.skillDemand
  .filter(skillDemand => skillDemand.demand_level === 'high')
  .map(skillDemand => `- ${skillDemand.skill} (croissance: ${skillDemand.growth_rate}%, impact salarial: +${skillDemand.salary_premium}%)`)
  .join('\n')}

**Compétences à développer en priorité :**
`;

      const missingSkills = marketInsight.skillDemand.filter(skillDemand =>
        skillDemand.demand_level === 'high' &&
        !userProfile.skills.some(userSkill =>
          userSkill.toLowerCase().includes(skillDemand.skill.toLowerCase())
        )
      );

      missingSkills.forEach(skill => {
        response += `- **${skill.skill}** - Priorité haute (${skill.growth_rate}% de croissance)\n`;
      });
    }

    response += `\nSouhaitez-vous que je vous crée un plan d'apprentissage personnalisé pour ces compétences ?`;
    return response;
  };

  const generateInterviewPrepResponse = async (): Promise<string> => {
    const targetRole = userProfile?.targetRole || userProfile?.currentRole || 'votre poste';

    const interviewPrep = await personalizedAIService.getInterviewPreparation(targetRole, 'medium');

    const response = `🎭 **Préparation aux entretiens pour ${targetRole}**

Voici quelques questions types que vous pourriez rencontrer :

### **Question Comportementale**
${interviewPrep[0]?.question || "Parlez-moi d'une situation où vous avez dû gérer un conflit."}

**Points clés à aborder :**
${interviewPrep[0]?.keyPoints.map(point => `- ${point}`).join('\n') || "- Utilisez la méthode STAR\n- Soyez spécifique\n- Montrez votre réflexion"}

**Exemple de réponse :**
${interviewPrep[0]?.sampleAnswer || "Dans mon précédent poste, j'ai dû gérer un désaccord entre deux membres de l'équipe..."}

### **Conseils pour réussir :**
1. **Recherchez l'entreprise** - Montrez que vous connaissez leurs valeurs et produits
2. **Préparez des questions** - Demandez sur l'équipe, les projets, la culture
3. **Soyez authentique** - Montrez votre personnalité tout en restant professionnel
4. **Utilisez des exemples** - Illustrez vos points avec des expériences concrètes

Voulez-vous que nous fassions une simulation d'entretien ou que je vous prépare pour des questions techniques spécifiques ?`;
    return response;
  };

  const generateResumeOptimizationResponse = async (): Promise<string> => {
    return `📄 **Optimisation de votre CV**

### **Points clés pour un CV efficace :**

**1. Mots-clés ATS**
- Utilisez les mots-clés des offres d'emploi
- Incluez des compétences techniques et logicielles
- Variez les termes (ex: JavaScript, JS, ECMAScript)

**2. Réalisations quantifiées**
- Au lieu de "Amélioration des performances", dites "Réduction du temps de chargement de 40%"
- Utilisez des chiffres, pourcentages, montants
- Montrez l'impact de vos actions

**3. Structure recommandée :**
\`\`\`
[Contact]
Profil professionnel (3-4 lignes)
Expérience (réalisations, pas justes des tâches)
Compétences (techniques et soft skills)
Formation
Certifications
Projets (si applicable)
\`\`\`

**4. Erreurs à éviter :**
- Photos (sauf exigé)
- Informations personnelles inutiles
- Design trop complexe
- Fautes d'orthographe
- Mentions trop génériques

Pouvez-vous me parler de vos expériences récentes pour que je vous aide à les formuler de manière percutante ?`;
  };

  const generateNetworkingResponse = async (): Promise<string> => {
    return `🤝 **Stratégie de réseautage professionnel**

### **Approche structurée :**

**1. Optimisez votre présence en ligne**
- **LinkedIn** : Profil complet, photo professionnelle, résumé percutant
- **GitHub** (si technique) : Projets récents, contributions actives
- **Portfolio** : Vos réalisations et projets personnels

**2. Types de réseautage :**
- **En ligne** : LinkedIn, groupes professionnels, forums spécialisés
- **Événements** : Conférences, meetups, salons professionnels
- **Alumni** : Anciens de votre établissement, anciens collègues
- **Mentorat** : Trouver un mentor dans votre domaine cible

**3. Techniques efficaces :**
- Soyez authentique et aidez les autres
- Commentez et partagez du contenu pertinent
- Participez à des discussions de groupe
- Envoyez des messages personnalisés (pas de copier-coller)

**4. Objectifs hebdomadaires :**
- 5 nouveaux contacts pertinents
- 10 interactions significatives
- 1 message personnalisé
- 1 commentaire par jour

Par où souhaitez-vous commencer : optimiser votre profil LinkedIn ou développer votre stratégie d'approche ?`;
  };

  const generateLearningPathResponse = async (): Promise<string> => {
    if (!userProfile) return "Pour vous créer un parcours d'apprentissage, j'ai besoin de connaître votre domaine.";

    const targetSkills = userProfile.targetRole ?
      ['Leadership', 'Communication', 'Gestion de projet'] : // Default skills
      ['JavaScript', 'React', 'Node.js']; // Default technical skills

    const learningPath = await personalizedAIService.getLearningPath(targetSkills);

    let response = `📚 **Parcours d'apprentissage personnalisé**

**Objectif :** Acquérir ${targetSkills.join(', ')}

**Votre profil actuel :**
- ${userProfile.skills.length} compétences maîtrisées
- ${learningPath.skillGaps.length} compétences à développer
- Style d'apprentissage : ${userProfile.preferences.learningStyle}

**Durée estimée :** ${learningPath.estimatedDuration}

### **Étapes recommandées :**
`;

    learningPath.milestones.forEach((milestone, index) => {
      response += `\n**Étape ${index + 1} : ${milestone.title}**
- Durée : ${milestone.estimatedDuration}
- Compétences : ${milestone.skills.join(', ')}
- Livrables : ${milestone.deliverables.join(', ')}
- Ressources : ${milestone.resources.length} ressources recommandées
`;
    });

    response += `\n**Impact sur votre carrière :** ${learningPath.careerImpact}

Par quelle étape souhaitez-vous commencer ? Je peux vous fournir les ressources détaillées pour chaque étape.`;
    return response;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const renderMessageContent = (message: ChatMessage) => {
    if (message.type === 'suggestion' && message.suggestions) {
      return (
        <div className="space-y-3">
          <ReactMarkdown>{message.content}</ReactMarkdown>
          <div className="grid grid-cols-1 gap-3 mt-4">
            {message.suggestions.map((suggestion, index) => (
              <Card key={suggestion.id} variant="default" className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    suggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                    suggestion.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{suggestion.estimatedTimeToComplete}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>{suggestion.confidence}% confiance</span>
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Commencer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children }) {
            const inline = !(children as string)?.includes('\n');
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <span className="relative block my-2">
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="!rounded-lg !shadow-lg"
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.8)',
                    fontSize: '0.875rem',
                    borderRadius: '0.5rem',
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </span>
            ) : (
              <code className="px-1 py-0.5 rounded text-xs font-mono bg-gray-200 text-gray-800">
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mb-2 mt-4 text-gray-900">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold mb-2 mt-3 text-gray-900">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mb-1 mt-2 text-gray-900">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-sm leading-relaxed mb-3 last:mb-0 text-gray-800">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 text-sm text-gray-800">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 text-sm text-gray-800">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
        }}
      >
        {message.content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>

          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>IA Connectée</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {QuickActionButtons.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                conversationMode === action.id
                  ? `bg-${action.color}-100 text-${action.color}-700 border border-${action.color}-200`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <action.icon className="w-4 h-4" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'assistant'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
            }`}>
              {message.role === 'assistant' ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>

            <div className={`max-w-3xl px-4 py-3 rounded-2xl ${
              message.role === 'assistant'
                ? 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
            }`}>
              <div className="prose prose-sm max-w-none">
                {renderMessageContent(message)}
              </div>
              <p className={`text-xs mt-2 ${
                message.role === 'assistant' ? 'text-gray-500' : 'text-white/70'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question ou décrivez votre objectif..."
              className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={1}
              maxLength={4000}
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne</span>
          <div className="flex items-center space-x-4">
            <span>{suggestions.length} suggestions disponibles</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedAIChat;