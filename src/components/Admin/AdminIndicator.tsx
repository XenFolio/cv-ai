// =====================================================
// INDICATEUR VISUEL ADMIN - CV-AI BACKOFFICE
// =====================================================
// Composant pour afficher un indicateur visuel admin

import React from 'react';
import { useIsAdmin } from '../../hooks/useAdmin';
import { Shield, Crown, Sparkles } from 'lucide-react';

interface AdminIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  position?: 'header' | 'floating';
}

export function AdminIndicator({ size = 'md', showText = false, position = 'header' }: AdminIndicatorProps) {
  const { isAdmin, loading } = useIsAdmin();

  if (loading || !isAdmin) {
    return null;
  }

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      spacing: 'space-x-1'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      spacing: 'space-x-2'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      spacing: 'space-x-3'
    }
  };

  const classes = sizeClasses[size];

  if (position === 'floating') {
    return (
      <div className="fixed top-4 right-4 z-[70] bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full shadow-lg animate-pulse">
        <div className={`flex items-center ${classes.container}`}>
          <Crown className={`${classes.icon} text-white`} />
          {showText && <span className="font-medium">Admin</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className={`flex items-center ${classes.spacing} bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-purple-300 rounded-full border border-purple-500/30 backdrop-blur-sm transition-all duration-300 group-hover:from-violet-600/30 group-hover:to-purple-600/30 group-hover:border-purple-400/50`}>
        <Crown className={`${classes.icon} text-purple-400 group-hover:text-purple-300 transition-colors`} />
        {showText && (
          <span className="font-medium text-purple-300 group-hover:text-purple-200 transition-colors">
            Admin
          </span>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        Mode Administrateur
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45"></div>
      </div>
    </div>
  );
}