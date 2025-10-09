import React from 'react';
import { Shield, PlusCircle, FileEdit, Edit3, MessageSquare, Search, Scan } from 'lucide-react';

interface WelcomeHeaderProps {
  userName: string;
  isAdmin?: boolean;
  adminLoading?: boolean;
  onNavigate?: (tab: string) => void;
  className?: string;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  userName,
  isAdmin = false,
  adminLoading = false,
  onNavigate,
  className = ''
}) => {
  const quickActions = [
    { id: 'creator', icon: PlusCircle, label: 'Créer un CV', description: 'Assistant IA', color: 'blue' },
    { id: 'chat', icon: FileEdit, label: 'Lettre de motivation', description: 'Génération IA', color: 'cyan' },
    { id: 'letter-editor', icon: Edit3, label: 'Éditeur de Lettres', description: 'Créez votre lettre', color: 'sky' },
    { id: 'chat-cv', icon: MessageSquare, label: 'Coach IA', description: 'Assistant virtuel', color: 'indigo' },
    { id: 'analyze', icon: Search, label: 'Analyser CV', description: 'Score ATS', color: 'violet' },
    { id: 'cv-scan', icon: Scan, label: 'Scan CV', description: 'Webcam + Upload', color: 'slate' }
  ];

  const getColor = (color: string) => {
    const palette: Record<string, string> = {
      blue: 'from-blue-800/40 to-blue-600/20',
      cyan: 'from-cyan-800/40 to-cyan-600/20',
      sky: 'from-sky-800/40 to-sky-600/20',
      indigo: 'from-indigo-800/40 to-indigo-600/20',
      violet: 'from-violet-800/40 to-violet-600/20',
      slate: 'from-slate-800/40 to-slate-600/20',
      default: 'from-blue-800/40 to-blue-600/20'
    };
    return palette[color] || palette.default;
  };

  return (
    <div
      className={`bg-gradient-to-br ${isAdmin
          ? 'from-slate-900 via-blue-900 to-cyan-900'
          : 'from-indigo-900 via-purple-900 to-violet-900'
        } rounded-3xl p-12 text-white relative overflow-hidden flex flex-col justify-between ${className}`}
      style={{ minHeight: '750px' }}
    >
      {/* Décor de fond */}
      <div className="absolute inset-0 bg-black/10 rounded-3xl" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* ====== HEADER ====== */}
        <div className="text-center xl:text-left">
          <div
            className="
              flex flex-col xl:flex-row xl:items-center xl:justify-center
              gap-3 mb-3
            "
          >
            {/* Titre avec effet IA lumineux */}
            <h1
              className="
                text-4xl font-bold text-center xl:text-left tracking-tight
                bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300
                bg-clip-text text-transparent animate-gradient-x
                drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]
              "
              style={{
                textShadow: '0 0 12px rgba(56,189,248,0.35), 0 0 24px rgba(37,99,235,0.25)'
              }}
            >
              {isAdmin ? "Bienvenue Administrateur CV-AI !" : `Bienvenue ${userName} !`} 👋
            </h1>

            {/* Badge admin aligné sur la même ligne en XL */}
            {isAdmin && !adminLoading && (
              <div
                className="
                  flex items-center gap-2 px-3 py-1 mx-auto xl:mx-0
                  bg-blue-600/80 backdrop-blur-sm border border-cyan-400/50 rounded-full
                  shadow-lg shadow-blue-800/30
                "
              >
                <Shield className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white whitespace-nowrap">
                  Mode Admin
                </span>
              </div>
            )}
          </div>

          <p className="text-white/90 text-lg text-center xl:text-center max-w-2xl mx-auto">
            Optimisez vos CV avec notre IA avancée et maximisez vos chances de succès.
          </p>
        </div>

        {/* ====== BOUTONS ====== */}
        <div className="flex-1 flex items-center justify-center mt-10">
          <div
            className="
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
              gap-8 w-full max-w-6xl mx-auto place-items-stretch
            "
          >
            {quickActions.map(({ id, icon: Icon, label, description, color }, index) => (
              <button
                key={id}
                onClick={() => onNavigate?.(id)}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                className={`opacity-0 group flex flex-col justify-center items-center 
                  py-10 px-6 rounded-2xl h-full
                  bg-gradient-to-br ${getColor(color)} border border-white/10
                  hover:border-white/30 hover:scale-105 hover:shadow-2xl hover:shadow-${color}-700/30
                  backdrop-blur-md transition-all duration-300`}
              >
                <Icon className="h-10 w-10 mb-4 text-white/90 group-hover:text-white transition-all duration-300 group-hover:scale-110" />
                <span className="font-semibold text-lg text-white">{label}</span>
                <span className="text-base mt-3 text-white/70">{description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ====== FOOTER ====== */}
        <div className="text-center mt-10">
          <p className="text-white/80 text-sm tracking-wide">
            Choisissez une action pour commencer votre optimisation professionnelle
          </p>
        </div>
      </div>

      {/* ====== Animations ====== */}
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 6s ease infinite;
          }
        `}
      </style>
    </div>
  );
};
