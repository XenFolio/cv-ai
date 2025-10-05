import React from 'react';
import { Clock, FileText, CheckCircle, AlertCircle, TrendingUp, Wand2, Target, Loader2 } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import { RecentActivitySkeleton } from './RecentActivitySkeleton';

interface RecentActivityProps {
  onShowAllActivities: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ onShowAllActivities }) => {
  const { activities, activitiesLoading, error } = useSupabase();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-emerald-600 bg-emerald-100';
      case 'warning': return 'text-amber-600 bg-amber-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/30 mx-auto w-full shadow-sm">
      <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-violet-600 to-pink-500 p-2 px-4  rounded-xl">
        <h3 className="w-full text-white text-lg font-semibold text-gray-900  ">Activité Récente</h3>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-400" />
          {activitiesLoading && <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />}
        </div>
      </div>
      
      {activitiesLoading ? (
        <RecentActivitySkeleton />
      ) : error ? (
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="font-semibold text-gray-700 mb-2">Aucune activité pour le moment</h4>
          <p className="text-sm text-gray-600 mb-4">
            Commencez par analyser un CV ou créer un nouveau document pour voir vos activités ici
          </p>

        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-3">
          {activities.slice(0, 5).map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer duration-200 transition-colors group">
                <div className={`p-2 rounded-lg ${getStatusColor(activity.status)} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-gray-600 truncate mt-0.5">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.created_at)}</p>
                    {activity.score && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
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

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200/30 flex justify-center">
        <button
          onClick={onShowAllActivities}
          className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-violet-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 shadow-sm"
        >
          Voir toute l'activité
        </button>
      </div>
    </div>
  );
};