import React, { ReactNode } from 'react';
import {
  CVContentProvider,
  CVStyleProvider,
  CVUIProvider,
  type CVContentType,
  type CVStyleType,
  type CVUIType
} from './contexts';

interface CVCreatorProvidersProps {
  children: ReactNode;
  contentValue: CVContentType;
  styleValue: CVStyleType;
  uiValue: CVUIType;
}

export const CVCreatorProviders: React.FC<CVCreatorProvidersProps> = ({
  children,
  contentValue,
  styleValue,
  uiValue
}) => {
  return (
    <CVContentProvider value={contentValue}>
      <CVStyleProvider value={styleValue}>
        <CVUIProvider value={uiValue}>
          {children}
        </CVUIProvider>
      </CVStyleProvider>
    </CVContentProvider>
  );
};