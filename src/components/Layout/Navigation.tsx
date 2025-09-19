import React, { useState } from 'react';
import { BarChart3, FileText, BookOpen, FolderOpen, Brain, MessageSquare, ChevronDown, Plus, Search } from 'lucide-react';
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
  { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
  { 
    id: 'cv', 
    label: 'CV', 
    icon: FileText,
    dropdown: [
      { id: 'creator', label: 'Créateur CV', icon: Plus },
      { id: 'analyze', label: 'Analyse CV', icon: Search },
    ]
  },
  { 
    id: 'lettre', 
    label: 'Lettre', 
    icon: FileText,
    dropdown: [
      { id: 'chat', label: 'Assistant IA', icon: Brain },
      { id: 'lettre-analyze', label: 'Analyse', icon: Search },
    ]
  },
  { id: 'templates', label: 'Templates', icon: FileText },
  { 
    id: 'coach', 
    label: 'Coach IA', 
    icon: MessageSquare,
    dropdown: [
      { id: 'chat-cv', label: 'Coach CV', icon: FileText },
      { id: 'chat-general', label: 'Coach Carrière', icon: Brain },
    ]
  },
  { id: 'library', label: 'Bibliothèque', icon: FolderOpen },
  { id: 'models', label: 'Modèles', icon: BookOpen },
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
    <nav className="bg-white/60 backdrop-blur-md border-b border-gray-200/30 relative z-[1000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
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
                    // Préchargement au survol pour les éléments sans dropdown
                    if (!hasDropdown) {
                      preloadOnHover(item.id);
                    }
                  }}
                  className={`relative flex items-center space-x-2 px-4 py-4 text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'text-violet-600 border-b-2 border-violet-500'
                      : 'text-gray-500 hover:text-violet-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-violet-600' : ''
                  }`} />
                  <span>{item.label}</span>
                  
                  {hasDropdown && (
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                      openDropdown === item.id ? 'rotate-180' : ''
                    } ${isActive ? 'text-violet-600' : ''}`} />
                  )}
                  
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-pink-500 to-blue-500 rounded-full" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {hasDropdown && openDropdown === item.id && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200/50 py-2 z-[9999]">
                    {item.dropdown!.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeTab === subItem.id;
                      
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleItemClick(subItem.id)}
                          onMouseEnter={() => {
                            // Préchargement au survol pour les éléments du dropdown
                            preloadOnHover(subItem.id);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-violet-50 ${
                            isSubActive
                              ? 'text-violet-600 bg-violet-50'
                              : 'text-gray-600 hover:text-violet-600'
                          }`}
                        >
                          <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-violet-600' : ''}`} />
                          <span>{subItem.label}</span>
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
