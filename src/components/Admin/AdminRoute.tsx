// =====================================================
// ROUTE PROTÉGÉE ADMIN - CV-AI BACKOFFICE
// =====================================================
// Composant de protection des routes admin

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '../../hooks/useAdmin';
import { Shield, Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AdminRoute({ children, redirectTo = '/' }: AdminRouteProps) {
  const { isAdmin, loading } = useIsAdmin();

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas admin, rediriger
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès Restreint</h1>
          <p className="text-gray-600 mb-6">
            Vous devez être administrateur pour accéder à cette page.
          </p>
          <button
            onClick={() => window.location.href = redirectTo}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>;
}