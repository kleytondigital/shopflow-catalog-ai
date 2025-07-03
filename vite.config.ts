import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __DEV__: mode === "development",
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    // Configurações para versionamento de arquivos
    rollupOptions: {
      output: {
        // Adicionar hash aos nomes dos arquivos para forçar atualização
        entryFileNames: (chunkInfo) => {
          return mode === "production"
            ? `assets/${chunkInfo.name}-[hash].js`
            : `assets/${chunkInfo.name}.js`;
        },
        chunkFileNames: (chunkInfo) => {
          return mode === "production"
            ? `assets/${chunkInfo.name}-[hash].js`
            : `assets/${chunkInfo.name}.js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return mode === "production"
              ? `assets/styles/[name]-[hash][extname]`
              : `assets/styles/[name][extname]`;
          }
          return mode === "production"
            ? `assets/[name]-[hash][extname]`
            : `assets/[name][extname]`;
        },
      },
    },
    // Separar vendors em chunk separado para melhor cache
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  // Configurar headers de cache para desenvolvimento
  preview: {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  },
  esbuild: {
    // Remove console.log, console.warn, console.error em produção
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
