import React from 'react';
import { CheckCircle, XCircle, Loader, Wifi, WifiOff, Key, Database, X, RefreshCw } from 'lucide-react';

interface ConnectionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'testing' | 'success' | 'error' | 'saving';
  message: string;
  details?: string;
  apiProvider?: string;
  onRetry?: () => void;
}

const ConnectionStatusModal: React.FC<ConnectionStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  message,
  details,
  apiProvider = 'OpenAI',
  onRetry
}) => {
  if (!isOpen) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'testing':
        return {
          icon: <Loader className="w-12 h-12 animate-spin" />,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'from-blue-50 to-cyan-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          iconBg: 'bg-blue-100',
          title: 'Test de connexion...'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12" />,
          color: 'from-emerald-500 to-green-500',
          bgColor: 'from-emerald-50 to-green-50',
          borderColor: 'border-emerald-200',
          textColor: 'text-emerald-900',
          iconBg: 'bg-emerald-100',
          title: 'Connexion réussie !'
        };
      case 'saving':
        return {
          icon: <Database className="w-12 h-12 animate-pulse" />,
          color: 'from-violet-500 to-purple-500',
          bgColor: 'from-violet-50 to-purple-50',
          borderColor: 'border-violet-200',
          textColor: 'text-violet-900',
          iconBg: 'bg-violet-100',
          title: 'Sauvegarde en cours...'
        };
      case 'error':
      default:
        return {
          icon: <XCircle className="w-12 h-12" />,
          color: 'from-red-500 to-pink-500',
          bgColor: 'from-red-50 to-pink-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          iconBg: 'bg-red-100',
          title: 'Échec de la connexion'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md transform transition-all duration-300 scale-100">
        <div className={`bg-gradient-to-br ${config.bgColor} rounded-3xl border ${config.borderColor} shadow-2xl overflow-hidden`}>
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Status Icon */}
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-2xl ${config.iconBg}`}>
                <div className={`bg-gradient-to-br ${config.color} bg-clip-text text-transparent`}>
                  {config.icon}
                </div>
              </div>
            </div>
            
            {/* Title */}
            <h3 className={`text-xl font-bold text-center ${config.textColor} mb-2`}>
              {config.title}
            </h3>
          </div>
          
          {/* Content */}
          <div className="px-6 pb-6">
            {/* API Provider Badge */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-2 bg-white/50 rounded-full px-4 py-2 border border-white/20">
                <Key className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{apiProvider}</span>
              </div>
            </div>
            
            {/* Message */}
            <p className={`text-center ${config.textColor} mb-3 font-medium`}>
              {message}
            </p>
            
            {/* Details */}
            {details && (
              <p className={`text-center ${config.textColor} text-sm opacity-80 mb-4`}>
                {details}
              </p>
            )}
            
            {/* Connection Status Indicator */}
            <div className="flex justify-center mb-6">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                status === 'success' 
                  ? 'bg-emerald-100/50 text-emerald-700 border border-emerald-200/50' 
                  : status === 'error'
                  ? 'bg-red-100/50 text-red-700 border border-red-200/50'
                  : 'bg-blue-100/50 text-blue-700 border border-blue-200/50'
              }`}>
                {status === 'success' ? (
                  <Wifi className="w-4 h-4" />
                ) : status === 'error' ? (
                  <WifiOff className="w-4 h-4" />
                ) : (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                <span className="text-sm font-medium">
                  {status === 'success' && 'Connecté'}
                  {status === 'error' && 'Déconnecté'}
                  {status === 'testing' && 'Test en cours'}
                  {status === 'saving' && 'Sauvegarde'}
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-3">
              {status === 'error' && onRetry && (
                <button
                  onClick={onRetry}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-violet-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Réessayer</span>
                </button>
              )}
              
              <button
                onClick={onClose}
                className={`${
                  status === 'error' && onRetry ? 'flex-1' : 'w-full'
                } ${
                  status === 'success'
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                    : status === 'testing' || status === 'saving'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-700'
                } text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  status !== 'testing' && status !== 'saving' ? 'hover:scale-105' : ''
                }`}
                disabled={status === 'testing' || status === 'saving'}
              >
                {status === 'success' ? 'Parfait !' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatusModal;
