import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from './useSupabase';
import type { CVAnalysisResponse } from './useOpenAI';
import { supabase } from '../lib/supabase';

export type DocumentType = "cv" | "letter";
export type SourceType = "analyzed" | "created";
export type Status = "draft" | "completed" | "optimized";

export interface CVData {
  name: string;
  contact: string;
  profileContent: string;
  experiences: Array<{ id: number; content: string; details: string; }>;
  skills: Array<{ id: number; content: string; }>;
  languages: Array<{ id: number; name: string; level: string; }>;
  educations: Array<{ id: number; degree: string; school: string; year: string; }>;
  industry?: string;
  customFont?: string;
  customColor?: string;
  templateName?: string;
}

export interface DocumentItem {
  id: string;
  docType: DocumentType;
  name: string;
  type: SourceType;
  atsScore: number;
  createdAt: Date;
  lastModified: Date;
  status: Status;
  template?: string;
  industry: string;
  isFavorite: boolean;
  fileSize: string;
  version: number;
  content?: string;
  originalFile?: File;
  analysisResults?: CVAnalysisResponse;
  cvData?: CVData; // Données du CV créé
}

interface CVLibraryData {
  documents: DocumentItem[];
}

const LOCAL_STORAGE_KEY = 'cvLibraryDocuments';

