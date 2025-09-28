import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Download, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { ocrService, type OCRResult } from '../../services/OCRService';

interface WebcamOCRProps {
  onResult?: (result: OCRResult) => void;
}

export const WebcamOCR: React.FC<WebcamOCRProps> = ({ onResult }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);

  // Démarrer la caméra
  const startCamera = async () => {
    try {
      setError(null);
      console.log('Tentative de démarrage de la caméra...');

      // Vérifier si le navigateur supporte la caméra
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Votre navigateur ne supporte pas l\'accès à la caméra');
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log('Contraintes de la caméra:', constraints);

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Flux vidéo obtenu:', mediaStream);

      setStream(mediaStream);
      setIsCameraActive(true);

      // Attendre un peu que le vidéo element soit prêt
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => {
            console.error('Erreur lors de la lecture vidéo:', e);
            setError('Erreur lors de la lecture vidéo');
          });
          console.log('Vidéo assignée au ref');
        }
      }, 100);

    } catch (err: unknown) {
      console.error('Erreur détaillée caméra:', err);
      let errorMessage = 'Impossible d\'accéder à la caméra';

      const errorObj = err as { name?: string; message?: string };

      if (errorObj.name === 'NotAllowedError') {
        errorMessage = 'Accès à la caméra refusé. Veuillez autoriser la caméra dans les paramètres du navigateur.';
      } else if (errorObj.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra trouvée sur cet appareil.';
      } else if (errorObj.name === 'NotReadableError') {
        errorMessage = 'La caméra est déjà utilisée par une autre application.';
      } else if (errorObj.name === 'OverconstrainedError') {
        errorMessage = 'Les contraintes de la caméra ne sont pas supportées.';
      } else if (errorObj.message) {
        errorMessage = `Erreur: ${errorObj.message}`;
      }

      setError(errorMessage);
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  // Changer de caméra (avant/arrière)
  const switchCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    if (isCameraActive) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  };

  // Capturer une image
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Définir les dimensions du canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dessiner l'image vidéo sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir en base64
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    setResult(null);
  };

  // Traiter l'image capturée avec OCR
  const processCapturedImage = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setResult(null);

    try {
      // Convertir base64 en Blob puis en File (nécessaire pour webcam)
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });

      // Utiliser le service OCR (comme dans OCRTest)
      const ocrResult = await ocrService.extractCVFromImage(file);
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

  // Télécharger le JSON
  const handleDownload = () => {
    if (result?.data) {
      ocrService.downloadJSON(result.data);
    }
  };

  // Réinitialiser
  const handleReset = () => {
    setCapturedImage(null);
    setResult(null);
    setIsPreviewMode(false);
  };

  // Nettoyer à la démontage
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">OCR CV avec Webcam</h1>
        <p className="text-gray-600">
          Prenez une photo d'un CV avec votre caméra pour extraire automatiquement les données
        </p>
      </div>

      {/* Caméra */}
      {!capturedImage ? (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="relative aspect-video bg-gray-100">
            {!isCameraActive ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Caméra désactivée</p>
                  <button
                    onClick={startCamera}
                    className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700"
                  >
                    Démarrer la caméra
                  </button>
                </div>
              </div>
            ) : !isPreviewMode ? (
              // Mode normal - vue caméra simple
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Boutons pour entrer en mode prévisualisation */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                  <button
                    onClick={() => setIsPreviewMode(true)}
                    className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 flex items-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Prévisualiser</span>
                  </button>

                  <button
                    onClick={switchCamera}
                    className="w-12 h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <RefreshCw className="w-6 h-6" />
                  </button>
                </div>

                {/* Bouton arrêt */}
                <button
                  onClick={stopCamera}
                  className="absolute top-4 right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </>
            ) : (
              // Mode prévisualisation - avec overlay et capture
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Overlay de capture */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                    <div className="absolute top-2 left-2 right-2 h-8 bg-white/10 backdrop-blur rounded border border-white/30 flex items-center justify-center">
                      <p className="text-white text-sm font-medium">Cadre de capture CV</p>
                    </div>
                  </div>
                </div>

                {/* Contrôles caméra en mode prévisualisation */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                  <button
                    onClick={captureImage}
                    className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-violet-400 transition-colors flex items-center justify-center shadow-lg"
                  >
                    <div className="w-12 h-12 bg-violet-600 rounded-full"></div>
                  </button>

                  <button
                    onClick={() => setIsPreviewMode(false)}
                    className="w-12 h-12 bg-gray-500/80 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-gray-600/80 transition-colors"
                  >
                    ×
                  </button>

                  <button
                    onClick={switchCamera}
                    className="w-12 h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <RefreshCw className="w-6 h-6" />
                  </button>
                </div>

                {/* Bouton arrêt */}
                <button
                  onClick={stopCamera}
                  className="absolute top-4 right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Image capturée */
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="relative">
            <img
              src={capturedImage}
              alt="CV capturé"
              className="w-full max-h-96 object-cover bg-gray-100"
            />

            {/* Actions sur l'image */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={handleReset}
                className="w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t flex justify-center space-x-4">
            <button
              onClick={processCapturedImage}
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

            <button
              onClick={handleReset}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reprendre photo</span>
            </button>
          </div>
        </div>
      )}

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

      {/* Canvas caché pour la capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
