// =====================================================
// DASHBOARD ADMINISTRATEUR - CV-AI BACKOFFICE
// =====================================================
// Dashboard complet pour la gestion des utilisateurs

import React, { useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { useAdminTheme } from '../../contexts/useAdminTheme';
import { UsersTable } from './UsersTable';
import { AdminStats } from './AdminStats';
import { AdminLogs } from './AdminLogs';
import { Search, Users, BarChart3, Activity, RefreshCw, Shield, AlertTriangle } from 'lucide-react';

export function AdminDashboard() {
  const {
    isAdmin,
    loading,
    users,
    stats,
    logs,
    error,
    refresh
  } = useAdmin();

  const { themeClasses } = useAdminTheme();

  const [activeTab, setActiveTab] = useState<'users' | 'stats' | 'logs'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeClasses.primary.replace('text-white', 'border-current').replace('bg-', 'border-')} mx-auto`}></div>
          <p className={`mt-4 ${themeClasses.textSecondary}`}>Chargement du dashboard admin...</p>
        </div>
      </div>
    );
  }

  // Vérification admin
  if (!isAdmin) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
        <div className={`text-center ${themeClasses.card} p-8 rounded-lg shadow-lg max-w-md`}>
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>Accès non autorisé</h1>
          <p className={`${themeClasses.textSecondary} mb-4`}>
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className={`text-sm ${themeClasses.textSecondary}`}>
            Veuillez vous connecter avec un compte administrateur.
          </p>
        </div>
      </div>
    );
  }

  // Erreur state
  if (error) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
        <div className={`text-center ${themeClasses.card} p-8 rounded-lg shadow-lg max-w-md`}>
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>Erreur de chargement</h1>
          <p className={`${themeClasses.textSecondary} mb-4`}>{error}</p>
          <button
            onClick={refresh}
            className={`${themeClasses.button} px-4 py-2 rounded-lg transition-colors`}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg}`}>
      {/* Header */}
      <div className={`${themeClasses.card} shadow-sm border-b ${themeClasses.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Dashboard Administrateur</h1>
              <p className={`${themeClasses.textSecondary} mt-1`}>
                Gestion des utilisateurs et du contenu CV-AI
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refresh}
                className={`flex items-center space-x-2 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Actualiser</span>
              </button>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Admin
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminStats stats={stats} />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`border-b ${themeClasses.border}`}>
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? `border-blue-500 text-blue-600`
                  : `border-transparent ${themeClasses.textSecondary} hover:${themeClasses.text} hover:${themeClasses.border}`
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Utilisateurs ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : `border-transparent ${themeClasses.textSecondary} hover:${themeClasses.text} hover:${themeClasses.border}`
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Statistiques</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : `border-transparent ${themeClasses.textSecondary} hover:${themeClasses.text} hover:${themeClasses.border}`
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Logs d'activité ({logs.length})</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab: Users */}
        {activeTab === 'users' && (
          <div>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.textSecondary}`} />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur par email ou nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border ${themeClasses.border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.bg} ${themeClasses.text}`}
                />
              </div>
            </div>

            {/* Users Table */}
            <UsersTable
              users={filteredUsers}
              onRefresh={refresh}
            />
          </div>
        )}

        {/* Tab: Stats */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            <div className={`${themeClasses.card} rounded-lg shadow p-6`}>
              <h2 className={`text-xl font-semibold ${themeClasses.text} mb-4`}>Statistiques détaillées</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-600 text-sm font-medium">Total utilisateurs</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total_users}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-600 text-sm font-medium">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold text-green-900">{stats.active_users}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-600 text-sm font-medium">Administrateurs</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.admin_users}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-600 text-sm font-medium">Nouveaux (7 jours)</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.new_users_week}</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className={`${themeClasses.card} rounded-lg shadow p-6`}>
              <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Activité récente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${themeClasses.bgSurface} p-4 rounded-lg`}>
                  <p className={`${themeClasses.textSecondary} text-sm`}>Actifs cette semaine</p>
                  <p className={`text-xl font-bold ${themeClasses.text}`}>{stats.active_last_week}</p>
                  <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                    {stats.active_last_week > 0
                      ? `${Math.round((stats.active_last_week / stats.active_users) * 100)}% des utilisateurs actifs`
                      : 'Aucune activité cette semaine'
                    }
                  </p>
                </div>
                <div className={`${themeClasses.bgSurface} p-4 rounded-lg`}>
                  <p className={`${themeClasses.textSecondary} text-sm`}>Taux de conversion</p>
                  <p className={`text-xl font-bold ${themeClasses.text}`}>
                    {stats.total_users > 0
                      ? `${Math.round((stats.admin_users / stats.total_users) * 100)}%`
                      : '0%'
                    }
                  </p>
                  <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>Administrateurs / Total</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Logs */}
        {activeTab === 'logs' && (
          <AdminLogs logs={logs} onRefresh={refresh} />
        )}
      </div>
    </div>
  );
}