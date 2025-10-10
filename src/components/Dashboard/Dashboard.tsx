import React, { useState } from 'react';
import { FileText, TrendingUp, Users, CheckCircle, PlusCircle, MessageSquare, FileEdit, Search, Edit3, Scan, Shield } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import { useProfile } from '../../hooks/useProfile';
import { useIsAdmin } from '../../hooks/useAdmin';
import { MetricCard } from './MetricCard';
import { RecentActivity } from './RecentActivity';
import { ActivityModal } from './ActivityModal';
import { MetricsSkeleton } from './MetricsSkeleton';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { activities, loading } = useSupabase();
  const { profile, getFullName } = useProfile();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  
  // Obtenir le nom d'utilisateur depuis le profil ou fallback
  const getUserName = () => {
    if (profile) {
      const fullName = getFullName();
      if (fullName.trim()) {
        return fullName;
      }
    }
    
    try {
      // Essayer de récupérer depuis localStorage (mode mock)
      const savedUser = localStorage.getItem('cvAssistantUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        return userData.name || 'Utilisateur';
      }
    } catch {
      console.log('Pas d\'utilisateur en localStorage');
    }
    
    // Valeur par défaut
    return 'Utilisateur';
  };
  
  const userName = getUserName();

  // Calculer les métriques depuis les données Supabase
  const calculateMetrics = () => {
    if (loading || activities.length === 0) {
      return {
        totalAnalyzed: 0,
        averageScore: 0,
        qualifiedCandidates: 0,
        matchRate: 0,
        trends: {
          totalAnalyzedTrend: null,
          averageScoreTrend: null,
          qualifiedCandidatesTrend: null,
          matchRateTrend: null
        }
      };
    }

    const analysisActivities = activities.filter(a => a.type === 'analysis' && a.score);
    const totalAnalyzed = analysisActivities.length;
    const averageScore = totalAnalyzed > 0 
      ? Math.round(analysisActivities.reduce((sum, a) => sum + (a.score || 0), 0) / totalAnalyzed)
      : 0;
    
    const qualifiedCandidates = analysisActivities.filter(a => (a.score || 0) >= 80).length;
    const matchRate = totalAnalyzed > 0 
      ? Math.round((qualifiedCandidates / totalAnalyzed) * 100)
      : 0;

    // Calculer les tendances seulement s'il y a assez de données (au moins 5 analyses)
    let trends: {
      totalAnalyzedTrend: string | null;
      averageScoreTrend: string | null;
      qualifiedCandidatesTrend: string | null;
      matchRateTrend: string | null;
    } = {
      totalAnalyzedTrend: null,
      averageScoreTrend: null,
      qualifiedCandidatesTrend: null,
      matchRateTrend: null
    };

    if (totalAnalyzed >= 5) {
      // Comparer les 30 derniers jours vs les 30 jours précédents
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentActivities = analysisActivities.filter(a =>
        new Date(a.created_at) >= thirtyDaysAgo
      );
      const previousActivities = analysisActivities.filter(a =>
        new Date(a.created_at) >= sixtyDaysAgo && new Date(a.created_at) < thirtyDaysAgo
      );

      if (recentActivities.length > 0 && previousActivities.length > 0) {
        const recentAvgScore = recentActivities.reduce((sum, a) => sum + (a.score || 0), 0) / recentActivities.length;
        const previousAvgScore = previousActivities.reduce((sum, a) => sum + (a.score || 0), 0) / previousActivities.length;
        
        const recentQualified = recentActivities.filter(a => (a.score || 0) >= 80).length;
        const previousQualified = previousActivities.filter(a => (a.score || 0) >= 80).length;
        
        const recentMatchRate = (recentQualified / recentActivities.length) * 100;
        const previousMatchRate = (previousQualified / previousActivities.length) * 100;

        trends = {
          totalAnalyzedTrend: recentActivities.length > previousActivities.length ? '+' : '-',
          averageScoreTrend: recentAvgScore > previousAvgScore ?
            `+${Math.round(((recentAvgScore - previousAvgScore) / previousAvgScore) * 100)}%` :
            `-${Math.round(((previousAvgScore - recentAvgScore) / previousAvgScore) * 100)}%`,
          qualifiedCandidatesTrend: recentQualified > previousQualified ? '+' : '-',
          matchRateTrend: recentMatchRate > previousMatchRate ?
            `+${Math.round(recentMatchRate - previousMatchRate)}%` :
            `-${Math.round(previousMatchRate - recentMatchRate)}%`
        };
      }
    }
    return {
      totalAnalyzed,
      averageScore,
      qualifiedCandidates,
      matchRate,
      trends
    };
  };

  const metrics = calculateMetrics();

  const metricCards = [
    {
      title: 'CV Analysés',
      value: loading ? '...' : metrics.totalAnalyzed.toString(),
      change: metrics.trends.totalAnalyzedTrend || '',
      icon: FileText,
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      title: 'Score ATS Moyen',
      value: loading ? '...' : `${metrics.averageScore}%`,
      change: metrics.trends.averageScoreTrend || '',
      icon: TrendingUp,
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Candidats Qualifiés',
      value: loading ? '...' : metrics.qualifiedCandidates.toString(),
      change: metrics.trends.qualifiedCandidatesTrend || '',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Taux de Match',
      value: loading ? '...' : `${metrics.matchRate}%`,
      change: metrics.trends.matchRateTrend || '',
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-600'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Section with Quick Actions */}
      <div className={`bg-gradient-to-br ${isAdmin ? 'from-slate-900 via-blue-900 to-cyan-900' : 'from-indigo-900 via-purple-900 to-violet-900'} rounded-3xl p-8 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10 rounded-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-2 flex flex-wrap justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className={`${isAdmin ? 'text-2xl' : 'text-3xl'} font-bold text-shadow-xl`}>Bienvenue {userName} ! 👋</h1>
              {isAdmin && !adminLoading && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/80 backdrop-blur-sm border border-cyan-400/50 rounded-full">
                  <Shield className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">Mode Admin</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-white/90 text-md mb-0 mt-2 ">
            Optimisez vos CV avec notre IA avancée et maximisez vos chances de succès.
          </p>

          {/* Actions Rapides intégrées */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6 mt-6">
            {/* Bouton Créer un CV */}
            <button
              onClick={() => onNavigate?.('creator')}
              className={`group flex flex-col items-center p-5 ${isAdmin ? 'bg-blue-800/30 hover:bg-blue-700/40 border-blue-600/30' : 'bg-white/10 hover:bg-white/20 border-white/20'} backdrop-blur-md text-white rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <PlusCircle className={`h-7 w-7 mb-3 ${isAdmin ? 'text-blue-200 group-hover:text-blue-100' : 'text-white/90 group-hover:text-white'} group-hover:scale-110 transition-all duration-300`} />
              <span className="font-semibold text-sm">Créer un CV</span>
              <span className={`text-xs mt-1 ${isAdmin ? 'text-blue-200' : 'text-white/70'}`}>Assistant IA</span>
            </button>

            {/* Bouton Lettre de motivation */}
            <button
              onClick={() => onNavigate?.('chat')}
              className={`group flex flex-col items-center p-5 ${isAdmin ? 'bg-cyan-800/30 hover:bg-cyan-700/40 border-cyan-600/30' : 'bg-white/10 hover:bg-white/20 border-white/20'} backdrop-blur-md text-white rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <FileEdit className={`h-7 w-7 mb-3 ${isAdmin ? 'text-cyan-200 group-hover:text-cyan-100' : 'text-white/90 group-hover:text-white'} group-hover:scale-110 transition-all duration-300`} />
              <span className="font-semibold text-sm">Lettre de motivation</span>
              <span className={`text-xs mt-1 ${isAdmin ? 'text-cyan-200' : 'text-white/70'}`}>Génération IA</span>
            </button>

            {/* Bouton Éditeur de Lettres */}
            <button
              onClick={() => onNavigate?.('letter-editor')}
              className={`group flex flex-col items-center p-5 ${isAdmin ? 'bg-sky-800/30 hover:bg-sky-700/40 border-sky-600/30' : 'bg-white/10 hover:bg-white/20 border-white/20'} backdrop-blur-md text-white rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <Edit3 className={`h-7 w-7 mb-3 ${isAdmin ? 'text-sky-200 group-hover:text-sky-100' : 'text-white/90 group-hover:text-white'} group-hover:scale-110 transition-all duration-300`} />
              <span className="font-semibold text-sm">Éditeur de Lettres</span>
              <span className={`text-xs mt-1 ${isAdmin ? 'text-sky-200' : 'text-white/70'}`}>Créez votre lettre</span>
            </button>

            {/* Bouton Chat IA */}
            <button
              onClick={() => onNavigate?.('chat-cv')}
              className={`group flex flex-col items-center p-5 ${isAdmin ? 'bg-blue-800/30 hover:bg-blue-700/40 border-blue-600/30' : 'bg-white/10 hover:bg-white/20 border-white/20'} backdrop-blur-md text-white rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <MessageSquare className={`h-7 w-7 mb-3 ${isAdmin ? 'text-blue-200 group-hover:text-blue-100' : 'text-white/90 group-hover:text-white'} group-hover:scale-110 transition-all duration-300`} />
              <span className="font-semibold text-sm">Coach IA</span>
              <span className={`text-xs mt-1 ${isAdmin ? 'text-blue-200' : 'text-white/70'}`}>Assistant virtuel</span>
            </button>

            {/* Bouton Analyser CV */}
            <button
              onClick={() => onNavigate?.('analyze')}
              className={`group flex flex-col items-center p-5 ${isAdmin ? 'bg-indigo-800/30 hover:bg-indigo-700/40 border-indigo-600/30' : 'bg-white/10 hover:bg-white/20 border-white/20'} backdrop-blur-md text-white rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <Search className={`h-7 w-7 mb-3 ${isAdmin ? 'text-indigo-200 group-hover:text-indigo-100' : 'text-white/90 group-hover:text-white'} group-hover:scale-110 transition-all duration-300`} />
              <span className="font-semibold text-sm">Analyser CV</span>
              <span className={`text-xs mt-1 ${isAdmin ? 'text-indigo-200' : 'text-white/70'}`}>Score ATS</span>
            </button>

            {/* Bouton Unifié CV Scan */}
            <button
              onClick={() => onNavigate?.('cv-scan')}
              className={`group flex flex-col items-center p-5 ${isAdmin ? 'bg-slate-800/30 hover:bg-slate-700/40 border-slate-600/30' : 'bg-white/10 hover:bg-white/20 border-white/20'} backdrop-blur-md text-white rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <Scan className={`h-7 w-7 mb-3 ${isAdmin ? 'text-slate-200 group-hover:text-slate-100' : 'text-white/90 group-hover:text-white'} group-hover:scale-110 transition-all duration-300`} />
              <span className="font-semibold text-sm">Scan CV</span>
              <span className={`text-xs mt-1 ${isAdmin ? 'text-slate-200' : 'text-white/70'}`}>Webcam + Upload</span>
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-white/80 text-sm">
              Choisissez une action pour commencer votre optimisation professionnelle
            </p>
          </div>
        </div>
      </div>


      {/* Metrics Grid */}
      {loading ? (
        <MetricsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
          {metricCards.map((metric, index) => (
            <MetricCard key={index} {...metric} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="flex justify-center">
          <RecentActivity
            onShowAllActivities={() => setIsActivityModalOpen(true)}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      {/* Backdrop du modal - positionné au niveau Dashboard pour couvrir tout l'écran */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur z-[99998]" style={{ marginTop: '0' }} />
      )}

      {/* Modal d'activité globalu niveau du Dashboard */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
      />
    </div>
  );
};
