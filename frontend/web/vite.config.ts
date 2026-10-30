
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
      ],

      manifest: {
        name: "Sentinela - Painel GCM",
        short_name: "Sentinela",
        description:
          "Sistema de gerenciamento de denúncias e ocorrências da Guarda Civil Municipal.",

        theme_color: "#0B0F19",
        background_color: "#0B0F19",

        display: "standalone",
        start_url: "/",
        scope: "/",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        navigateFallback: "/index.html",

        runtimeCaching: [],

        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
