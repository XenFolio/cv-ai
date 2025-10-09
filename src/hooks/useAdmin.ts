// =====================================================
// HOOK ADMIN - CV-AI BACKOFFICE
// =====================================================
// Hook pour la gestion des fonctionnalités administratives

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Types pour les données admin
export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  cv_count?: number;
  letter_count?: number;
  last_document_created?: string;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  new_users_week: number;
  active_last_week: number;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Hook principal pour les fonctionnalités admin
export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si l'utilisateur actuel est admin
  const checkAdminStatus = async () => {
    try {
      setLoading(true);

      // Vérifier d'abord localement avec le profil
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Vérifier directement dans la table profiles (optimisé)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .single();

      setIsAdmin(profile?.role === 'admin' && profile?.is_active === true);
    } catch (err) {
      console.error('Erreur checkAdminStatus:', err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // Charger tous les utilisateurs (admin seulement)
  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setError(null);
      const { data, error } = await supabase
        .from('admin_users_with_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Erreur loadUsers:', err);
      setError(errorMessage);
      toast.error('Erreur lors du chargement des utilisateurs');
    }
  }, [isAdmin]);

  // Charger les statistiques admin
  const loadStats = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setError(null);
      const { data, error } = await supabase
        .from('admin_user_stats')
        .select('*')
        .single();

      if (error) throw error;
      setStats(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Erreur loadStats:', err);
      setError(errorMessage);
    }
  }, [isAdmin]);

  // Charger les logs admin
  const loadLogs = useCallback(async (limit: number = 50) => {
    if (!isAdmin) return;

    try {
      setError(null);
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setLogs(data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Erreur loadLogs:', err);
      setError(errorMessage);
    }
  }, [isAdmin]);

  // Logger une action admin
  const logAction = async (
    action: string,
    targetType?: string,
    targetId?: string,
    details?: Record<string, unknown>
  ) => {
    if (!isAdmin) return;

    try {
      await supabase.rpc('log_admin_action', {
        action,
        target_type: targetType,
        target_id: targetId,
        details
      });
    } catch (err) {
      console.error('Erreur logAction:', err);
    }
  };

  // Mettre à jour le rôle d'un utilisateur
  const updateUserRole = async (
    userId: string,
    role: 'user' | 'admin',
    isActive: boolean = true
  ) => {
    if (!isAdmin) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role,
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      await logAction('update_user_role', 'profile', userId, { role, is_active: isActive });
      toast.success(`Rôle utilisateur mis à jour: ${role}`);

      // Recharger les utilisateurs
      await loadUsers();
      return true;
    } catch (err: unknown) {
      console.error('Erreur updateUserRole:', err);
      toast.error('Erreur lors de la mise à jour du rôle');
      return false;
    }
  };

  // Désactiver/Activer un utilisateur
  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    if (!isAdmin) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      await logAction('toggle_user_status', 'profile', userId, { is_active: isActive });
      toast.success(`Utilisateur ${isActive ? 'activé' : 'désactivé'}`);

      // Recharger les utilisateurs
      await loadUsers();
      return true;
    } catch (err: unknown) {
      console.error('Erreur toggleUserStatus:', err);
      toast.error('Erreur lors de la mise à jour du statut');
      return false;
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async (userId: string) => {
    if (!isAdmin) return false;

    try {
      // Supprimer d'abord le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Puis supprimer l'utilisateur auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      await logAction('delete_user', 'user', userId);
      toast.success('Utilisateur supprimé avec succès');

      // Recharger les utilisateurs
      await loadUsers();
      return true;
    } catch (err: unknown) {
      console.error('Erreur deleteUser:', err);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
      return false;
    }
  };

  // Effet pour vérifier le statut admin au montage
  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Effet pour charger les données quand le statut admin change
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadStats();
      loadLogs();
    }
  }, [isAdmin, loadUsers, loadStats, loadLogs]);

  return {
    // État
    isAdmin,
    loading,
    users,
    stats,
    logs,
    error,

    // Actions
    checkAdminStatus,
    loadUsers,
    loadStats,
    loadLogs,
    logAction,
    updateUserRole,
    toggleUserStatus,
    deleteUser,

    // Utilitaires
    refresh: () => {
      loadUsers();
      loadStats();
      loadLogs();
    }
  };
}

// Hook pour vérifier si un utilisateur est admin (version simple)
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          return;
        }

        // Vérifier directement dans la table profiles (optimisé)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_active')
          .eq('id', user.id)
          .single();

        setIsAdmin(profile?.role === 'admin' && profile?.is_active === true);
      } catch (err) {
        console.error('Erreur useIsAdmin:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading };
}

// Hook pour les permissions admin
export function useAdminPermissions() {
  const { isAdmin, loading } = useIsAdmin();

  const canViewUsers = isAdmin;
  const canEditUsers = isAdmin;
  const canDeleteUsers = isAdmin;
  const canViewStats = isAdmin;
  const canViewLogs = isAdmin;

  return {
    isAdmin,
    loading,
    permissions: {
      canViewUsers,
      canEditUsers,
      canDeleteUsers,
      canViewStats,
      canViewLogs
    }
  };
}
