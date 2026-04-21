import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  appType: 'custom',
  // Matches src/server/app.ts publicDir so dev warnings and /logo.png align with Express
  publicDir: 'src/public',
  build: {
    outDir: 'dist',
    manifest: true,
    rollupOptions: {
      input: 'src/client.tsx',
    },
  },
});
