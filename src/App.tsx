import React, { useState, Suspense, useEffect, useCallback } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { SupabaseAuthProvider } from './components/Auth/SupabaseAuthProvider';
import { useAuth } from './hooks/useAuth';
import { UniversalLoginPage } from './components/Auth/UniversalLoginPage';
import { SupabaseConfigModal } from './components/Auth/SupabaseConfigModal';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { Sparkles } from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { AuthBoundary } from './components/Auth/AuthBoundary';
import { useAuthStore } from './store/useAuthStore';
import { lazyComponentsMap, intelligentPreload } from './utils/lazyComponents';
import PageLoader from './components/loader/PageLoader';
import { ThemeProvider } from './contexts/ThemeContext';
import AIDashboard from './components/AISuggestions/AIDashboard';
import { JobAnalysis } from './components/JobAnalysis/JobAnalysis';
import { useJobSearch } from './hooks/useJobSearch';

// Composant wrapper pour JobAnalysis avec accès aux jobs
const JobAnalysisWithRouter: React.FC<{ jobId: string; onBack: () => void }> = ({ jobId, onBack }) => {
  const { jobs } = useJobSearch();
  return <JobAnalysis jobs={jobs} jobId={jobId} onBack={onBack} />;
};

// Composants lazy chargés à la demande
const {
  Dashboard,
  CVAnalysis,
  CVCreator,
  CVLibrary,
  Models,
  Templates,
  Settings,
  AIChat,
  CVCreatorDemo,
  LetterEditor,
  JobSearch,
} = lazyComponentsMap;

// Import direct pour SubscriptionPlans (pas de lazy loading pour les tarifs)
import { SubscriptionPlans } from './components/Subscription/SubscriptionPlans';
import { Coaching } from './components/Coaching/Coaching';

