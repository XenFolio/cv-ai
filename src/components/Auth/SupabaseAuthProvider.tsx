import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useSupabase, UserProfile } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';

interface SignUpMetadata {
  first_name?: string;
  last_name?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<{ error?: AuthError | Error }>;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError | Error }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<{ success: boolean; error?: Error | unknown }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface SupabaseAuthProviderProps {
  children: React.ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { saveProfile } = useSupabase();

  const loadUserProfile = useCallback(async (userId: string) => {
    if (!supabase) {
      console.log('Supabase non configuré - pas de chargement de profil');
      setProfile(null);
      return;
    }

    try {
      console.log('Chargement du profil utilisateur:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      const profileData = data || null;
      setProfile(profileData);
      console.log('Profil chargé:', profileData ? 'Succès' : 'Aucun profil');
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      // Ne pas bloquer l'application si le profil ne peut pas être chargé
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      // Mode fallback sans Supabase
      console.log('Supabase non configuré - mode fallback');
      setIsLoading(false);
      return;
    }

    console.log('Initialisation de l\'authentification Supabase...');

    // Timeout de sécurité réduit pour éviter un loading infini
    const loadingTimeout = setTimeout(() => {
      console.warn('Timeout de chargement atteint - forcer isLoading = false');
      setIsLoading(false);
    }, 10000); // 10 secondes maximum

    // Récupérer la session initiale avec timeout
    const getInitialSession = async () => {
      try {
        console.log('Récupération de la session initiale...');
        
        // Créer une promesse avec timeout pour getSession
        const sessionPromise = supabase!.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout getSession')), 15000)
        );
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          setSession(null);
          setUser(null);
          setProfile(null);
        } else {
          console.log('Session récupérée:', session ? 'Utilisateur connecté' : 'Pas de session');
          setSession(session);
          setUser(session?.user ?? null);
          
          // Charger le profil si l'utilisateur est connecté (sans timeout)
          if (session?.user) {
            loadUserProfile(session.user.id).catch((profileError) => {
              console.warn('Erreur lors du chargement du profil:', profileError);
              setProfile(null);
            });
          } else {
            setProfile(null);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Timeout getSession') {
          console.warn('Timeout de connexion Supabase - Mode hors-ligne activé');
        } else {
          console.error('Erreur lors de l\'initialisation de l\'auth:', error);
        }
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        console.log('Initialisation terminée - isLoading = false');
        clearTimeout(loadingTimeout);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Charger le profil sans timeout
          loadUserProfile(session.user.id).catch((profileError) => {
            console.warn('Erreur lors du chargement du profil:', profileError);
            setProfile(null);
          });
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        // S'assurer que isLoading est toujours à false après un changement d'état
        setIsLoading(false);
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const signUp = async (email: string, password: string, metadata?: SignUpMetadata) => {
    if (!supabase) {
      return { error: new Error('Supabase non configuré') };
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        console.error('Erreur Supabase lors de l\'inscription:', error);
        
        // Améliorer les messages d'erreur pour l'utilisateur
        let userFriendlyMessage = error.message;
        
        if (error.message.includes('User already registered')) {
          userFriendlyMessage = 'Un compte avec cette adresse email existe déjà. Essayez de vous connecter.';
        } else if (error.message.includes('Invalid email')) {
          userFriendlyMessage = 'Adresse email invalide. Veuillez vérifier le format.';
        } else if (error.message.includes('Password should be at least')) {
          userFriendlyMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
        } else if (error.message.includes('signup is disabled')) {
          userFriendlyMessage = 'Les inscriptions sont temporairement désactivées.';
        }
        
        return { error: new Error(userFriendlyMessage) };
      }

      // Le profil sera créé automatiquement par le trigger de la base de données
      console.log('Inscription réussie:', data);
      
      // Si l'utilisateur est créé mais pas encore confirmé
      if (data.user && !data.user.email_confirmed_at) {
        console.log('Email de confirmation envoyé à:', data.user.email);
      }
      
      return {};
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      
      // Gestion des erreurs réseau ou autres
      let errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Impossible de contacter le serveur. Veuillez réessayer plus tard.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { error: new Error(errorMessage) };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase non configuré') };
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erreur Supabase lors de la connexion:', error);
        
        // Améliorer les messages d'erreur pour l'utilisateur
        let userFriendlyMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          userFriendlyMessage = 'Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte si vous n\'en avez pas encore.';
        } else if (error.message.includes('Email not confirmed')) {
          userFriendlyMessage = 'Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception.';
        } else if (error.message.includes('Too many requests')) {
          userFriendlyMessage = 'Trop de tentatives de connexion. Veuillez attendre quelques minutes avant de réessayer.';
        } else if (error.message.includes('User not found')) {
          userFriendlyMessage = 'Aucun compte trouvé avec cette adresse email. Créez un compte d\'abord.';
        }
        
        return { error: new Error(userFriendlyMessage) };
      }

      console.log('Connexion réussie:', data);
      return {};
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      
      // Gestion des erreurs réseau ou autres
      let errorMessage = 'Erreur lors de la connexion. Veuillez réessayer.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Impossible de contacter le serveur. Veuillez réessayer plus tard.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { error: new Error(errorMessage) };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (!supabase) {
      // Mode fallback - nettoyer l'état immédiatement
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsLoading(false);
      return;
    }

    console.log('Déconnexion en cours...');
    setIsLoading(true);
    
    // Nettoyer l'état local IMMÉDIATEMENT pour une UX fluide
    setUser(null);
    setProfile(null);
    setSession(null);
    
    try {
      // Timeout réduit pour éviter les blocages
      const signOutPromise = supabase!.auth.signOut();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout de déconnexion')), 2000) // 2 secondes au lieu de 5
      );
      
      await Promise.race([signOutPromise, timeoutPromise]);
      console.log('Déconnexion Supabase réussie');
    } catch (error) {
      // En cas de timeout ou d'erreur, on continue car l'état local est déjà nettoyé
      if (error instanceof Error && error.message === 'Timeout de déconnexion') {
        console.warn('Timeout lors de la déconnexion - état local déjà nettoyé');
      } else {
        console.error('Erreur lors de la déconnexion:', error);
      }
    } finally {
      console.log('Déconnexion terminée - isLoading = false');
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const result = await saveProfile(profileData);
      
      if (result.success && result.data) {
        setProfile(result.data as UserProfile);
      }
      
      return result;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { success: false, error };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isAuthenticated: !!user,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
