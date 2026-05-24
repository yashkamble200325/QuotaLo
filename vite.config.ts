import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      port: 3000,
      host: '0.0.0.0',

      // Better HMR stability
      hmr: process.env.DISABLE_HMR !== 'true',

      // Optional file watching
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {
              usePolling: true,
            },
    },

    preview: {
      port: 3000,
      host: '0.0.0.0',
    },

    build: {
      outDir: 'dist',

      // Fix large chunk warning
      chunkSizeWarningLimit: 2000,

      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          },
        },
      },
    },

    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  };
});
