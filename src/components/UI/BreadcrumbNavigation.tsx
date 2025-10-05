import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ProfessionalIcon } from './ProfessionalIcons';
import { NavigationIcons } from './iconsData';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ComponentType<{ className?: string; size?: string | number; color?: string }>;
  current?: boolean;
  onClick?: () => void;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
  maxItems?: number;
  animated?: boolean;
  onHomeClick?: () => void;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  className = '',
  showHome = true,
  separator,
  maxItems,
  animated = true,
  onHomeClick
}) => {

  // Si maxItems est spécifié, on tronque les éléments du milieu
  const processedItems = React.useMemo(() => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    if (maxItems <= 2) {
      return [items[0], items[items.length - 1]];
    }

    const firstItems = items.slice(0, 1);
    const lastItems = items.slice(-(maxItems - 2));

    return [
      ...firstItems,
      { label: '...', path: undefined },
      ...lastItems
    ];
  }, [items, maxItems]);

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.onClick && !item.current) {
      item.onClick();

      // Annonce pour les lecteurs d'écran
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Navigation vers ${item.label}`;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  };

  const defaultSeparator = (
    <ChevronRight className="w-4 h-4 !text-gray-600 !dark:text-gray-500 flex-shrink-0" />
  );

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={`flex items-center flex-wrap text-sm ${className}`}
    >
      {/* Home button */}
      {showHome && (
        <>
          <button
            onClick={onHomeClick}
            className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 p-1 rounded"
            aria-label="Retour à l'accueil"
          >
            <ProfessionalIcon
              icon={NavigationIcons.Home}
              size="sm"
              animated={animated}
            />
          </button>
          {processedItems.length > 0 && (
            <span className="mx-2 !text-gray-600 dark:text-gray-500">
              {separator || defaultSeparator}
            </span>
          )}
        </>
      )}

      {/* Breadcrumb items */}
      {processedItems.map((item, index) => {
        const isEllipsis = item.label === '...';

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="mx-2 !text-gray-600 dark:text-gray-500">
                {separator || defaultSeparator}
              </span>
            )}

            <div className="flex items-center">
              {isEllipsis ? (
                <span className="!text-gray-600 dark:text-gray-500 px-1">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.current || !item.onClick}
                  className={`
                    flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-200
                    ${item.current
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent font-semibold bg-indigo-50 dark:bg-indigo-900/30 shadow-sm'
                      : item.onClick
                        ? '!text-gray-600 !dark:text-gray-300 hover:!text-indigo-600 !dark:hover:text-indigo-400 hover:!bg-indigo-50 !dark:hover:bg-indigo-900/30'
                        : '!text-gray-500 !dark:text-gray-400 cursor-default'
                    }
                    ${animated && !item.current ? 'hover:scale-105' : ''}
                  `}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.icon && (
                    <ProfessionalIcon
                      icon={item.icon}
                      size="xs"
                      animated={animated}
                    />
                  )}
                  <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
                    {item.label}
                  </span>
                </button>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
};



export default BreadcrumbNavigation;
