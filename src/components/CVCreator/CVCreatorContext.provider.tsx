import React, { ReactNode, createContext } from 'react';
import type { CVCreatorContextType } from './CVCreatorContext.types';

export const CVCreatorContext = createContext<CVCreatorContextType | undefined>(undefined);

interface CVCreatorProviderProps {
  children: ReactNode;
  value: CVCreatorContextType;
}

export const CVCreatorProvider: React.FC<CVCreatorProviderProps> = ({ children, value }) => {
  return (
    <CVCreatorContext.Provider value={value}>
      {children}
    </CVCreatorContext.Provider>
  );
};
