import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { mobxVmVitePlugin } from 'mobx-view-model-vite-plugin';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  return {
  plugins: [mobxVmVitePlugin({
    autoDisplayName: isDev,
    devtools: isDev,
    hmr: isDev,
  }), tailwindcss(), react()],
  appType: 'custom' as const,
  // Matches src/server/app.ts publicDir so dev warnings and /logo.png align with Express
  publicDir: 'public',
  build: {
    outDir: 'dist',
    manifest: true,
    rollupOptions: {
      input: 'src/client.tsx',
    },
  },
  }
});
