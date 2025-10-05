import React, { useState , useEffect} from "react";
import {
  Search,
  Eye,
  Star,
  Calendar,
  Trash2,
  Download,  
  BarChart3
} from "lucide-react";

import { QuickActions } from "./QuickActions";
import { DocumentsSkeleton } from "./DocumentsSkeleton";
import { useCVLibrary } from "../../hooks/useCVLibrary";
import { useAppStore } from "../../store/useAppStore";
import { BreadcrumbNavigation } from "../UI/BreadcrumbNavigation";
import { NavigationIcons } from "../UI/iconsData";
import { FileText } from "lucide-react";

type FilterType = "all" | "analyzed" | "created";
type SortBy = "date" | "score" | "name";

// ----------------------
// Composant
// ----------------------
export const CVLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [documentsLoading, setDocumentsLoading] = useState<boolean>(true);

  // Hook pour la gestion des documents
  const { 
    documents, 
    toggleFavorite, 
    deleteDocument, 
    searchDocuments, 
    getStats 
  } = useCVLibrary();

  // Hook pour la navigation
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const setShowSettings = useAppStore(s => s.setShowSettings);
  const setPreviewFile = useAppStore(s => s.setPreviewFile);

  // ----------------------
  // Filtres et Tri
  // ----------------------
  const filteredDocs = searchDocuments(searchTerm, filterType, sortBy);

  // ----------------------
  // Actions
  // ----------------------
  const handleAction = (action: string, docId: string) => {
    switch (action) {
      case 'view': {
        const document = documents.find(doc => doc.id === docId);
        if (document) {
          if (document.type === 'created') {
            // Pour un CV créé, retourner au créateur avec les données
            setShowSettings(false);
            setActiveTab('creator');
            
            // TODO: Ici on pourrait charger les données du CV dans le créateur
            // en utilisant le cvData stocké dans le document
            console.log('Navigation vers le créateur avec les données:', document.cvData);
          } else {
            // Pour un CV analysé, retourner à l'aperçu pré-analyse
            if (document.originalFile) {
              // Passer le fichier original pour prévisualisation
              setPreviewFile(document.originalFile);
            }
            setShowSettings(false);
            setActiveTab('analyze');
            
            console.log('Navigation vers l\'aperçu du CV analysé:', document.name);
          }
        }
        break;
      }
      case 'delete':
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
          deleteDocument(docId);
        }
        break;
      case 'download':
        console.log(`Téléchargement du document ${docId}`);
        // Ici on pourrait implémenter le téléchargement
        break;
      default:
        console.log(`Action ${action} pour le document ${docId}`);
    }
  };

  const stats = getStats();

  // Simuler le chargement des documents
  useEffect(() => {
    const timer = setTimeout(() => {
      setDocumentsLoading(false);
    }, 2000); // 2 secondes de chargement

    return () => clearTimeout(timer);
  }, []);

  // ----------------------
  // Render
  // ----------------------
  return (
    <div className="space-y-8">
      {documentsLoading ? (
        <DocumentsSkeleton />
      ) : (
        <>
          {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <BreadcrumbNavigation
            items={[
              {
                label: 'Accueil',
                icon: NavigationIcons.Home,
                onClick: () => setActiveTab('dashboard')
              },
              
              { label: 'Bibliothèque', current: true }
            ]}
            showHome={false}
            className="justify-start"
          />
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl animate-scaleIn flex-shrink-0">
            <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
        <p className="text-gray-600 max-w-2xl">
          Gérez vos CV et lettres de motivation (créés ou analysés).
        </p>
      </div>

      {/* Statistiques */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/70 rounded-2xl p-4 border border-gray-200/30 text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="w-6 h-6 text-violet-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total documents</div>
          </div>

          <div className="bg-white/70 rounded-2xl p-4 border border-gray-200/30 text-center">
            <div className="flex items-center justify-center mb-2">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.analyzed}</div>
            <div className="text-sm text-gray-600">Analysés</div>
          </div>

          <div className="bg-white/70 rounded-2xl p-4 border border-gray-200/30 text-center">
            <div className="flex items-center justify-center mb-2">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.created}</div>
            <div className="text-sm text-gray-600">Créés</div>
          </div>

          <div className="bg-white/70 rounded-2xl p-4 border border-gray-200/30 text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.averageScore}%</div>
            <div className="text-sm text-gray-600">Score ATS moyen</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white/70 rounded-2xl p-6 border border-gray-200/30">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou secteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 transition-all outline-violet-500 hover:border-violet-400"
            />
          </div>

          {/* Filter Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 transition-all"
          >
            <option value="all">Tous les documents</option>
            <option value="created">Créés</option>
            <option value="analyzed">Analysés</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 transition-all"
          >
            <option value="date">Trier par date</option>
            <option value="score">Trier par score ATS</option>
            <option value="name">Trier par nom</option>
          </select>
        </div>
      </div>

      {/* Message si aucun document */}
      {filteredDocs.length === 0 && documents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Bibliothèque vide
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par créer ou analyser un CV pour le voir apparaître ici.
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => {
                setShowSettings(false);
                setActiveTab('creator');
              }}
              className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:from-violet-700 hover:to-pink-700 transition-all"
            >
              Créer un CV
            </button>
            <button 
              onClick={() => {
                setShowSettings(false);
                setActiveTab('analyze');
              }}
              className="border border-violet-600 text-violet-600 px-6 py-2 rounded-lg font-medium hover:bg-violet-50 transition-all"
            >
              Analyser un CV
            </button>
          </div>
        </div>
      )}

      {/* Message si aucun résultat de recherche */}
      {filteredDocs.length === 0 && documents.length > 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aucun résultat trouvé
          </h3>
          <p className="text-gray-600">
            Essayez de modifier vos critères de recherche ou filtres.
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-wrap justify-center gap-6">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="w-80 bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {doc.name}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(doc.id)}
                    className={`p-1 rounded-full transition-colors ${doc.isFavorite
                        ? "text-yellow-500"
                        : "text-gray-400 hover:text-yellow-500"
                      }`}
                    title="Marquer comme favori"
                  >
                    <Star
                      className={`w-5 h-5 ${doc.isFavorite ? "fill-current" : ""}`}
                    />
                  </button>
                  <button
                    onClick={() => handleAction("delete", doc.id)}
                    className="p-1 rounded-full text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Infos */}
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium uppercase">
                  {doc.docType === "cv" ? "CV" : "Lettre"}
                </span>{" "}
                • <span className={`px-2 py-1 rounded-full text-xs ${
                  doc.type === "created" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {doc.type === "created" ? "Créé" : "Analysé"}
                </span> • {doc.industry}
                {doc.template && (
                  <span className="block mt-1 text-xs text-gray-500">
                    Template: {doc.template}
                  </span>
                )}
              </div>

              {/* Score */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-xl font-bold text-gray-900">
                  {doc.atsScore}%
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  doc.atsScore >= 90 ? 'bg-green-100 text-green-800' :
                  doc.atsScore >= 80 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {doc.atsScore >= 90 ? 'Excellent' :
                   doc.atsScore >= 80 ? 'Bon' : 'À améliorer'}
                </div>
              </div>

              {/* Métadonnées */}
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>
                    Modifié le {doc.lastModified.toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taille: {doc.fileSize}</span>
                  <span>v{doc.version}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction("view", doc.id)}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-violet-700 hover:to-pink-700 transition-all"
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  Voir
                </button>
                <button
                  onClick={() => handleAction("download", doc.id)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                  title="Télécharger"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
          <QuickActions/>
        </>
      )}
    </div>
  );
};
