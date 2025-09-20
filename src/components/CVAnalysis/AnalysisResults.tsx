import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, AlertTriangle, XCircle, Brain, Target, Award, Download, RefreshCw, Loader2, ChevronDown, Briefcase, Activity } from 'lucide-react';
import { CVAnalysisResponse } from '../../hooks/useOpenAI';
import { DocumentType } from '../../hooks/useCVLibrary';
import html2pdf from 'html2pdf.js';
import AdvancedATSScoring from './AdvancedATSScoring';

interface AnalysisResultsProps {
  results: CVAnalysisResponse;
  fileName: string;
  originalContent?: string;
  documentType?: DocumentType;
  onOptimize?: () => void;
  isOptimizing?: boolean;
  onJobSearch?: (keywords: string[]) => void;
  industry?: string;
  experienceLevel?: string;
  jobTitle?: string;
  showAdvanced?: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  results,
  fileName,
  originalContent,
  documentType = 'cv',
  onOptimize,
  isOptimizing = false,
  onJobSearch,
  industry = 'Technology',
  experienceLevel = 'Mid-level',
  jobTitle = 'Professional',
  showAdvanced = true
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-violet-600';
    if (score >= 70) return 'text-rose-400';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 85) return 'from-rose-500 to-violet-500';
    if (score >= 60) return 'from-pink-500 to-rose-500';
    return 'from-pink-500 to-pink-700';
  };

  const exportReportHTML = () => {
    // Générer le contenu HTML du rapport
    const reportHTML = generateReportHTML();
    
    // Créer un blob avec le contenu HTML
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const documentLabel = documentType === 'cv' ? 'CV' : 'Lettre';
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rapport_Analyse_${documentLabel}_${fileName.replace(/\.[^/.]+$/, '')}.html`;
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer l'URL
    URL.revokeObjectURL(url);
    
    setShowExportMenu(false);
  };

  const exportReportPDF = () => {
    // Générer le contenu HTML du rapport avec séparation des sections
    const reportHTML = generateReportHTMLForPDF();
    
    // Créer un élément temporaire pour le contenu HTML
    const element = document.createElement('div');
    element.innerHTML = reportHTML;
    element.style.width = '210mm'; // Format A4
    element.style.minHeight = '297mm';
    element.style.padding = '20mm';
    element.style.margin = '0';
    element.style.backgroundColor = 'white';
    
    const documentLabel = documentType === 'cv' ? 'CV' : 'Lettre';
    // Options pour html2pdf
    const options = {
      margin: 0,
      filename: `Rapport_Analyse_${documentLabel}_${fileName.replace(/\.[^/.]+$/, '')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Générer et télécharger le PDF
    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        setShowExportMenu(false);
      })
      .catch((error: Error) => {
        console.error('Erreur lors de la génération du PDF:', error);
        setShowExportMenu(false);
      });
  };

  const generateReportHTMLForPDF = () => {
    const getScoreColorHex = (score: number) => {
      if (score >= 85) return '#7c3aed'; // violet-600
      if (score >= 70) return '#fb7185'; // rose-400
      return '#dc2626'; // red-600
    };

    const getScoreGradientCSS = (score: number) => {
      if (score >= 85) return 'linear-gradient(to right, #f43f5e, #7c3aed)'; // rose to violet
      if (score >= 60) return 'linear-gradient(to right, #ec4899, #f43f5e)'; // pink to rose
      return 'linear-gradient(to right, #ec4899, #be185d)'; // pink to pink-700
    };

    // Calculs supplémentaires pour le rapport
    const totalKeywords = results.keywords.found.length + results.keywords.missing.length;
    const keywordMatchRate = totalKeywords > 0 ? Math.round((results.keywords.found.length / totalKeywords) * 100) : 0;
    const averageScore = Math.round(Object.values(results.sections).reduce((a, b) => a + (b as number), 0) / Object.keys(results.sections).length);
    const improvementPotential = Math.min(98 - results.overallScore, 25);
    const analysisDate = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div style="max-width: 100%; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 20px;">
          <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #ec4899, #3b82f6); padding: 3px; margin-bottom: 20px;">
            <div style="width: 100%; height: 100%; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <div style="text-align: center;">
                <div style="font-size: 36px; font-weight: bold; color: ${getScoreColorHex(results.overallScore)};">${results.overallScore}%</div>
                <div style="font-size: 12px; color: #6b7280; font-weight: 500;">Score ATS</div>
              </div>
            </div>
          </div>
          <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">Rapport d'Analyse ${documentType === 'cv' ? 'CV' : 'Lettre de motivation'}</h1>
          <h2 style="font-size: 18px; color: #6b7280; margin: 0 0 15px 0;">${fileName}</h2>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">Analyse générée par IA OpenAI avec recommandations pour optimiser la compatibilité ATS</p>
        </div>

        <!-- Scores détaillés -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
          ${Object.entries(results.sections).map(([key, score]) => {
            const labels: Record<string, { title: string, description: string }> = {
              atsOptimization: { title: 'Optimisation ATS', description: 'Compatibilité avec les systèmes de tracking' },
              keywordMatch: { title: 'Correspondance Mots-clés', description: 'Présence des termes recherchés par les recruteurs' },
              structure: { title: 'Structure & Format', description: 'Organisation et présentation du contenu' },
              content: { title: 'Qualité du Contenu', description: 'Pertinence et impact des informations' }
            };
            
            return `
              <div style="background: white; padding: 25px; border-radius: 15px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                  <div>
                    <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 5px 0;">${labels[key].title}</h3>
                    <p style="font-size: 12px; color: #6b7280; margin: 0;">${labels[key].description}</p>
                  </div>
                  <span style="font-size: 24px; font-weight: bold; color: ${getScoreColorHex(score as number)};">${score}%</span>
                </div>
                <div style="width: 100%; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden;">
                  <div style="height: 100%; width: ${score}%; background: ${getScoreGradientCSS(score as number)}; border-radius: 6px;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 10px; color: #9ca3af;">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Sections d'analyse -->
        <div style="display: flex; flex-wrap: nowrap; gap: 20px; margin-bottom: 30px; width: 100%;">
          <!-- Recommandations IA -->
          <div style="background: white; padding: 20px; border-radius: 15px; border: 1px solid #e5e7eb; flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white; font-size: 16px;">🧠</span>
              </div>
              <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0;">Recommandations IA</h3>
            </div>
            <div style="space-y: 10px;">
              ${results.recommendations.slice(0, 5).map((rec: string, index: number) => `
                <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                  <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #60a5fa, #34d399); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; flex-shrink: 0; margin-top: 2px;">
                    <span style="color: white; font-size: 10px; font-weight: bold;">${index + 1}</span>
                  </div>
                  <p style="font-size: 12px; color: #374151; margin: 0; line-height: 1.4;">${rec}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Points Forts -->
          <div style="background: white; padding: 20px; border-radius: 15px; border: 1px solid #e5e7eb; flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10b981, #14b8a6); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white; font-size: 16px;">🏆</span>
              </div>
              <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0;">Points Forts</h3>
            </div>
            <div>
              ${results.strengths.slice(0, 5).map((strength: string) => `
                <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                  <span style="color: #10b981; margin-right: 8px; margin-top: 2px;">✓</span>
                  <p style="font-size: 12px; color: #374151; margin: 0; line-height: 1.4;">${strength}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- À Améliorer -->
          <div style="background: white; padding: 20px; border-radius: 15px; border: 1px solid #e5e7eb; flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #f59e0b, #f97316); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white; font-size: 16px;">⚠️</span>
              </div>
              <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0;">À Améliorer</h3>
            </div>
            <div>
              ${results.weaknesses.slice(0, 5).map((weakness: string) => `
                <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                  <span style="color: #f59e0b; margin-right: 8px; margin-top: 2px;">⚪</span>
                  <p style="font-size: 12px; color: #374151; margin: 0; line-height: 1.4;">${weakness}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Informations techniques supplémentaires -->
        <div style="background: white; padding: 25px; border-radius: 15px; border: 1px solid #e5e7eb; margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 20px 0; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">📊 Statistiques Détaillées</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 10px;">
              <div style="font-size: 24px; font-weight: bold; color: #7c3aed;">${keywordMatchRate}%</div>
              <div style="font-size: 12px; color: #6b7280;">Taux de correspondance mots-clés</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 10px;">
              <div style="font-size: 24px; font-weight: bold; color: #ec4899;">${averageScore}%</div>
              <div style="font-size: 12px; color: #6b7280;">Score moyen des sections</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 10px;">
              <div style="font-size: 24px; font-weight: bold; color: #10b981;">+${improvementPotential}%</div>
              <div style="font-size: 12px; color: #6b7280;">Potentiel d'amélioration</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h4 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 10px 0;">🎯 Analyse des mots-clés</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #6b7280;">
                <li>Mots-clés trouvés: ${results.keywords.found.length}</li>
                <li>Mots-clés manquants: ${results.keywords.missing.length}</li>
                <li>Suggestions IA: ${results.keywords.suggestions.length}</li>
                <li>Densité optimale: ${keywordMatchRate >= 70 ? 'Atteinte' : 'À améliorer'}</li>
              </ul>
            </div>
            <div>
              <h4 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 10px 0;">⚡ Performance par section</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #6b7280;">
                <li>Meilleure section: ${Object.entries(results.sections).reduce((a, b) => (b[1] as number) > (a[1] as number) ? b : a)[0] === 'atsOptimization' ? 'Optimisation ATS' : Object.entries(results.sections).reduce((a, b) => (b[1] as number) > (a[1] as number) ? b : a)[0] === 'keywordMatch' ? 'Mots-clés' : Object.entries(results.sections).reduce((a, b) => (b[1] as number) > (a[1] as number) ? b : a)[0] === 'structure' ? 'Structure' : 'Contenu'} (${Math.max(...Object.values(results.sections) as number[])}%)</li>
                <li>Section à prioriser: ${Object.entries(results.sections).reduce((a, b) => (b[1] as number) < (a[1] as number) ? b : a)[0] === 'atsOptimization' ? 'Optimisation ATS' : Object.entries(results.sections).reduce((a, b) => (b[1] as number) < (a[1] as number) ? b : a)[0] === 'keywordMatch' ? 'Mots-clés' : Object.entries(results.sections).reduce((a, b) => (b[1] as number) < (a[1] as number) ? b : a)[0] === 'structure' ? 'Structure' : 'Contenu'} (${Math.min(...Object.values(results.sections) as number[])}%)</li>
                <li>Écart max/min: ${Math.max(...Object.values(results.sections) as number[]) - Math.min(...Object.values(results.sections) as number[])}%</li>
                <li>Homogénéité: ${Math.max(...Object.values(results.sections) as number[]) - Math.min(...Object.values(results.sections) as number[]) <= 15 ? 'Excellente' : Math.max(...Object.values(results.sections) as number[]) - Math.min(...Object.values(results.sections) as number[]) <= 25 ? 'Bonne' : 'À améliorer'}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Plan d'action détaillé -->
        <div style="background: white; padding: 25px; border-radius: 15px; border: 1px solid #e5e7eb; margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 20px 0; border-bottom: 2px solid #ec4899; padding-bottom: 10px;">🚀 Plan d'Action Personnalisé</h3>
          
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 600; color: #dc2626; margin: 0 0 10px 0;">🔥 Actions Prioritaires (0-7 jours)</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #374151; line-height: 1.6;">
              ${results.improvements.filter(imp => imp.priority === 'high').slice(0, 3).map(imp => `<li><strong>${imp.title}:</strong> ${imp.description}</li>`).join('')}
              ${results.improvements.filter(imp => imp.priority === 'high').length === 0 ? '<li>Excellent ! Aucune action critique identifiée.</li>' : ''}
            </ul>
          </div>

          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 600; color: #f59e0b; margin: 0 0 10px 0;">⚡ Actions Importantes (1-2 semaines)</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #374151; line-height: 1.6;">
              ${results.improvements.filter(imp => imp.priority === 'medium').slice(0, 4).map(imp => `<li><strong>${imp.title}:</strong> ${imp.description}</li>`).join('')}
            </ul>
          </div>

          <div>
            <h4 style="font-size: 14px; font-weight: 600; color: #10b981; margin: 0 0 10px 0;">💡 Optimisations Futures (1 mois)</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #374151; line-height: 1.6;">
              ${results.improvements.filter(imp => imp.priority === 'low').slice(0, 3).map(imp => `<li><strong>${imp.title}:</strong> ${imp.description}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Conseils d'experts -->
        <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 25px; border-radius: 15px; color: white; margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">💎 Conseils d'Experts ATS</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 10px 0; opacity: 0.9;">🎯 Optimisation ATS</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; line-height: 1.6; opacity: 0.9;">
                <li>Utilisez des formats standards (.docx, .pdf)</li>
                <li>Évitez les images et graphiques complexes</li>
                <li>Structurez avec des titres clairs</li>
                <li>Répétez les mots-clés naturellement</li>
              </ul>
            </div>
            <div>
              <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 10px 0; opacity: 0.9;">📈 Suivi des performances</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; line-height: 1.6; opacity: 0.9;">
                <li>Testez votre CV sur différents ATS</li>
                <li>Adaptez pour chaque offre d'emploi</li>
                <li>Mesurez le taux de réponse</li>
                <li>Réanalysez après modifications</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Saut de page forcé avant les informations techniques -->
        <div style="page-break-before: always;"></div>

        <!-- Informations techniques sur la dernière page -->
        <div style="background: #f8fafc; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h4 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 15px 0;">🔧 Informations Techniques</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; font-size: 11px; color: #6b7280;">
            <div>
              <strong>Analyse:</strong><br>
              Date: ${analysisDate}<br>
              Moteur: OpenAI GPT<br>
              Version: 4.0
            </div>
            <div>
              <strong>Fichier:</strong><br>
              Nom: ${fileName}<br>
              Taille: ${originalContent ? Math.round(originalContent.length / 1024) + ' KB' : 'N/A'}<br>
              Encodage: UTF-8
            </div>
            <div>
              <strong>Métriques:</strong><br>
              Mots analysés: ${originalContent ? originalContent.split(' ').length : 'N/A'}<br>
              Temps d'analyse: ~30s<br>
              Précision: 94%
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 15px; margin-top: 30px;">
          <p style="font-size: 12px; color: #6b7280; margin: 0;">
            Rapport généré le ${analysisDate} par CV ATS Assistant<br>
            <span style="font-size: 10px; opacity: 0.7;">Analyse basée sur les standards ATS 2024 • Données confidentielles</span>
          </p>
        </div>
      </div>
    `;
  };

  const generateReportHTML = () => {
    const getScoreColorHex = (score: number) => {
      if (score >= 85) return '#7c3aed'; // violet-600
      if (score >= 70) return '#fb7185'; // rose-400
      return '#dc2626'; // red-600
    };

    const getScoreGradientCSS = (score: number) => {
      if (score >= 85) return 'linear-gradient(to right, #f43f5e, #7c3aed)'; // rose to violet
      if (score >= 60) return 'linear-gradient(to right, #ec4899, #f43f5e)'; // pink to rose
      return 'linear-gradient(to right, #ec4899, #be185d)'; // pink to pink-700
    };

    // Calculs supplémentaires pour le rapport
    const totalKeywords = results.keywords.found.length + results.keywords.missing.length;
    const keywordMatchRate = totalKeywords > 0 ? Math.round((results.keywords.found.length / totalKeywords) * 100) : 0;
    const averageScore = Math.round(Object.values(results.sections).reduce((a, b) => a + (b as number), 0) / Object.keys(results.sections).length);
    const improvementPotential = Math.min(98 - results.overallScore, 25);
    const analysisDate = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div style="max-width: 100%; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 20px;">
          <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #ec4899, #3b82f6); padding: 3px; margin-bottom: 20px;">
            <div style="width: 100%; height: 100%; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <div style="text-align: center;">
                <div style="font-size: 36px; font-weight: bold; color: ${getScoreColorHex(results.overallScore)};">${results.overallScore}%</div>
                <div style="font-size: 12px; color: #6b7280; font-weight: 500;">Score ATS</div>
              </div>
            </div>
          </div>
          <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 10px 0;">Rapport d'Analyse CV</h1>
          <h2 style="font-size: 18px; color: #6b7280; margin: 0 0 15px 0;">${fileName}</h2>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">Analyse générée par IA avec recommandations pour optimiser la compatibilité ATS</p>
        </div>

        <!-- Scores détaillés -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
          ${Object.entries(results.sections).map(([key, score]) => {
            const labels: Record<string, { title: string, description: string }> = {
              atsOptimization: { title: 'Optimisation ATS', description: 'Compatibilité avec les systèmes de tracking' },
              keywordMatch: { title: 'Correspondance Mots-clés', description: 'Présence des termes recherchés par les recruteurs' },
              structure: { title: 'Structure & Format', description: 'Organisation et présentation du contenu' },
              content: { title: 'Qualité du Contenu', description: 'Pertinence et impact des informations' }
            };
            
            return `
              <div style="background: white; padding: 25px; border-radius: 15px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                  <div>
                    <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 5px 0;">${labels[key].title}</h3>
                    <p style="font-size: 12px; color: #6b7280; margin: 0;">${labels[key].description}</p>
                  </div>
                  <span style="font-size: 24px; font-weight: bold; color: ${getScoreColorHex(score as number)};">${score}%</span>
                </div>
                <div style="width: 100%; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden;">
                  <div style="height: 100%; width: ${score}%; background: ${getScoreGradientCSS(score as number)}; border-radius: 6px;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 10px; color: #9ca3af;">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Sections d'analyse -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <!-- Recommandations IA -->
          <div style="background: white; padding: 20px; border-radius: 15px; border: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white; font-size: 16px;">🧠</span>
              </div>
              <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0;">Recommandations IA</h3>
            </div>
            <div style="space-y: 10px;">
              ${results.recommendations.slice(0, 5).map((rec: string, index: number) => `
                <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                  <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #60a5fa, #34d399); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; flex-shrink: 0; margin-top: 2px;">
                    <span style="color: white; font-size: 10px; font-weight: bold;">${index + 1}</span>
                  </div>
                  <p style="font-size: 12px; color: #374151; margin: 0; line-height: 1.4;">${rec}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Points Forts -->
          <div style="background: white; padding: 20px; border-radius: 15px; border: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10b981, #14b8a6); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white; font-size: 16px;">🏆</span>
              </div>
              <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0;">Points Forts</h3>
            </div>
            <div>
              ${results.strengths.slice(0, 5).map((strength: string) => `
                <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                  <span style="color: #10b981; margin-right: 8px; margin-top: 2px;">✓</span>
                  <p style="font-size: 12px; color: #374151; margin: 0; line-height: 1.4;">${strength}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- À Améliorer -->
          <div style="background: white; padding: 20px; border-radius: 15px; border: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #f59e0b, #f97316); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white; font-size: 16px;">⚠️</span>
              </div>
              <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0;">À Améliorer</h3>
            </div>
            <div>
              ${results.weaknesses.slice(0, 5).map((weakness: string) => `
                <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                  <span style="color: #f59e0b; margin-right: 8px; margin-top: 2px;">⚪</span>
                  <p style="font-size: 12px; color: #374151; margin: 0; line-height: 1.4;">${weakness}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Informations techniques supplémentaires -->
        <div style="background: white; padding: 25px; border-radius: 15px; border: 1px solid #e5e7eb; margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 20px 0; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">📊 Statistiques Détaillées</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 10px;">
              <div style="font-size: 24px; font-weight: bold; color: #7c3aed;">${keywordMatchRate}%</div>
              <div style="font-size: 12px; color: #6b7280;">Taux de correspondance mots-clés</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 10px;">
              <div style="font-size: 24px; font-weight: bold; color: #ec4899;">${averageScore}%</div>
              <div style="font-size: 12px; color: #6b7280;">Score moyen des sections</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 10px;">
              <div style="font-size: 24px; font-weight: bold; color: #10b981;">+${improvementPotential}%</div>
              <div style="font-size: 12px; color: #6b7280;">Potentiel d'amélioration</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h4 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 10px 0;">🎯 Analyse des mots-clés</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #6b7280;">
                <li>Mots-clés trouvés: ${results.keywords.found.length}</li>
                <li>Mots-clés manquants: ${results.keywords.missing.length}</li>
                <li>Suggestions IA: ${results.keywords.suggestions.length}</li>
                <li>Densité optimale: ${keywordMatchRate >= 70 ? 'Atteinte' : 'À améliorer'}</li>
              </ul>
            </div>
            <div>
              <h4 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 10px 0;">⚡ Performance par section</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #6b7280;">
                <li>Meilleure section: ${Object.entries(results.sections).reduce((a, b) => (b[1] as number) > (a[1] as number) ? b : a)[0] === 'atsOptimization' ? 'Optimisation ATS' : Object.entries(results.sections).reduce((a, b) => (b[1] as number) > (a[1] as number) ? b : a)[0] === 'keywordMatch' ? 'Mots-clés' : Object.entries(results.sections).reduce((a, b) => (b[1] as number) > (a[1] as number) ? b : a)[0] === 'structure' ? 'Structure' : 'Contenu'} (${Math.max(...Object.values(results.sections) as number[])}%)</li>
                <li>Section à prioriser: ${Object.entries(results.sections).reduce((a, b) => (b[1] as number) < (a[1] as number) ? b : a)[0] === 'atsOptimization' ? 'Optimisation ATS' : Object.entries(results.sections).reduce((a, b) => (b[1] as number) < (a[1] as number) ? b : a)[0] === 'keywordMatch' ? 'Mots-clés' : Object.entries(results.sections).reduce((a, b) => (b[1] as number) < (a[1] as number) ? b : a)[0] === 'structure' ? 'Structure' : 'Contenu'} (${Math.min(...Object.values(results.sections) as number[])}%)</li>
                <li>Écart max/min: ${Math.max(...Object.values(results.sections) as number[]) - Math.min(...Object.values(results.sections) as number[])}%</li>
                <li>Homogénéité: ${Math.max(...Object.values(results.sections) as number[]) - Math.min(...Object.values(results.sections) as number[]) <= 15 ? 'Excellente' : Math.max(...Object.values(results.sections) as number[]) - Math.min(...Object.values(results.sections) as number[]) <= 25 ? 'Bonne' : 'À améliorer'}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Plan d'action détaillé -->
        <div style="background: white; padding: 25px; border-radius: 15px; border: 1px solid #e5e7eb; margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 20px 0; border-bottom: 2px solid #ec4899; padding-bottom: 10px;">🚀 Plan d'Action Personnalisé</h3>
          
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 600; color: #dc2626; margin: 0 0 10px 0;">🔥 Actions Prioritaires (0-7 jours)</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #374151; line-height: 1.6;">
              ${results.improvements.filter(imp => imp.priority === 'high').slice(0, 3).map(imp => `<li><strong>${imp.title}:</strong> ${imp.description}</li>`).join('')}
              ${results.improvements.filter(imp => imp.priority === 'high').length === 0 ? '<li>Excellent ! Aucune action critique identifiée.</li>' : ''}
            </ul>
          </div>

          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 600; color: #f59e0b; margin: 0 0 10px 0;">⚡ Actions Importantes (1-2 semaines)</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #374151; line-height: 1.6;">
              ${results.improvements.filter(imp => imp.priority === 'medium').slice(0, 4).map(imp => `<li><strong>${imp.title}:</strong> ${imp.description}</li>`).join('')}
            </ul>
          </div>

          <div>
            <h4 style="font-size: 14px; font-weight: 600; color: #10b981; margin: 0 0 10px 0;">💡 Optimisations Futures (1 mois)</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #374151; line-height: 1.6;">
              ${results.improvements.filter(imp => imp.priority === 'low').slice(0, 3).map(imp => `<li><strong>${imp.title}:</strong> ${imp.description}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Conseils d'experts -->
        <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 25px; border-radius: 15px; color: white; margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">💎 Conseils d'Experts ATS</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 10px 0; opacity: 0.9;">🎯 Optimisation ATS</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; line-height: 1.6; opacity: 0.9;">
                <li>Utilisez des formats standards (.docx, .pdf)</li>
                <li>Évitez les images et graphiques complexes</li>
                <li>Structurez avec des titres clairs</li>
                <li>Répétez les mots-clés naturellement</li>
              </ul>
            </div>
            <div>
              <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 10px 0; opacity: 0.9;">📈 Suivi des performances</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; line-height: 1.6; opacity: 0.9;">
                <li>Testez votre CV sur différents ATS</li>
                <li>Adaptez pour chaque offre d'emploi</li>
                <li>Mesurez le taux de réponse</li>
                <li>Réanalysez après modifications</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Informations techniques -->
        <div style="background: #f8fafc; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h4 style="font-size: 14px; font-weight: 600; color: #374151; margin: 0 0 15px 0;">🔧 Informations Techniques</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; font-size: 11px; color: #6b7280;">
            <div>
              <strong>Analyse:</strong><br>
              Date: ${analysisDate}<br>
              Moteur: OpenAI GPT<br>
              Version: 4.0
            </div>
            <div>
              <strong>Fichier:</strong><br>
              Nom: ${fileName}<br>
              Taille: ${originalContent ? Math.round(originalContent.length / 1024) + ' KB' : 'N/A'}<br>
              Encodage: UTF-8
            </div>
            <div>
              <strong>Métriques:</strong><br>
              Mots analysés: ${originalContent ? originalContent.split(' ').length : 'N/A'}<br>
              Temps d'analyse: ~30s<br>
              Précision: 94%
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 15px; margin-top: 30px;">
          <p style="font-size: 12px; color: #6b7280; margin: 0;">
            Rapport généré le ${analysisDate} par CV ATS Assistant<br>
            <span style="font-size: 10px; opacity: 0.7;">Analyse basée sur les standards ATS 2024 • Données confidentielles</span>
          </p>
        </div>
      </div>
    `;
  };

  // Générer les métadonnées dynamiques
  const documentLabel = documentType === 'cv' ? 'CV' : 'lettre de motivation';
  const scoreCategory = results.overallScore >= 85 ? 'Excellent' : results.overallScore >= 70 ? 'Bon' : 'À améliorer';
  const pageTitle = `Analyse ${documentLabel} - Score ATS ${results.overallScore}% | ${fileName}`;
  const pageDescription = `Analyse complète de votre ${documentLabel} avec un score ATS de ${results.overallScore}%. ${results.recommendations.length} recommandations personnalisées pour optimiser votre candidature.`;
  const keywords = [
    'analyse CV',
    'ATS',
    'optimisation CV',
    'score ATS',
    documentType === 'cv' ? 'curriculum vitae' : 'lettre de motivation',
    'recrutement',
    'candidature',
    'IA',
    'recommandations',
    ...results.keywords.found.slice(0, 5)
  ].join(', ');

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:site_name" content="CV ATS Assistant" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* Additional SEO meta tags */}
        <meta name="robots" content="noindex, nofollow" />
        <meta name="author" content="CV ATS Assistant" />
        <meta name="application-name" content="CV ATS Assistant" />
        <meta name="theme-color" content="#7c3aed" />
        
        {/* Structured data for better SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AnalysisReport",
            "name": pageTitle,
            "description": pageDescription,
            "author": {
              "@type": "Organization",
              "name": "CV ATS Assistant"
            },
            "dateCreated": new Date().toISOString(),
            "about": {
              "@type": "Document",
              "name": fileName,
              "category": documentType === 'cv' ? 'Resume' : 'CoverLetter'
            },
            "result": {
              "@type": "Rating",
              "ratingValue": results.overallScore,
              "bestRating": 100,
              "worstRating": 0,
              "description": `Score ATS de ${results.overallScore}% - ${scoreCategory}`
            }
          })}
        </script>
      </Helmet>
      
      <div className="space-y-8">
      {/* Overall Score Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/30">
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-blue-500 p-1.5">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(results.overallScore)}`}>
                    {results.overallScore}%
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Score ATS</div>
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">Analyse Complète - <span  className=" text-xl text-gray-600">{fileName}</span></h3>
          <p className="text-gray-500 mb-6">
            {documentType === 'cv' 
              ? 'Votre CV a été analysé par notre IA OpenAI avec des recommandations précises pour optimiser votre passage des filtres ATS'
              : 'Votre lettre de motivation a été analysée par notre IA OpenAI avec des recommandations pour maximiser son impact auprès des recruteurs'
            }
          </p>
          
          <div className="flex justify-center space-x-4">
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="bg-gray-50 border border-gray-600 text-gray-600 px-6 py-3 rounded-xl font-medium hover:bg-rose-100 transition-all duration-200 hover:scale-105 hover:border-rose-500 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exporter le rapport</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showExportMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  <button
                    onClick={exportReportHTML}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-t-xl flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                    <span>Exporter en HTML</span>
                  </button>
                  <button
                    onClick={exportReportPDF}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-b-xl flex items-center space-x-2 border-t border-gray-100"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                    <span>Exporter en PDF</span>
                  </button>
                </div>
              )}
            </div>
            
            {originalContent && onOptimize && (
              <button 
                onClick={onOptimize}
                disabled={isOptimizing}
                className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium  transition-all duration-200 hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Optimisation en cours...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    <span>Optimiser automatiquement</span>
                  </>
                )}
              </button>
            )}
            
            <button className="bg-white/70 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Réanalyser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(results.sections).map(([key, score]) => {
          const labels: Record<string, { title: string, description: string }> = {
            atsOptimization: {
              title: 'Optimisation ATS',
              description: 'Compatibilité avec les systèmes de tracking'
            },
            keywordMatch: {
              title: 'Correspondance Mots-clés',
              description: 'Présence des termes recherchés par les recruteurs'
            },
            structure: {
              title: 'Structure & Format',
              description: 'Organisation et présentation du contenu'
            },
            content: {
              title: 'Qualité du Contenu',
              description: 'Pertinence et impact des informations'
            }
          };
          
          return (
            <div key={key} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{labels[key].title}</h4>
                  <p className="text-sm text-gray-600">{labels[key].description}</p>
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(score as number)}`}>{score as number}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className={`h-3 bg-gradient-to-r ${getScoreGradient(score as number)} rounded-full transition-all duration-1000 relative overflow-hidden`}
                  style={{ width: `${score as number}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations and Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendations */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Recommandations IA</h4>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {results.recommendations.map((rec: string, index: number) => (
              <div key={index} className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 flex-1">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Points Forts</h4>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {results.strengths.map((strength: string, index: number) => (
              <div key={index} className="flex items-start space-x-2 p-2 rounded-lg hover:bg-emerald-50/30 transition-colors">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{strength}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">À Améliorer</h4>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {results.weaknesses.map((weakness: string, index: number) => (
              <div key={index} className="flex items-start space-x-2 p-2 rounded-lg hover:bg-amber-50/30 transition-colors">
                <XCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{weakness}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={onOptimize}
          disabled={isOptimizing}
          className="bg-gradient-to-br from-violet-500 to-pink-500 text-white p-6 rounded-2xl hover:from-violet-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Target className="w-8 h-8 mb-3" />
          <h4 className="font-semibold mb-2">Optimiser Automatiquement</h4>
          <p className="text-sm text-white/90">Laissez l'IA appliquer les améliorations</p>
        </button>

        <button className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 hover:scale-105 text-left">
          <Brain className="w-8 h-8 mb-3" />
          <h4 className="font-semibold mb-2">Coaching IA</h4>
          <p className="text-sm text-white/90">Obtenez des conseils personnalisés</p>
        </button>

        <button className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-6 rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 hover:scale-105 text-left">
          <Award className="w-8 h-8 mb-3" />
          <h4 className="font-semibold mb-2">Créer Version Optimisée</h4>
          <p className="text-sm text-white/90">Générer un nouveau {documentType === 'cv' ? 'CV' : 'lettre'} amélioré</p>
        </button>

        <button 
          onClick={() => onJobSearch?.(results.keywords.found)}
          className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 hover:scale-105 text-left"
        >
          <Briefcase className="w-8 h-8 mb-3" />
          <h4 className="font-semibold mb-2">Rechercher des Emplois</h4>
          <p className="text-sm text-white/90">Trouvez des offres correspondant à votre profil</p>
        </button>
      </div>

      {/* Advanced Scoring Section */}
      {showAdvanced && (
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Analyse Avancée ATS</h3>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              Premium
            </span>
          </div>
          <AdvancedATSScoring
            results={results}
            industry={industry}
            experienceLevel={experienceLevel}
            jobTitle={jobTitle}
          />
        </div>
      )}
    </div>
    </>
  );
};
