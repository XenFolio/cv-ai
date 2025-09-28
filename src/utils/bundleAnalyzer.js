/**
 * Script d'analyse des bundles et des dépendances
 * Pour analyser la taille des chunks et optimiser les performances
 */

import { execSync } from 'child_process';
import fs from 'fs';

export const analyzeBundles = () => {
  console.log('📊 Analyse des bundles en cours...\n');

  try {
    const buildOutput = execSync('npm run build 2>&1', { encoding: 'utf8' });
    const lines = buildOutput.split('\n');

    const chunkRegex = /dist\/assets\/([^-]+)-([^.]+)\.js\s+([.\d]+)\s+kB/;
    const chunks = [];

    lines.forEach(line => {
      const match = line.match(chunkRegex);
      if (match) {
        chunks.push({
          name: match[1],
          hash: match[2],
          size: parseFloat(match[3])
        });
      }
    });

    chunks.sort((a, b) => b.size - a.size);

    console.log('🔍 Chunks les plus volumineux:');
    chunks.slice(0, 10).forEach((chunk, index) => {
      console.log(`${index + 1}. ${chunk.name}: ${(chunk.size / 1024).toFixed(2)} MB`);
    });

    return chunks;

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
    return [];
  }
};

export const suggestOptimizations = () => {
  console.log('🚀 Optimisations recommandées pour votre projet React/Vite:\n');

  console.log('=== 🎯 OPTIMISATIONS PRIORITAIRES ===\n');

  console.log('1. 📦 Dynamic Imports pour les dépendances lourdes:');
  console.log('   • react-syntax-highlighter (596kB) → Importer seulement quand nécessaire');
  console.log('   • docx/mammoth (386kB + 209kB) → Lazy loading pour l\'export');
  console.log('   • jspdf/html2pdf (576kB) → Importer uniquement lors de l\'export PDF');
  console.log('   • tesseract.js (OCR) → Charger seulement pour la fonctionnalité de scan');

  console.log('\n2. 🧩 Code Splitting par fonctionnalités:');
  console.log('   • Séparer CVCreator en sous-modules: Export, Preview, StyleControls');
  console.log('   • Créer des routes lazy pour pages non essentielles');
  console.log('   • Extraire Advanced Analysis (DetailedAnalysis) dans un chunk séparé');

  console.log('\n3. 🗂️ Tree Shaking amélioré:');
  console.log('   • Utiliser named exports plutôt que default exports');
  console.log('   • Éliminer les imports inutiles (surtout lucide-react icons)');
  console.log('   • Configurer sideEffects dans package.json');

  console.log('\n=== 🛠️ IMPLEMENTATIONS PRATIQUES ===\n');

  console.log('a) Lazy Loading de CVCreator:');
  console.log(`
  // Dans lazyComponents.tsx, remplacer:
  CVCreator: lazy(() => import('../components/CVCreator/CVCreator'))

  // Par:
  CVCreator: lazy(() => import('../components/CVCreator/CVCreator').then(module => ({
    default: (props: CVCreatorProps) => {
      const [isLoaded, setIsLoaded] = useState(false);
      useEffect(() => { setIsLoaded(true); }, []);
      return isLoaded ? <module.default {...props} /> : <LoadingSpinner />;
    }
  })))
  `);

  console.log('\n=== 📊 ANALYSEURS RECOMMANDÉS ===\n');

  console.log('npm i --save-dev vite-bundle-analyzer rollup-plugin-visualizer');

  console.log(`
  Import dans vite.config.ts:
  import { visualizer } from 'rollup-plugin-visualizer';

  Puis ajouter dans plugins:
  visualizer({
    filename: 'dist/bundle-analysis.html',
    open: true,
    gzipSize: true,
    brotliSize: true
  })
  `);

  console.log('\n=== 🚀 OPTIMISATIONS AVANCÉES ===\n');

  console.log('4. 🎯 Preload strategique:');
  console.log('   • Preload des chunks critiques (dashboard, CVCreator)');
  console.log('   • DEFUSE non-blocking pour les chunks secondaires');

  console.log('\n5. 💾 Service Worker & Cache:');
  console.log('   • Implémenter cache pour vendor chunks');
  console.log('   • Background sync pour offline');

  console.log('\n6. 🔧 Webpack/Vite optimizations:');
  console.log('   • Active minification Terser avec options avancées');
  console.log('   •Compression Brotli + Gzip');

  console.log('\n=== 📈 RÉSULTATS ATTENDUS ===\n');
  console.log('• First Contentful Paint: -30%');
  console.log('• Time to Interactive: -25%');
  console.log('• Bundle size: -200-400kB');
  console.log('• Lighthouse Score: +10 points');
};

export default { analyzeBundles, suggestOptimizations };