export const useCVLibrary = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const { profile } = useSupabase();

  const loadDocuments = useCallback(async () => {
    if (!profile?.id) {
      console.log('Pas de profil utilisateur, chargement depuis localStorage');
      // Fallback vers localStorage si pas d'utilisateur authentifié
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed: CVLibraryData = JSON.parse(saved);
          const documentsWithDates = parsed.documents.map(doc => ({
            ...doc,
            createdAt: new Date(doc.createdAt),
            lastModified: new Date(doc.lastModified)
          }));
          setDocuments(documentsWithDates);
        }
      } catch (error) {
        console.error('Erreur localStorage:', error);
        setDocuments([]);
      }
      return;
    }

    try {
      console.log('Chargement des documents depuis Supabase pour utilisateur:', profile.id);
      
      if (!supabase) {
        console.error('Supabase client non initialisé');
        setDocuments([]);
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase lors du chargement:', error);
        setDocuments([]);
        return;
      }

      // Convertir les données Supabase vers notre format
      const convertedDocuments: DocumentItem[] = (data || []).map(doc => ({
        id: doc.id,
        docType: doc.doc_type as DocumentType,
        name: doc.name,
        type: doc.type as SourceType,
        atsScore: doc.ats_score,
        createdAt: new Date(doc.created_at),
        lastModified: new Date(doc.updated_at),
        status: doc.status as Status,
        template: doc.template,
        industry: doc.industry,
        isFavorite: doc.is_favorite,
        fileSize: doc.file_size,
        version: doc.version,
        content: doc.content,
        analysisResults: doc.analysis_results,
        cvData: doc.cv_data,
        // Note: originalFile ne peut pas être reconstruit depuis la DB
      }));

      setDocuments(convertedDocuments);
      console.log(`${convertedDocuments.length} documents chargés depuis Supabase`);
    } catch (error) {
      console.error('Erreur lors du chargement des documents depuis Supabase:', error);
      setDocuments([]);
    }
  }, [profile?.id]);

  // Charger les documents au démarrage
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const saveDocuments = (newDocuments: DocumentItem[]) => {
    try {
      const dataToSave: CVLibraryData = { documents: newDocuments };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      setDocuments(newDocuments);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des documents:', error);
    }
  };

  // Ajouter un CV analysé à la bibliothèque
  const addAnalyzedCV = async (
    fileName: string,
    analysisResults: CVAnalysisResponse,
    originalFile?: File,
    docType: DocumentType = 'cv'
  ) => {
    const documentData = {
      docType,
      name: fileName.replace(/\.[^/.]+$/, ""), // Supprimer l'extension
      type: 'analyzed' as SourceType,
      atsScore: analysisResults?.overallScore || 0,
      status: 'completed' as Status,
      industry: 'Non spécifié',
      isFavorite: false,
      fileSize: originalFile ? formatFileSize(originalFile.size) : 'Inconnu',
      version: 1,
      content: `CV analysé avec un score ATS de ${analysisResults?.overallScore || 0}%`,
      analysisResults,
      originalFile
    };

    if (!profile?.id || !supabase) {
      // Fallback vers localStorage
      const newDocument: DocumentItem = {
        id: `analyzed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...documentData,
        createdAt: new Date(),
        lastModified: new Date(),
      };
      const updatedDocuments = [newDocument, ...documents];
      saveDocuments(updatedDocuments);
      console.log('CV analysé ajouté à localStorage:', newDocument);
      return newDocument.id;
    }

    try {
      // Convertir le fichier en base64 si présent
      let fileData = null;
      if (originalFile) {
        const arrayBuffer = await originalFile.arrayBuffer();
        fileData = new Uint8Array(arrayBuffer);
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: profile.id,
          doc_type: documentData.docType,
          name: documentData.name,
          type: documentData.type,
          ats_score: documentData.atsScore,
          status: documentData.status,
          industry: documentData.industry,
          is_favorite: documentData.isFavorite,
          file_size: documentData.fileSize,
          version: documentData.version,
          content: documentData.content,
          original_file_name: originalFile?.name,
          original_file_data: fileData,
          analysis_results: documentData.analysisResults,
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout à Supabase:', error);
        // Fallback vers localStorage en cas d'erreur
        const newDocument: DocumentItem = {
          id: `analyzed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...documentData,
          createdAt: new Date(),
          lastModified: new Date(),
        };
        const updatedDocuments = [newDocument, ...documents];
        saveDocuments(updatedDocuments);
        return newDocument.id;
      }

      // Recharger les documents depuis Supabase
      await loadDocuments();
      console.log('CV analysé ajouté à Supabase:', data.id);
      return data.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du CV analysé:', error);
      // Fallback vers localStorage
      const newDocument: DocumentItem = {
        id: `analyzed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...documentData,
        createdAt: new Date(),
        lastModified: new Date(),
      };
      const updatedDocuments = [newDocument, ...documents];
      saveDocuments(updatedDocuments);
      return newDocument.id;
    }
  };

  // Ajouter un CV créé à la bibliothèque
  const addCreatedCV = async (
    cvName: string,
    cvData: CVData,
    templateName?: string,
    atsScore: number = 85
  ) => {
    const documentData = {
      docType: 'cv' as DocumentType,
      name: cvName || 'CV Créé',
      type: 'created' as SourceType,
      atsScore,
      status: 'completed' as Status,
      template: templateName,
      industry: cvData?.industry || 'Non spécifié',
      isFavorite: false,
      fileSize: 'Généré',
      version: 1,
      cvData,
      content: `CV créé avec le template ${templateName || 'personnalisé'}`
    };

    if (!profile?.id || !supabase) {
      // Fallback vers localStorage
      const newDocument: DocumentItem = {
        id: `created_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...documentData,
        createdAt: new Date(),
        lastModified: new Date(),
      };
      const updatedDocuments = [newDocument, ...documents];
      saveDocuments(updatedDocuments);
      console.log('✅ CV créé ajouté à localStorage:', newDocument);
      return newDocument.id;
    }

    try {
      // Sauvegarder dans Supabase comme addActivity fait pour activities
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: profile.id,
          doc_type: documentData.docType,
          name: documentData.name,
          type: documentData.type,
          ats_score: documentData.atsScore,
          status: documentData.status,
          industry: documentData.industry,
          is_favorite: documentData.isFavorite,
          file_size: documentData.fileSize,
          version: documentData.version,
          content: documentData.content,
          template: documentData.template,
          cv_data: documentData.cvData,
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout du CV créé à Supabase:', error);
        // Fallback vers localStorage en cas d'erreur
        const newDocument: DocumentItem = {
          id: `created_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...documentData,
          createdAt: new Date(),
          lastModified: new Date(),
        };
        const updatedDocuments = [newDocument, ...documents];
        saveDocuments(updatedDocuments);
        return newDocument.id;
      }

      // Recharger les documents depuis Supabase
      await loadDocuments();
      console.log('✅ CV créé ajouté et sauvegardé dans Supabase:', data.id);
      return data.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du CV créé:', error);
      // Fallback vers localStorage
      const newDocument: DocumentItem = {
        id: `created_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...documentData,
        createdAt: new Date(),
        lastModified: new Date(),
      };
      const updatedDocuments = [newDocument, ...documents];
      saveDocuments(updatedDocuments);
      return newDocument.id;
    }
  };

  // Mettre à jour un document existant
  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    const updatedDocuments = documents.map(doc => 
      doc.id === id 
        ? { ...doc, ...updates, lastModified: new Date() }
        : doc
    );
    saveDocuments(updatedDocuments);
  };

  // Supprimer un document
  const deleteDocument = (id: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== id);
    saveDocuments(updatedDocuments);
  };

  // Toggle favori
  const toggleFavorite = (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (document) {
      updateDocument(id, { isFavorite: !document.isFavorite });
    }
  };

  // Télécharger un document et l'enregistrer automatiquement dans la table
  const downloadDocument = async (
    documentId: string, 
    fileName?: string,
    downloadCallback?: () => Promise<void>
  ) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) {
      console.error('Document non trouvé:', documentId);
      return false;
    }

    try {
      // Exécuter le téléchargement d'abord si fourni
      if (downloadCallback) {
        await downloadCallback();
      }

      // Créer immédiatement l'enregistrement de téléchargement
      const downloadRecord = {
        id: `downloaded_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        docType: document.docType,
        name: fileName || `${document.name} (Téléchargé le ${new Date().toLocaleDateString('fr-FR')})`,
        type: 'analyzed' as SourceType,
        atsScore: document.atsScore,
        createdAt: new Date(),
        lastModified: new Date(),
        status: 'completed' as Status,
        template: document.template,
        industry: document.industry,
        isFavorite: false,
        fileSize: document.fileSize,
        version: document.version + 1,
        content: `Document téléchargé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} - ${document.content}`,
        analysisResults: document.analysisResults,
        cvData: document.cvData,
      };

      if (!profile?.id || !supabase) {
        // Sauvegarde locale immédiate
        const updatedDocuments = [downloadRecord, ...documents];
        saveDocuments(updatedDocuments);
        console.log('✅ Document téléchargé et enregistré dans localStorage:', downloadRecord.name);
        return true;
      }

      // Sauvegarde immédiate dans Supabase
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: profile.id,
          doc_type: downloadRecord.docType,
          name: downloadRecord.name,
          type: downloadRecord.type,
          ats_score: downloadRecord.atsScore,
          status: downloadRecord.status,
          industry: downloadRecord.industry,
          is_favorite: downloadRecord.isFavorite,
          file_size: downloadRecord.fileSize,
          version: downloadRecord.version,
          content: downloadRecord.content,
          template: downloadRecord.template,
          analysis_results: downloadRecord.analysisResults,
          cv_data: downloadRecord.cvData,
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase lors de l\'enregistrement du téléchargement:', error);
        // Fallback automatique vers localStorage
        const updatedDocuments = [downloadRecord, ...documents];
        saveDocuments(updatedDocuments);
        console.log('✅ Document téléchargé et enregistré dans localStorage (fallback):', downloadRecord.name);
        return true;
      }

      // Recharger immédiatement les documents
      await loadDocuments();
      console.log('✅ Document téléchargé et enregistré dans Supabase:', data.name);
      return true;

    } catch (error) {
      console.error('❌ Erreur lors du téléchargement/enregistrement:', error);
      return false;
    }
  };

  // Fonction simple pour marquer un téléchargement (pour compatibilité)
  const saveDownloadedDocument = async (documentId: string) => {
    return await downloadDocument(documentId);
  };

  // Recherche et filtre
  const searchDocuments = (
    searchTerm: string = '',
    filterType: 'all' | 'analyzed' | 'created' = 'all',
    sortBy: 'date' | 'score' | 'name' = 'date'
  ) => {
    return documents
      .filter((doc) => {
        const matchesSearch =
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.industry.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || doc.type === filterType;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'score':
            return b.atsScore - a.atsScore;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'date':
          default:
            return b.lastModified.getTime() - a.lastModified.getTime();
        }
      });
  };

  // Obtenir les statistiques
  const getStats = () => {
    const totalDocs = documents.length;
    const analyzedDocs = documents.filter(doc => doc.type === 'analyzed').length;
    const createdDocs = documents.filter(doc => doc.type === 'created').length;
    const avgScore = documents.length > 0 
      ? Math.round(documents.reduce((sum, doc) => sum + doc.atsScore, 0) / documents.length)
      : 0;

    return {
      total: totalDocs,
      analyzed: analyzedDocs,
      created: createdDocs,
      averageScore: avgScore
    };
  };

  return {
    documents,
    addAnalyzedCV,
    addCreatedCV,
    updateDocument,
    deleteDocument,
    toggleFavorite,
    downloadDocument,
    saveDownloadedDocument,
    searchDocuments,
    getStats,
    refreshDocuments: loadDocuments,
    getDocument: (id: string) => documents.find(doc => doc.id === id)
  };
};

// Fonction utilitaire pour formater la taille des fichiers
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
