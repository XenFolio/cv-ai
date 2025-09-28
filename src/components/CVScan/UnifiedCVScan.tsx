import React, { useState } from 'react';
import { Camera, Upload, Scan, Sparkles, FileText, CheckCircle, AlertCircle, ArrowRight,  Download } from 'lucide-react';
import { BreadcrumbNavigation } from '../UI/BreadcrumbNavigation';
import { useAppStore } from '../../store/useAppStore';
import { WebcamOCR } from '../Webcam/WebcamOCR';
import { OCRTest } from '../OCR/OCRTest';
import {  type OCRResult } from '../../services/OCRService';

type ScanMode = 'choice' | 'webcam' | 'upload' | 'results';



export const UnifiedCVScan: React.FC = () => {
  const [scanMode, setScanMode] = useState<ScanMode>('choice');
  const [result, setResult] = useState<OCRResult | null>(null);
  const setActiveTab = useAppStore(s => s.setActiveTab);

  const handleResult = (ocrResult: OCRResult) => {
    setResult(ocrResult);
    setScanMode('results');
  };

  const handleReset = () => {
    setResult(null);
    setScanMode('choice');
  };

  const renderChoiceMode = () => (
    <div className="max-w-4xl mx-auto p-1 flex flex-col">
      <div className="text-center mb-2">
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Scan className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Scan CV Intelligent
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Choisissez votre méthode pour analyser vos CV avec notre IA
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-4">
          {/* Option Webcam */}
          <div
            onClick={() => setScanMode('webcam')}
            className="group cursor-pointer bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Scanner avec Webcam</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Prenez une photo directement de votre CV avec votre caméra
              </p>
              <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-3 py-2 rounded-full group-hover:bg-indigo-200 transition-colors">
                <span className="font-medium text-sm">Commencer</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Option Upload */}
          <div
            onClick={() => setScanMode('upload')}
            className="group cursor-pointer bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-100 hover:border-violet-300 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Uploader une Image</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Importez une image ou un PDF de votre CV
              </p>
              <div className="inline-flex items-center space-x-2 bg-violet-100 text-violet-700 px-3 py-2 rounded-full group-hover:bg-violet-200 transition-colors">
                <span className="font-medium text-sm">Commencer</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1 text-sm">Extraction Précise</h4>
            <p className="text-gray-600 text-xs">Notre IA identifie et extrait toutes les informations clés</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1 text-sm">Format Structuré</h4>
            <p className="text-gray-600 text-xs">Récupérez vos données au format JSON prêt à l'emploi</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1 text-sm">Technologie Avancée</h4>
            <p className="text-gray-600 text-xs">Propulsé par Mistral Pixtral pour une reconnaissance optimale</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWebcamMode = () => (
    <div className="max-w-4xl mx-auto p-2 ">
      <WebcamOCR onResult={handleResult} />
    </div>
  );

  const renderUploadMode = () => (
    <div className="max-w-4xl mx-auto p-2">
      <OCRTest onResult={handleResult} />
    </div>
  );

  const renderResults = () => (
    <div className="max-w-4xl mx-auto p-4 h-full overflow-auto">

      {result && (
        <div className="bg-white rounded-3xl border shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`p-8 ${result.success ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-pink-600'} text-white`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                {result.success ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {result.success ? "Scan Réussi !" : "Erreur lors du scan"}
                </h2>
                <p className="text-white/90">
                  {result.success
                    ? "Votre CV a été analysé avec succès"
                    : "Une erreur est survenue pendant l'analyse"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {result.success && result.data ? (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-indigo-900 mb-2">Identité</h4>
                    <p className="text-2xl font-bold text-indigo-600">
                      {result.data.identite?.nom || 'N/A'}
                    </p>
                    <p className="text-sm text-indigo-600">
                      {result.data.identite?.titre || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-purple-900 mb-2">Compétences</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {result.data.competences?.length || 0}
                    </p>
                    <p className="text-sm text-purple-600">compétences trouvées</p>
                  </div>
                  <div className="bg-violet-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-violet-900 mb-2">Expériences</h4>
                    <p className="text-2xl font-bold text-violet-600">
                      {result.data.experiences?.length || 0}
                    </p>
                    <p className="text-sm text-violet-600">postes identifiés</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-emerald-900 mb-2">Formations</h4>
                    <p className="text-2xl font-bold text-emerald-600">
                      {result.data.formations?.length || 0}
                    </p>
                    <p className="text-sm text-emerald-600">diplômes trouvés</p>
                  </div>
                </div>

                {/* Detailed Data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Identity Details */}
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                      Identité Complète
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nom:</span>
                        <span className="font-medium">{result.data.identite?.nom || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Titre:</span>
                        <span className="font-medium">{result.data.identite?.titre || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{result.data.identite?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone:</span>
                        <span className="font-medium">{result.data.identite?.telephone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adresse:</span>
                        <span className="font-medium">{result.data.identite?.adresse || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile */}
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-purple-600" />
                      Profil Professionnel
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {result.data.profil || 'Aucun profil identifié'}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-violet-600" />
                    Compétences Identifiées
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {result.data.competences?.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-medium shadow-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* JSON Export */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-emerald-400" />
                      Données Complètes (JSON)
                    </h4>
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'cv-scan.json';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger JSON</span>
                    </button>
                  </div>
                  <pre className="text-green-400 text-sm ">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Échec de l'analyse</h3>
                <p className="text-gray-600 mb-6">{result.error || 'Une erreur inconnue est survenue'}</p>
                <button
                  onClick={handleReset}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Breadcrumb items selon le mode
  const getBreadcrumbItems = () => {
    const baseItems = [
      {
        label: 'Scan CV',
        path: '/cv-scan',
        onClick: () => setScanMode('choice')
      }
    ];

    switch (scanMode) {
      case 'webcam':
        return [...baseItems, { label: 'Webcam', path: '#', current: true }];
      case 'upload':
        return [...baseItems, { label: 'Upload', path: '#', current: true }];
      case 'results':
        return [...baseItems, { label: 'Résultats', path: '#', current: true }];
      default:
        return baseItems.map((item, index) => ({
          ...item,
          current: index === baseItems.length - 1
        }));
    }
  };

  // Navigation vers le dashboard
  const handleHomeClick = () => {
    setActiveTab('dashboard');
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-300/20 to-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-violet-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-violet-300/20 to-pink-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col ">
        {/* Header avec breadcrumb */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm flex-shrink-0">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-12">
              {/* Breadcrumb à gauche */}
              <div className="flex items-center">
                <BreadcrumbNavigation
                  items={getBreadcrumbItems()}
                  onHomeClick={handleHomeClick}
                />
              </div>

              
            </div>
          </div>
        </header>

        {/* Contenu */}
        <div className=" overflow-hidden py-4 mt-4">
          {scanMode === 'choice' && renderChoiceMode()}
          {scanMode === 'webcam' && renderWebcamMode()}
          {scanMode === 'upload' && renderUploadMode()}
          {scanMode === 'results' && renderResults()}
        </div>
      </div>
    </div>
  );
};
