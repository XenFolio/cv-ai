import React from 'react';
import { CVCreator } from './CVCreator';
import { CVScan } from './CVScan';
import Button from '../UI/Button';
import { Camera, FileText, ArrowLeft } from 'lucide-react';

interface CVScanIntegrationProps {
  onBack: () => void;
  onImportCV?: () => void;
}

export const CVScanIntegration: React.FC<CVScanIntegrationProps> = ({ onBack, onImportCV }) => {
  const [currentView, setCurrentView] = React.useState<'menu' | 'scanner' | 'creator'>('menu');

  if (currentView === 'scanner') {
    return (
      <CVScan
        onBack={() => setCurrentView('menu')}
        onImportCV={() => {
          if (onImportCV) onImportCV();
          setCurrentView('creator');
        }}
      />
    );
  }

  if (currentView === 'creator') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50">
        <CVCreator />
      </div>
    );
  }

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
                <Button
                  onClick={onBack}
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 via-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-pink-400 bg-clip-text text-transparent">
                      Création de CV Intelligente
                    </h1>
                    <p className="text-xs text-gray-600">Scannez ou créez votre CV</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-pink-400 bg-clip-text text-transparent mb-4">
              Transformez votre CV en quelques clics
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Scannez votre CV existant avec notre IA ou créez-en un nouveau à partir de zéro avec notre assistant intelligent
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Scan Option */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 hover:border-violet-300/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Scanner votre CV
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Utilisez votre caméra ou téléchargez une image pour que notre IA analyse et extrait automatiquement
                toutes les informations de votre CV existant. Gain de temps garanti !
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  <span>OCR intelligent avec reconnaissance français/anglais</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  <span>Prétraitement d'image pour meilleurs résultats</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  <span>Extraction intelligente des sections CV</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  <span>Compatibilité mobile et desktop</span>
                </div>
              </div>
              <Button
                onClick={() => setCurrentView('scanner')}
                className="w-full px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300"
              >
                Commencer le scan
              </Button>
            </div>

            {/* Create Option */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 hover:border-pink-300/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-violet-500 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Créer votre CV
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Partez de zéro avec notre créateur de CV intuitif. Templates professionnels,
                IA d'assistance et export multi-formats pour un CV parfait.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  <span>15+ templates professionnels</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  <span>Drag & drop intuitif</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  <span>Assistant IA de contenu</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
                  <span>Export PDF/Word professionnel</span>
                </div>
              </div>
              <Button
                onClick={() => setCurrentView('creator')}
                variant="outline"
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-violet-300 hover:bg-violet-50 transition-all duration-300"
              >
                Créer un CV
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Scan Ultra-rapide</h4>
              <p className="text-sm text-gray-600">Analyse en temps réel avec progress bar</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Précision Optimale</h4>
              <p className="text-sm text-gray-600">OCR avancé avec prétraitement d'image</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowLeft className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Import Intelligent</h4>
              <p className="text-sm text-gray-600">Extraction automatique des sections CV</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
