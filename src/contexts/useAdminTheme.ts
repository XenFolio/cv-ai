import { createContext, useContext } from 'react';

export interface AdminThemeContextType {
  isAdmin: boolean;
  adminTheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  themeClasses: {
    bg: string;
    bgGradient: string;
    bgSurface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    secondary: string;
    accent: string;
    card: string;
    button: string;
    buttonHover: string;
  };
  applyAdminTheme: () => void;
  removeAdminTheme: () => void;
}

export const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
}
