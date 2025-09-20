import React from 'react';
import { User, LogOut, Settings, AlertTriangle, ChevronDown, Sparkles } from 'lucide-react';
import ThemeToggle from '../UI/ThemeToggle';

interface HeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
  onSettingsClick: () => void;
  onLogout: () => void;
  apiKeyStatus?: 'valid' | 'invalid' | 'missing';
}

export const Header: React.FC<HeaderProps> = ({ user, onSettingsClick, onLogout, apiKeyStatus = 'valid' }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const getApiKeyIndicator = () => {
    if (apiKeyStatus === 'missing') {
      return {
        text: 'Clé IA requise',
        bgColor: 'bg-red-50/80',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        iconColor: 'text-red-600'
      };
    } else if (apiKeyStatus === 'invalid') {
      return {
        text: 'Clé IA invalide',
        bgColor: 'bg-amber-50/80',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        iconColor: 'text-amber-600'
      };
    }
    return null;
  };

  const indicator = getApiKeyIndicator();

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                CV ATS <span className="text-indigo-600">Pro</span>
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">Assistant Carrière IA</p>
            </div>
          </div>

          {/* Center Action Items */}
          <div className="hidden md:flex items-center space-x-4">
            {indicator && (
              <button
                onClick={onSettingsClick}
                className={`flex items-center space-x-2 px-4 py-2.5 ${indicator.bgColor} border ${indicator.borderColor} rounded-xl hover:shadow-md transition-all duration-200 hover:scale-[1.02] group`}
                title="Configurez votre clé API pour débloquer toutes les fonctionnalités"
              >
                <AlertTriangle className={`w-4 h-4 ${indicator.iconColor} group-hover:scale-110 transition-transform`} />
                <span className={`text-sm ${indicator.textColor} font-medium`}>{indicator.text}</span>
              </button>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Settings */}
            <button
              onClick={onSettingsClick}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              title="Paramètres"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 bg-gray-50/80 hover:bg-gray-100/80 rounded-xl px-4 py-2.5 transition-all duration-200 hover:shadow-sm border border-gray-100"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onSettingsClick();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Paramètres</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};
