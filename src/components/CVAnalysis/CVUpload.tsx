import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useOpenAI } from '../../hooks/useOpenAI';
import { useSupabase } from '../../hooks/useSupabase';
import { DocumentViewer } from '../DocumentViewer/DocumentViewer';
import { CVAnalysisDocumentType } from './CVAnalysis';

// Interface pour étendre File avec l'ID du document
interface FileWithDocumentId extends File {
  __documentId?: string;
}

interface CVUploadProps {
  onFileUpload: (file: File, documentId?: string) => void;
  documentType?: CVAnalysisDocumentType;
  uploadDescription?: string;
}

export const CVUpload: React.FC<CVUploadProps> = ({ 
  onFileUpload, 
  documentType = 'cv',
  uploadDescription 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const { error } = useOpenAI();
  const { addDocument } = useSupabase();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setPreviewFile(file);
    
    let documentId: string | undefined;
    
    try {
      // Convertir le fichier en données binaires
      let fileData: Uint8Array | undefined;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        fileData = new Uint8Array(arrayBuffer);
      }

      // Sauvegarder directement dans la table documents avec status 'draft'
      const docTypeForSupabase = documentType === 'lettre' ? 'letter' : 'cv';
      const document = await addDocument({
        doc_type: docTypeForSupabase,
        name: file.name.replace(/\.[^/.]+$/, ""), // Supprimer l'extension
        type: 'analyzed', // Le fichier est téléchargé pour analyse
        ats_score: 0, // Score par défaut, sera mis à jour après analyse
        status: 'draft', // Statut draft car pas encore analysé
        template: undefined,
        industry: 'Non spécifié',
        file_size: `${(file.size / 1024).toFixed(1)} KB`,
        version: 1,
        content: `Document téléchargé le ${new Date().toLocaleDateString('fr-FR')} - En attente d'analyse`,
        original_file_name: file.name,
        original_file_data: fileData,
        analysis_results: {}, // Vide pour l'instant
        cv_data: {},
        metadata: {
          uploadedAt: new Date().toISOString(),
          fileType: file.type,
          originalSize: file.size,
          documentType: documentType,
          uploadSource: 'CVUpload',
          status: 'uploaded',
          userAgent: navigator.userAgent
        }
      });

      documentId = document.id;
      console.log('✅ Document créé dans CVUpload avec ID:', documentId, 'pour le fichier:', file.name);
      setUploadStatus('success');
    } catch (error) {
      console.warn('⚠️ Erreur lors de la sauvegarde dans CVUpload:', error);
      // Même en cas d'erreur de sauvegarde, on laisse l'utilisateur continuer
      setUploadStatus('success');
    }
    
    // Stocker l'ID du document pour pouvoir le passer lors de l'analyse
    if (documentId) {
      (file as FileWithDocumentId).__documentId = documentId;
    }
  }, [addDocument, documentType]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleAnalyzeFile = () => {
    if (previewFile) {
      const documentId = (previewFile as FileWithDocumentId).__documentId;
      onFileUpload(previewFile, documentId);
    }
  };

  const handleNewUpload = () => {
    setPreviewFile(null);
    setUploadStatus('idle');
  };

  // Si un fichier est en prévisualisation, afficher le viewer
  if (previewFile && uploadStatus === 'success') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleNewUpload}
            className="rounded-lg p-2 border flex items-center space-x-2 text-violet-500 hover:text-violet-700 hover:border-violet-300 font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Télécharger un autre fichier</span>
          </button>
          
          <button
            onClick={handleAnalyzeFile}
            className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-violet-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 flex items-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Analyser {documentType === 'cv' ? 'le CV' : 'la lettre'}</span>
          </button>
        </div>
        
        <DocumentViewer 
          file={previewFile} 
          onClose={handleAnalyzeFile}
        />
      </div>
    );
  }
  // Configuration des textes selon le type de document
  const getUploadConfig = () => {
    if (documentType === 'cv') {
      return {
        title: 'Analysez votre CV',
        description: 'Obtenez une évaluation complète de votre CV avec des recommandations personnalisées pour optimiser votre compatibilité ATS.',
        uploadTitle: 'Téléchargez votre CV',
        uploadDescription: uploadDescription || 'Glissez-déposez votre fichier ici ou cliquez pour sélectionner',
        buttonText: 'Choisir un fichier',
        successMessage: 'CV téléchargé avec succès !'
      };
    } else {
      return {
        title: 'Analysez votre lettre de motivation',
        description: 'Obtenez une évaluation détaillée de votre lettre avec des recommandations pour maximiser son impact.',
        uploadTitle: 'Téléchargez votre lettre',
        uploadDescription: uploadDescription || 'Glissez-déposez votre fichier ici ou cliquez pour sélectionner',
        buttonText: 'Choisir un fichier',
        successMessage: 'Lettre téléchargée avec succès !'
      };
    }
  };

  const config = getUploadConfig();

  return (
    <div className="space-y-6">

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-violet-400 bg-violet-50/50 scale-105'
            : uploadStatus === 'success'
            ? 'border-emerald-400 bg-emerald-50/50'
            : uploadStatus === 'error'
            ? 'border-red-400 bg-red-50/50'
            : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50/30'
        }`}
      >
        <div className="space-y-4">
          {uploadStatus === 'uploading' ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-violet-600 font-medium mt-4">Téléchargement en cours...</p>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <p className="text-emerald-600 font-medium">{config.successMessage}</p>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <p className="text-red-600 font-medium">Erreur lors du téléchargement</p>
              <p className="text-red-500 text-sm">Veuillez vérifier le format et la taille du fichier</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Upload className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{config.uploadTitle}</h3>
                <p className="text-gray-600 mb-4">
                  {config.uploadDescription}
                </p>
              </div>
              
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-violet-700 hover:to-pink-700 transition-all duration-200 cursor-pointer hover:scale-105"
              >
                <FileText className="w-5 h-5" />
                <span>{config.buttonText}</span>
              </label>
            </>
          )}
        </div>
        
        {uploadStatus === 'idle' && (
          <div className="mt-6 text-sm text-gray-500">
            <p>Formats acceptés: PDF, DOC, DOCX, TXT</p>
            <p>Taille maximale: 10MB</p>
          </div>
        )}
      </div>

      
      {/* Display error if any */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-800 text-sm mb-1">Erreur d'analyse</h4>
            <p className="text-red-700 text-xs">{error}</p>
          </div>
        </div>
      )}
        <div className="mt-6">
          
          
        </div>
    </div>
  );
};
