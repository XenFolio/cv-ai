import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ContrastMode = 'normal' | 'high';
export type MotionMode = 'normal' | 'reduced';

export interface AdvancedThemeContextType {
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

export const AdvancedThemeContext = createContext<AdvancedThemeContextType | undefined>(undefined);

export const useAdvancedTheme = () => {
  const context = useContext(AdvancedThemeContext);
  if (!context) {
    throw new Error('useAdvancedTheme must be used within an AdvancedThemeProvider');
  }
  return context;
};
