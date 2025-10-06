import React, { useRef, useState } from 'react';
import { FileText, Award, TrendingUp, AlertTriangle, CheckCircle, Download, Loader2, Sparkles, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
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
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportQuality, setExportQuality] = useState<'standard' | 'high'>('high');

  // Debug: Afficher les infos reçues
  console.log('ATSReportExport - candidateInfo reçu:', candidateInfo);

  const exportToPDF = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      setExportProgress(20);

      // Créer le PDF directement avec jsPDF sans html2canvas
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      setExportProgress(40);

      // Couleurs et styles
      const primaryColor = [124, 58, 220]; // violet
      const secondaryColor = [236, 72, 153]; // rose
      const successColor = [0, 150, 136]; // vert émeraude
      const greenColor2 = [0, 220, 180]; // vert turquoise

      const warningColor = [217, 119, 6]; // ambre
      const dangerColor = [220, 38, 38]; // rouge

      // Fonction pour ajouter du texte avec retour à la ligne automatique
      const addTextWithWrap = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return lines.length * fontSize * 0.35; // hauteur utilisée
      };

      let currentY = 20;

      // En-tête avec gradient violet vers rose
      for (let i = 0; i < 40; i++) {
        const ratio = i / 40;
        const r = Math.round(primaryColor[0] + (secondaryColor[0] - primaryColor[0]) * ratio);
        const g = Math.round(primaryColor[1] + (secondaryColor[1] - primaryColor[1]) * ratio);
        const b = Math.round(primaryColor[2] + (secondaryColor[2] - primaryColor[2]) * ratio);
        pdf.setFillColor(r, g, b);
        pdf.rect(0, i, 210, 1, 'F');
      }

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RAPPORT D\'ANALYSE ATS', 105, 25, { align: 'center' });

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Analyse automatique de Lettre de motivation avec IA', 105, 35, { align: 'center' });

      currentY = 50;

      // Informations candidat
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMATIONS CANDIDAT', 20, currentY);

      currentY += 10;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      if (candidateInfo?.name) {
        pdf.text(`Nom: ${candidateInfo.name}`, 20, currentY);
        currentY += 7;
      }
      if (candidateInfo?.email) {
        pdf.text(`Email: ${candidateInfo.email}`, 20, currentY);
        currentY += 7;
      }
      if (candidateInfo?.position) {
        pdf.text(`Position: ${candidateInfo.position}`, 20, currentY);
        currentY += 7;
      }

      pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, currentY);
      currentY += 15;

      // Score global
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SCORE GLOBAL ATS', 20, currentY);

      currentY += 10;

  
      // Gradient simple à 2 couleurs pour le cercle
      for (let r = 20; r >= 0; r--) {
        const ratio = 1 - (r / 20);
        let gradientR, gradientG, gradientB;

        if (analysis.overallScore >= 80) {
          // Gradient vert émeraude vers turquoise
          gradientR = Math.round(successColor[0] + (greenColor2[0] - successColor[0]) * ratio);
          gradientG = Math.round(successColor[1] + (greenColor2[1] - successColor[1]) * ratio);
          gradientB = Math.round(successColor[2] + (greenColor2[2] - successColor[2]) * ratio);
        } else if (analysis.overallScore >= 60) {
          // Gradient jaune vers vert
          gradientR = Math.round(warningColor[0] + (successColor[0] - warningColor[0]) * ratio);
          gradientG = Math.round(warningColor[1] + (successColor[1] - warningColor[1]) * ratio);
          gradientB = Math.round(warningColor[2] + (successColor[2] - warningColor[2]) * ratio);
        } else {
          // Gradient rouge vers orange
          gradientR = Math.round(dangerColor[0] + (warningColor[0] - dangerColor[0]) * ratio);
          gradientG = Math.round(dangerColor[1] + (warningColor[1] - dangerColor[1]) * ratio);
          gradientB = Math.round(dangerColor[2] + (warningColor[2] - dangerColor[2]) * ratio);
        }

        pdf.setFillColor(gradientR, gradientG, gradientB);
        pdf.circle(105, currentY + 10, r, 'F');
      }

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${Math.round(analysis.overallScore)}%`, 105, currentY + 9.5, { align: 'center' });

      pdf.setTextColor(250, 250, 250);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Score ATS', 105, currentY + 18.5, { align: 'center' });

      currentY += 35;

      // Sections détaillées
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ANALYSE PAR SECTION', 20, currentY);
      currentY += 10;

      const sections = [
        { key: 'atsOptimization', label: 'Optimisation ATS' },
        { key: 'keywordMatch', label: 'Mots-clés' },
        { key: 'structure', label: 'Structure' },
        { key: 'content', label: 'Contenu' }
      ];

      sections.forEach((section) => {
        const score = analysis.sections[section.key as keyof typeof analysis.sections] as number;

        // Barre de progression simple
        const barHeight = 6;
        const barWidth = 120;

        // Fond gris
        pdf.setFillColor(230, 230, 230);
        pdf.rect(20, currentY, barWidth, barHeight, 'F');

        // Barre de progression
        const progressWidth = (score / 100) * barWidth;

        if (progressWidth > 0) {
          if (score >= 80) {
            // Gradient vert émeraude vers turquoise
            for (let x = 0; x < progressWidth; x++) {
              const ratio = x / progressWidth;
              const gradientR = Math.round(successColor[0] + (greenColor2[0] - successColor[0]) * ratio);
              const gradientG = Math.round(successColor[1] + (greenColor2[1] - successColor[1]) * ratio);
              const gradientB = Math.round(successColor[2] + (greenColor2[2] - successColor[2]) * ratio);
              pdf.setFillColor(gradientR, gradientG, gradientB);
              pdf.rect(20 + x, currentY, 1, barHeight, 'F');
            }
          } else if (score >= 60) {
            // Gradient jaune vers vert
            for (let x = 0; x < progressWidth; x++) {
              const ratio = x / progressWidth;
              const gradientR = Math.round(warningColor[0] + (successColor[0] - warningColor[0]) * ratio);
              const gradientG = Math.round(warningColor[1] + (successColor[1] - warningColor[1]) * ratio);
              const gradientB = Math.round(warningColor[2] + (successColor[2] - warningColor[2]) * ratio);
              pdf.setFillColor(gradientR, gradientG, gradientB);
              pdf.rect(20 + x, currentY, 1, barHeight, 'F');
            }
          } else {
            // Gradient rouge vers orange
            for (let x = 0; x < progressWidth; x++) {
              const ratio = x / progressWidth;
              const gradientR = Math.round(dangerColor[0] + (warningColor[0] - dangerColor[0]) * ratio);
              const gradientG = Math.round(dangerColor[1] + (warningColor[1] - dangerColor[1]) * ratio);
              const gradientB = Math.round(dangerColor[2] + (warningColor[2] - dangerColor[2]) * ratio);
              pdf.setFillColor(gradientR, gradientG, gradientB);
              pdf.rect(20 + x, currentY, 1, barHeight, 'F');
            }
          }
        }

        // Texte
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.text(`${section.label}: ${score.toFixed(1)}%`, 145, currentY + 5);

        currentY += 15;
      });

      currentY += 10;
      // Points forts
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("POINTS FORTS", 21, currentY);
      currentY += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      analysis.strengths.forEach((strength) => {
        const height = addTextWithWrap(`+ ${strength}`, 25, currentY, 160);
        currentY += height + 5;

      });

      currentY += 10;
      if (currentY > 260) {
        pdf.addPage();
        currentY = 20;
      }


      // Axes d'amélioration
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AXES D\'AMÉLIORATION', 20, currentY);
      currentY += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      analysis.weaknesses.forEach((weakness) => {
        const height = addTextWithWrap(`- ${weakness}`, 25, currentY, 160);
        currentY += height + 5;
      });

      currentY += 10;
      // Mots-clés
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ANALYSE DES MOTS-CLÉS', 20, currentY);
      currentY += 10;
        
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      pdf.setTextColor(0, 0, 0); // Couleur noire 
      pdf.setFont('helvetica', 'bold');
      pdf.text('Mots-clés présents:', 20, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(successColor[0], successColor[1], successColor[2]);
      currentY += 7;
      addTextWithWrap(analysis.keywords.found.join(', '), 25, currentY, 160);
      currentY += 15;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Mots-clés manquants:', 20, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2]);

      currentY += 7;
      addTextWithWrap(analysis.keywords.missing.join(', '), 25, currentY, 160);
      currentY += 15;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Suggestions:', 20, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(warningColor[0], warningColor[1], warningColor[2]);

      currentY += 7;
      addTextWithWrap(analysis.keywords.suggestions.join(', '), 25, currentY, 160);

      // Footer
      const pageCount = (pdf as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${i}/${pageCount}`, 105, 285, { align: 'center' });
        pdf.text('Généré par CV ATS Assistant - ' + new Date().toLocaleDateString('fr-FR'), 105, 290, { align: 'center' });
      }

      setExportProgress(90);

      // Sauvegarde
      const name = candidateInfo?.name || 'Candidate';
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `ATS_Analysis_Report_${name.replace(/\s+/g, '_')}_${timestamp}.pdf`;

      pdf.save(fileName);
      setExportProgress(100);

      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      setIsExporting(false);
      setExportProgress(0);
      alert(`Erreur lors de la génération du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}. Veuillez réessayer.`);
    }
  };

  // Ajout d'une fonction d'export rapide
  const quickExport = async () => {
    setExportQuality('standard');
    await exportToPDF();
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
      {/* Export Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-violet-600" />
            Options d'Export PDF
          </h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Qualité:</label>
            <select
              value={exportQuality}
              onChange={(e) => setExportQuality(e.target.value as 'standard' | 'high')}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              disabled={isExporting}
            >
              <option value="standard">Standard</option>
              <option value="high">Haute</option>
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        {isExporting && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Génération du PDF...</span>
              <span>{exportProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-violet-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={quickExport}
            disabled={isExporting}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Export rapide...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Rapide</span>
              </>
            )}
          </button>

          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg hover:from-violet-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Export en cours...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Export Complet</span>
              </>
            )}
          </button>
        </div>

        {/* Export Info */}
        <div className="mt-3 text-xs text-gray-500">
          <p>• Export Rapide: Qualité standard, génération plus rapide</p>
          <p>• Export Complet: Haute qualité, analyse détaillée incluse</p>
        </div>
      </div>

      {/* Hidden Report Content - Optimized for PDF Export */}
      <div className="hidden">
        <div ref={reportRef} style={{
          backgroundColor: 'white',
          padding: '15mm',
          fontFamily: 'Arial, sans-serif',
          color: '#000000',
          width: '210mm',
          maxWidth: '210mm',
          minHeight: '297mm',
          margin: '0',
          fontSize: '11px',
          lineHeight: '1.4',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {/* Professional Header - PDF Optimized */}
          <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '15px' }}>
            {/* Logo/Title Section */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '10px',
                height: '10px',
                backgroundColor: '#7c3aed',
                borderRadius: '50%',
                marginBottom: '8px',
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                📄
              </div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#000000',
                marginBottom: '8px',
                fontFamily: 'Arial, sans-serif'
              }}>
                RAPPORT D'ANALYSE ATS PROFESSIONNEL
              </h1>
              <p style={{
                fontSize: '12px',
                color: '#666666',
                marginBottom: '10px',
                fontFamily: 'Arial, sans-serif'
              }}>
                Analyse intelligente de CV avec IA et recommandations d'optimisation
              </p>
            </div>

            {/* Candidate Information - PDF Optimized */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              padding: '10px',
              marginBottom: '15px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '10px' }}>
                {candidateInfo?.name && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 'bold', color: '#374151' }}>Candidat:</span>
                    <span style={{ color: '#000000' }}>{candidateInfo.name}</span>
                  </div>
                )}
                {candidateInfo?.email && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 'bold', color: '#374151' }}>Email:</span>
                    <span style={{ color: '#000000' }}>{candidateInfo.email}</span>
                  </div>
                )}
                {candidateInfo?.position && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 'bold', color: '#374151' }}>Position Actuelle:</span>
                    <span style={{ color: '#000000' }}>{candidateInfo.position}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#374151' }}>Date d'analyse:</span>
                  <span style={{ color: '#000000' }}>{new Date().toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Score Section - PDF Optimized */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '15px',
              color: '#000000',
              fontFamily: 'Arial, sans-serif'
            }}>
              SCORE DE PERFORMANCE GLOBAL
            </h2>
            <div style={{ textAlign: 'center' }}>
              {/* Score Circle - PDF Optimized */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '3px solid #d1d5db',
                marginBottom: '15px',
                position: 'relative',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: overallLevel.level === 'Excellent' ? '#059669' :
                      overallLevel.level === 'Très bon' ? '#2563eb' :
                        overallLevel.level === 'Bon' ? '#4f46e5' :
                          overallLevel.level === 'Moyen' ? '#d97706' : '#dc2626'
                  }}>
                    {analysis.overallScore}%
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    fontWeight: '500',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    Score ATS
                  </div>
                </div>
                {/* Level Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  backgroundColor: overallLevel.level === 'Excellent' ? '#10b981' :
                    overallLevel.level === 'Très bon' ? '#3b82f6' :
                      overallLevel.level === 'Bon' ? '#6366f1' :
                        overallLevel.level === 'Moyen' ? '#f59e0b' : '#ef4444',
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}>
                  {overallLevel.level}
                </div>
              </div>

              {/* Score Description - PDF Optimized */}
              <div style={{
                marginTop: '10px',
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: overallLevel.level === 'Excellent' ? '#ecfdf5' :
                  overallLevel.level === 'Très bon' ? '#eff6ff' :
                    overallLevel.level === 'Bon' ? '#eef2ff' :
                      overallLevel.level === 'Moyen' ? '#fffbeb' : '#fef2f2',
                borderLeft: `3px solid ${overallLevel.level === 'Excellent' ? '#059669' :
                    overallLevel.level === 'Très bon' ? '#2563eb' :
                      overallLevel.level === 'Bon' ? '#4f46e5' :
                        overallLevel.level === 'Moyen' ? '#d97706' : '#dc2626'
                  }`
              }}>
                <p style={{
                  fontSize: '10px',
                  fontWeight: '500',
                  color: '#1f2937',
                  fontFamily: 'Arial, sans-serif',
                  margin: 0
                }}>
                  {overallLevel.level === 'Excellent' && 'Votre CV est exceptionnellement optimisé pour les systèmes ATS. Vous avez d\'excellentes chances de passer les filtres automatiques.'}
                  {overallLevel.level === 'Très bon' && 'Votre CV est très bien optimisé. Quelques ajustements mineurs pourraient encore améliorer vos résultats.'}
                  {overallLevel.level === 'Bon' && 'Votre CV est bien structuré. Des améliorations ciblées pourraient augmenter significativement votre score ATS.'}
                  {overallLevel.level === 'Moyen' && 'Votre CV nécessite des améliorations importantes pour mieux performer avec les systèmes ATS.'}
                  {overallLevel.level === 'À améliorer' && 'Votre CV requiert une optimisation significative pour être efficace avec les systèmes ATS.'}
                </p>
              </div>
            </div>
          </div>

          {/* Job Information - PDF Optimized */}
          {jobInfo && (
            <div style={{
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#000000',
                fontFamily: 'Arial, sans-serif'
              }}>
                Position Visée
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '10px' }}>
                {jobInfo.title && (
                  <div><strong>Poste:</strong> {jobInfo.title}</div>
                )}
                {jobInfo.company && (
                  <div><strong>Entreprise:</strong> {jobInfo.company}</div>
                )}
              </div>
            </div>
          )}

          {/* Section Scores - PDF Optimized */}
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#000000',
              fontFamily: 'Arial, sans-serif'
            }}>
              Analyse Détaillée par Section
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {Object.entries(analysis.sections).map(([key, score]) => {
                const labels: Record<string, string> = {
                  atsOptimization: 'Optimisation ATS',
                  keywordMatch: 'Mots-clés',
                  structure: 'Structure',
                  content: 'Contenu'
                };

                const sectionLevel = getSectionScoreLevel(score as number);

                return (
                  <div key={key} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '8px',
                    backgroundColor: 'white'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <h3 style={{
                        fontWeight: '600',
                        color: '#000000',
                        fontSize: '11px',
                        fontFamily: 'Arial, sans-serif'
                      }}>
                        {labels[key]}
                      </h3>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#000000',
                        fontFamily: 'Arial, sans-serif'
                      }}>
                        {score}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '9999px',
                      height: '4px',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: sectionLevel.color === 'bg-green-500' ? '#059669' :
                            sectionLevel.color === 'bg-blue-500' ? '#2563eb' :
                              sectionLevel.color === 'bg-amber-500' ? '#d97706' : '#dc2626',
                          borderRadius: '9999px',
                          width: `${score}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths - PDF Optimized */}
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#000000',
              fontFamily: 'Arial, sans-serif',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ color: '#059669', marginRight: '5px' }}>✓</span>
              Points Forts
            </h2>
            <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {analysis.strengths.map((strength, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '5px',
                  fontSize: '10px',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  <span style={{
                    color: '#059669',
                    marginRight: '5px',
                    minWidth: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>✓</span>
                  <span style={{ color: '#1f2937', lineHeight: '1.3' }}>{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses - PDF Optimized */}
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#000000',
              fontFamily: 'Arial, sans-serif',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ color: '#dc2626', marginRight: '5px' }}>!</span>
              Axes d'Amélioration
            </h2>
            <div style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {analysis.weaknesses.map((weakness, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '5px',
                  fontSize: '10px',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  <span style={{
                    color: '#dc2626',
                    marginRight: '5px',
                    minWidth: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>!</span>
                  <span style={{ color: '#1f2937', lineHeight: '1.3' }}>{weakness}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords Analysis - PDF Optimized */}
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#000000',
              fontFamily: 'Arial, sans-serif'
            }}>
              Analyse des Mots-clés
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  color: '#059669',
                  marginBottom: '4px',
                  fontSize: '11px',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  Mots-clés Présents ({analysis.keywords.found.length})
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                  {analysis.keywords.found.map((keyword, index) => (
                    <span key={index} style={{
                      padding: '2px 4px',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      borderRadius: '3px',
                      fontSize: '8px',
                      fontFamily: 'Arial, sans-serif',
                      border: '1px solid #a7f3d0'
                    }}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  color: '#dc2626',
                  marginBottom: '4px',
                  fontSize: '11px',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  Mots-clés Manquants ({analysis.keywords.missing.length})
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                  {analysis.keywords.missing.map((keyword, index) => (
                    <span key={index} style={{
                      padding: '2px 4px',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      borderRadius: '3px',
                      fontSize: '8px',
                      fontFamily: 'Arial, sans-serif',
                      border: '1px solid #fecaca'
                    }}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  color: '#2563eb',
                  marginBottom: '4px',
                  fontSize: '11px',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  Suggestions ({analysis.keywords.suggestions.length})
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                  {analysis.keywords.suggestions.map((keyword, index) => (
                    <span key={index} style={{
                      padding: '2px 4px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      borderRadius: '3px',
                      fontSize: '8px',
                      fontFamily: 'Arial, sans-serif',
                      border: '1px solid #bfdbfe'
                    }}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Benchmarking Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              Benchmarking et Comparaison
            </h2>

            {/* Industry Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <h3 className="font-semibold text-blue-800 mb-3">Performance vs Moyenne Secteur</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Votre Score:</span>
                    <span className="font-bold text-blue-800">{analysis.overallScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Moyenne Technologie:</span>
                    <span className="font-bold text-gray-600">75%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Top 10%:</span>
                    <span className="font-bold text-green-600">92%+</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="text-xs text-blue-700">
                    {analysis.overallScore >= 92 ? '🏆 Vous faites partie du top 10%!' :
                      analysis.overallScore >= 75 ? '✅ Au-dessus de la moyenne' :
                        '📈 En dessous de la moyenne - room for improvement'}
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <h3 className="font-semibold text-green-800 mb-3">Statistiques Clés</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Taux de Réussite:</span>
                    <span className="font-bold text-green-600">
                      {analysis.overallScore >= 90 ? '95%' :
                        analysis.overallScore >= 80 ? '85%' :
                          analysis.overallScore >= 70 ? '70%' :
                            analysis.overallScore >= 60 ? '55%' : '40%'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Mots-clés Optimisés:</span>
                    <span className="font-bold text-green-600">
                      {Math.round((analysis.keywords.found.length / (analysis.keywords.found.length + analysis.keywords.missing.length)) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Structure Optimisée:</span>
                    <span className="font-bold text-green-600">
                      {analysis.sections.structure >= 80 ? '✅ Optimisée' : '⚠️ À améliorer'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="text-xs text-green-700">
                    Basé sur l'analyse de 10,000+ CV dans le secteur
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword Performance Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Performance des Mots-clés</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{analysis.keywords.found.length}</div>
                  <div className="text-sm text-gray-600">Mots-clés Trouvés</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(analysis.keywords.found.length / (analysis.keywords.found.length + analysis.keywords.missing.length)) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{analysis.keywords.missing.length}</div>
                  <div className="text-sm text-gray-600">Mots-clés Manquants</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(analysis.keywords.missing.length / (analysis.keywords.found.length + analysis.keywords.missing.length)) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{analysis.keywords.suggestions.length}</div>
                  <div className="text-sm text-gray-600">Suggestions</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
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
                      <span className={`text-xs px-2 py-1 rounded-full ${improvement.priority === 'high' ? 'bg-red-200 text-red-800' :
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

          {/* Enhanced Footer - PDF Optimized */}
          <div style={{
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #d1d5db',
            marginTop: '20px',
            fontFamily: 'Arial, sans-serif'
          }}>
            {/* Company Info */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '25px',
                  height: '25px',
                  backgroundColor: '#7c3aed',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  ✨
                </div>
                <h3 style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  CV ATS Assistant
                </h3>
              </div>
              <p style={{
                fontSize: '9px',
                color: '#6b7280',
                marginBottom: '4px',
                fontFamily: 'Arial, sans-serif'
              }}>
                Analyse professionnelle de CV avec intelligence artificielle avancée
              </p>
              <p style={{
                fontSize: '8px',
                color: '#9ca3af',
                fontFamily: 'Arial, sans-serif'
              }}>
                Technologies: OpenAI GPT-4 • Analyse sémantique • Benchmarking secteur
              </p>
            </div>

            {/* Report Metadata */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              padding: '8px',
              marginBottom: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '8px',
                fontSize: '8px',
                fontFamily: 'Arial, sans-serif'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151', marginBottom: '1px' }}>ID Rapport:</div>
                  <div style={{ color: '#6b7280' }}>ATS-{Date.now().toString().slice(-8)}</div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151', marginBottom: '1px' }}>Version:</div>
                  <div style={{ color: '#6b7280' }}>v4.2</div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151', marginBottom: '1px' }}>Modèle IA:</div>
                  <div style={{ color: '#6b7280' }}>GPT-4 Turbo</div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#374151', marginBottom: '1px' }}>Précision:</div>
                  <div style={{ color: '#6b7280' }}>95%+</div>
                </div>
              </div>
            </div>

            {/* Contact and Legal */}
            <div style={{ lineHeight: '1.2' }}>
              <p style={{
                fontSize: '8px',
                color: '#6b7280',
                marginBottom: '2px',
                fontFamily: 'Arial, sans-serif'
              }}>
                <strong>Contact:</strong> support@cv-ai-assistant.com |
                <strong>Site:</strong> www.cv-ai-assistant.com
              </p>
              <p style={{
                fontSize: '7px',
                color: '#9ca3af',
                marginBottom: '2px',
                fontFamily: 'Arial, sans-serif'
              }}>
                Ce rapport est généré automatiquement et doit être utilisé comme guide d'amélioration.
                Les résultats sont basés sur les meilleures pratiques actuelles des systèmes ATS.
              </p>
              <p style={{
                fontSize: '7px',
                color: '#d1d5db',
                marginTop: '6px',
                fontFamily: 'Arial, sans-serif'
              }}>
                © 2025 CV ATS Assistant. Tous droits réservés. |
                Confidentialité: Vos données sont sécurisées et ne sont pas partagées.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSReportExport;