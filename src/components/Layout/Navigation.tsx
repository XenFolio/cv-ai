import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, FolderOpen, Brain, MessageSquare, ChevronDown, Plus, Search, Briefcase, LayoutTemplate, Star, Menu, X } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { preloadOnHover } from '../../utils/lazyComponents';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface DropdownItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  dropdown?: DropdownItem[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Accueil', icon: BarChart3 },
  {
    id: 'cv',
    label: 'CV',
    icon: FileText,
    dropdown: [
      { id: 'creator', label: 'Créer un CV', icon: Plus },
      { id: 'analyze', label: 'Analyser mon CV', icon: Search },
    ]
  },
  {
    id: 'lettre',
    label: 'Lettre',
    icon: FileText,
    dropdown: [
      { id: 'chat', label: 'Assistant IA', icon: Brain },
      { id: 'lettre-analyze', label: 'Analyser une lettre', icon: Search },
      { id: 'letter-editor', label: 'Éditeur', icon: MessageSquare },
    ]
  },
  { id: 'templates', label: 'Modèles', icon: LayoutTemplate },
  {
    id: 'coach',
    label: 'Coach IA',
    icon: Brain,
    dropdown: [
      { id: 'coaching', label: 'Coaching Personnalisé', icon: Brain },
      { id: 'chat-cv', label: 'Conseils CV', icon: FileText },
      { id: 'chat-general', label: 'Carrière', icon: MessageSquare },
    ]
  },
  { id: 'library', label: 'Mes Documents', icon: FolderOpen },
  { id: 'jobs', label: 'Offres d\'emploi', icon: Briefcase },
  { id: 'cv-designer-test', label: 'CV Designer Test', icon: FileText },
  { id: 'tarifs', label: 'Premium', icon: Star },
];

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter la taille de l'écran
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Fermer le menu mobile quand on change d'onglet
  useEffect(() => {
    if (activeTab) {
      setIsMobileMenuOpen(false);
    }
  }, [activeTab]);

  const handleDropdownClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === itemId ? null : itemId);
  };

  const handleDropdownToggle = (itemId: string) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId);
  };

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    setOpenDropdown(null);
  };

  const isItemActive = (item: NavItem) => {
    if (item.dropdown) {
      return item.dropdown.some(subItem => subItem.id === activeTab);
    }
    return activeTab === item.id;
  };

  // Mobile menu button
  if (isMobile) {
    return (
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 relative z-[1000] shadow-sm" role="navigation" aria-label="Navigation principale">
        <div className="max-w-8xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }
              }}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-haspopup="true"
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Fermer le menu principal' : 'Ouvrir le menu principal'}</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>

            {/* Mobile title */}
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CV ATS Pro</h1>
            </div>

            {/* Placeholder pour aligner */}
            <div className="w-10" />
          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-700"
            role="menu"
            aria-label="Menu de navigation mobile"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-[70vh] overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);
                const hasDropdown = item.dropdown && item.dropdown.length > 0;

                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={(e) => {
                        if (hasDropdown) {
                          handleDropdownClick(item.id, e);
                        } else {
                          handleItemClick(item.id);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (hasDropdown) {
                            handleDropdownToggle(item.id);
                          } else {
                            handleItemClick(item.id);
                          }
                        }
                      }}
                      role="menuitem"
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/50'
                        : 'text-gray-600 dark:text-gray-400 hover:text-indigo-300 dark:hover:text-indigo-200 hover:bg-indigo-900/20 dark:hover:bg-indigo-950/30'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 transition-transform ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                          }`} />
                        <span>{item.label}</span>
                      </div>

                      {hasDropdown && (
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openDropdown === item.id ? 'rotate-180' : ''
                          } ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                      )}
                    </button>

                    {/* Mobile dropdown */}
                    {hasDropdown && openDropdown === item.id && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.dropdown!.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = activeTab === subItem.id;

                          return (
                            <button
                              key={subItem.id}
                              onClick={() => handleItemClick(subItem.id)}
                              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isSubActive
                                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/50'
                                : 'text-gray-600 dark:text-gray-400 hover:text-indigo-300 dark:hover:text-indigo-200 hover:bg-indigo-900/20 dark:hover:bg-indigo-950/30'
                                }`}
                            >
                              <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                              <span className="text-left">{subItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    );
  }

  // Desktop navigation
  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 relative z-[1000] shadow-sm">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);
            const hasDropdown = item.dropdown && item.dropdown.length > 0;

            return (
              <div key={item.id} className="relative">
                <button
                  onClick={(e) => {
                    if (hasDropdown) {
                      handleDropdownClick(item.id, e);
                    } else {
                      handleItemClick(item.id);
                    }
                  }}
                  onMouseEnter={() => {
                    if (!hasDropdown) {
                      preloadOnHover(item.id);
                    }
                  }}
                  className={`relative flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg group ${isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/50'
                    : 'text-gray-600 dark:text-gray-400 hover:text-indigo-300 dark:hover:text-indigo-200 hover:bg-indigo-900/20 dark:hover:bg-indigo-950/30'
                    }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                  <span className="font-medium">{item.label}</span>

                  {hasDropdown && (
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openDropdown === item.id ? 'rotate-180' : ''
                      } ${isActive ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                  )}

                  {isActive && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {hasDropdown && openDropdown === item.id && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-[9999]">
                    {item.dropdown!.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeTab === subItem.id;

                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleItemClick(subItem.id)}
                          onMouseEnter={() => {
                            preloadOnHover(subItem.id);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 ${isSubActive
                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/50'
                            : 'text-gray-600 dark:text-gray-400 hover:text-indigo-300 dark:hover:text-indigo-200'
                            }`}
                        >
                          <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                          <span className="text-left">{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Overlay pour fermer les dropdowns */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </nav>
  );
};
