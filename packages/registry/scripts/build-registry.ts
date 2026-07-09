import { createHash } from "node:crypto"
import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { z } from "zod"

import { registry } from "../registry"
import {
  REGISTRY_SCHEMA_VERSION,
  type BuiltRegistryItem,
  type RegistryIndexItem,
  type RegistryManifest,
} from "../src/schema"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REGISTRY_ROOT = path.resolve(__dirname, "..")
const SRC_DIR = path.join(REGISTRY_ROOT, "src")

const OUTPUT_DIR = path.resolve(REGISTRY_ROOT, "..", "..", "apps", "www", "public", "r")

const itemTypeSchema = z.enum([
  "registry:ui",
  "registry:lib",
  "registry:hook",
  "registry:token",
  "registry:theme",
  "registry:block",
  "registry:motion",
  "registry:icon",
  "registry:asset",
])

const registryItemSchema = z
  .object({
    name: z
      .string()
      .regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, "name must be kebab-case"),
    type: itemTypeSchema,
    description: z.string().min(20, "description must be meaningful (>= 20 chars) — agents rely on it"),
    source: z.enum(["shadcn", "magicui", "radix", "lorre"]),
    category: z.enum([
      "token",
      "component",
      "block",
      "motion",
      "icon",
      "illustration",
      "asset",
      "lib",
    ]),
    themes: z.array(z.string()).optional(),
    tokenType: z
      .enum(["color", "typography", "spacing", "layout", "radius", "shadow", "motion"])
      .optional(),
    tags: z.array(z.string()).optional(),
    license: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
    registryDependencies: z.array(z.string()).optional(),
    files: z.array(z.object({ path: z.string(), type: itemTypeSchema })).min(1),
  })
  .superRefine((item, ctx) => {
    if (item.source !== "lorre" && !item.license) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `"${item.name}" is ported from ${item.source} — license is required`,
      })
    }
    if (item.category === "token" && !item.tokenType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `"${item.name}" has category "token" — tokenType is required`,
      })
    }
  })

function validate() {
  const names = new Set<string>()
  for (const item of registry) {
    const parsed = registryItemSchema.safeParse(item)
    if (!parsed.success) {
      console.error(`✗ registry item "${item.name}" is invalid:`)
      for (const issue of parsed.error.issues) {
        console.error(`  - ${issue.path.join(".") || "(item)"}: ${issue.message}`)
      }
      process.exit(1)
    }
    if (names.has(item.name)) {
      console.error(`✗ duplicate registry item name: "${item.name}"`)
      process.exit(1)
    }
    names.add(item.name)
  }
  // registryDependencies must resolve within the registry
  for (const item of registry) {
    for (const dep of item.registryDependencies ?? []) {
      if (!names.has(dep)) {
        console.error(`✗ "${item.name}" depends on unknown registry item "${dep}"`)
        process.exit(1)
      }
    }
  }
}

async function readFileContent(filePath: string): Promise<string> {
  const abs = path.join(SRC_DIR, filePath)
  return fs.readFile(abs, "utf8")
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex")
}

async function build() {
  validate()

  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const index: RegistryIndexItem[] = []

  for (const item of registry) {
    const files = await Promise.all(
      item.files.map(async (file) => ({
        ...file,
        content: await readFileContent(file.path),
      }))
    )

    const checksum = sha256(files.map((f) => f.content).join("\n"))
    const built: BuiltRegistryItem = { ...item, files, checksum }

    const outPath = path.join(OUTPUT_DIR, `${item.name}.json`)
    await fs.writeFile(outPath, JSON.stringify(built, null, 2) + "\n", "utf8")

    const { files: _files, ...meta } = built
    index.push(meta)

    console.log(`✓ ${item.name} -> r/${item.name}.json (${files.length} file(s))`)
  }

  await fs.writeFile(
    path.join(OUTPUT_DIR, "index.json"),
    JSON.stringify(index, null, 2) + "\n",
    "utf8"
  )
  console.log(`✓ index -> r/index.json (${index.length} item(s))`)

  const manifest: RegistryManifest = {
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    itemCount: index.length,
    sources: [...new Set(index.map((i) => i.source))],
    categories: [...new Set(index.map((i) => i.category))],
    themes: [...new Set(index.flatMap((i) => i.themes ?? []))],
  }
  await fs.writeFile(
    path.join(OUTPUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8"
  )
  console.log(`✓ manifest -> r/manifest.json (schema v${REGISTRY_SCHEMA_VERSION})`)

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
