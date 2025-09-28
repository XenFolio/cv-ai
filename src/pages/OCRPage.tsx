import React from 'react';
import { BreadcrumbNavigation } from '../components/UI/BreadcrumbNavigation';
import { OCRTest } from '../components/OCR/OCRTest';

export const OCRPage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Accueil', path: '/' },
    { label: 'OCR CV', path: '/ocr' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec breadcrumb */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <BreadcrumbNavigation items={breadcrumbItems} />
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="py-8">
        <OCRTest />
      </main>
    </div>
  );
};