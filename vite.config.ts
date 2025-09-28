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
        manualChunks: (id) => {
          // Vendors React (chargés une seule fois)
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Composants UI (icônes, composants d'interface)
          if (id.includes('node_modules/lucide-react')) {
            return 'ui-vendor';
          }
          // Utilitaires d'état et de gestion
          if (id.includes('node_modules/zustand') || id.includes('node_modules/@tanstack/react-query')) {
            return 'utils';
          }
          // Supabase et authentification
          if (id.includes('node_modules/@supabase')) {
            return 'auth-vendor';
          }
          // Librairies PDF
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2pdf')) {
            return 'pdf-vendor';
          }
          // Librairies de traitement de documents (séparé en deux pour réduire la taille)
          if (id.includes('node_modules/docx') || id.includes('node_modules/mammoth')) {
            return 'word-vendor';
          }
          if (id.includes('node_modules/html2canvas') || id.includes('node_modules/fabric') || id.includes('node_modules/tesseract.js')) {
            return 'ocr-vendor';
          }
          // Librairies markdown
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark')) {
            return 'markdown-vendor';
          }
          // Stripe
          if (id.includes('node_modules/@stripe')) {
            return 'stripe-vendor';
          }
          // Librairies de syntax highlighting (grosse) - séparées en chunks plus petits
          if (id.includes('node_modules/highlight.js')) {
            return 'syntax-highlight-vendor';
          }
          if (id.includes('node_modules/react-syntax-highlighter') ||
              id.includes('node_modules/refractor')) {
            return 'syntax-render-vendor';
          }
          // Librairies de gestion des dates/calendrier
          if (id.includes('node_modules/date-fns') || id.includes('node_modules/dayjs')) {
            return 'date-vendor';
          }
          // Librairies de validation/formulaires
          if (id.includes('node_modules/yup') || id.includes('node_modules/zod')) {
            return 'validation-vendor';
          }
          // D'autres vendors moins critiques (séparés en chunks plus petits)
          if (id.includes('node_modules/') && !id.includes('node_modules/@types')) {
            // Séparer par domaine fonctionnel plutôt que tout dans 'vendor'
            if (id.includes('core-js') || id.includes('babel-runtime') || id.includes('regenerator-runtime')) {
              return 'polyfills-vendor';
            }
            if (id.includes('underscore') || id.includes('lodash') || id.includes('ramda')) {
              return 'utils-vendor';
            }
            if (id.includes('axios') || id.includes('fetch') || id.includes('http')) {
              return 'http-vendor';
            }
            // Le reste va dans vendor-core (devrait être plus petit maintenant)
            return 'vendor-core';
          }
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
        // Optimisations supplémentaires
        pure_funcs: ['console.debug'],
      },
    },
    // Activer le CSS code splitting
    cssCodeSplit: true,
    // Sourcemaps en production pour le debugging
    sourcemap: false,
  },
  optimizeDeps: {
    // Pré-bundler les dépendances critiques
    include: [
      'react',
      'react-dom',
      'zustand',
      '@supabase/supabase-js',
      'docx',
      'file-saver'
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
