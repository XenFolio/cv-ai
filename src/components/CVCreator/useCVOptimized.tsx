import { useCVContent } from './contexts/CVContentContext';
import { useCVStyle } from './contexts/CVStyleContext';
import { useCVUI } from './contexts/CVUIContext';

// Hook unifié qui combine tous les contextes CV optimisés
export const useCVOptimized = () => {
  const content = useCVContent();
  const style = useCVStyle();
  const ui = useCVUI();

  return {
    ...content,
    ...style,
    ...ui
  };
};