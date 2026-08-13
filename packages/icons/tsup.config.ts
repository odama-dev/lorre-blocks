import { defineConfig } from "tsup"

const STYLES = [
  "stroke-1",
  "stroke-1.5",
  "stroke-2",
  "filled-1",
  "filled-1.5",
  "filled-2",
]

export default defineConfig({
  entry: Object.fromEntries(STYLES.map((s) => [`${s}/index`, `src/${s}/index.tsx`])),
  format: ["esm"],
  target: "es2022",
  dts: true,
  clean: true,
  // 585 components per entry; without splitting off, importing one style would
  // pull the whole file. Consumers rely on bundler tree-shaking, which needs
  // each export to stay its own top-level binding.
  splitting: false,
  treeshake: true,
  external: ["react"],
  // The package exports "./catalog.json" from dist; tsup only emits the JS
  // entries, so the catalog has to be copied in alongside them.
  async onSuccess() {
    const { copyFile } = await import("node:fs/promises")
    await copyFile("src/catalog.json", "dist/catalog.json")
  },
})
