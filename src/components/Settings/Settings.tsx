import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bot, Shield, Bell, User, Palette, Key, RefreshCw, Database } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import { useProfile } from '../../hooks/useProfile';
import { ProfileForm } from '../Profile/ProfileForm';
import { ProfileTest } from '../Profile/ProfileTest';
import { SupabaseConfigModal } from '../Auth/SupabaseConfigModal';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import ConnectionStatusModal from './ConnectionStatusModal';

interface SettingsProps {
  onBack: () => void;
  onApiKeyStatusChange?: (status: 'valid' | 'invalid' | 'missing') => void;
}

type SettingsType = {
  ai: {
    model: string;
    temperature: number;
    maxTokens: number;
    language: string;
    analysisDepth: string;
    autoOptimization: boolean;
    keywordSuggestions: boolean;
    industrySpecific: boolean;
    apiKey: string;
    keyStatus?: 'valid' | 'invalid';
    voiceRecognition: boolean;
    voiceSynthesis: boolean;
  };
  notifications: {
    analysisComplete: boolean;
    cvGenerated: boolean;
    weeklyReport: boolean;
    marketingEmails: boolean;
  };
  privacy: {
    dataRetention: string;
    shareAnalytics: boolean;
    cookieConsent: boolean;
  };
  appearance: {
    theme: string;
    language: string;
    animations: boolean;
    compactMode: boolean;
  };
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    dateOfBirth: string;
    nationality: string;
    linkedIn: string;
    website: string;
    profession: string;
    company: string;
  };
};

