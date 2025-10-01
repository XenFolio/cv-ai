import { useState, useEffect, useCallback, useRef } from 'react';

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface MarginManagerOptions {
  onMarginsChange?: (margins: Margins) => void;
  showNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  editorContainerRef?: React.RefObject<HTMLDivElement>;
}

export const useMarginManager = ({
  onMarginsChange,
  showNotification,
  editorRef: externalEditorRef,
  editorContainerRef: externalEditorContainerRef
}: MarginManagerOptions = {}) => {
  const [customMargins, setCustomMargins] = useState<Margins>({
    top: 15,
    right: 15,
    bottom: 15,
    left: 15,
  });

  const [showMarginModal, setShowMarginModal] = useState(false);
  const internalEditorRef = useRef<HTMLDivElement>(null);
  const internalEditorContainerRef = useRef<HTMLDivElement>(null);

  // Utiliser les refs externes si fournies, sinon les refs internes
  const editorRef = externalEditorRef || internalEditorRef;
  const editorContainerRef = externalEditorContainerRef || internalEditorContainerRef;

  // Conversion mm -> pixels (96 DPI standard)
  const toPx = useCallback((mm: number): number => {
    return Math.round(mm * 2.8);
  }, []);

  // Conversion pixels -> mm
  const toMm = useCallback((px: number): number => {
    return Math.round(px / 2.8);
  }, []);

  // Appliquer les marges aux éléments DOM
  const applyMargins = useCallback((element: HTMLElement, margins: Margins) => {
    element.style.paddingTop = `${toPx(margins.top)}px`;
    element.style.paddingRight = `${toPx(margins.right)}px`;
    element.style.paddingBottom = `${toPx(margins.bottom)}px`;
    element.style.paddingLeft = `${toPx(margins.left)}px`;
  }, [toPx]);

  // Appliquer les marges personnalisées sur tous les letter-container
  useEffect(() => {
    const applyMarginsToAllContainers = () => {
      const letterContainers = document.querySelectorAll('.letter-container');
      letterContainers.forEach((container) => {
        applyMargins(container as HTMLElement, customMargins);
      });
    };

    applyMarginsToAllContainers();

    // Timeout pour s'assurer que les éléments sont bien présents après changement de template
    const timeoutId = setTimeout(() => {
      applyMarginsToAllContainers();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [customMargins, applyMargins]);

  // Parser les marges depuis un template (format CSS)
  const parseMarginsFromTemplate = useCallback((templatePadding: string): Margins => {
    let newMargins = { top: 20, right: 20, bottom: 20, left: 20 };

    if (!templatePadding) return newMargins;

    const values = templatePadding.split(/\s+/).map(v => {
      const match = v.match(/(\d+)/);
      const value = match ? parseInt(match[1]) : 0;

      // Convertir en pixels si nécessaire
      if (v.includes('mm')) {
        return toPx(value);
      }
      return value; // déjà en pixels
    });

    if (values.length === 1) {
      // Format: "20mm" -> toutes les marges
      newMargins = { top: values[0], right: values[0], bottom: values[0], left: values[0] };
    } else if (values.length === 2) {
      // Format: "20px 30px" -> vertical horizontal
      newMargins = { top: values[0], right: values[1], bottom: values[0], left: values[1] };
    } else if (values.length === 4) {
      // Format: "20px 30px 40px 30px" -> top right bottom left
      newMargins = { top: values[0], right: values[1], bottom: values[2], left: values[3] };
    }

    return newMargins;
  }, [toPx]);

  // Sauvegarder les nouvelles marges
  const saveMargins = useCallback((newMargins: Margins) => {
    setCustomMargins(newMargins);
    setShowMarginModal(false);
    onMarginsChange?.(newMargins);
    showNotification?.('Marges mises à jour', 'success');
  }, [onMarginsChange, showNotification]);

  // Ouvrir la modal avec les marges du template actuel
  const openMarginModal = useCallback((templatePadding?: string) => {
    if (templatePadding) {
      const templateMargins = parseMarginsFromTemplate(templatePadding);
      setCustomMargins(templateMargins);
    }
    setShowMarginModal(true);
  }, [parseMarginsFromTemplate]);

  // Fermer la modal
  const closeMarginModal = useCallback(() => {
    setShowMarginModal(false);
  }, []);

  // Obtenir les marges en mm pour l'export PDF
  const getMarginsForExport = useCallback((): Margins => {
    return customMargins; // déjà en mm
  }, [customMargins]);

  // Obtenir les marges en pixels pour le style inline
  const getMarginsForStyle = useCallback((): {
    top: string;
    right: string;
    bottom: string;
    left: string;
  } => {
    return {
      top: `${toPx(customMargins.top)}px`,
      right: `${toPx(customMargins.right)}px`,
      bottom: `${toPx(customMargins.bottom)}px`,
      left: `${toPx(customMargins.left)}px`,
    };
  }, [customMargins, toPx]);

  // Appliquer des presets de marges
  const applyPreset = useCallback((preset: 'standard' | 'narrow' | 'wide' | 'custom', customValue?: Margins) => {
    let newMargins: Margins;

    switch (preset) {
      case 'standard':
        newMargins = { top: 15, right: 15, bottom: 15, left: 15 };
        break;
      case 'narrow':
        newMargins = { top: 10, right: 10, bottom: 10, left: 10 };
        break;
      case 'wide':
        newMargins = { top: 30, right: 30, bottom: 30, left: 30 };
        break;
      case 'custom':
        if (!customValue) {
          setShowMarginModal(true);
          return;
        }
        newMargins = customValue;
        break;
      default:
        newMargins = customMargins;
    }

    saveMargins(newMargins);
  }, [customMargins, saveMargins]);

  // Réinitialiser aux marges par défaut
  const resetMargins = useCallback(() => {
    const defaultMargins = { top: 15, right: 15, bottom: 15, left: 15 };
    saveMargins(defaultMargins);
  }, [saveMargins]);

  // Forcer la réapplication des marges (utile après changement de template)
  const reapplyMargins = useCallback(() => {
    const letterContainers = document.querySelectorAll('.letter-container');
    letterContainers.forEach((container) => {
      applyMargins(container as HTMLElement, customMargins);
    });
  }, [customMargins, applyMargins]);

  return {
    // État
    customMargins,
    showMarginModal,

    // Refs
    editorRef,
    editorContainerRef,

    // Actions principales
    setCustomMargins,
    saveMargins,
    openMarginModal,
    closeMarginModal,

    // Utilitaires
    toPx,
    toMm,
    applyMargins,
    parseMarginsFromTemplate,
    getMarginsForExport,
    getMarginsForStyle,
    applyPreset,
    resetMargins,
    reapplyMargins,
  };
};
