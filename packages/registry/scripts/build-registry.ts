import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { registry } from "../registry"
import type { BuiltRegistryItem } from "../src/schema"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REGISTRY_ROOT = path.resolve(__dirname, "..")
const SRC_DIR = path.join(REGISTRY_ROOT, "src")

const OUTPUT_DIR = path.resolve(REGISTRY_ROOT, "..", "..", "apps", "www", "public", "r")

async function readFileContent(filePath: string): Promise<string> {
  const abs = path.join(SRC_DIR, filePath)
  return fs.readFile(abs, "utf8")
}

async function build() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const index: Array<{
    name: string
    type: string
    description?: string
    dependencies?: string[]
    registryDependencies?: string[]
  }> = []

  for (const item of registry) {
    const files = await Promise.all(
      item.files.map(async (file) => ({
        ...file,
        content: await readFileContent(file.path),
      }))
    )

    const built: BuiltRegistryItem = { ...item, files }

    const outPath = path.join(OUTPUT_DIR, `${item.name}.json`)
    await fs.writeFile(outPath, JSON.stringify(built, null, 2) + "\n", "utf8")

    index.push({
      name: item.name,
      type: item.type,
      description: item.description,
      dependencies: item.dependencies,
      registryDependencies: item.registryDependencies,
    })

    console.log(`✓ ${item.name} -> r/${item.name}.json (${files.length} file(s))`)
  }

  await fs.writeFile(
    path.join(OUTPUT_DIR, "index.json"),
    JSON.stringify(index, null, 2) + "\n",
    "utf8"
  )
  console.log(`✓ index -> r/index.json (${index.length} item(s))`)

  const themeCss = await fs.readFile(
    path.join(SRC_DIR, "styles", "theme.css"),
    "utf8"
  )
  await fs.writeFile(
    path.join(OUTPUT_DIR, "theme.json"),
    JSON.stringify({ css: themeCss }, null, 2) + "\n",
    "utf8"
  )
  console.log("✓ theme -> r/theme.json")
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
