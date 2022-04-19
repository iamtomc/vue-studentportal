import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import { VitePWA } from 'vite-plugin-pwa';

import { readFileSync } from 'fs';
import config from './windi.config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    WindiCSS({
      transformCSS: 'pre'
    }),
    Icons({
      customCollections: {
        'custom': {
          'logo': () => readFileSync('./src/assets/myuic-concept.svg', 'utf-8'),
          'google-classroom': `
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M1.637 1.637C.732 1.637 0 2.369 0 3.273v17.454c0 .904.732 1.636 1.637 1.636h20.726c.905 0 1.637-.732 1.637-1.636V3.273c0-.904-.732-1.636-1.637-1.636H1.637zm.545 2.181h19.636v16.364h-2.726v-1.09h-4.91v1.09h-12V3.818zM12 8.182a1.636 1.636 0 1 0 0 3.273 1.636 1.636 0 1 0 0-3.273zm-4.363 1.91c-.678 0-1.229.55-1.229 1.226a1.228 1.228 0 0 0 2.455 0c0-.677-.549-1.226-1.226-1.226zm8.726 0a1.227 1.227 0 1 0 0 2.453 1.227 1.227 0 0 0 0-2.453zM12 12.545c-1.179 0-2.413.401-3.148 1.006a4.136 4.136 0 0 0-1.215-.188c-1.314 0-2.729.695-2.729 1.559v.896h14.184v-.896c0-.864-1.415-1.559-2.729-1.559-.41 0-.83.068-1.215.188-.735-.605-1.969-1.006-3.148-1.006Z"/>
          </svg>
          `
        },
        'payment-center-logos': FileSystemIconLoader('./src/assets/payment-center-logos')
      },
      iconCustomizer(collection, icon, props) {
        if (collection === 'payment-center-logos') {
          props.width = '1.8em';
        }
      }
    }),
    VitePWA({
      includeManifestIcons: true,
      manifest: {
        //@ts-ignore
        background_color: config.theme.colors.primary["500"],
        //@ts-ignore
        theme_color: config.theme.colors.primary["500"],
        name: "MyUIC Concept",
        short_name: 'MyUIC Concept',
        display: "standalone",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-256x256.png",
            sizes: "256x256",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
