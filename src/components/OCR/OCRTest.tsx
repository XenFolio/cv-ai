import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { ocrService,  type OCRResult } from '../../services/OCRService';

interface OCRTestProps {
  onResult?: (result: OCRResult) => void;
}

export const OCRTest: React.FC<OCRTestProps> = ({ onResult }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);

      // Créer un preview de l'image
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Reset le résultat précédent
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const ocrResult = await ocrService.extractCVFromImage(selectedFile);
      setResult(ocrResult);

      // Notifier le parent si callback fourni
      if (onResult) {
        onResult(ocrResult);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result?.data) {
      ocrService.downloadJSON(result.data);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">OCR CV avec Mistral (Pixtral)</h1>
        <p className="text-gray-600">
          Téléchargez une image de CV pour extraire automatiquement les données structurées
        </p>
      </div>

      {/* Zone de téléchargement */}
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-violet-400 transition-colors">
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!selectedFile ? (
          <label htmlFor="fileInput" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Cliquez pour sélectionner une image
            </p>
            <p className="text-sm text-gray-500">
              Formats supportés : PNG, JPG, JPEG (max 10MB)
            </p>
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-violet-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview de l'image */}
            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg shadow-md"
                />
              </div>
            )}

            <div className="flex space-x-3 justify-center">
              <button
                onClick={handleAnalyze}
                disabled={isProcessing}
                className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyse en cours...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Analyser le CV</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Résultats */}
      {result && (
        <div className="bg-white rounded-xl border shadow-sm">
          {/* Header du résultat */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500" />
              )}
              <h3 className="text-lg font-semibold">
                {result.success ? "Extraction réussie" : "Erreur lors de l'extraction"}
              </h3>
            </div>

            {result.success && result.data && (
              <button
                onClick={handleDownload}
                className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger JSON</span>
              </button>
            )}
          </div>

          {/* Contenu du résultat */}
          <div className="p-4">
            {result.success && result.data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Identité */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Identité</h4>
                    <p className="text-sm"><strong>Nom:</strong> {result.data.identite.nom || 'N/A'}</p>
                    <p className="text-sm"><strong>Titre:</strong> {result.data.identite.titre || 'N/A'}</p>
                    <p className="text-sm"><strong>Email:</strong> {result.data.identite.email || 'N/A'}</p>
                    <p className="text-sm"><strong>Téléphone:</strong> {result.data.identite.telephone || 'N/A'}</p>
                  </div>

                  {/* Profil */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Profil</h4>
                    <p className="text-sm text-gray-700">{result.data.profil || 'N/A'}</p>
                  </div>
                </div>

                {/* Compétences */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Compétences</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.data.competences.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expériences */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Expériences ({result.data.experiences.length})</h4>
                  <div className="space-y-2">
                    {result.data.experiences.slice(0, 3).map((exp, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium">{exp.intitule_poste} - {exp.societe}</p>
                        <p className="text-gray-600">{exp.periode} • {exp.lieu}</p>
                      </div>
                    ))}
                    {result.data.experiences.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{result.data.experiences.length - 3} autres expériences...
                      </p>
                    )}
                  </div>
                </div>

                {/* JSON complet */}
                <details className="bg-gray-900 text-green-400 p-4 rounded-lg">
                  <summary className="cursor-pointer font-mono text-sm">Voir le JSON complet</summary>
                  <pre className="mt-2 text-xs overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-2">Erreur lors de l'analyse</p>
                <p className="text-gray-600 text-sm mb-4">{result.error}</p>

                {result.rawText && (
                  <details className="text-left">
                    <summary className="cursor-pointer text-violet-600 font-medium">
                      Voir la réponse brute
                    </summary>
                    <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-x-auto">
                      {result.rawText}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
