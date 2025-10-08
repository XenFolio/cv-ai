import React, { lazy } from 'react';

// Système de lazy loading avec préchargement intelligent
export const lazyComponentsMap = {
  // Composants principaux (chargés fréquemment)
  Dashboard: lazy(() => import('../components/Dashboard/Dashboard').then(module => ({ default: module.Dashboard }))),
  CVAnalysis: lazy(() => import('../components/CVAnalysis/CVAnalysis').then(module => ({ default: module.CVAnalysis }))),
  CVCreator: lazy(() => import('../components/CVCreator/CVCreator').then(module => ({ default: module.CVCreator }))),
  
  // Composants secondaires (chargés à la demande)
  Templates: lazy(() => import('../components/Templates/Templates').then(module => ({ default: module.Templates }))),
  CVLibrary: lazy(() => import('../components/CVLibrary/CVLibrary').then(module => ({ default: module.CVLibrary }))),
  Settings: lazy(() => import('../components/Settings/Settings').then(module => ({ default: module.Settings }))),
  
  // Composants spécialisés (chargés rarement)
  Models: lazy(() => import('../components/Models/Models').then(module => ({ default: module.Models }))),
  AIChat: lazy(() => import('../components/Chat/AIChat').then(module => ({ default: module.AIChat }))),
  LetterEditor: lazy(() => import('../components/LetterEditor/LetterEditorV2').then(module => ({ default: module.LetterEditorV2 }))),
    JobSearch: lazy(() => import('../components/JobSearch/JobSearch').then(module => ({ default: module.JobSearch }))),
};

// Type pour les clés des composants
export type LazyComponentKey = keyof typeof lazyComponentsMap;

// Cache des promesses de préchargement
const preloadCache = new Set<LazyComponentKey>();

/**
 * Précharge un composant de manière asynchrone
 * @param componentKey - Clé du composant à précharger
 */
export const preloadComponent = (componentKey: LazyComponentKey): void => {
  if (preloadCache.has(componentKey)) {
    return; // Déjà en cours de préchargement
  }

  preloadCache.add(componentKey);
  
  // Mapping des imports pour préchargement direct
  const importMap: Record<LazyComponentKey, () => Promise<unknown>> = {
    Dashboard: () => import('../components/Dashboard/Dashboard'),
    CVAnalysis: () => import('../components/CVAnalysis/CVAnalysis'),
    CVCreator: () => import('../components/CVCreator/CVCreator'),
    Templates: () => import('../components/Templates/Templates'),
    CVLibrary: () => import('../components/CVLibrary/CVLibrary'),
    Settings: () => import('../components/Settings/Settings'),
    Models: () => import('../components/Models/Models'),
    AIChat: () => import('../components/Chat/AIChat'),
    LetterEditor: () => import('../components/LetterEditor/LetterEditorV2'),
        JobSearch: () => import('../components/JobSearch/JobSearch'),
  };

  // Précharger le module directement
  const importFunction = importMap[componentKey];
  if (importFunction) {
    importFunction().catch(() => {
      // Ignorer les erreurs de préchargement et retirer du cache
      preloadCache.delete(componentKey);
    });
  }
};

/**
 * Précharge plusieurs composants de manière séquentielle
 * @param componentKeys - Array des clés des composants à précharger
 * @param delay - Délai entre chaque préchargement (en ms)
 */
export const preloadComponents = (
  componentKeys: LazyComponentKey[],
  delay: number = 100
): void => {
  componentKeys.forEach((key, index) => {
    setTimeout(() => {
      preloadComponent(key);
    }, index * delay);
  });
};

/**
 * Préchargement intelligent basé sur l'onglet actuel
 * @param currentTab - Onglet actuellement actif
 */
export const intelligentPreload = (currentTab: string): void => {
  // Définir les composants à précharger selon l'onglet actuel
  const preloadRules: Record<string, LazyComponentKey[]> = {
    dashboard: ['CVCreator', 'CVAnalysis', 'Templates'],
    analyze: ['CVCreator', 'Templates'],
    creator: ['Templates', 'CVLibrary'],
    templates: ['CVCreator'],
    library: ['CVCreator', 'Templates'],
    settings: [], // Pas de préchargement depuis les settings
  };

  const componentsToPreload = preloadRules[currentTab];
  if (componentsToPreload) {
    preloadComponents(componentsToPreload, 200);
  }
};

/**
 * Préchargement au survol des éléments de navigation
 * @param targetTab - Onglet survolé
 */
export const preloadOnHover = (targetTab: string): void => {
  const hoverPreloadMap: Record<string, LazyComponentKey> = {
    dashboard: 'Dashboard',
    analyze: 'CVAnalysis',
    creator: 'CVCreator',
    templates: 'Templates',
    library: 'CVLibrary',
    models: 'Models',
    settings: 'Settings',
    chat: 'AIChat',
    'chat-cv': 'AIChat',
    'chat-general': 'AIChat',
    'letter-editor': 'LetterEditor',
  };

  const componentKey = hoverPreloadMap[targetTab];
  if (componentKey) {
    preloadComponent(componentKey);
  }
};

/**
 * HOC pour wraper un composant lazy avec Suspense et gestion d'erreur
 */
export const withLazyLoading = <P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
  fallback?: React.ReactNode,
  errorFallback?: React.ReactNode
) => {
  return React.forwardRef<React.ComponentType<P>, P>((props, ref) => (
    <React.Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorFallback}>
        <LazyComponent {...props} ref={ref} />
      </ErrorBoundary>
    </React.Suspense>
  ));
};

// Composant ErrorBoundary simple pour les composants lazy
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-gray-600">Erreur de chargement du composant</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 px-4 py-2 bg-violet-500 text-white rounded hover:bg-violet-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
