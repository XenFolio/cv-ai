import React from 'react';
import { Contrast, Zap, Eye, EyeOff } from 'lucide-react';
import { useAdvancedTheme } from '../../hooks/useAdvancedTheme';
import { ProfessionalIcon,  } from './ProfessionalIcons';
import { InteractiveButton } from './AdvancedLoadingStates';
import { ThemeIcons } from './iconsData';

interface AdvancedThemeSettingsProps {
  className?: string;
  compact?: boolean;
}

export const AdvancedThemeSettings: React.FC<AdvancedThemeSettingsProps> = ({
  className = '',
  compact = false
}) => {
  const {
    themeMode,
    setThemeMode,
    setContrastMode,
    setMotionMode,
    isHighContrast,
    isReducedMotion
  } = useAdvancedTheme();

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${className}`}>
        {/* Theme Mode */}
        <div className="flex items-center gap-1">
          <InteractiveButton
            onClick={() => setThemeMode('light')}
            variant={themeMode === 'light' ? 'primary' : 'ghost'}
            size="sm"
            icon={<ThemeIcons.Sun className="w-4 h-4" />}
            title="Mode clair"
            aria-label="Mode clair"
          />
          <InteractiveButton
            onClick={() => setThemeMode('dark')}
            variant={themeMode === 'dark' ? 'primary' : 'ghost'}
            size="sm"
            icon={<ThemeIcons.Moon className="w-4 h-4" />}
            title="Mode sombre"
            aria-label="Mode sombre"
          />
          <InteractiveButton
            onClick={() => setThemeMode('system')}
            variant={themeMode === 'system' ? 'primary' : 'ghost'}
            size="sm"
            icon={<ThemeIcons.Monitor className="w-4 h-4" />}
            title="Mode système"
            aria-label="Mode système"
          />
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

        {/* High Contrast */}
        <InteractiveButton
          onClick={() => setContrastMode(isHighContrast ? 'normal' : 'high')}
          variant={isHighContrast ? 'primary' : 'ghost'}
          size="sm"
          icon={<Contrast className="w-4 h-4" />}
          title={isHighContrast ? 'Contraste normal' : 'Contraste élevé'}
          aria-label={isHighContrast ? 'Désactiver le contraste élevé' : 'Activer le contraste élevé'}
        />

        {/* Reduced Motion */}
        <InteractiveButton
          onClick={() => setMotionMode(isReducedMotion ? 'normal' : 'reduced')}
          variant={isReducedMotion ? 'primary' : 'ghost'}
          size="sm"
          icon={isReducedMotion ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          title={isReducedMotion ? 'Animations normales' : 'Animations réduites'}
          aria-label={isReducedMotion ? 'Activer les animations' : 'Désactiver les animations'}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Theme Mode Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <ProfessionalIcon icon={ThemeIcons.Palette} size="sm" />
          Mode d'affichage
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <InteractiveButton
            onClick={() => setThemeMode('light')}
            variant={themeMode === 'light' ? 'primary' : 'outline'}
            className="flex-col items-center gap-2 py-4"
            icon={<ThemeIcons.Sun className="w-6 h-6" />}
          >
            <span className="text-sm">Clair</span>
          </InteractiveButton>
          <InteractiveButton
            onClick={() => setThemeMode('dark')}
            variant={themeMode === 'dark' ? 'primary' : 'outline'}
            className="flex-col items-center gap-2 py-4"
            icon={<ThemeIcons.Moon className="w-6 h-6" />}
          >
            <span className="text-sm">Sombre</span>
          </InteractiveButton>
          <InteractiveButton
            onClick={() => setThemeMode('system')}
            variant={themeMode === 'system' ? 'primary' : 'outline'}
            className="flex-col items-center gap-2 py-4"
            icon={<ThemeIcons.Monitor className="w-6 h-6" />}
          >
            <span className="text-sm">Système</span>
          </InteractiveButton>
        </div>
      </div>

      {/* Accessibility Settings */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <ProfessionalIcon icon={Eye} size="sm" />
          Accessibilité
        </h3>

        <div className="space-y-3">
          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                <Contrast className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Contraste élevé
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Améliore le contraste pour une meilleure lisibilité
                </p>
              </div>
            </div>
            <InteractiveButton
              onClick={() => setContrastMode(isHighContrast ? 'normal' : 'high')}
              variant={isHighContrast ? 'primary' : 'outline'}
              size="sm"
              className="ml-4"
            >
              {isHighContrast ? 'Activé' : 'Désactivé'}
            </InteractiveButton>
          </div>

          {/* Reduced Motion Mode */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                {isReducedMotion ? (
                  <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Animations réduites
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Minimise les animations pour le confort visuel
                </p>
              </div>
            </div>
            <InteractiveButton
              onClick={() => setMotionMode(isReducedMotion ? 'normal' : 'reduced')}
              variant={isReducedMotion ? 'primary' : 'outline'}
              size="sm"
              className="ml-4"
            >
              {isReducedMotion ? 'Activé' : 'Désactivé'}
            </InteractiveButton>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Aperçu
        </h3>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="space-y-3">
            {/* Sample text with different contrast levels */}
            <div>
              <p className={`text-sm ${isHighContrast ? 'text-black dark:text-white font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                Exemple de texte normal
              </p>
              <p className={`text-xs ${isHighContrast ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                Exemple de texte secondaire avec des informations supplémentaires.
              </p>
            </div>

            {/* Sample buttons */}
            <div className="flex gap-2">
              <InteractiveButton
                variant="primary"
                size="sm"
                disabled={isReducedMotion}
              >
                Bouton primaire
              </InteractiveButton>
              <InteractiveButton
                variant="outline"
                size="sm"
                disabled={isReducedMotion}
              >
                Bouton secondaire
              </InteractiveButton>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isHighContrast ? 'bg-green-600 border-2 border-black' : 'bg-green-500'}`} />
              <span className={`text-xs ${isHighContrast ? 'font-semibold' : ''}`}>
                Statut actif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Settings Summary */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
          Paramètres actuels
        </h4>
        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <p>• Thème: {themeMode === 'light' ? 'Clair' : themeMode === 'dark' ? 'Sombre' : 'Système'}</p>
          <p>• Contraste: {isHighContrast ? 'Élevé' : 'Normal'}</p>
          <p>• Animations: {isReducedMotion ? 'Réduites' : 'Normales'}</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedThemeSettings;
