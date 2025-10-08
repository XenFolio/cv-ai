import React from 'react';
import { BreadcrumbNavigation } from '../../UI/BreadcrumbNavigation';
import { NavigationIcons } from '../../UI/iconsData';

interface CVCreatorHeaderProps {
  hasLocalData: () => boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  onATSAnalysis: () => void;
  onDownload: () => void;
}

export const CVCreatorHeader: React.FC<CVCreatorHeaderProps> = ({
  hasLocalData,
  lastSaved,
  autoSaveEnabled,
  setAutoSaveEnabled,
  onATSAnalysis,
  onDownload
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-3 py-1 sm:py-1">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Breadcrumb et sauvegarde sur la même ligne pour desktop */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
          <BreadcrumbNavigation
            items={[
              {
                label: 'Accueil',
                icon: NavigationIcons.Home,
                onClick: () => window.history.back()
              },
              {
                label: 'CV',
                onClick: () => window.history.back()
              },
              { label: 'Créateur de CV', current: true }
            ]}
            className="text-sm"
            showHome={false}
          />

          {/* Indicateur de sauvegarde automatique */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 ml-0 sm:ml-4">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:border-gray-500 dark:focus:ring-gray-500"
                />
                Sauvegarde auto
              </label>
            </div>

            {lastSaved && (
              <time className="text-xs text-gray-500 dark:text-gray-400">
                Dernière sauvegarde : {lastSaved.toLocaleTimeString()}
              </time>
            )}

            {hasLocalData() && (
              <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" aria-hidden="true"></span>
                Données sauvegardées
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center space-x-2 self-start">
          <button
            onClick={onATSAnalysis}
            className="w-9 h-9 bg-transparent text-green-600 border rounded border-green-600 hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
            aria-label="Analyse ATS et Export PDF"
            title="Analyse ATS et Export PDF"
          >
            <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button
            onClick={onDownload}
            className="w-9 h-9 bg-transparent text-violet-600 border rounded border-violet-600 hover:bg-violet-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
            aria-label="Télécharger le CV"
          >
            <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2  0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};