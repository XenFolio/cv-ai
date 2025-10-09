// =====================================================
// LOGS ADMIN - CV-AI BACKOFFICE
// =====================================================
// Affichage des logs d'activité admin

import React, { useState } from 'react';
import { AdminLog } from '../../hooks/useAdmin';
import { Search, Filter, Calendar, Activity, User, Settings, Trash2, RefreshCw } from 'lucide-react';

interface AdminLogsProps {
  logs: AdminLog[];
  onRefresh: () => void;
}

export function AdminLogs({ logs, onRefresh }: AdminLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  // Filtrer les logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesFilter;
  });

  // Actions uniques pour le filtre
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  // Obtenir l'icône pour l'action
  const getActionIcon = (action: string) => {
    if (action.includes('create') || action.includes('add')) return <User className="h-4 w-4 text-green-500" />;
    if (action.includes('delete') || action.includes('remove')) return <Trash2 className="h-4 w-4 text-red-500" />;
    if (action.includes('update') || action.includes('change') || action.includes('toggle')) return <Settings className="h-4 w-4 text-yellow-500" />;
    return <Activity className="h-4 w-4 text-blue-500" />;
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir la couleur de fond selon l'action
  const getActionBgColor = (action: string) => {
    if (action.includes('create') || action.includes('add')) return 'bg-green-50';
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-50';
    if (action.includes('update') || action.includes('change') || action.includes('toggle')) return 'bg-yellow-50';
    return 'bg-blue-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          Logs d'activité ({filteredLogs.length} / {logs.length})
        </h2>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher dans les logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="all">Toutes les actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">Aucun log trouvé</p>
            <p className="text-gray-500">
              {logs.length === 0
                ? 'Aucune activité enregistrée pour le moment.'
                : 'Essayez de modifier vos filtres.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${getActionBgColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {log.action}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(log.created_at)}
                      </div>
                    </div>

                    {/* Target Info */}
                    {log.target_type && (
                      <p className="text-sm text-gray-600 mt-1">
                        Cible: {log.target_type}
                        {log.target_id && (
                          <span className="ml-1 text-gray-400">({log.target_id.slice(0, 8)}...)</span>
                        )}
                      </p>
                    )}

                    {/* Details */}
                    {log.details && (
                      <div className="mt-2">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            Voir les détails
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}

                    {/* Admin Info */}
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>Admin ID: {log.admin_id.slice(0, 8)}...</span>
                      {log.ip_address && (
                        <span className="ml-3">IP: {log.ip_address}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredLogs.length >= 50 && (
        <div className="text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Charger plus de logs...
          </button>
        </div>
      )}
    </div>
  );
}