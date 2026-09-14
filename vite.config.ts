import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        react: resolve(__dirname, "src/react.ts"),
        vue: resolve(__dirname, "src/vue.ts"),
        svelte: resolve(__dirname, "src/svelte.ts"),
        "web-components": resolve(__dirname, "src/web-components.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    emptyOutDir: true,
    rollupOptions: { external: ["react", "vue"] },
  },
});
