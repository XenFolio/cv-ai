import { useState, useEffect } from 'react';
import { useSupabase, UserProfile } from './useSupabase';

// Types pour la validation
export interface ProfileValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

// Hook personnalisé pour la gestion des profils
export const useProfile = () => {
  const { 
    profile, 
    profileLoading, 
    loadProfile, 
    saveProfile, 
    createProfile, 
    deleteProfile,
    error 
  } = useSupabase();
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Fonction de validation des données de profil
  const validateProfile = (profileData: Partial<UserProfile>): ProfileValidation => {
    const errors: Record<string, string> = {};

    // Validation des champs obligatoires
    if (!profileData.first_name?.trim()) {
      errors.first_name = 'Le prénom est obligatoire';
    }

    if (!profileData.last_name?.trim()) {
      errors.last_name = 'Le nom est obligatoire';
    }

    if (!profileData.email?.trim()) {
      errors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    // Validation du téléphone (optionnel mais format si présent)
    if (profileData.phone && !/^(\+33|0)[1-9](\d{8})$/.test(profileData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Format de téléphone invalide (ex: 06 12 34 56 78)';
    }

    // Validation du code postal (optionnel mais format si présent)
    if (profileData.postal_code && !/^\d{5}$/.test(profileData.postal_code)) {
      errors.postal_code = 'Le code postal doit contenir 5 chiffres';
    }

    // Validation des URLs (optionnelles mais format si présentes)
    const urlRegex = /^https?:\/\/.+/;
    if (profileData.linkedin && !urlRegex.test(profileData.linkedin)) {
      errors.linkedin = 'L\'URL LinkedIn doit commencer par http:// ou https://';
    }

    if (profileData.website && !urlRegex.test(profileData.website)) {
      errors.website = 'L\'URL du site web doit commencer par http:// ou https://';
    }

    // Validation de la date de naissance (optionnelle mais cohérente si présente)
    if (profileData.date_of_birth) {
      const birthDate = new Date(profileData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (birthDate > today) {
        errors.date_of_birth = 'La date de naissance ne peut pas être dans le futur';
      } else if (age > 120) {
        errors.date_of_birth = 'Date de naissance non réaliste';
      }
    }

    setValidationErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Fonction pour sauvegarder avec validation
  const saveProfileWithValidation = async (profileData: Partial<UserProfile>) => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Validation des données
      const validation = validateProfile(profileData);
      if (!validation.isValid) {
        setSaveStatus('error');
        return { success: false, errors: validation.errors };
      }

      // Sauvegarde
      const result = await saveProfile(profileData);
      
      if (result.success) {
        setSaveStatus('success');
        setValidationErrors({});
        
        // Reset du statut après 3 secondes
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }

      return result;
    } catch (error) {
      setSaveStatus('error');
      return { success: false, error };
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour créer un profil avec validation
  const createProfileWithValidation = async (profileData: Partial<UserProfile>) => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Validation des données
      const validation = validateProfile(profileData);
      if (!validation.isValid) {
        setSaveStatus('error');
        return { success: false, errors: validation.errors };
      }

      // Création
      const result = await createProfile(profileData);
      
      if (result.success) {
        setSaveStatus('success');
        setValidationErrors({});
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }

      return result;
    } catch (error) {
      setSaveStatus('error');
      return { success: false, error };
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour obtenir les initiales du profil
  const getInitials = (): string => {
    if (!profile) return '';
    
    const firstInitial = profile.first_name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = profile.last_name?.charAt(0)?.toUpperCase() || '';
    
    return `${firstInitial}${lastInitial}`;
  };

  // Fonction pour obtenir le nom complet
  const getFullName = (): string => {
    if (!profile) return '';
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    
    return `${firstName} ${lastName}`.trim();
  };

  // Fonction pour vérifier si le profil est complet
  const isProfileComplete = (): boolean => {
    if (!profile) return false;
    
    const requiredFields = ['first_name', 'last_name', 'email'];
    return requiredFields.every(field => profile[field as keyof UserProfile]);
  };

  // Fonction pour obtenir le pourcentage de completion du profil
  const getCompletionPercentage = (): number => {
    if (!profile) return 0;
    
    const allFields = [
      'first_name', 'last_name', 'email', 'phone', 'address', 
      'postal_code', 'city', 'country', 'date_of_birth', 
      'nationality', 'linkedin', 'website', 'profession', 'company'
    ];
    
    const filledFields = allFields.filter(field => {
      const value = profile[field as keyof UserProfile];
      return value && value.toString().trim() !== '';
    });
    
    return Math.round((filledFields.length / allFields.length) * 100);
  };

  // Fonction pour formater l'adresse complète
  const getFormattedAddress = (): string => {
    if (!profile) return '';
    
    const parts = [
      profile.address,
      profile.postal_code,
      profile.city,
      profile.country
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  };

  // Fonction pour obtenir le type d'abonnement (avec "free" par défaut)
  const getSubscriptionType = (): 'free' | 'pro_monthly' | 'pro_yearly' => {
    return profile?.subscription_type || 'free';
  };

  // Fonction pour obtenir le statut d'abonnement (avec "free" par défaut)
  const getSubscriptionStatus = (): 'free' | 'active' | 'inactive' | 'canceled' => {
    return profile?.subscription_status || 'free';
  };

  // Fonction pour vérifier si l'utilisateur a un abonnement actif
  const hasActiveSubscription = (): boolean => {
    const status = getSubscriptionStatus();
    return status === 'active';
  };

  // Fonction pour vérifier si l'utilisateur est sur le plan gratuit
  const isFreeUser = (): boolean => {
    const type = getSubscriptionType();
    return type === 'free';
  };

  // Fonction pour vérifier si l'utilisateur a un abonnement Pro
  const isProUser = (): boolean => {
    const type = getSubscriptionType();
    return type === 'pro_monthly' || type === 'pro_yearly';
  };

  // Fonction pour obtenir le nom d'affichage du plan d'abonnement
  const getSubscriptionDisplayName = (): string => {
    const type = getSubscriptionType();
    switch (type) {
      case 'pro_monthly':
        return 'Pro Mensuel';
      case 'pro_yearly':
        return 'Pro Annuel';
      case 'free':
      default:
        return 'Gratuit';
    }
  };

  // Charger le profil au montage du hook (une seule fois)
  useEffect(() => {
    if (!profile && !profileLoading) {
      loadProfile();
    }
  }, [profile, profileLoading, loadProfile]);

  return {
    // Données
    profile,
    profileLoading,
    error,
    validationErrors,
    isSaving,
    saveStatus,
    
    // Actions
    loadProfile,
    saveProfile: saveProfileWithValidation,
    createProfile: createProfileWithValidation,
    deleteProfile,
    validateProfile,
    
    // Utilitaires
    getInitials,
    getFullName,
    isProfileComplete,
    getCompletionPercentage,
    getFormattedAddress,
    
    // Utilitaires d'abonnement
    getSubscriptionType,
    getSubscriptionStatus,
    hasActiveSubscription,
    isFreeUser,
    isProUser,
    getSubscriptionDisplayName,
    
    // Reset des erreurs
    clearValidationErrors: () => setValidationErrors({}),
    resetSaveStatus: () => setSaveStatus('idle')
  };
};
