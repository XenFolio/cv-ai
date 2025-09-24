import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { CVCreator } from './CVCreator';
import { BackButton } from '../UI/BackButton';

interface CVCreatorDemoProps {
  onBack: () => void;
}

export const CVCreatorDemo: React.FC<CVCreatorDemoProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-300/20 to-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-violet-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-violet-300/20 to-pink-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header simple pour la démo */}
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
                      Créateur de CV - Démo
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
        <main className="flex justify-center px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-8xl w-full">
            <CVCreator />
          </div>
        </main>
      </div>
    </div>
  );
};