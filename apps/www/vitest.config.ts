import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  // Next's tsconfig uses jsx: preserve; the plugin transforms it for vitest.
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@www", replacement: path.resolve(__dirname) },
      {
        find: "@/components/ui",
        replacement: path.resolve(__dirname, "../../packages/registry/src/ui"),
      },
      {
        find: "@/",
        replacement: path.resolve(__dirname, "../../packages/registry/src") + "/",
      },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
  },
})
