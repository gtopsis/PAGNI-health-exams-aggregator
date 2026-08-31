import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // Tauri expects a fixed dev port and fails if it is not available.
  server: {
    port: 1420,
    strictPort: true,
    host: "127.0.0.1",
  },
  // Prevent obscuring Rust errors in the terminal.
  clearScreen: false,
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS/Linux.
    target: ["es2022", "chrome120", "safari17"],
    sourcemap: !!process.env.VSCODE_DEBUG,
  },
});
