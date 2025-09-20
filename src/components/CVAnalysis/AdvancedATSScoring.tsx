import React from 'react';
import { TrendingUp, Target, Award, AlertCircle, CheckCircle, BarChart3, PieChart, Activity, Zap } from 'lucide-react';
import { CVAnalysisResponse } from '../../hooks/useOpenAI';
import Card from '../UI/Card';
import ATSReportExport from './ATSReportExport';

interface AdvancedATSScoringProps {
  results: CVAnalysisResponse;
  industry?: string;
  experienceLevel?: string;
  jobTitle?: string;
  candidateInfo?: {
    name?: string;
    email?: string;
    position?: string;
  };
  jobInfo?: {
    title?: string;
    company?: string;
    description?: string;
  };
}

interface BenchmarkData {
  industry: string;
  averageScore: number;
  topPerformers: number;
  yourPosition: number;
}

const AdvancedATSScoring: React.FC<AdvancedATSScoringProps> = ({
  results,
  industry = 'Technology',
  experienceLevel = 'Mid-level',
  jobTitle = 'Professional',
  candidateInfo,
  jobInfo
}) => {
  // Calculs avancés pour le scoring
  const calculateAdvancedMetrics = () => {
    const sectionScores = Object.values(results.sections);
    const averageSectionScore = sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length;

    const totalKeywords = results.keywords.found.length + results.keywords.missing.length;
    const keywordEfficiency = totalKeywords > 0 ? (results.keywords.found.length / totalKeywords) * 100 : 0;

    const contentQuality = results.sections.content as number;
    const structureScore = results.sections.structure as number;
    const atsOptimization = results.sections.atsOptimization as number;

    // Score de compétitivité (basé sur plusieurs facteurs)
    const competitivenessScore = Math.round(
      (contentQuality * 0.4) +
      (keywordEfficiency * 0.3) +
      (structureScore * 0.2) +
      (atsOptimization * 0.1)
    );

    // Potentiel d'amélioration
    const improvementPotential = Math.min(100 - results.overallScore, 35);

    // Score de cohérence (écart entre sections)
    const scoreVariance = Math.max(...sectionScores) - Math.min(...sectionScores);
    const consistencyScore = Math.max(0, 100 - (scoreVariance * 2));

    return {
      competitivenessScore,
      keywordEfficiency: Math.round(keywordEfficiency),
      improvementPotential,
      consistencyScore: Math.round(consistencyScore),
      averageSectionScore: Math.round(averageSectionScore)
    };
  };

  // Données de benchmark simulées par industrie
  const getBenchmarkData = (): BenchmarkData => {
    const benchmarks: Record<string, BenchmarkData> = {
      'Technology': { industry: 'Technology', averageScore: 78, topPerformers: 92, yourPosition: 65 },
      'Finance': { industry: 'Finance', averageScore: 82, topPerformers: 94, yourPosition: 70 },
      'Healthcare': { industry: 'Healthcare', averageScore: 75, topPerformers: 89, yourPosition: 60 },
      'Marketing': { industry: 'Marketing', averageScore: 73, topPerformers: 87, yourPosition: 55 },
      'Education': { industry: 'Education', averageScore: 70, topPerformers: 85, yourPosition: 50 },
      'Consulting': { industry: 'Consulting', averageScore: 85, topPerformers: 95, yourPosition: 75 }
    };

    return benchmarks[industry] || benchmarks['Technology'];
  };

  const metrics = calculateAdvancedMetrics();
  const benchmark = getBenchmarkData();

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: 'Exceptionnel', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 80) return { level: 'Excellent', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 70) return { level: 'Bon', color: 'text-indigo-600', bg: 'bg-indigo-50' };
    if (score >= 60) return { level: 'Moyen', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { level: 'À améliorer', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 70) return 'from-blue-500 to-indigo-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const overallLevel = getScoreLevel(results.overallScore);

  return (
    <div className="space-y-6">
      {/* Score Overview avec Benchmark */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <span>Score ATS Avancé</span>
            </h3>
            <p className="text-gray-600 text-sm mt-1">Analyse comparative avec benchmark {benchmark.industry}</p>
          </div>
          <div className={`px-3 py-1 rounded-full ${overallLevel.bg} ${overallLevel.color} text-sm font-medium`}>
            {overallLevel.level}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Principal */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${overallLevel.color}`}>
                      {results.overallScore}%
                    </div>
                    <div className="text-xs text-gray-500">Score Global</div>
                  </div>
                </div>
              </div>
              {/* Indicateur de tendance */}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Comparaison Benchmark */}
          <div className="flex flex-col justify-center space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Votre score</span>
              <span className="font-semibold text-indigo-600">{results.overallScore}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Moyenne {benchmark.industry}</span>
              <span className="font-semibold text-gray-600">{benchmark.averageScore}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Top performers</span>
              <span className="font-semibold text-green-600">{benchmark.topPerformers}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Votre position</span>
              <span className="font-semibold text-amber-600">Top {benchmark.yourPosition}%</span>
            </div>
          </div>

          {/* Métriques Clés */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-gray-700">Compétitivité</span>
              </div>
              <span className="font-semibold text-indigo-600">{metrics.competitivenessScore}%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-gray-700">Potentiel</span>
              </div>
              <span className="font-semibold text-amber-600">+{metrics.improvementPotential}%</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Cohérence</span>
              </div>
              <span className="font-semibold text-green-600">{metrics.consistencyScore}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Métriques Détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Efficacité Mots-clés</span>
            <PieChart className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{metrics.keywordEfficiency}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 bg-gradient-to-r ${getProgressColor(metrics.keywordEfficiency)} rounded-full`}
              style={{ width: `${metrics.keywordEfficiency}%` }}
            />
          </div>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Score Moyen Sections</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{metrics.averageSectionScore}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 bg-gradient-to-r ${getProgressColor(metrics.averageSectionScore)} rounded-full`}
              style={{ width: `${metrics.averageSectionScore}%` }}
            />
          </div>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Compétitivité</span>
            <Award className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{metrics.competitivenessScore}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 bg-gradient-to-r ${getProgressColor(metrics.competitivenessScore)} rounded-full`}
              style={{ width: `${metrics.competitivenessScore}%` }}
            />
          </div>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Potentiel Amélioration</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">+{metrics.improvementPotential}%</div>
          <div className="text-xs text-gray-500 mt-1">Gain possible</div>
        </Card>
      </div>

      {/* Analyse des Écarts */}
      <Card variant="elevated" className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span>Analyse des Écarts de Performance</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Écart vs Benchmark */}
          <div>
            <h5 className="font-medium text-gray-700 mb-3">vs Benchmark {benchmark.industry}</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Écart de performance</span>
                <span className={`font-semibold ${results.overallScore >= benchmark.averageScore ? 'text-green-600' : 'text-red-600'}`}>
                  {results.overallScore >= benchmark.averageScore ? '+' : ''}{results.overallScore - benchmark.averageScore}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Distance au top 10%</span>
                <span className="font-semibold text-amber-600">
                  {benchmark.topPerformers - results.overallScore}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Percentile</span>
                <span className="font-semibold text-indigo-600">
                  Top {benchmark.yourPosition}%
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations Stratégiques */}
          <div>
            <h5 className="font-medium text-gray-700 mb-3">Recommandations Stratégiques</h5>
            <div className="space-y-2">
              {results.overallScore < benchmark.averageScore && (
                <div className="flex items-start space-x-2 p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">
                    Votre score est inférieur à la moyenne du secteur. Priorisez l'optimisation ATS.
                  </p>
                </div>
              )}

              {metrics.improvementPotential > 20 && (
                <div className="flex items-start space-x-2 p-2 bg-amber-50 rounded-lg">
                  <Zap className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Fort potentiel d'amélioration (+{metrics.improvementPotential}%). Focus sur les mots-clés manquants.
                  </p>
                </div>
              )}

              {metrics.consistencyScore < 70 && (
                <div className="flex items-start space-x-2 p-2 bg-blue-50 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Scores inégaux entre sections. Travaillez l'équilibre global du CV.
                  </p>
                </div>
              )}

              {results.overallScore >= benchmark.averageScore && (
                <div className="flex items-start space-x-2 p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800">
                    Votre performance est au-dessus de la moyenne. Continuez sur cette lancée !
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Score Radar Chart Simulation */}
      <Card variant="default" className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance par Dimension</h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(results.sections).map(([key, score]) => {
            const labels: Record<string, string> = {
              atsOptimization: 'Optimisation ATS',
              keywordMatch: 'Mots-clés',
              structure: 'Structure',
              content: 'Contenu'
            };

            const level = getScoreLevel(score as number);

            return (
              <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${level.color} mb-1`}>
                  {score}%
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {labels[key]}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${level.bg} ${level.color}`}>
                  {level.level}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* PDF Export */}
      <div className="mt-6">
        <ATSReportExport
          analysis={results}
          candidateInfo={candidateInfo}
          jobInfo={jobInfo}
        />
      </div>
    </div>
  );
};

export default AdvancedATSScoring;