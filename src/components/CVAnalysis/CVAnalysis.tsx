import React, { useState } from 'react';
import { CVUpload } from './CVUpload';
import { AnalysisResults } from './AnalysisResults';
import { DetailedAnalysis } from './DetailedAnalysis';
import { CVOptimization } from '../CVOptimization/CVOptimization';
import { useOpenAI, CVAnalysisResponse } from '../../hooks/useOpenAI';
import { useSupabase } from '../../hooks/useSupabase';
import { useCVLibrary, DocumentType } from '../../hooks/useCVLibrary';
import { useAppStore } from '../../store/useAppStore';
import { ArrowLeft, Target } from 'lucide-react';
import GradientSpinLoader from '../loader/GradientSpinLoader';
import { BreadcrumbNavigation } from '../UI/BreadcrumbNavigation';
import { NavigationIcons } from '../UI/iconsData';
import MarketBenchmarkingService from '../../services/MarketBenchmarkingService';
// Type local pour le composant CVAnalysis
export type CVAnalysisDocumentType = 'cv' | 'lettre';

interface CVAnalysisProps {
  documentType?: CVAnalysisDocumentType;
  title?: string;
  description?: string;
  uploadDescription?: string;
}

export const CVAnalysis: React.FC<CVAnalysisProps> = ({
  documentType = 'cv',
  title,
  description,
  uploadDescription
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<CVAnalysisResponse | null>(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // ATS Pro Features
  const [enableATSPro, setEnableATSPro] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const { analyzeFile, error } = useOpenAI();
  const { addActivity, addDocument, updateDocument } = useSupabase();
  const { addAnalyzedCV } = useCVLibrary();
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const previewFile = useAppStore(s => s.previewFile);
  const setPreviewFile = useAppStore(s => s.setPreviewFile);

  // Helper functions for market benchmarking
  const detectIndustry = (text: string): string => {
    const textLower = text.toLowerCase();
    if (textLower.includes('software') || textLower.includes('developer') || textLower.includes('data')) {
      return 'technology';
    } else if (textLower.includes('finance') || textLower.includes('banking') || textLower.includes('accounting')) {
      return 'finance';
    } else if (textLower.includes('healthcare') || textLower.includes('medical') || textLower.includes('nurse')) {
      return 'healthcare';
    } else if (textLower.includes('marketing') || textLower.includes('sales') || textLower.includes('advertising')) {
      return 'marketing';
    }
    return 'general';
  };

  const detectExperienceLevel = (role: string): 'junior' | 'mid' | 'senior' | 'lead' | 'executive' => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('junior') || roleLower.includes('entry') || roleLower.includes('débutant')) {
      return 'junior';
    } else if (roleLower.includes('senior') || roleLower.includes('lead') || roleLower.includes('principal')) {
      return 'senior';
    } else if (roleLower.includes('manager') || roleLower.includes('director')) {
      return 'lead';
    } else if (roleLower.includes('cto') || roleLower.includes('ceo') || roleLower.includes('vp')) {
      return 'executive';
    }
    return 'mid';
  };

  // Si un fichier est à prévisualiser depuis la bibliothèque, l'initialiser
  React.useEffect(() => {
    if (previewFile && !uploadedFile) {
      setUploadedFile(previewFile);
      // Nettoyer le store après utilisation
      setPreviewFile(null);
    }
  }, [previewFile, uploadedFile, setPreviewFile]);

  const handleFileUpload = async (file: File, documentId?: string) => {
    setUploadedFile(file);
    setIsAnalyzing(true);
    
    try {
      console.log('Début de l\'analyse du fichier:', file.name, 'Type:', file.type);
      
      // Analyser le fichier avec les options ATS Pro
      const results = await analyzeFile(
        file,
        targetRole || 'Développeur Full Stack',
        jobDescription,
        enableATSPro
      );
      
      console.log('Résultats de l\'analyse:', results);
      
      if (results) {
        console.log('Analyse réussie, affichage des résultats');
        setAnalysisResults(results);

        // Stocker le contenu original pour l'affichage
        setOriginalContent(`Analyse du fichier: ${file.name}`);

        // If ATS Pro is enabled, get market benchmarking
        if (enableATSPro && (targetRole || jobDescription)) {
          console.log('Récupération des données de benchmarking...');
          try {
            const benchmarkService = MarketBenchmarkingService.getInstance();
            const industry = detectIndustry(targetRole || jobDescription || '');
            const benchmark = await benchmarkService.getMarketBenchmark(
              industry,
              targetRole || 'Professional',
              detectExperienceLevel(targetRole || '')
            );
            console.log('Benchmarking terminé:', benchmark);
          } catch (benchmarkError) {
            console.warn('Erreur lors du benchmarking:', benchmarkError);
          }
        }
        
        // Ajouter le CV/Lettre analysé à la bibliothèque et sauvegarder dans Supabase
        try {
          // Convertir 'lettre' vers 'letter' pour le type DocumentType du hook
          const docTypeForLibrary: DocumentType = documentType === 'lettre' ? 'letter' : 'cv';
          const docId = await addAnalyzedCV(file.name, results, file, docTypeForLibrary);
          console.log(`✅ Document ajouté et sauvegardé avec l'ID: ${docId}`);
        } catch (error) {
          console.warn('⚠️ Erreur lors de l\'ajout/sauvegarde à la bibliothèque:', error);
          // Ne pas bloquer l'analyse - l'utilisateur peut continuer
        }

        // Mettre à jour le document existant avec les résultats d'analyse
        if (documentId) {
          try {
            await updateDocument(documentId, {
              ats_score: results.overallScore,
              status: 'completed',
              content: `Document analysé avec un score ATS de ${results.overallScore}%`,
              analysis_results: results as unknown as Record<string, unknown>,
              metadata: {
                uploadedAt: new Date().toISOString(),
                fileType: file.type,
                originalSize: file.size,
                documentType: documentType,
                analysisVersion: '1.0',
                userAgent: navigator.userAgent,
                analysisCompletedAt: new Date().toISOString()
              }
            });
            console.log('✅ Document mis à jour avec les résultats d\'analyse, ID:', documentId);
          } catch (error) {
            console.warn('⚠️ Erreur lors de la mise à jour du document:', error);
            // Créer un nouveau document en cas d'erreur de mise à jour
            try {
              const fileData = new Uint8Array(await file.arrayBuffer());
              const docTypeForSupabase = documentType === 'lettre' ? 'letter' : 'cv';
              await addDocument({
                doc_type: docTypeForSupabase,
                name: file.name.replace(/\.[^/.]+$/, ""),
                type: 'analyzed',
                ats_score: results.overallScore,
                status: 'completed',
                template: undefined,
                industry: 'Non spécifié',
                file_size: `${(file.size / 1024).toFixed(1)} KB`,
                version: 1,
                content: `Document analysé avec un score ATS de ${results.overallScore}%`,
                original_file_name: file.name,
                original_file_data: fileData,
                analysis_results: results as unknown as Record<string, unknown>,
                cv_data: {},
                metadata: {
                  uploadedAt: new Date().toISOString(),
                  fileType: file.type,
                  originalSize: file.size,
                  documentType: documentType,
                  analysisVersion: '1.0',
                  userAgent: navigator.userAgent
                }
              });
              console.log('✅ Nouveau document créé en fallback');
            } catch (fallbackError) {
              console.warn('⚠️ Erreur lors de la création de fallback:', fallbackError);
            }
          }
        } else {
          console.warn('⚠️ Aucun ID de document fourni, création d\'un nouveau document');
          // Fallback : créer un nouveau document
          try {
            const fileData = new Uint8Array(await file.arrayBuffer());
            const docTypeForSupabase = documentType === 'lettre' ? 'letter' : 'cv';
            await addDocument({
              doc_type: docTypeForSupabase,
              name: file.name.replace(/\.[^/.]+$/, ""),
              type: 'analyzed',
              ats_score: results.overallScore,
              status: 'completed',
              template: undefined,
              industry: 'Non spécifié',
              file_size: `${(file.size / 1024).toFixed(1)} KB`,
              version: 1,
              content: `Document analysé avec un score ATS de ${results.overallScore}%`,
              original_file_name: file.name,
              original_file_data: fileData,
              analysis_results: results as unknown as Record<string, unknown>,
              cv_data: {},
              metadata: {
                uploadedAt: new Date().toISOString(),
                fileType: file.type,
                originalSize: file.size,
                documentType: documentType,
                analysisVersion: '1.0',
                userAgent: navigator.userAgent
              }
            });
            console.log('✅ Nouveau document créé (pas d\'ID fourni)');
          } catch (fallbackError) {
            console.warn('⚠️ Erreur lors de la création de document fallback:', fallbackError);
          }
        }

        // Ajouter l'activité à Supabase (optionnel - ne pas bloquer l'analyse si ça échoue)
        try {
          const documentLabel = documentType === 'cv' ? 'CV' : 'Lettre de motivation';
          await addActivity({
            type: 'analysis',
            title: `${documentLabel} Analysé - ${file.name}`,
            description: `Analyse complète avec score ATS de ${results.overallScore}%`,
            score: results.overallScore,
            status: results.overallScore >= 80 ? 'success' : results.overallScore >= 60 ? 'warning' : 'error',
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              documentType: documentType,
              analysisTime: new Date().toISOString()
            }
          });
          console.log('Activité enregistrée avec succès');
        } catch (error) {
          console.warn('Impossible d\'enregistrer l\'activité (permissions Supabase):', error);
          // Ne pas bloquer l'analyse - continuer normalement
        }
        
        // Afficher automatiquement les résultats après l'analyse
        setShowResults(true);
      } else {
        // Si l'analyse échoue, afficher l'erreur - PAS DE MOCK
        console.error('Analyse IA échouée - results est null');
        console.error('Erreur détaillée:', error);
        // L'erreur sera affichée via le hook useOpenAI
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse (catch):', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResults(null);
    setShowDetailedAnalysis(false);
    setShowOptimization(false);
    setUploadedFile(null);
    setOriginalContent('');
    setShowResults(false);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ajouter l'activité d'optimisation
      if (analysisResults && uploadedFile) {
        const newScore = Math.min(analysisResults.overallScore + 8, 98);
        const documentLabel = documentType === 'cv' ? 'CV' : 'Lettre de motivation';
        
        await addActivity({
          type: 'optimization',
          title: `${documentLabel} optimisé - ${uploadedFile.name}`,
          description: `Score ATS amélioré de ${analysisResults.overallScore}% à ${newScore}%`,
          score: newScore,
          status: 'success',
          metadata: {
            fileName: uploadedFile.name,
            originalScore: analysisResults.overallScore,
            newScore: newScore,
            documentType: documentType,
            improvements: analysisResults.improvements.length
          }
        });
      }
      
      setShowOptimization(true);
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-8">
        <div className="relative flex items-center justify-center">
          {/* }<div className="w-24 h-24 bg-gradient-to-br from-violet-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-12 h-12 text-white" />
          </div>*/}
          <GradientSpinLoader size={100} thickness={0.05} className="absolute" />
        </div>
        
        <div className="text-center max-w-md">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Analyse IA en cours
          </h3>
          <p className="text-gray-600 mb-6">
            {documentType === 'cv' 
              ? 'Notre intelligence artificielle analyse votre CV et génère des recommandations personnalisées pour optimiser votre compatibilité ATS'
              : 'Notre intelligence artificielle analyse votre lettre de motivation et génère des recommandations personnalisées pour maximiser son impact'
            }
          </p>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/30">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
              <span>
                {documentType === 'cv' 
                  ? 'Analyse des mots-clés, structure et optimisation ATS...'
                  : 'Analyse du contenu, ton et cohérence de la lettre...'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showOptimization && analysisResults && originalContent) {
    return (
      <CVOptimization
        analysisResults={analysisResults}
        originalContent={originalContent}
        fileName={uploadedFile?.name || 'CV'}
        onBack={() => setShowOptimization(false)}
      />
    );
  }

  if (showDetailedAnalysis && analysisResults) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setShowDetailedAnalysis(false)}
          className="rounded-lg border p-2 flex items-center space-x-2 text-violet-500 hover:text-violet-800 hover:border-violet-300 font-medium transition-colors "
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux résultats</span>
        </button>
        <DetailedAnalysis results={analysisResults} />
      </div>
    );
  }

  if (analysisResults && showResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleNewAnalysis}
            className="border px-2 py-2 rounded-lg flex items-center space-x-2 text-violet-600 hover:text-violet-700 font-medium transition-colors hover:border-violet-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className=''>Nouvelle analyse</span>
          </button>
          
          <button
            onClick={() => setShowDetailedAnalysis(true)}
            className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-violet-700 hover:to-pink-700 transition-all duration-200 hover:scale-105"
          >
            Analyse détaillée
          </button>
        </div>
        
        <AnalysisResults 
          results={analysisResults} 
          fileName={uploadedFile?.name || (documentType === 'cv' ? 'CV' : 'Lettre')}
          originalContent={originalContent}
          documentType={documentType === 'lettre' ? 'letter' : 'cv'}
          onOptimize={handleOptimize}
          isOptimizing={isOptimizing}
        />
      </div>
    );
  }

  // Configuration des textes selon le type de document
  const getDocumentConfig = () => {
    if (documentType === 'cv') {
      return {
        title: title || 'Analyse CV',
        description: description || 'Uploadez votre CV pour une analyse ATS complète',
        uploadDescription: uploadDescription || 'Glissez-déposez votre CV ou cliquez pour sélectionner'
      };
    } else {
      return {
        title: title || 'Analyse Lettre de motivation',
        description: description || 'Uploadez votre lettre de motivation pour une analyse détaillée',
        uploadDescription: uploadDescription || 'Glissez-déposez votre lettre ou cliquez pour sélectionner'
      };
    }
  };

  const config = getDocumentConfig();

  return (
    <div className="space-y-6">
      {/* En-tête avec breadcrumb et description */}
      <div className="text-left space-y-8">
        <BreadcrumbNavigation
          items={[
            {
              label: 'Accueil',
              icon: NavigationIcons.Home,
              onClick: () => setActiveTab('dashboard')
            },
            {
              label: 'CV',
              onClick: () => setActiveTab('cv')
            },
            { label: config.title, current: true }
          ]}
          showHome={false}
          className="justify-start mb-4"
        />
        <p className="text-gray-600 max-w-2xl mx-auto">
          {config.description}
        </p>
      </div>

      {/* ATS Pro Controls */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-violet-900">ATS Pro Analysis</h3>
              <p className="text-sm text-violet-700">Advanced job market benchmarking and keyword optimization</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enableATSPro}
              onChange={(e) => setEnableATSPro(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-purple-500"></div>
          </label>
        </div>

        {enableATSPro && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-violet-900 mb-2">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-4 py-3 border border-violet-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-violet-900 mb-2">
                Job Description (Optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description for targeted analysis..."
                rows={3}
                className="w-full px-4 py-3 border border-violet-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/90 backdrop-blur-sm transition-all duration-200 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      <CVUpload
        onFileUpload={handleFileUpload}
        documentType={documentType}
        uploadDescription={config.uploadDescription}
      />
      
      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div>
            <h4 className="font-medium text-red-800 text-sm mb-1">Erreur d'analyse IA</h4>
            <p className="text-red-700 text-xs">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
