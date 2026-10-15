import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/latent-watermarking-101/",
  optimizeDeps: { entries: ['index.html'] },
  server: {
    watch: { ignored: ['**/implementations/**', '**/.uv-cache*/**', '**/outputs/**'] },
  },
});
