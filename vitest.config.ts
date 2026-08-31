import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "jsdom",
    globals: false,
    include: ["src/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      include: ["src/domain/**", "src/stores/**", "src/components/**", "src/composables/**"],
      thresholds: {
        "src/domain/**": { statements: 90, branches: 90, functions: 90, lines: 90 },
      },
    },
  },
});
