import React, { useState } from 'react';
import { BarChart3, FileText, FolderOpen, Brain, MessageSquare, ChevronDown, Plus, Search, CreditCard, Briefcase, LayoutTemplate, Star } from 'lucide-react';
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

  const handleDropdownClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
                  className={`relative flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg group ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/50'
                      : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span className="font-medium">{item.label}</span>

                  {hasDropdown && (
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                      openDropdown === item.id ? 'rotate-180' : ''
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
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-indigo-50 ${
                            isSubActive
                              ? 'text-indigo-600 bg-indigo-50/50'
                              : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                          }`}
                        >
                          <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
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
