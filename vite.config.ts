import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimisation des chunks pour le lazy loading
    rollupOptions: {
      output: {
        // Séparation manuelle des chunks pour optimiser le chargement
        manualChunks: {
          // Vendors React (chargés une seule fois)
          'react-vendor': ['react', 'react-dom'],
          // Composants UI (icônes, composants d'interface)
          'ui-vendor': ['lucide-react'],
          // Utilitaires d'état et de gestion
          'utils': ['zustand', '@tanstack/react-query'],
          // Supabase et authentification
          'auth-vendor': ['@supabase/supabase-js'],
          // Librairies de traitement de documents
          'document-vendor': ['html2canvas', 'jspdf', 'docx', 'mammoth'],
        },
      },
    },
    // Augmenter la limite d'avertissement pour les gros chunks
    chunkSizeWarningLimit: 1000,
    // Optimiser la taille minimale des chunks
    minify: 'terser',
    terserOptions: {
      compress: {
        // Supprimer les console.log en production
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    // Pré-bundler les dépendances critiques
    include: [
      'react', 
      'react-dom', 
      'zustand',
      '@supabase/supabase-js'
    ],
    // Exclure les dépendances qui doivent être traitées dynamiquement
    exclude: ['lucide-react'],
  },
  // Configuration pour le développement
  server: {
    // Pré-transformation pour améliorer la vitesse en dev
    warmup: {
      clientFiles: [
        './src/App.tsx',
        './src/main.tsx',
        './src/components/Layout/**/*.tsx'
      ]
    }
  }
});
