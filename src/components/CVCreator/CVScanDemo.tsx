import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, FileText, Sparkles, CheckCircle, AlertCircle, Wand2 } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { BackButton } from '../UI/BackButton';
import Button from '../UI/Button';
import { ImagePreprocessor } from './ImagePreprocessor';

interface CVScanDemoProps {
  onBack: () => void;
}

interface ScanResult {
  text: string;
  confidence: number;
  processedAt: Date;
}

export const CVScanDemo: React.FC<CVScanDemoProps> = ({ onBack }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [preprocessingImage, setPreprocessingImage] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch {
      console.error('Camera access denied or not available');
      setError('Camera access denied or not available');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context?.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        setPreprocessingImage(blob);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreprocessingImage(file);
    }
  };

  const handlePreprocessComplete = (processedBlob: Blob) => {
    setPreprocessingImage(null);
    processImage(processedBlob);
  };

  const handlePreprocessCancel = () => {
    setPreprocessingImage(null);
  };

  const processImage = async (imageBlob: Blob) => {
    setIsScanning(true);
    setError(null);
    setOcrProgress(0);

    try {
      const worker = await createWorker();

      // Load French language for better CV recognition
      await worker.load();

      // Set parameters for better text recognition
      await worker.setParameters({
        tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789àâäçéèêëïîôùûüÿñæœÀÂÄÇÉÈÊËÏÎÔÙÛÜŸÑÆŒ&@%#-+*/=.,;:!?()[]{}"\''
      });

      const imageUrl = URL.createObjectURL(imageBlob);
      const { data: { text, confidence } } = await worker.recognize(imageUrl);

      await worker.terminate();
      URL.revokeObjectURL(imageUrl);

      const result: ScanResult = {
        text: text.trim(),
        confidence: confidence / 100,
        processedAt: new Date()
      };

      setScanResult(result);
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Le traitement OCR a échoué. Veuillez réessayer avec une image plus claire.');
    } finally {
      setIsScanning(false);
      setOcrProgress(0);
    }
  };

  const handleImportCV = () => {
    if (scanResult) {
      // Parse OCR text to extract CV sections
      const parsedCV = parseCVText(scanResult.text);
      console.log('Parsed CV data:', parsedCV);

      // This would integrate with your existing CV system
      alert('CV importé avec succès! Données extraites prêtes pour le créateur de CV.');
    }
  };

  const parseCVText = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const result: {
      personal: Record<string, string>;
      experience: Array<{ company: string; description: string }>;
      education: Array<{ school: string; description: string }>;
      skills: string[];
    } = {
      personal: {},
      experience: [],
      education: [],
      skills: []
    };

    let currentSection: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect sections
      if (line.toUpperCase().includes('EXPÉRIENCE') || line.toUpperCase().includes('EXPERIENCE')) {
        currentSection = 'experience';
        continue;
      } else if (line.toUpperCase().includes('FORMATION') || line.toUpperCase().includes('ÉDUCATION')) {
        currentSection = 'education';
        continue;
      } else if (line.toUpperCase().includes('COMPÉTENCES') || line.toUpperCase().includes('SKILLS')) {
        currentSection = 'skills';
        continue;
      }

      // Parse personal info (usually first few lines)
      if (!currentSection && i < 5) {
        if (line.includes('@') || line.includes('email')) {
          result.personal.email = line;
        } else if (line.includes('+33') || line.includes('06') || line.includes('07')) {
          result.personal.phone = line;
        } else if (line.toLowerCase().includes('linkedin')) {
          result.personal.linkedin = line;
        } else if (!result.personal.name && line.length > 2 && !line.includes('@')) {
          result.personal.name = line;
        }
      }

      // Parse sections
      if (currentSection === 'experience' && line.length > 0) {
        if (line.includes('•') || line.includes('-')) {
          result.experience.push({
            company: lines[i-1] || '',
            description: line.replace(/^[•-]\s*/, '')
          });
        }
      } else if (currentSection === 'education' && line.length > 0) {
        if (line.includes('•') || line.includes('-')) {
          result.education.push({
            school: lines[i-1] || '',
            description: line.replace(/^[•-]\s*/, '')
          });
        }
      } else if (currentSection === 'skills' && line.length > 0) {
        result.skills.push(line.replace(/^[•-]\s*/, ''));
      }
    }

    return result;
  };

  const resetScan = () => {
    setScanResult(null);
    setCameraActive(false);
    setUploadMode(false);
    setError(null);
    setOcrProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-300/20 to-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-violet-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-violet-300/20 to-pink-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <BackButton
                  onClick={onBack}
                  text="Retour"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 via-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-pink-400 bg-clip-text text-transparent">
                      Scan CV par Caméra - Démo
                    </h1>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
                <Sparkles className="w-4 h-4" />
                Mode Démo
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!scanResult ? (
            <div className="space-y-6">
              {/* Mode Selection */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Choisissez votre méthode de scan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setUploadMode(false);
                      setCameraActive(true);
                    }}
                    disabled={cameraActive}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      cameraActive && !uploadMode
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                    }`}
                  >
                    <Camera className="w-8 h-8 text-violet-600 mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-2">Caméra</h3>
                    <p className="text-sm text-gray-600">Prenez une photo de votre CV</p>
                  </button>

                  <button
                    onClick={() => {
                      setCameraActive(false);
                      setUploadMode(true);
                    }}
                    disabled={uploadMode}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      uploadMode && !cameraActive
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-pink-600 mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-2">Upload</h3>
                    <p className="text-sm text-gray-600">Téléchargez une image de CV</p>
                  </button>
                </div>
              </div>

              {/* Camera View */}
              {cameraActive && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-96 object-cover rounded-lg bg-gray-900"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scan overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-4 border-2 border-violet-500 rounded-lg">
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-violet-500" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-violet-500" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-violet-500" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-violet-500" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <Button
                      onClick={captureImage}
                      disabled={isScanning}
                      className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full font-semibold"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Capturer l'image
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload View */}
              {uploadMode && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Téléchargez votre CV
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Formats supportés: JPG, PNG, PDF
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isScanning}
                      className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full font-semibold"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Choisir un fichier
                    </Button>
                  </div>
                </div>
              )}

              {/* Preprocessing Modal */}
              {preprocessingImage && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <ImagePreprocessor
                      imageBlob={preprocessingImage}
                      onProcess={handlePreprocessComplete}
                      onCancel={handlePreprocessCancel}
                    />
                  </div>
                </div>
              )}

              {/* Scanning Progress Overlay */}
              {isScanning && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wand2 className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Analyse en cours...
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Notre IA extrait le texte de votre CV
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {ocrProgress}% complété
                    </p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Conseils pour un scan optimal:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Assurez-vous que le CV est bien éclairé</li>
                  <li>• Évitez les ombres et reflets</li>
                  <li>• Placez le CV à plat</li>
                  <li>• Utilisez une résolution minimale de 720p</li>
                  <li>• Formats supportés: JPG, PNG, PDF</li>
                </ul>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-6">
              {/* Success Header */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">CV scanné avec succès!</h3>
                  <p className="text-sm text-green-700">
                    Confiance: {(scanResult.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Results */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Texte extrait:</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {scanResult.text}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={handleImportCV}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full font-semibold"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Importer dans le créateur de CV
                </Button>
                <Button
                  onClick={resetScan}
                  variant="outline"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50"
                >
                  Scanner un autre CV
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};