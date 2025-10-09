// =====================================================
// STATISTIQUES ADMIN - CV-AI BACKOFFICE
// =====================================================
// Composant pour afficher les statistiques principales

import React from 'react';
import { AdminStats as AdminStatsType } from '../../hooks/useAdmin';
import { Users, UserCheck, TrendingUp, Calendar, FileText, Shield, Activity } from 'lucide-react';

interface AdminStatsProps {
  stats: AdminStatsType;
}

export function AdminStats({ stats }: AdminStatsProps) {
  // Calcul des pourcentages et ratios
  const activePercentage = stats.total_users > 0
    ? Math.round((stats.active_users / stats.total_users) * 100)
    : 0;

  const adminPercentage = stats.total_users > 0
    ? Math.round((stats.admin_users / stats.total_users) * 100)
    : 0;

  const weeklyGrowthPercentage = stats.new_users_week > 0
    ? Math.round((stats.new_users_week / Math.max(stats.total_users - stats.new_users_week, 1)) * 100)
    : 0;

  const returnUserRate = stats.active_last_week > 0
    ? Math.round((stats.active_last_week / stats.active_users) * 100)
    : 0;

  const statCards = [
    {
      title: 'Total Utilisateurs',
      value: stats.total_users,
      change: stats.new_users_week,
      changeType: 'positive' as const,
      icon: Users,
      color: 'blue',
      description: '+ Utilisateurs cette semaine'
    },
    {
      title: 'Utilisateurs Actifs',
      value: stats.active_users,
      change: activePercentage,
      changeType: 'percentage' as const,
      icon: UserCheck,
      color: 'green',
      description: `${activePercentage}% du total`
    },
    {
      title: 'Administrateurs',
      value: stats.admin_users,
      change: adminPercentage,
      changeType: 'percentage' as const,
      icon: Shield,
      color: 'purple',
      description: `${adminPercentage}% des utilisateurs`
    },
    {
      title: 'Croissance Hebdo',
      value: stats.new_users_week,
      change: weeklyGrowthPercentage,
      changeType: 'percentage' as const,
      icon: TrendingUp,
      color: 'yellow',
      description: 'Nouveaux utilisateurs'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        text: 'text-blue-900',
        change: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        text: 'text-green-900',
        change: 'text-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        text: 'text-purple-900',
        change: 'text-purple-600'
      },
      yellow: {
        bg: 'bg-yellow-50',
        icon: 'text-yellow-600',
        text: 'text-yellow-900',
        change: 'text-yellow-600'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          const Icon = stat.icon;

          return (
            <div key={index} className={`${colors.bg} rounded-lg p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold ${colors.text} mt-2`}>
                    {stat.value.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'positive' && stat.change > 0 && (
                      <span className={`text-sm font-medium ${colors.change}`}>
                        +{stat.change}
                      </span>
                    )}
                    {stat.changeType === 'percentage' && (
                      <span className={`text-sm font-medium ${colors.change}`}>
                        {stat.change}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`${colors.bg} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activité Utilisateurs</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Actifs cette semaine</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.active_last_week} / {stats.active_users}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${returnUserRate}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {returnUserRate}% des utilisateurs actifs cette semaine
            </p>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Métriques de Croissance</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nouveaux cette semaine</span>
              <span className="text-sm font-medium text-green-600">
                +{stats.new_users_week}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taux d'activation</span>
              <span className="text-sm font-medium text-gray-900">
                {activePercentage}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ratio Admin/Utilisateurs</span>
              <span className="text-sm font-medium text-purple-900">
                1:{Math.max(Math.round(stats.total_users / Math.max(stats.admin_users, 1)), 1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total comptes</p>
              <p className="text-sm font-medium text-gray-900">{stats.total_users}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Comptes actifs</p>
              <p className="text-sm font-medium text-gray-900">{stats.active_users}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Administrateurs</p>
              <p className="text-sm font-medium text-gray-900">{stats.admin_users}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}