export const Settings: React.FC<SettingsProps> = ({ onBack, onApiKeyStatusChange }) => {
  const [activeSection, setActiveSection] = useState('ai');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [connectionModal, setConnectionModal] = useState({
    isOpen: false,
    status: 'testing',
    message: '',
    details: '',
    apiProvider: 'OpenAI'
  });
  const { profile: supaProfile, saveOpenAIKey, removeOpenAIKey } = useSupabase();
  const storeProfile = useAuthStore(s => s.profile);
  const currentProfile = storeProfile ?? supaProfile;

  const {
    getFullName,
    getInitials,
    isProfileComplete,
    getCompletionPercentage,
    getSubscriptionType,
    getSubscriptionStatus,
    getSubscriptionDisplayName,
    hasActiveSubscription,
    isFreeUser,
    isProUser
  } = useProfile();
  
  // Charger les paramètres depuis localStorage ou utiliser les valeurs par défaut
  const getInitialSettings = () => {
    const savedSettings = localStorage.getItem('cvAssistantSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch {
        // Si erreur de parsing, utiliser les valeurs par défaut
      }
    }
    
    // Valeurs par défaut
    return {
      ai: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        language: 'fr',
        analysisDepth: 'detailed',
        autoOptimization: true,
        keywordSuggestions: true,
        industrySpecific: true,
        apiKey: '',
        voiceRecognition: true,
        voiceSynthesis: true
      },
      notifications: {
        analysisComplete: true,
        cvGenerated: true,
        weeklyReport: false,
        marketingEmails: false
      },
      privacy: {
        dataRetention: '12months',
        shareAnalytics: false,
        cookieConsent: true
      },
      appearance: {
        theme: 'gradient',
        language: 'fr',
        animations: true,
        compactMode: false
      },
      profile: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        city: '',
        country: 'France',
        dateOfBirth: '',
        nationality: 'Française',
        linkedIn: '',
        website: '',
        profession: '',
        company: ''
      }
    };
  };

  const [settings, setSettings] = useState<SettingsType>(getInitialSettings());

  // Charger les données du profil depuis le store (hydraté par AuthBoundary)
  useEffect(() => {
    const profile = storeProfile ?? supaProfile; // fallback temporaire
    if (profile) {
      setSettings(prev => ({
        ...prev,
        ai: {
          ...prev.ai,
          // Charger la clé API depuis le profil Supabase si elle existe
          apiKey: profile.openai_api_key || prev.ai.apiKey
        },
        profile: {
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          postalCode: profile.postal_code || '',
          city: profile.city || '',
          country: profile.country || 'France',
          dateOfBirth: profile.date_of_birth || '',
          nationality: profile.nationality || 'Française',
          linkedIn: profile.linkedin || '',
          website: profile.website || '',
          profession: profile.profession || '',
          company: profile.company || ''
        }
      }));
    }
  }, [storeProfile, supaProfile]);

  const sections = [
    { id: 'ai', label: 'Intelligence Artificielle', icon: Bot },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'account', label: 'Compte', icon: User },
    { id: 'test', label: 'Tests d\'Intégration', icon: RefreshCw },
  ];

  const updateSetting = (section: string, key: string, value: string | boolean | number) => {
    setSettings((prev: SettingsType) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof SettingsType],
        [key]: value
      }
    }));
  };

  const testApiKey = async (apiKey: string): Promise<'valid' | 'invalid'> => {
    // Déterminer le provider API
    const apiProvider = settings.ai.model.includes('gpt') ? 'OpenAI' : 
                       settings.ai.model.includes('claude') ? 'Anthropic' :
                       settings.ai.model.includes('gemini') ? 'Google' :
                       settings.ai.model.includes('mistral') ? 'Mistral' : 'IA';

    // Afficher la modale de test
    setConnectionModal({
      isOpen: true,
      status: 'testing',
      message: 'Test de la connexion à l\'API en cours...',
      details: 'Vérification de la validité de votre clé API',
      apiProvider
    });

    try {
      // Adapter l'URL selon le provider
      let apiUrl = 'https://api.openai.com/v1/models';
      if (settings.ai.model.includes('claude')) {
        // Pour Anthropic, utiliser un endpoint différent si nécessaire
        apiUrl = 'https://api.anthropic.com/v1/messages';
      } else if (settings.ai.model.includes('gemini')) {
        apiUrl = 'https://generativelanguage.googleapis.com/v1/models';
      }

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Succès
        setConnectionModal({
          isOpen: true,
          status: 'success',
          message: 'Connexion établie avec succès !',
          details: `Votre clé API ${apiProvider} est valide et fonctionnelle`,
          apiProvider
        });
        return 'valid';
      } else {
        // Erreur API
        setConnectionModal({
          isOpen: true,
          status: 'error',
          message: 'Clé API invalide',
          details: `La clé API ${apiProvider} semble incorrecte ou expirée. Vérifiez votre clé sur ${apiProvider === 'OpenAI' ? 'platform.openai.com' : 'la plateforme officielle'}`,
          apiProvider
        });
        return 'invalid';
      }
    } catch  {
      // Erreur de connexion
      setConnectionModal({
        isOpen: true,
        status: 'error',
        message: 'Erreur de connexion',
        details: `Impossible de se connecter à ${apiProvider}. Vérifiez votre connexion internet et réessayez.`,
        apiProvider
      });
      return 'invalid';
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      ai: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        language: 'fr',
        analysisDepth: 'detailed',
        autoOptimization: true,
        keywordSuggestions: true,
        industrySpecific: true,
        apiKey: '',
        voiceRecognition: true,
        voiceSynthesis: true
      },
      notifications: {
        analysisComplete: true,
        cvGenerated: true,
        weeklyReport: false,
        marketingEmails: false
      },
      privacy: {
        dataRetention: '12months',
        shareAnalytics: false,
        cookieConsent: true
      },
      appearance: {
        theme: 'gradient',
        language: 'fr',
        animations: true,
        compactMode: false
      },
      profile: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        city: '',
        country: 'France',
        dateOfBirth: '',
        nationality: 'Française',
        linkedIn: '',
        website: '',
        profession: '',
        company: ''
      }
    };
    
    setSettings(defaultSettings);
  };

  const renderAISettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Bot className="w-5 h-5 text-violet-600" />
          <span>Configuration Intelligence Artificielle</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Modèle IA</label>
            <select
              value={settings.ai.model}
              onChange={(e) => updateSetting('ai', 'model', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all duration-200"
            >
              <optgroup label="OpenAI">
                <option value="gpt-4">GPT-4 (Recommandé)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4o">GPT-4o</option>
              </optgroup>
              <optgroup label="Anthropic">
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </optgroup>
              <optgroup label="Google">
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gemini-pro-vision">Gemini Pro Vision</option>
              </optgroup>
              <optgroup label="Mistral">
                <option value="mistral-large">Mistral Large</option>
                <option value="mistral-medium">Mistral Medium</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Langue d'analyse</label>
            <select
              value={settings.ai.language}
              onChange={(e) => updateSetting('ai', 'language', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all duration-200"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Créativité (Temperature: {settings.ai.temperature})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.ai.temperature}
              onChange={(e) => updateSetting('ai', 'temperature', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Conservateur</span>
              <span>Créatif</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profondeur d'analyse</label>
            <select
              value={settings.ai.analysisDepth}
              onChange={(e) => updateSetting('ai', 'analysisDepth', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all duration-200"
            >
              <option value="quick">Rapide</option>
              <option value="standard">Standard</option>
              <option value="detailed">Détaillée</option>
              <option value="comprehensive">Complète</option>
            </select>
          </div>
        </div>

        {/* API Key Configuration */}
        <div className="mt-8">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Key className="w-5 h-5 text-violet-600" />
            <span>Configuration API</span>
          </h4>
          
          <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-6 border border-violet-200/30">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clé API {settings.ai.model.includes('gpt') ? 'OpenAI' : 
                          settings.ai.model.includes('claude') ? 'Anthropic' :
                          settings.ai.model.includes('gemini') ? 'Google' :
                          settings.ai.model.includes('mistral') ? 'Mistral' : 'IA'}
                </label>
                <div className="flex space-x-3">
                  <input
                    type="password"
                    value={settings.ai.apiKey}
                    onChange={(e) => {
                      updateSetting('ai', 'apiKey', e.target.value);
                      // Update status based on key length
                      if (onApiKeyStatusChange) {
                        if (e.target.value.length === 0) {
                          onApiKeyStatusChange('missing');
                        } else {
                          onApiKeyStatusChange('invalid');
                        }
                      }
                    }}
                    placeholder={
                      settings.ai.model.includes('gpt') ? 'sk-...' :
                      settings.ai.model.includes('claude') ? 'sk-ant-...' :
                      settings.ai.model.includes('gemini') ? 'AIza...' :
                      settings.ai.model.includes('mistral') ? 'api_key...' : 'Clé API...'
                    }
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all duration-200"
                  />
                  <button
                    onClick={async () => {
                      if (settings.ai.apiKey) {
                        // Test the API key
                        const keyStatus = await testApiKey(settings.ai.apiKey);
                        
                        if (keyStatus === 'valid') {
                          // Sauvegarder la clé API dans Supabase
                          const result = await saveOpenAIKey(settings.ai.apiKey);
                          
                          if (result.success) {
                            // Mise à jour du statut pour indiquer la sauvegarde réussie
                            setConnectionModal(prev => ({
                              ...prev,
                              status: 'success',
                              message: 'Clé API validée et sauvegardée !',
                              details: 'Votre clé API a été validée et sauvegardée dans votre profil avec succès.'
                            }));
                          } else {
                            // Mise à jour du statut pour indiquer l'erreur de sauvegarde
                            setConnectionModal(prev => ({
                              ...prev,
                              status: 'success',
                              message: 'Clé API validée',
                              details: 'Clé API validée mais erreur de sauvegarde. La clé reste disponible localement.'
                            }));
                            console.error('Erreur sauvegarde:', result.error);
                          }
                        }
                        
                        // Save settings to localStorage with the validation result
                        const updatedSettings = {
                          ...settings,
                          ai: {
                            ...settings.ai,
                            keyStatus: keyStatus
                          }
                        };
                        localStorage.setItem('cvAssistantSettings', JSON.stringify(updatedSettings));
                        setSettings(updatedSettings);
                        
                        // Notify parent component of the status change
                        if (onApiKeyStatusChange) {
                          onApiKeyStatusChange(keyStatus);
                        }
                      } else {
                        // If no API key, set status to missing
                        if (onApiKeyStatusChange) {
                          onApiKeyStatusChange('missing');
                        }
                      }
                    }}
                    className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-6 py-2 rounded-xl font-medium hover:from-violet-700 hover:to-pink-700 transition-all duration-200 hover:scale-105"
                  >
                    Connecter
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {settings.ai.model.includes('gpt') && 'Obtenez votre clé API sur platform.openai.com'}
                  {settings.ai.model.includes('claude') && 'Obtenez votre clé API sur console.anthropic.com'}
                  {settings.ai.model.includes('gemini') && 'Obtenez votre clé API sur makersuite.google.com'}
                  {settings.ai.model.includes('mistral') && 'Obtenez votre clé API sur console.mistral.ai'}
                </p>
              </div>
              
              {settings.ai.apiKey && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Statut de connexion</span>
                    </div>
                    <span className="text-sm text-emerald-600 font-medium">Connecté</span>
                  </div>
                  
                  {/* Indicateur de stockage */}
                  <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-200/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-900">
                        {currentProfile?.openai_api_key ? 'Stockée dans votre profil' : 'Stockée localement'}
                      </span>
                    </div>
                    {currentProfile?.openai_api_key && (
                      <button
                        onClick={async () => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer la clé API de votre profil ?')) {
                            // Afficher la modale de statut pendant la suppression
                            setConnectionModal({
                              isOpen: true,
                              status: 'saving',
                              message: 'Suppression en cours...',
                              details: 'Suppression de votre clé API du profil',
                              apiProvider: 'OpenAI'
                            });
                            
                            const result = await removeOpenAIKey();
                            if (result.success) {
                              // Succès de suppression
                              setConnectionModal({
                                isOpen: true,
                                status: 'success',
                                message: 'Clé API supprimée !',
                                details: 'Votre clé API a été supprimée de votre profil. Elle reste disponible localement.',
                                apiProvider: 'OpenAI'
                              });
                            } else {
                              // Erreur de suppression
                              setConnectionModal({
                                isOpen: true,
                                status: 'error',
                                message: 'Erreur de suppression',
                                details: 'Impossible de supprimer la clé API de votre profil. ' + (result.message || 'Erreur inconnue'),
                                apiProvider: 'OpenAI'
                              });
                            }
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Options d'optimisation</h4>
        <div className="space-y-4">
          {[
            { key: 'autoOptimization', label: 'Optimisation automatique ATS', description: 'Applique automatiquement les améliorations suggérées' },
            { key: 'keywordSuggestions', label: 'Suggestions de mots-clés', description: 'Propose des mots-clés pertinents pour votre secteur' },
            { key: 'industrySpecific', label: 'Analyse spécifique au secteur', description: 'Adapte l\'analyse selon votre domaine d\'activité' },
            { key: 'voiceRecognition', label: 'Reconnaissance vocale', description: 'Permet de dicter vos messages dans le chat IA' },
            { key: 'voiceSynthesis', label: 'Synthèse vocale', description: 'L\'IA peut lire ses réponses à voix haute' }
          ].map((option) => (
            <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <div>
                <h5 className="font-medium text-gray-900">{option.label}</h5>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ai[option.key as keyof typeof settings.ai] as boolean}
                  onChange={(e) => updateSetting('ai', option.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Bell className="w-5 h-5 text-violet-600" />
        <span>Préférences de notification</span>
      </h3>
      
      <div className="space-y-4">
        {[
          { key: 'analysisComplete', label: 'Analyse terminée', description: 'Notification quand l\'analyse de CV est complète' },
          { key: 'cvGenerated', label: 'CV généré', description: 'Notification quand un nouveau CV est créé' },
          { key: 'weeklyReport', label: 'Rapport hebdomadaire', description: 'Résumé de vos activités chaque semaine' },
          { key: 'marketingEmails', label: 'Emails marketing', description: 'Nouveautés et conseils carrière' }
        ].map((option) => (
          <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
            <div>
              <h5 className="font-medium text-gray-900">{option.label}</h5>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications[option.key as keyof typeof settings.notifications]}
                onChange={(e) => updateSetting('notifications', option.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Shield className="w-5 h-5 text-violet-600" />
        <span>Confidentialité et sécurité</span>
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rétention des données</label>
          <select
            value={settings.privacy.dataRetention}
            onChange={(e) => updateSetting('privacy', 'dataRetention', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all duration-200"
          >
            <option value="3months">3 mois</option>
            <option value="6months">6 mois</option>
            <option value="12months">12 mois</option>
            <option value="indefinite">Indéfinie</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
          <div>
            <h5 className="font-medium text-gray-900">Partage des données analytiques</h5>
            <p className="text-sm text-gray-600">Aide à améliorer nos services (données anonymisées)</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.privacy.shareAnalytics}
              onChange={(e) => updateSetting('privacy', 'shareAnalytics', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Palette className="w-5 h-5 text-violet-600" />
        <span>Apparence</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thème</label>
          <select
            value={settings.appearance.theme}
            onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all duration-200"
          >
            <option value="gradient">Dégradé (Défaut)</option>
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Langue de l'interface</label>
          <select
            value={settings.appearance.language}
            onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all duration-200"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'animations', label: 'Animations', description: 'Active les animations et transitions' },
          { key: 'compactMode', label: 'Mode compact', description: 'Interface plus dense avec moins d\'espacement' }
        ].map((option) => (
          <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
            <div>
              <h5 className="font-medium text-gray-900">{option.label}</h5>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.appearance[option.key as keyof typeof settings.appearance] as boolean}
                onChange={(e) => updateSetting('appearance', option.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <User className="w-5 h-5 text-violet-600" />
          <span>Profil utilisateur</span>
        </h3>
        
        {currentProfile && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
              {getInitials()}
            </div>
            <div>
              <div className="font-medium text-gray-900">{getFullName()}</div>
              <div className="text-sm text-gray-500">
                Profil complété à {getCompletionPercentage()}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statut du profil */}
      {currentProfile && (
        <div className={`p-4 rounded-xl border ${
          isProfileComplete()
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center space-x-2">
            {isProfileComplete() ? (
              <>
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="font-medium">Profil complet</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="font-medium">Profil incomplet</span>
              </>
            )}
          </div>
          <p className="text-sm mt-1">
            {isProfileComplete()
              ? 'Votre profil contient toutes les informations essentielles.'
              : 'Complétez votre profil pour une meilleure expérience.'
            }
          </p>
        </div>
      )}

      {/* Informations d'abonnement */}
      {currentProfile && (
        <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-6 border border-violet-200/30">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              hasActiveSubscription() 
                ? 'bg-emerald-600' 
                : isFreeUser() 
                ? 'bg-blue-600' 
                : 'bg-gray-400'
            }`}>
              {hasActiveSubscription() ? (
                <span className="text-white text-xs">★</span>
              ) : (
                <span className="text-white text-xs">○</span>
              )}
            </div>
            <span>Abonnement</span>
          </h4>
          
          <div className="space-y-4">
            {/* Plan actuel */}
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200/30">
              <div>
                <div className="font-medium text-gray-900">{getSubscriptionDisplayName()}</div>
                <div className="text-sm text-gray-600">
                  Statut: {getSubscriptionStatus() === 'free' ? 'Gratuit' : 
                          getSubscriptionStatus() === 'active' ? 'Actif' :
                          getSubscriptionStatus() === 'inactive' ? 'Inactif' :
                          'Annulé'}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                hasActiveSubscription() 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : isFreeUser()
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isProUser() ? 'PRO' : 'FREE'}
              </div>
            </div>

            {/* Détails de l'abonnement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white/30 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Type d'abonnement</div>
                <div className="font-medium text-gray-900">
                  {getSubscriptionType() === 'pro_monthly' ? 'Pro Mensuel' :
                   getSubscriptionType() === 'pro_yearly' ? 'Pro Annuel' :
                   'Gratuit'}
                </div>
              </div>
              <div className="p-3 bg-white/30 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Statut</div>
                <div className="font-medium text-gray-900">
                  {getSubscriptionStatus() === 'free' ? 'Plan gratuit' :
                   getSubscriptionStatus() === 'active' ? 'Abonnement actif' :
                   getSubscriptionStatus() === 'inactive' ? 'Abonnement suspendu' :
                   'Abonnement annulé'}
                </div>
              </div>
            </div>

            {/* Actions d'abonnement */}
            <div className="flex flex-wrap gap-3 pt-2">
              {isFreeUser() && (
                <button
                  onClick={() => {
                    // Navigation vers la page tarifs
                    if (onBack) {
                      onBack(); // Retour au dashboard
                      // Puis navigation vers tarifs (utilisation du store)
                      setTimeout(() => {
                        const setActiveTab = useAppStore.getState().setActiveTab;
                        setActiveTab('tarifs');
                      }, 100);
                    }
                  }}
                  className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-violet-700 hover:to-pink-700 transition-all duration-200 hover:scale-105"
                >
                  Passer à Pro
                </button>
              )}
              {hasActiveSubscription() && (
                <>
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200">
                    Gérer l'abonnement
                  </button>
                  <button className="border border-red-300 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-all duration-200">
                    Résilier
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  // Navigation vers la page tarifs pour voir tous les plans
                  if (onBack) {
                    onBack();
                    setTimeout(() => {
                      const setActiveTab = useAppStore.getState().setActiveTab;
                      setActiveTab('tarifs');
                    }, 100);
                  }
                }}
                className="border border-violet-300 text-violet-700 px-4 py-2 rounded-lg font-medium hover:bg-violet-50 transition-all duration-200"
              >
                Voir tous les plans
              </button>
            </div>

            {/* Message informatif */}
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/30">
              <div className="text-xs font-medium text-blue-900 mb-1">💡 Information</div>
              <div className="text-xs text-blue-800">
                {isFreeUser() 
                  ? 'Vous profitez actuellement de notre plan gratuit. Passez à Pro pour débloquer toutes les fonctionnalités avancées.'
                  : hasActiveSubscription()
                  ? 'Votre abonnement Pro vous donne accès à toutes les fonctionnalités premium de la plateforme.'
                  : 'Votre abonnement nécessite une attention. Contactez le support si vous avez des questions.'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de profil */}
      <ProfileForm
        onSave={(savedProfile) => {
          console.log('Profil sauvegardé:', savedProfile);
        }}
        showActions={true}
      />

      {/* Configuration API Avancée */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200/30">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <Key className="w-5 h-5 text-violet-600" />
          <span>Configuration API Avancée</span>
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Configurez vos clés API pour accéder aux différents modèles d'IA disponibles.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint personnalisé (optionnel)</label>
              <input
                type="url"
                placeholder="https://api.custom-endpoint.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (secondes)</label>
              <input
                type="number"
                defaultValue="30"
                min="10"
                max="120"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions du compte */}
      <div className="flex flex-wrap gap-4">
        <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200">
          Exporter les données
        </button>
        <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-all duration-200">
          Supprimer le compte
        </button>
      </div>
    </div>
  );

  const renderTestSection = () => {
    // Vérifier si Supabase est configuré
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

    return (
      <div className="space-y-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 text-violet-600" />
          <span>Tests d'Intégration</span>
        </h3>
        
        {/* Configuration Supabase */}
        <div className={`p-6 rounded-2xl border ${
          isSupabaseConfigured
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className={`w-6 h-6 ${
                isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'
              }`} />
              <div>
                <h4 className={`font-semibold ${
                  isSupabaseConfigured ? 'text-emerald-900' : 'text-amber-900'
                } mb-1`}>
                  {isSupabaseConfigured ? 'Supabase Configuré' : 'Supabase Non Configuré'}
                </h4>
                <p className={`text-sm ${
                  isSupabaseConfigured ? 'text-emerald-800' : 'text-amber-800'
                }`}>
                  {isSupabaseConfigured
                    ? 'Base de données connectée et opérationnelle'
                    : 'Application en mode démo - données non persistantes'
                  }
                </p>
              </div>
            </div>
            
            {!isSupabaseConfigured && (
              <button
                onClick={() => setShowConfigModal(true)}
                className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-4 py-2 rounded-xl font-medium hover:from-violet-700 hover:to-pink-700 transition-all duration-200 hover:scale-105"
              >
                Configurer Supabase
              </button>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h4 className="font-semibold text-blue-900 mb-2">À propos des tests</h4>
          <p className="text-blue-800 text-sm">
            Cette section permet de tester l'intégration complète des profils avec Supabase.
            Utilisez ces tests pour vérifier que tout fonctionne correctement après la configuration.
          </p>
        </div>

        <ProfileTest />
      </div>
    );
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'ai':
        return renderAISettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'account':
        return renderAccountSettings();
      case 'test':
        return renderTestSection();
      default:
        return renderAISettings();
    }
  };

  return (
    <div className="space-y-8">
      {/* Notification d'erreur d'authentification */}
      {authError && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl shadow-lg border border-red-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                🔐
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Authentification requise</h4>
              <p className="text-sm opacity-90 whitespace-pre-line">{authError.replace('🔐 ', '')}</p>
              <button
                onClick={() => setAuthError(null)}
                className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-violet-600 hover:text-violet-700 font-medium transition-all duration-200 hover:bg-violet-50 hover:border-violet-200 border border-transparent rounded-lg px-3 py-2 hover:shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="heading-gradient">
          Paramètres
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Personnalisez votre expérience et configurez les options d'intelligence artificielle selon vos préférences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/30 p-4 sticky top-8 h-full">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/30 p-8">
            {renderActiveSection()}
          </div>
        </div>
      </div>

      {/* Modale de configuration Supabase */}
      <SupabaseConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onContinueDemo={() => setShowConfigModal(false)}
      />

      {/* Modale de statut de connexion API */}
      <ConnectionStatusModal
        isOpen={connectionModal.isOpen}
        onClose={() => setConnectionModal(prev => ({ ...prev, isOpen: false }))}
        status={connectionModal.status as 'testing' | 'success' | 'error' | 'saving'}
        message={connectionModal.message}
        details={connectionModal.details}
        apiProvider={connectionModal.apiProvider}
        onRetry={() => {
          if (settings.ai.apiKey) {
            testApiKey(settings.ai.apiKey);
          }
        }}
      />
    </div>
  );
};
