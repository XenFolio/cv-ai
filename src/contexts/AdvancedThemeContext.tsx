import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ContrastMode = 'normal' | 'high';
export type MotionMode = 'normal' | 'reduced';

interface AdvancedThemeContextType {
  themeMode: ThemeMode;
  contrastMode: ContrastMode;
  motionMode: MotionMode;
  setThemeMode: (mode: ThemeMode) => void;
  setContrastMode: (mode: ContrastMode) => void;
  setMotionMode: (mode: MotionMode) => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  effectiveTheme: 'light' | 'dark';
}

const AdvancedThemeContext = createContext<AdvancedThemeContextType | undefined>(undefined);

export const useAdvancedTheme = () => {
  const context = useContext(AdvancedThemeContext);
  if (!context) {
    throw new Error('useAdvancedTheme must be used within an AdvancedThemeProvider');
  }
  return context;
};

interface AdvancedThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultContrast?: ContrastMode;
  defaultMotion?: MotionMode;
}

export const AdvancedThemeProvider: React.FC<AdvancedThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  defaultContrast = 'normal',
  defaultMotion = 'normal'
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('themeMode');
      return (saved as ThemeMode) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const [contrastMode, setContrastMode] = useState<ContrastMode>(() => {
    try {
      const saved = localStorage.getItem('contrastMode');
      return (saved as ContrastMode) || defaultContrast;
    } catch {
      return defaultContrast;
    }
  });

  const [motionMode, setMotionMode] = useState<MotionMode>(() => {
    try {
      const saved = localStorage.getItem('motionMode');
      return (saved as MotionMode) || defaultMotion;
    } catch {
      return defaultMotion;
    }
  });

  // Calculate effective theme
  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeMode;
  };

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(getEffectiveTheme());

  // Update effective theme when system preference changes
  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  // Update effective theme when theme mode changes
  useEffect(() => {
    setEffectiveTheme(getEffectiveTheme());
  }, [themeMode]);

  // Save preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('themeMode', themeMode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  }, [themeMode]);

  useEffect(() => {
    try {
      localStorage.setItem('contrastMode', contrastMode);
    } catch (error) {
      console.error('Error saving contrast mode:', error);
    }
  }, [contrastMode]);

  useEffect(() => {
    try {
      localStorage.setItem('motionMode', motionMode);
    } catch (error) {
      console.error('Error saving motion mode:', error);
    }
  }, [motionMode]);

  // Apply theme classes to document
  useEffect(() => {
    const root = document.documentElement;

    // Remove all existing theme classes
    root.classList.remove('light', 'dark', 'high-contrast', 'reduced-motion');

    // Add theme classes
    root.classList.add(effectiveTheme);

    if (contrastMode === 'high') {
      root.classList.add('high-contrast');
    }

    if (motionMode === 'reduced') {
      root.classList.add('reduced-motion');
    }

    // Apply high contrast styles
    if (contrastMode === 'high') {
      root.style.setProperty('--contrast-min', '7');
      root.style.setProperty('--contrast-enhanced', '21');
    } else {
      root.style.removeProperty('--contrast-min');
      root.style.removeProperty('--contrast-enhanced');
    }

    // Apply reduced motion styles
    if (motionMode === 'reduced') {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Set meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#1f2937' : '#ffffff');
    }
  }, [effectiveTheme, contrastMode, motionMode]);

  // Listen for system preference changes for motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && motionMode === 'normal') {
        // Optionally respect system preference
        console.log('System prefers reduced motion');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [motionMode]);

  const contextValue: AdvancedThemeContextType = {
    themeMode,
    contrastMode,
    motionMode,
    setThemeMode,
    setContrastMode,
    setMotionMode,
    isHighContrast: contrastMode === 'high',
    isReducedMotion: motionMode === 'reduced',
    effectiveTheme
  };

  return (
    <AdvancedThemeContext.Provider value={contextValue}>
      {children}
    </AdvancedThemeContext.Provider>
  );
};

export default AdvancedThemeProvider;