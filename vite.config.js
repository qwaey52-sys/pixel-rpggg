import { defineConfig } from 'vite';

// base './' нужен, чтобы пути работали внутри Android WebView.
export default defineConfig({
  base: './',
  build: { outDir: 'dist', emptyOutDir: true }
});
