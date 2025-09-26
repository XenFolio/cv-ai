import React, { useEffect } from 'react';
import { CVScanIntegration } from './CVScanIntegration';

export const CVScanStandalone: React.FC = () => {
  useEffect(() => {
    // Forcer le mode démo
    document.title = 'CV Scan Demo - CV-AI';
  }, []);

  return <CVScanIntegration onBack={() => window.history.back()} />;
};