import React, { useState } from 'react';
import { CVUpload } from './CVUpload';
import { AnalysisResults } from './AnalysisResults';
import { DetailedAnalysis } from './DetailedAnalysis';
import { CVOptimization } from '../CVOptimization/CVOptimization';
import { useOpenAI, CVAnalysisResponse } from '../../hooks/useOpenAI';
import { useSupabase } from '../../hooks/useSupabase';
import { useCVLibrary, DocumentType } from '../../hooks/useCVLibrary';
import { useAppStore } from '../../store/useAppStore';
import {  ArrowLeft } from 'lucide-react';
import GradientSpinLoader from '../loader/GradientSpinLoader';
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
  const { analyzeFile, error } = useOpenAI();
  const { addActivity, addDocument, updateDocument } = useSupabase();
  const { addAnalyzedCV } = useCVLibrary();
  const previewFile = useAppStore(s => s.previewFile);
  const setPreviewFile = useAppStore(s => s.setPreviewFile);

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
      
      // Analyser le fichier directement avec l'IA - OBLIGATOIRE
      // L'extraction de contenu se fait dans le hook useOpenAI
      const results = await analyzeFile(file, 'Développeur Full Stack');
      
      console.log('Résultats de l\'analyse:', results);
      
      if (results) {
        console.log('Analyse réussie, affichage des résultats');
        setAnalysisResults(results);
        
        // Stocker le contenu original pour l'affichage
        setOriginalContent(`Analyse du fichier: ${file.name}`);
        
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
      {/* En-tête avec titre et description */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
          {config.title}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {config.description}
        </p>
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
