import React, { createContext, useContext, useEffect, useState } from 'react';
import { darkMode } from '../styles/theme';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved) return saved;

      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'system';
      }
    }
    return 'light';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const calculateTheme = () => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return theme === 'dark';
    };

    const dark = calculateTheme();
    setIsDark(dark);

    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);

      // Apply theme to document
      const root = document.documentElement;

      if (dark) {
        root.classList.add('dark');
        // Apply dark mode custom properties
        root.style.setProperty('--background', darkMode.background);
        root.style.setProperty('--surface', darkMode.surface);
        root.style.setProperty('--surface-hover', darkMode.surfaceHover);
        root.style.setProperty('--border', darkMode.border);
        root.style.setProperty('--text-primary', darkMode.text.primary);
        root.style.setProperty('--text-secondary', darkMode.text.secondary);
        root.style.setProperty('--text-muted', darkMode.text.muted);
      } else {
        root.classList.remove('dark');
        // Reset to light mode defaults
        root.style.removeProperty('--background');
        root.style.removeProperty('--surface');
        root.style.removeProperty('--surface-hover');
        root.style.removeProperty('--border');
        root.style.removeProperty('--text-primary');
        root.style.removeProperty('--text-secondary');
        root.style.removeProperty('--text-muted');
      }
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        setIsDark(mediaQuery.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  };

  const value = {
    theme,
    setTheme,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};