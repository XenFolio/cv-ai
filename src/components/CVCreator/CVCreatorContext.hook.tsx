import { useContext } from 'react';
import { CVCreatorContext } from './CVCreatorContext.provider';

export const useCVCreator = () => {
  const context = useContext(CVCreatorContext);
  if (!context) {
    throw new Error('useCVCreator must be used within a CVCreatorProvider');
  }
  return context;
};
