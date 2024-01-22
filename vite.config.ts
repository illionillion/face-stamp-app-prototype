import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/face-stamp-app-prototype/' : './',
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      includeAssets: [
        'https://github-simple-icon-generator.vercel.app/api/?username=illionillion',
        'https://github-simple-icon-generator.vercel.app/api/?username=illionillion&size=192',
        'https://github-simple-icon-generator.vercel.app/api/?username=illionillion&size=512'
      ],
      manifest: {
        short_name: 'Face Masking App',
        name: 'Face Masking App',
        icons: [
          {
            src: 'https://github-simple-icon-generator.vercel.app/api/?username=illionillion',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
          {
            src: 'https://github-simple-icon-generator.vercel.app/api/?username=illionillion&size=192',
            type: 'image/png',
            sizes: '192x192',
          },
          {
            src: 'https://github-simple-icon-generator.vercel.app/api/?username=illionillion&size=512',
            type: 'image/png',
            sizes: '512x512',
          },
        ],
        start_url: '.',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#FF6463',
      },
    }),
  ],
});
