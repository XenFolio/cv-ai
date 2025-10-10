// =====================================================
// ADMIN THEME PROVIDER - CV-AI BACKOFFICE
// =====================================================
// Fournisseur de contexte pour le thème admin

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminThemeContext, AdminThemeContextType } from './useAdminTheme';
import { useIsAdmin } from '../hooks/useAdmin';
import { useTheme } from './useTheme';

interface AdminThemeProviderProps {
  children: React.ReactNode;
}

export function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  const { isAdmin, loading } = useIsAdmin();
  const { isDark } = useTheme();
  const [isThemeApplied, setIsThemeApplied] = useState(false);

  // Thème admin avec couleurs bleues professionnelles
  const adminTheme = useMemo(() => ({
    primary: '#1E40AF',      // Bleu principal profond
    secondary: '#3B82F6',    // Bleu secondaire vif
    accent: '#06B6D4',       // Cyan accent moderne
    background: '#0F172A',   // Fond bleu marine profond
    surface: '#1E293B',      // Surface bleu marine
    text: '#F8FAFC',         // Texte très clair
    border: '#334155',       // Bordure bleu gris
    success: '#10B981',      // Vert succès
    warning: '#F59E0B',      // Orange warning
    error: '#EF4444',        // Rouge error
    info: '#0EA5E9'          // Bleu info clair
  }), []);

  // Classes CSS pour le thème admin ou régulier
  const themeClasses = isAdmin ? (isDark ? {
    bg: 'bg-slate-950',
    bgGradient: 'bg-gradient-to-br from-slate-950 via-blue-900 to-cyan-900',
    bgSurface: 'bg-slate-900/50',
    text: 'text-slate-100',
    textSecondary: 'text-slate-300',
    border: 'border-slate-700',
    primary: 'bg-blue-700 hover:bg-blue-800 text-white',
    secondary: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    accent: 'bg-sky-600 hover:bg-sky-700 text-white',
    card: 'bg-slate-800/30 border-slate-700 backdrop-blur-sm',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonHover: 'hover:bg-blue-700'
  } : {
    bg: 'bg-slate-100',
    bgGradient: 'bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50',
    bgSurface: 'bg-white/90',
    text: 'text-slate-800',
    textSecondary: 'text-slate-600',
    border: 'border-slate-300',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    accent: 'bg-sky-600 hover:bg-sky-700 text-white',
    card: 'bg-white border-slate-300 backdrop-blur-sm',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonHover: 'hover:bg-blue-700'
  }) : isDark ? {
    bg: 'bg-slate-900',
    bgGradient: 'bg-gradient-to-br from-slate-900 via-gray-900 to-gray-950',
    bgSurface: 'bg-slate-800/50',
    text: 'text-slate-100',
    textSecondary: 'text-slate-300',
    border: 'border-slate-700',
    primary: 'bg-blue-700 hover:bg-blue-800 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-800 text-white',
    accent: 'bg-purple-700 hover:bg-purple-800 text-white ',
    card: 'bg-slate-800/30 border-slate-700 backdrop-blur-sm',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonHover: 'hover:bg-blue-700'
  } : {
    bg: 'bg-gray-50',
    bgGradient: 'bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50',
    bgSurface: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    accent: 'bg-purple-600 hover:bg-purple-700 text-white',
    card: 'bg-white border-gray-200',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonHover: 'hover:bg-blue-700'
  };

  // Appliquer le thème admin
  const applyAdminTheme = useCallback(() => {
    if (!isAdmin) return;

    const root = document.documentElement;

    // Appliquer les couleurs CSS
    root.style.setProperty('--admin-primary', adminTheme.primary);
    root.style.setProperty('--admin-secondary', adminTheme.secondary);
    root.style.setProperty('--admin-accent', adminTheme.accent);
    root.style.setProperty('--admin-background', adminTheme.background);
    root.style.setProperty('--admin-surface', adminTheme.surface);
    root.style.setProperty('--admin-text', adminTheme.text);
    root.style.setProperty('--admin-border', adminTheme.border);
    root.style.setProperty('--admin-success', adminTheme.success);
    root.style.setProperty('--admin-warning', adminTheme.warning);
    root.style.setProperty('--admin-error', adminTheme.error);
    root.style.setProperty('--admin-info', adminTheme.info);

    // Ajouter la classe admin au body
    document.body.classList.add('admin-theme');
    setIsThemeApplied(true);
  }, [isAdmin, adminTheme]);

  // Retirer le thème admin
  const removeAdminTheme = useCallback(() => {
    const root = document.documentElement;

    // Retirer les variables CSS
    const adminVars = [
      '--admin-primary', '--admin-secondary', '--admin-accent', '--admin-background',
      '--admin-surface', '--admin-text', '--admin-border', '--admin-success',
      '--admin-warning', '--admin-error', '--admin-info'
    ];

    adminVars.forEach(varName => {
      root.style.removeProperty(varName);
    });

    // Retirer la classe admin du body
    document.body.classList.remove('admin-theme');
    setIsThemeApplied(false);
  }, []);

  // Appliquer/retirer le thème selon le statut admin
  useEffect(() => {
    if (loading) return;

    if (isAdmin && !isThemeApplied) {
      applyAdminTheme();
    } else if (!isAdmin && isThemeApplied) {
      removeAdminTheme();
    }
  }, [isAdmin, loading, isThemeApplied, applyAdminTheme, removeAdminTheme]);

  // Nettoyer au démontage
  useEffect(() => {
    return () => {
      if (isThemeApplied) {
        removeAdminTheme();
      }
    };
  }, [isThemeApplied, removeAdminTheme]);

  const value: AdminThemeContextType = {
    isAdmin,
    adminTheme,
    themeClasses,
    applyAdminTheme,
    removeAdminTheme
  };

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
}
