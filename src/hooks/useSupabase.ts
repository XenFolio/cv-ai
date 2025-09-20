import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CVContent } from '../components/CVCreator/types';

// Types pour les templates
export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  preview_color: string;
  ats_score: number;
  downloads: string;
  rating: number;
  tags: string[];
  word_content: string;
  html_content: string;
  is_premium: boolean;
  industry: string;
  created_at?: string;
  updated_at?: string;
}

// Types pour les compétences
export interface Skill {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  level?: 'débutant' | 'intermédiaire' | 'avancé' | 'expert';
  keywords: string[];
  is_ai_generated: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// Types pour les activités
export interface Activity {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description?: string;
  score?: number;
  status: 'success' | 'warning' | 'info' | 'error';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Types pour les profils utilisateur
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  date_of_birth: string;
  nationality: string;
  linkedin: string;
  website: string;
  profession: string;
  company: string;
  openai_api_key?: string;
  subscription_type?: 'free' | 'pro_monthly' | 'pro_yearly';
  subscription_status?: 'free' | 'active' | 'inactive' | 'canceled';
  stripe_customer_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Hook pour gérer les données Supabase
export const useSupabase = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les activités depuis Supabase
  const loadActivities = async () => {
    if (!supabase) {
      setActivities([]);
      setActivitiesLoading(false);
      return;
    }

    try {
      setActivitiesLoading(true);
      
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      setActivities(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des activités:', err);
      setError('Erreur lors du chargement des activités');
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Fonction pour ajouter une nouvelle activité
  const addActivity = async (activity: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    try {
      // Récupérer l'utilisateur connecté
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        throw new Error('Utilisateur non authentifié');
      }
      
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Ajouter le user_id à l'activité
      const activityWithUserId = {
        ...activity,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('activities')
        .insert([activityWithUserId])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Mettre à jour la liste locale
      setActivities(prev => [data, ...prev.slice(0, 9)]);
      return data;
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'activité:', err);
      throw err;
    }
  };

  // Fonction pour ajouter un document directement dans la table documents
  // Structure conforme au schéma Supabase exact
  // Gère automatiquement l'unicité du nom avec la contrainte DB
  const addDocument = async (document: {
    doc_type: 'cv' | 'letter';
    name: string;
    type: 'analyzed' | 'created';
    ats_score?: number;
    status?: 'draft' | 'completed' | 'optimized';
    template?: string;
    industry?: string;
    file_size?: string;
    version?: number;
    content: CVContent | string; // Accepter soit CVContent soit une chaîne de caractères
    original_file_name?: string;
    original_file_data?: Uint8Array;
    analysis_results?: Record<string, unknown>;
    cv_data?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }) => {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        throw new Error('Utilisateur non authentifié');
      }

      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const documentData = {
        user_id: user.id,
        doc_type: document.doc_type,
        name: document.name,
        type: document.type,
        ats_score: document.ats_score || 0,
        status: document.status || 'completed',
        template: document.template || null,
        industry: document.industry || 'Non spécifié',
        is_favorite: false,
        file_size: document.file_size || 'Inconnu',
        version: document.version || 1,
        content: document.content, // Enregistrer directement en JSON
        original_file_name: document.original_file_name || null,
        original_file_data: document.original_file_data || null,
        analysis_results: document.analysis_results || {},
        cv_data: document.cv_data || {},
        metadata: document.metadata || {}
      };

      const { data, error } = await supabase
        .from('documents')
        .insert([documentData])
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase lors de l\'insertion document:', error);
        throw error;
      }

