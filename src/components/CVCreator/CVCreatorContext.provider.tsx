import React, { ReactNode } from 'react';
import { CVCreatorContext } from './CVCreatorContext.hook';
import type { CVCreatorContextType } from './CVCreatorContext.types';

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