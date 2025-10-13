import { useContext } from 'react';
import { CVCreatorContext } from './CVCreatorContext.provider';
import { useCVContent, useCVStyle, useCVUI } from './contexts';

// Ancien hook pour compatibilité - utilise les nouveaux contextes spécialisés
export const useCVCreator = () => {
  // Appeler tous les hooks inconditionnellement
  const content = useCVContent();
  const style = useCVStyle();
  const ui = useCVUI();
  const context = useContext(CVCreatorContext);

  // Vérifier si les nouveaux contextes sont disponibles
  const hasNewContexts = content && style && ui;

  if (hasNewContexts) {
    // Combiner les contextes pour maintenir la compatibilité
    return {
      ...content,
      ...style,
      ...ui
    };
  } else {
    // Fallback vers l'ancien contexte si disponible
    if (!context) {
      throw new Error('useCVCreator must be used within a CVCreatorProvider');
    }
    return context;
  }
};
