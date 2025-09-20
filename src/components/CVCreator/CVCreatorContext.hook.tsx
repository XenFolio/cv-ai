import { createContext, useContext } from 'react';
import type { CVCreatorContextType } from './CVCreatorContext.types';

export const CVCreatorContext = createContext<CVCreatorContextType | undefined>(undefined);

export const useCVCreator = () => {
  const context = useContext(CVCreatorContext);
  if (!context) {
    throw new Error('useCVCreator must be used within a CVCreatorProvider');
  }
  return context;
};