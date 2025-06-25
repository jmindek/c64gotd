import { defineConfig } from 'vite';
import { resolve } from 'path';


export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [],
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: ['..']
    },
    hmr: {
      overlay: true
    },
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@public': resolve(__dirname, './public')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  optimizeDeps: {

    exclude: ['@emulatorjs/core-vice_x64']
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  }
});