// Composant pour l'authentification Supabase
const SupabaseAppContent: React.FC = () => {
  const { signOut } = useAuth();
  const user = useAuthStore(s => s.user);
  const profile = useAuthStore(s => s.profile);
  const isLoading = useAuthStore(s => s.loading);
  const isAuthenticated = !!user;
  const activeTab = useAppStore(s => s.activeTab);
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const showSettings = useAppStore(s => s.showSettings);
  const setShowSettings = useAppStore(s => s.setShowSettings);
  const showChat = useAppStore(s => s.showChat);
  const setShowChat = useAppStore(s => s.setShowChat);
  const voiceEnabled = useAppStore(s => s.voiceEnabled);
  const showCVCreatorDemo = useAppStore(s => s.showCVCreatorDemo);
  const setShowCVCreatorDemo = useAppStore(s => s.setShowCVCreatorDemo);
  const apiKeyStatus = useAppStore(s => s.apiKeyStatus);
  const setApiKeyStatus = useAppStore(s => s.setApiKeyStatus);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Fonction pour vérifier le statut de la clé API
  const checkApiKeyStatus = useCallback(() => {
    const savedSettings = localStorage.getItem('cvAssistantSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        const apiKey = settings.ai?.apiKey;
        const keyStatus = settings.ai?.keyStatus;

        if (!apiKey || apiKey.length === 0) {
          setApiKeyStatus('missing');
        } else if (keyStatus === 'valid') {
          setApiKeyStatus('valid');
        } else {
          // Si clé présente mais pas validée, considérer comme invalide
          setApiKeyStatus('invalid');
        }
      } catch {
        setApiKeyStatus('missing');
      }
    } else {
      setApiKeyStatus('missing');
    }
  }, [setApiKeyStatus]);

  // Vérifier le statut de la clé API au chargement et quand on revient des settings
  React.useEffect(() => {
    checkApiKeyStatus();
  }, [checkApiKeyStatus]);

  React.useEffect(() => {
    if (!showSettings) {
      checkApiKeyStatus();
    }
  }, [showSettings, checkApiKeyStatus]);

  // Préchargement intelligent basé sur l'onglet actuel
  useEffect(() => {
    intelligentPreload(activeTab);
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-ping"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">CV ATS Pro</h3>
          <p className="text-gray-600">Chargement de votre espace...</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Si on est en mode démo CVCreator, afficher seulement le CVCreator
  if (showCVCreatorDemo) {
    return <CVCreatorDemo onBack={() => setShowCVCreatorDemo(false)} />;
  }

  if (!isAuthenticated) {
    return <UniversalLoginPage onCVCreatorDemo={() => setShowCVCreatorDemo(true)} />;
  }

  const renderActiveTab = () => {
    const content = (() => {
      switch (activeTab) {
        case 'dashboard':
          return <Dashboard onNavigate={handleTabChange} />;
        case 'analyze':
          return (
            <CVAnalysis
              documentType="cv"
              title="Analyse CV"
              description="Uploadez votre CV pour une analyse ATS complète"
            />
          );
        case 'creator':
          return <CVCreator />;
        case 'templates':
          return <Templates />;
        case 'lettre-analyze':
          return (
            <CVAnalysis
              documentType="lettre"
              title="Analyse Lettre de motivation"
              description="Uploadez votre lettre de motivation pour une analyse détaillée"
            />
          );
        case 'library':
          return <CVLibrary />;
        case 'models':
          return <Models />;
        case 'settings':
          return <Settings onBack={handleBackToDashboard} onApiKeyStatusChange={setApiKeyStatus} />;
        case 'chat':
          return (
            <AIChat
              onBack={handleBackToDashboard}
              voiceEnabled={voiceEnabled}
              mode="lettre"
              title="Assistant Lettre de Motivation IA"
              description="Créez une lettre de motivation professionnelle et personnalisée"
            />
          );
        case 'chat-cv':
          return (
            <AIChat
              onBack={handleBackToDashboard}
              voiceEnabled={voiceEnabled}
              mode="general"
              title="Coach CV IA"
              description="Votre assistant personnel pour améliorer votre CV"
            />
          );
        case 'chat-general':
          return (
            <AIChat
              onBack={handleBackToDashboard}
              voiceEnabled={voiceEnabled}
              mode="general"
              title="Coach de Carrière IA"
              description="Votre assistant personnel pour des conseils de carrière"
            />
          );
        case 'letter-editor':
          return (
            <LetterEditor
              onSave={(content) => console.log('Letter saved:', content)}
              onExport={(content, format) => console.log('Letter exported:', format, content)}
            />
          );
        case 'jobs':
          return currentJobId ? <JobAnalysisWithRouter jobId={currentJobId} onBack={() => setCurrentJobId(null)} /> : <JobSearch onAnalyzeJob={setCurrentJobId} />;
        case 'ai-dashboard':
          return <AIDashboard />;
        case 'tarifs':
          return <SubscriptionPlans />;
        case 'coaching':
          return <Coaching onNavigate={handleTabChange} />;
        default:
          return <Dashboard onNavigate={handleTabChange} />;
      }
    })();

    return (
      <Suspense fallback={<PageLoader message={`Chargement ${getTabDisplayName(activeTab)}...`} />}>
        {content}
      </Suspense>
    );
  };

  const getTabDisplayName = (tab: string): string => {
    const displayNames: Record<string, string> = {
      dashboard: 'du tableau de bord',
      analyze: 'de l\'analyse',
      creator: 'du créateur CV',
      templates: 'des modèles',
      'lettre-analyze': 'de l\'analyse lettre',
      library: 'de la bibliothèque',
      models: 'des modèles IA',
      settings: 'des paramètres',
      chat: 'du chat',
      'chat-cv': 'du coach CV',
      'chat-general': 'du coach carrière',
      'letter-editor': 'de l\'éditeur de lettre',
      jobs: 'des offres d\'emploi',
      'ai-dashboard': 'du coach IA',
      tarifs: 'des tarifs',
      coaching: 'du coaching IA',
      'cv-designer-test': 'du CV Designer test'
    };
    return displayNames[tab] || 'du contenu';
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
    setActiveTab('settings');
  };

  const handleTabChange = (tab: string) => {
    if (tab !== 'settings') {
      setShowSettings(false);
    }
    if (tab === 'chat' || tab === 'chat-cv' || tab === 'chat-general') {
      setShowChat(true);
    } else {
      setShowChat(false);
    }
    setActiveTab(tab);
  };

  const handleBackToDashboard = () => {
    setShowChat(false);
    setShowSettings(false);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    signOut();
  };

  // Créer un objet utilisateur compatible avec le Header
  const headerUser = user ? {
    id: user.id,
    name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Utilisateur' : user.email?.split('@')[0] || 'Utilisateur',
    email: user.email || '',
    createdAt: new Date(user.created_at || Date.now())
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-300/20 to-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-violet-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-violet-300/20 to-pink-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header
          user={headerUser!}
          onSettingsClick={handleSettingsClick}
          onLogout={handleLogout}
          apiKeyStatus={apiKeyStatus}
        />
        {!showSettings && !showChat && <Navigation activeTab={activeTab} onTabChange={handleTabChange} />}

        <main className="flex justify-center px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="w-full max-w-7xl lg:max-w-8xl">
            {renderActiveTab()}
          </div>
        </main>
      </div>
    </div>
  );
};


// Composant qui détermine quel provider utiliser
const App: React.FC = () => {
  // Vérifier la configuration Supabase directement
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isConfigured = !!(supabaseUrl && supabaseKey);

  const [showConfigModal, setShowConfigModal] = useState(!isConfigured);

  // Si Supabase est configuré, utiliser directement Supabase
  if (isConfigured) {
    return (
      <HelmetProvider>
        <ThemeProvider>
          <SupabaseAuthProvider>
            <AuthBoundary>
              <SupabaseAppContent />
            </AuthBoundary>
          </SupabaseAuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    );
  }


  // Sinon, afficher la modale de configuration
  return (
    <HelmetProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-400 bg-clip-text text-transparent mb-2">
              CV ATS Pro
            </h1>
            <p className="text-gray-600">Configuration en cours...</p>
          </div>
        </div>

        <SupabaseConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onContinueDemo={() => {
            setShowConfigModal(false);
          }}
        />
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
