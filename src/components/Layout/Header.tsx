import { AlertTriangle, BarChart3, Brain, Briefcase, ChevronDown, Crown, FileText, FolderOpen, LayoutTemplate, LogOut, ChevronDown as MenuDown, MessageSquare, Plus, Search, Settings, Shield, Sparkles, Star, User } from 'lucide-react';
import React from 'react';
import { useAdminTheme } from '../../contexts/useAdminTheme';
import { useIsAdmin } from '../../hooks/useAdmin';
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
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSettingsClick, onLogout, apiKeyStatus = 'valid', activeTab = '', onTabChange = () => { } }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const { isAdmin } = useIsAdmin();
  const { themeClasses } = useAdminTheme();

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Accueil', icon: BarChart3 },
    {
      id: 'cv',
      label: 'CV',
      icon: FileText,
      dropdown: [
        { id: 'creator', label: 'Créer', icon: Plus },
        { id: 'analyze', label: 'Analyser', icon: Search },
      ]
    },
    {
      id: 'lettre',
      label: 'Lettre',
      icon: MessageSquare,
      dropdown: [
        { id: 'chat', label: 'Assistant IA', icon: Brain },
        { id: 'letter-editor', label: 'Créer', icon: Plus },
        { id: 'lettre-analyze', label: 'Analyser', icon: Search },
      ]
    },
    { id: 'templates', label: 'Modèles', icon: LayoutTemplate },
    {
      id: 'coach',
      label: 'Coach IA',
      icon: Brain,
      dropdown: [
        { id: 'coaching', label: 'Coaching', icon: Brain },
        { id: 'chat-cv', label: 'Conseils CV', icon: FileText },
        { id: 'chat-general', label: 'Carrière', icon: MessageSquare },
      ]
    },
    { id: 'library', label: 'Documents', icon: FolderOpen },
    { id: 'jobs', label: 'Offres', icon: Briefcase },
    { id: 'tarifs', label: 'Premium', icon: Star },
    // Admin only navigation
    ...(isAdmin ? [
      { id: 'admin', label: 'Admin', icon: Shield }
    ] : []),
  ];

  const isItemActive = (itemId: string) => {
    return activeTab === itemId;
  };

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    setOpenDropdown(null);
  };

  const handleDropdownToggle = (itemId: string) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId);
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

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
    <header className={`${themeClasses.bg} ${themeClasses.bgGradient} backdrop-blur-xl border-b ${themeClasses.border} shadow-sm sticky top-0 z-[60]`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onTabChange('dashboard')}
              className="relative"
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg ${isAdmin
                  ? 'bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600'
                  : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600'
                }`}>
                {isAdmin ? (
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isAdmin ? 'bg-purple-400' : 'bg-green-400'
                }`}></div>
            </button>
            <button
              onClick={() => onTabChange('dashboard')}
              className="hidden sm:block text-left hover:opacity-80 transition-opacity"
            >
              <h1 className={`text-lg sm:text-xl font-semibold tracking-tight ${themeClasses.text}`}>
                CV ATS <span className={isAdmin ? 'text-purple-400' : 'text-indigo-600 dark:text-indigo-400'}>
                  {isAdmin ? 'Admin' : 'Pro'}
                </span>
              </h1>
              <p className={`text-xs -mt-0.5 ${themeClasses.textSecondary}`}>
                {isAdmin ? 'Administration Plateforme' : 'Assistant Carrière IA'}
              </p>
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-4xl mx-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.id);
              const hasDropdown = item.dropdown && item.dropdown.length > 0;

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={(e) => {
                      if (hasDropdown) {
                        e.stopPropagation();
                        handleDropdownToggle(item.id);
                      } else {
                        handleItemClick(item.id);
                      }
                    }}
                    onMouseEnter={() => {
                      if (hasDropdown) {
                        setOpenDropdown(item.id);
                      }
                    }}
                    className={`relative flex items-center space-x-1 px-2 py-1.5 text-xs font-medium rounded-md ${item.id === 'admin' && isActive
                        ? 'text-purple-400 bg-purple-900/60 shadow-sm'
                        : item.id === 'admin'
                          ? 'text-purple-300 hover:text-purple-400 hover:bg-purple-900/40'
                          : isActive
                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-900/60 shadow-sm'
                            : isAdmin
                              ? `${themeClasses.text} hover:text-indigo-400 hover:bg-indigo-900/40`
                              : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/40'
                      }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={`w-3 h-3 ${item.id === 'admin'
                        ? isActive
                          ? 'text-purple-400'
                          : 'text-purple-500'
                        : isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : isAdmin
                            ? themeClasses.textSecondary
                            : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    <span className="font-medium hidden sm:block">{item.label}</span>

                    {hasDropdown && (
                      <MenuDown className={`w-2 h-2 ${openDropdown === item.id ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : (
                        isAdmin ? themeClasses.textSecondary : 'text-gray-400 dark:text-gray-500'
                      )
                        }`} />
                    )}

                    {/* Active indicator */}
                    {isActive && (
                      <div className={`absolute bottom-0 left-1 right-1 h-0.5 rounded-full ${item.id === 'admin'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`} />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {hasDropdown && openDropdown === item.id && (
                    <div
                      className="absolute top-full left-0 mt-1 w-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-[99999]"
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {item.dropdown.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = activeTab === subItem.id;

                        return (
                          <button
                            key={subItem.id}
                            onClick={() => handleItemClick(subItem.id)}
                            className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/50 ${isSubActive
                              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-900/60'
                              : isAdmin
                                ? `${themeClasses.text} hover:text-indigo-400`
                                : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                              }`}
                          >
                            <SubIcon className={`w-3 h-3 ${isSubActive ? 'text-indigo-600 dark:text-indigo-400' : (
                              isAdmin ? themeClasses.textSecondary : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                            )
                              }`} />
                            <span className="text-left font-medium">{subItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Mobile indicator */}
            {indicator && (
              <button
                onClick={onSettingsClick}
                className="md:hidden p-2 rounded-lg"
                title={indicator.text}
              >
                <AlertTriangle className={`w-4 h-4 ${indicator.iconColor}`} />
              </button>
            )}



            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Settings */}
            <button
              onClick={onSettingsClick}
              className={`p-2 ${isAdmin ? themeClasses.textSecondary : 'text-gray-400 dark:text-gray-500'} hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg`}
              title="Paramètres"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 sm:space-x-3 bg-gray-50/80 dark:bg-gray-800/80 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-100 dark:border-gray-700"
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-sm ${isAdmin
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  }`}>
                  {isAdmin ? (
                    <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  ) : (
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className={`text-sm font-medium ${isAdmin ? themeClasses.text : 'text-gray-900 dark:text-gray-100'} leading-tight truncate max-w-[120px]`}>{user.name}</p>
                  <p className={`text-xs ${isAdmin ? themeClasses.textSecondary : 'text-gray-500 dark:text-gray-400'} truncate max-w-[120px]`}>{user.email}</p>
                </div>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 ${isAdmin ? themeClasses.textSecondary : 'text-gray-400 dark:text-gray-500'}`} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-[99999]">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onSettingsClick();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Paramètres</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
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
          className="fixed inset-0 z-[99998]"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};
