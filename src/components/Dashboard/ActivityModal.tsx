import React, { useState, useMemo } from 'react';
import { X, Clock, FileText, CheckCircle, AlertCircle, TrendingUp, Wand2, Target, Search, Calendar } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, onClose }) => {
  const { activities, activitiesLoading } = useSupabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'analysis': return FileText;
      case 'match': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'creation': return Wand2;
      case 'optimization': return TrendingUp;
      default: return Target;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-emerald-600 bg-emerald-100';
      case 'warning': return 'text-amber-600 bg-amber-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activityTypes = useMemo(() => {
    const types = activities.map(a => a.type);
    return [...new Set(types)];
  }, [activities]);

  const activityStatuses = useMemo(() => {
    const statuses = activities.map(a => a.status);
    return [...new Set(statuses)];
  }, [activities]);

  const filteredAndSortedActivities = useMemo(() => {
    const filtered = activities.filter(activity => {
      const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || activity.type === filterType;
      const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });

    // Tri
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      }
      return 0;
    });

    return filtered;
  }, [activities, searchTerm, filterType, filterStatus, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center z-[99999] pointer-events-none">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative z-[99999] pointer-events-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Toutes les activités</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une activité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous les types</option>
                {activityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous les statuts</option>
                {activityStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              >
                <option value="date">Trier par date</option>
                <option value="score">Trier par score</option>
              </select>

              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{filteredAndSortedActivities.length} activité{filteredAndSortedActivities.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des activités */}
        <div className="flex-1 overflow-y-auto p-6">
          {activitiesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-start space-x-3 p-4 rounded-xl animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedActivities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune activité trouvée</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Commencez par analyser un CV ou créer un nouveau document'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className={`p-2.5 rounded-lg ${getStatusColor(activity.status)} group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {activity.title}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-gray-600 mb-2">
                              {activity.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(activity.created_at)}
                            </span>
                            <span>({formatTimeAgo(activity.created_at)})</span>
                          </div>
                        </div>

                        {activity.score && (
                          <span className={`text-sm font-semibold px-3 py-1 rounded-full ml-4 ${
                            activity.score >= 80
                              ? 'bg-emerald-100 text-emerald-700'
                              : activity.score >= 60
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {activity.score}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
