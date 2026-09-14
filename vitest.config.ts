import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    exclude: ["tests/browser/**", "node_modules/**", "dist/**"],
  },
});
