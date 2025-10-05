import React, { useRef } from 'react';
import {  FileText, Award, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CVAnalysisResponse } from '../../hooks/useOpenAI';

interface ATSReportExportProps {
  analysis: CVAnalysisResponse;
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

const ATSReportExport: React.FC<ATSReportExportProps> = ({
  analysis,
  candidateInfo,
  jobInfo
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const name = candidateInfo?.name || 'Candidate';
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`ATS_Analysis_Report_${name.replace(/\s+/g, '_')}_${timestamp}.pdf`);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Erreur lors de la génération du rapport PDF. Veuillez réessayer.');
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', icon: Award };
    if (score >= 80) return { level: 'Très bon', color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle };
    if (score >= 70) return { level: 'Bon', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: TrendingUp };
    if (score >= 60) return { level: 'Moyen', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle };
    return { level: 'À améliorer', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle };
  };

  const getSectionScoreLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'bg-green-500' };
    if (score >= 70) return { level: 'Bon', color: 'bg-blue-500' };
    if (score >= 60) return { level: 'Moyen', color: 'bg-amber-500' };
    return { level: 'Faible', color: 'bg-red-500' };
  };

  const overallLevel = getScoreLevel(analysis.overallScore);

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <button
        onClick={exportToPDF}
        className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <FileText className="w-5 h-5" />
        <span>Exporter le rapport ATS (PDF)</span>
      </button>

      {/* Hidden Report Content */}
      <div className="hidden">
        <div ref={reportRef} className="bg-white p-8 font-sans text-black max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rapport d'Analyse ATS
            </h1>
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
              {candidateInfo?.name && (
                <div><strong>Candidat:</strong> {candidateInfo.name}</div>
              )}
              {candidateInfo?.email && (
                <div><strong>Email:</strong> {candidateInfo.email}</div>
              )}
              <div><strong>Date:</strong> {new Date().toLocaleDateString('fr-FR')}</div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-gray-300 mb-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${overallLevel.color}`}>
                  {analysis.overallScore}%
                </div>
                <div className="text-xs text-gray-600">Score Global</div>
              </div>
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${overallLevel.bg} ${overallLevel.color} font-medium`}>
              <overallLevel.icon className="w-4 h-4 mr-2" />
              {overallLevel.level}
            </div>
          </div>

          {/* Job Information */}
          {jobInfo && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Position Visée</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {jobInfo.title && (
                  <div><strong>Poste:</strong> {jobInfo.title}</div>
                )}
                {jobInfo.company && (
                  <div><strong>Entreprise:</strong> {jobInfo.company}</div>
                )}
              </div>
            </div>
          )}

          {/* Section Scores */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Analyse Détaillée par Section</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(analysis.sections).map(([key, score]) => {
                const labels: Record<string, string> = {
                  atsOptimization: 'Optimisation ATS',
                  keywordMatch: 'Mots-clés',
                  structure: 'Structure',
                  content: 'Contenu'
                };

                const sectionLevel = getSectionScoreLevel(score as number);

                return (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{labels[key]}</h3>
                      <span className="text-lg font-bold">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 ${sectionLevel.color} rounded-full`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Award className="w-5 h-5 text-green-600 mr-2" />
              Points Forts
            </h2>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              Axes d'Amélioration
            </h2>
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Keywords Analysis */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Analyse des Mots-clés</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-green-600 mb-2">Mots-clés Présents ({analysis.keywords.found.length})</h3>
                <div className="flex flex-wrap gap-1">
                  {analysis.keywords.found.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-red-600 mb-2">Mots-clés Manquants ({analysis.keywords.missing.length})</h3>
                <div className="flex flex-wrap gap-1">
                  {analysis.keywords.missing.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">Suggestions ({analysis.keywords.suggestions.length})</h3>
                <div className="flex flex-wrap gap-1">
                  {analysis.keywords.suggestions.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Recommandations</h2>
            <ul className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Priority Improvements */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Plan d'Action Prioritaire</h2>
            <div className="space-y-3">
              {analysis.improvements.map((improvement, index) => {
                const priorityColors = {
                  high: 'border-red-500 bg-red-50',
                  medium: 'border-amber-500 bg-amber-50',
                  low: 'border-green-500 bg-green-50'
                };

                const priorityLabels = {
                  high: 'Haute priorité',
                  medium: 'Priorité moyenne',
                  low: 'Priorité faible'
                };

                return (
                  <div
                    key={index}
                    className={`border-l-4 p-4 rounded-r-lg ${priorityColors[improvement.priority]}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{improvement.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        improvement.priority === 'high' ? 'bg-red-200 text-red-800' :
                        improvement.priority === 'medium' ? 'bg-amber-200 text-amber-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {priorityLabels[improvement.priority]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{improvement.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-gray-300">
            <p className="text-sm text-gray-600">
              Rapport généré par CV ATS Assistant - Analyse professionnelle avec intelligence artificielle
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Ce rapport est généré automatiquement et doit être utilisé comme guide d'amélioration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSReportExport;