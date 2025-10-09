// =====================================================
// DASHBOARD ADMINISTRATEUR - CV-AI BACKOFFICE
// =====================================================
// Dashboard complet pour la gestion des utilisateurs

import React, { useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard admin...</p>
        </div>
      </div>
    );
  }

  // Vérification admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h1>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-gray-500">
            Veuillez vous connecter avec un compte administrateur.
          </p>
        </div>
      </div>
    );
  }

  // Erreur state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
              <p className="text-gray-600 mt-1">
                Gestion des utilisateurs et du contenu CV-AI
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refresh}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
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
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur par email ou nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques détaillées</h2>
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
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Actifs cette semaine</p>
                  <p className="text-xl font-bold text-gray-900">{stats.active_last_week}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.active_last_week > 0
                      ? `${Math.round((stats.active_last_week / stats.active_users) * 100)}% des utilisateurs actifs`
                      : 'Aucune activité cette semaine'
                    }
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Taux de conversion</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.total_users > 0
                      ? `${Math.round((stats.admin_users / stats.total_users) * 100)}%`
                      : '0%'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Administrateurs / Total</p>
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