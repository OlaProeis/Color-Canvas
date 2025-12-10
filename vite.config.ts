import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  base: '/Color-Canvas/',  // GitHub Pages serves from repo name subdirectory
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate', // Silent updates on next visit
      includeAssets: ['favicon.ico', 'icons/*.png', 'icons/*.svg', 'templates/**/*.svg'],
      manifest: {
        name: 'Color Canvas',
        short_name: 'Color Canvas',
        description: 'A fun drawing and coloring app for kids with shapes, fills, and backgrounds',
        theme_color: '#38BDF8',
        background_color: '#F8F9FE',
        display: 'standalone',
        orientation: 'any',
        categories: ['kids', 'education', 'entertainment'],
        icons: [
          {
            src: 'icons/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cache all static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Don't fallback on document based (e.g. `/some-page`) requests
        navigateFallback: null,
        // Cleanup old caches
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false, // Disable in dev mode to avoid caching issues
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