      console.log('✅ Document ajouté à la table documents:', data.id);
      return data;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du document:', err);
      throw err;
    }
  };

  // Fonction pour vérifier si un nom de document existe déjà
  const checkDocumentNameExists = async (name: string, docType: 'cv' | 'letter'): Promise<boolean> => {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    try {
      // Récupérer l'utilisateur connecté
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Utilisateur non authentifié');
      }

      const { data, error } = await supabase
        .from('documents')
        .select('id')
        .eq('user_id', user.id)
        .eq('doc_type', docType)
        .eq('name', name)
        .limit(1);

      if (error) {
        throw error;
      }

      return (data && data.length > 0);
    } catch (err) {
      console.error('Erreur lors de la vérification du nom:', err);
      throw err;
    }
  };

  // Fonction pour générer un nom unique
  const generateUniqueName = async (baseName: string, docType: 'cv' | 'letter'): Promise<string> => {
    let uniqueName = baseName;
    let counter = 1;

    while (await checkDocumentNameExists(uniqueName, docType)) {
      counter++;
      uniqueName = `${baseName} (${counter})`;
    }

    return uniqueName;
  };

  // Fonction pour mettre à jour un document existant
  const updateDocument = async (documentId: string, updates: {
    ats_score?: number;
    status?: 'draft' | 'completed' | 'optimized';
    content?: CVContent | string; // Accepter soit CVContent soit une chaîne de caractères
    analysis_results?: Record<string, unknown>;
    cv_data?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }) => {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        throw new Error('Utilisateur non authentifié');
      }

      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (updates.content) {
        updateData['content'] = updates.content; // Enregistrer directement en JSON
      }

      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase lors de la mise à jour du document:', error);
        throw error;
      }

      console.log('✅ Document mis à jour dans la table documents:', data.id);
      return data;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du document:', err);
      throw err;
    }
  };

  // Fonction pour charger le profil utilisateur (stabilisée avec useCallback)
  const loadProfile = useCallback(async (userId?: string) => {
    console.log('useSupabase - loadProfile appelé, supabase:', !!supabase);
    
    if (!supabase) {
      console.log('useSupabase - Supabase non configuré');
      setProfile(null);
      setProfileLoading(false);
      return null;
    }

    try {
      setProfileLoading(true);
      setError(null);
      console.log('useSupabase - Chargement du profil en cours...');
      
      // Si pas d'userId fourni, essayer de récupérer l'utilisateur actuel
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        currentUserId = user?.id;
        console.log('useSupabase - Utilisateur actuel:', currentUserId);
      }

      if (!currentUserId) {
        console.log('useSupabase - Pas d\'utilisateur connecté');
        setProfile(null);
        setProfileLoading(false);
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      console.log('useSupabase - Données du profil récupérées:', data);
      console.log('useSupabase - Erreur éventuelle:', error);

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      const profileData = data || null;
      setProfile(profileData);
      return profileData;
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
      setError('Erreur lors du chargement du profil');
      return null;
    } finally {
      setProfileLoading(false);
      console.log('useSupabase - Chargement du profil terminé');
    }
  }, []);

  // Fonction pour sauvegarder le profil utilisateur
  const saveProfile = async (profileData: Partial<UserProfile>) => {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    try {
      setError(null);
      console.log('Vérification de l\'authentification...');
      
      // Vérifier d'abord s'il y a une session active
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erreur de session:', sessionError);
        throw new Error('Erreur de session: ' + sessionError.message);
      }
      
      if (!session) {
        console.error('Aucune session active');
        throw new Error('🔐 Vous devez être connecté pour sauvegarder votre profil.\n\n👉 Cliquez sur "Se connecter" en haut à droite de l\'écran pour vous authentifier.');
      }
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        if (authError.message.includes('Auth session missing')) {
          throw new Error('🔐 Session d\'authentification expirée.\n\n👉 Veuillez vous reconnecter en cliquant sur "Se connecter".');
        }
        throw new Error('Erreur d\'authentification: ' + authError.message);
      }
      
      if (!user) {
        console.error('Aucun utilisateur connecté');
        throw new Error('🔐 Vous devez être connecté pour sauvegarder votre profil.\n\n👉 Cliquez sur "Se connecter" en haut à droite de l\'écran.');
      }

      console.log('Utilisateur connecté:', user.id);

      // Nettoyer les données avant l'insertion
      const cleanProfileData = Object.fromEntries(
        Object.entries(profileData).filter(([, value]) => value !== undefined)
      );

      console.log('Données à sauvegarder:', cleanProfileData);

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...cleanProfileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase:', error);
        if (error.code === '42P01') {
          throw new Error('La table des profils n\'existe pas. Veuillez appliquer les migrations d\'abord.');
        }
        throw error;
      }

      setProfile(data);
      console.log('Profil sauvegardé avec succès:', data);
      return { success: true, data };
    } catch (err: unknown) {
      console.error('Erreur lors de la sauvegarde du profil:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde du profil';
      setError(errorMessage);
      return { success: false, error: err, message: errorMessage };
    }
  };

  // Fonction pour créer un nouveau profil
  const createProfile = async (profileData: Partial<UserProfile>) => {
    if (!supabase) {
      return { success: false, error: 'Supabase non configuré' };
    }

    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Définir les valeurs par défaut pour l'abonnement
      const defaultSubscriptionData = {
        subscription_type: 'free' as const,
        subscription_status: 'free' as const,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          ...defaultSubscriptionData,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      console.log('Profil créé avec succès avec abonnement free par défaut:', data);
      return { success: true, data };
    } catch (err) {
      console.error('Erreur lors de la création du profil:', err);
      setError('Erreur lors de la création du profil');
      return { success: false, error: err };
    }
  };

  // Fonction pour supprimer le profil
  const deleteProfile = async () => {
    if (!supabase) {
      return { success: false, error: 'Supabase non configuré' };
    }

    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setProfile(null);
      console.log('Profil supprimé avec succès');
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la suppression du profil:', err);
      setError('Erreur lors de la suppression du profil');
      return { success: false, error: err };
    }
  };

  // Fonction pour récupérer les compétences par catégorie
  const getSkillsByCategory = useCallback(async (category: string): Promise<Skill[]> => {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    try {
      setSkillsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('category', category)
        .order('usage_count', { ascending: false });

      if (error) {
        throw error;
      }

      const skillsData = data as Skill[];
      
      // Mettre à jour le state local
      setSkills(prev => {
        const filtered = prev.filter(skill => skill.category !== category);
        return [...filtered, ...skillsData];
      });

      return skillsData;
    } catch (err) {
      console.error('Erreur lors de la récupération des compétences:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des compétences';
      setError(errorMessage);
      throw err;
    } finally {
      setSkillsLoading(false);
    }
  }, []);

  // Fonction pour ajouter une nouvelle compétence
  const addSkill = useCallback(async (skillData: Omit<Skill, 'id' | 'created_at' | 'updated_at'>): Promise<Skill> => {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('skills')
        .insert([skillData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newSkill = data as Skill;
      
      // Mettre à jour le state local
      setSkills(prev => [...prev, newSkill]);

      return newSkill;
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la compétence:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la compétence';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Fonction pour obtenir toutes les catégories de compétences
  const getSkillCategories = useCallback(async (): Promise<string[]> => {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    try {
      const { data, error } = await supabase
        .from('skills')
        .select('category')
        .order('category');

      if (error) {
        throw error;
      }

      // Extraire les catégories uniques
      const categories = [...new Set(data?.map((item: { category: string }) => item.category) || [])];
      return categories;
    } catch (err) {
      console.error('Erreur lors de la récupération des catégories:', err);
      throw err;
    }
  }, []);

  // Fonction pour rechercher des compétences
  const searchSkills = useCallback(async (query: string): Promise<Skill[]> => {
    if (!supabase) {
      throw new Error('Supabase non configuré');
    }

    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('usage_count', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      return data as Skill[];
    } catch (err) {
      console.error('Erreur lors de la recherche de compétences:', err);
      throw err;
    }
  }, []);

  // Fonction pour sauvegarder la clé OpenAI dans le profil
  const saveOpenAIKey = async (apiKey: string): Promise<{ success: boolean; error?: unknown; message?: string }> => {
    if (!supabase) {
      return { success: false, error: 'Supabase non configuré' };
    }

    try {
      setError(null);
      
      // Vérifier l'authentification
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Utilisateur non connecté');
      }

      // Sauvegarder la clé API dans le profil
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          openai_api_key: apiKey.trim(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Mettre à jour le profil local
      setProfile(prev => prev ? { ...prev, openai_api_key: apiKey.trim() } : null);
      
      console.log('Clé OpenAI sauvegardée avec succès');
      return { success: true };
    } catch (err: unknown) {
      console.error('Erreur lors de la sauvegarde de la clé OpenAI:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde de la clé OpenAI';
      setError(errorMessage);
      return { success: false, error: err, message: errorMessage };
    }
  };

  // Fonction pour supprimer la clé OpenAI du profil
  const removeOpenAIKey = async (): Promise<{ success: boolean; error?: unknown; message?: string }> => {
    if (!supabase) {
      return { success: false, error: 'Supabase non configuré' };
    }

    try {
      setError(null);
      
      // Vérifier l'authentification
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Utilisateur non connecté');
      }

      // Supprimer la clé API du profil
      const { error } = await supabase
        .from('profiles')
        .update({
          openai_api_key: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Mettre à jour le profil local
      setProfile(prev => prev ? { ...prev, openai_api_key: undefined } : null);
      
      console.log('Clé OpenAI supprimée avec succès');
      return { success: true };
    } catch (err: unknown) {
      console.error('Erreur lors de la suppression de la clé OpenAI:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la clé OpenAI';
      setError(errorMessage);
      return { success: false, error: err, message: errorMessage };
    }
  };

  useEffect(() => {
    // Chargement des données
    const loadTemplates = async () => {
      try {
        setLoading(true);
        
        if (!supabase) {
          console.log('Supabase non configuré - aucun template disponible');
          setTemplates([]);
        } else {
          // Charger depuis Supabase
          const { data, error } = await supabase
            .from('templates')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            throw error;
          }

          setTemplates(data || []);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des templates:', err);
        setError('Erreur lors du chargement des templates');
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
    loadActivities();
  }, []);

  return {
    templates,
    activities,
    profile,
    skills,
    loading,
    activitiesLoading,
    profileLoading,
    skillsLoading,
    error,
    addActivity,
    addDocument,
    updateDocument,
    generateUniqueName,
    checkDocumentNameExists,
    refreshActivities: loadActivities,
    loadProfile,
    saveProfile,
    createProfile,
    deleteProfile,
    getSkillsByCategory,
    addSkill,
    getSkillCategories,
    searchSkills,
    saveOpenAIKey,
    removeOpenAIKey
  };
};
