import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,      // Remixアプリがリッスンするポート
    proxy: {
      // '/api'で始まるHTTPリクエストをAPIサーバーに転送
      '/api': {
        target: 'http://api:3000',
        changeOrigin: true,
      },
      // '/socket'で始まるWebSocket接続をAPIサーバーに転送
      '/socket': {
        target: 'ws://api:3000',
        ws: true, // WebSocketプロキシを有効にする
      },
    },
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
});
