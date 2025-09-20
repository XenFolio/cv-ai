import React from 'react';
import { BarChart3, MapPin, Briefcase, TrendingUp, Clock } from 'lucide-react';
import { JobSearchStats } from '../../types/jobs';

interface JobStatsProps {
  stats: JobSearchStats;
}

export const JobStats: React.FC<JobStatsProps> = ({ stats }) => {
  // Obtenir les top 3 localisations
  const topLocations = Object.entries(stats.byLocation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Obtenir les top 3 types de contrat
  const topContractTypes = Object.entries(stats.byContractType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Obtenir les sources actives
  const activeSources = Object.entries(stats.bySource)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  // Formatage du salaire moyen
  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(salary);
  };

  // Formatage de la date de dernière mise à jour
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-4">
      {/* Statistiques générales */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-gray-900">Statistiques</h3>
        </div>

        <div className="space-y-4">
          {/* Total des offres */}
          <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-pink-50 rounded-xl">
            <div className="text-2xl font-bold text-violet-600">{stats.totalJobs}</div>
            <div className="text-sm text-gray-600">Offres trouvées</div>
          </div>

          {/* Salaire moyen */}
          {stats.averageSalary && (
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="text-lg font-bold text-green-600">
                {formatSalary(stats.averageSalary)}
              </div>
              <div className="text-sm text-gray-600">Salaire moyen</div>
            </div>
          )}

          {/* Dernière mise à jour */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Mis à jour {formatLastUpdated(stats.lastUpdated)}</span>
          </div>
        </div>
      </div>

      {/* Top localisations */}
      {topLocations.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Top Localisations</h3>
          </div>

          <div className="space-y-3">
            {topLocations.map(([location, count]) => {
              const percentage = Math.round((count / stats.totalJobs) * 100);
              return (
                <div key={location} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate">{location}</span>
                    <span className="text-gray-500">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Types de contrat */}
      {topContractTypes.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Types de Contrat</h3>
          </div>

          <div className="space-y-3">
            {topContractTypes.map(([contractType, count]) => {
              const percentage = Math.round((count / stats.totalJobs) * 100);
              const colors = {
                'CDI': 'from-green-500 to-emerald-500',
                'CDD': 'from-blue-500 to-cyan-500',
                'Stage': 'from-purple-500 to-pink-500',
                'Freelance': 'from-orange-500 to-red-500',
                'Alternance': 'from-pink-500 to-rose-500'
              };
              
              return (
                <div key={contractType} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{contractType}</span>
                    <span className="text-gray-500">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${colors[contractType as keyof typeof colors] || 'from-gray-500 to-gray-600'} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sources */}
      {activeSources.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Sources</h3>
          </div>

          <div className="space-y-2">
            {activeSources.map(([source, count]) => {
              const percentage = Math.round((count / stats.totalJobs) * 100);
              const sourceLabels = {
                'indeed': 'Indeed',
                'linkedin': 'LinkedIn',
                'welcometothejungle': 'WTTJ',
                'apec': 'APEC',
                'pole-emploi': 'Pôle Emploi',
                'other': 'Autres'
              };
              
              return (
                <div key={source} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-gray-700">
                      {sourceLabels[source as keyof typeof sourceLabels] || source}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{count}</span>
                    <span className="text-xs text-gray-400">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conseils */}
      <div className="bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5" />
          <h3 className="font-semibold">Conseil</h3>
        </div>
        
        <p className="text-sm text-white/90 leading-relaxed">
          {stats.averageSalary && stats.averageSalary > 50000
            ? "Les salaires sont attractifs dans cette recherche. Mettez en avant vos compétences spécialisées."
            : topLocations.length > 0 && topLocations[0][1] > stats.totalJobs * 0.5
            ? `${topLocations[0][0]} concentre la majorité des offres. Élargissez votre zone de recherche pour plus d'opportunités.`
            : "Diversifiez vos mots-clés de recherche pour découvrir plus d'opportunités cachées."
          }
        </p>
      </div>
    </div>
  );
};
