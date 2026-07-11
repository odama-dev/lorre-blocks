import { createHash } from "node:crypto"
import { promises as fs, readFileSync } from "node:fs"
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
import { allResolvedThemes, themeToCss, themeToDtcg } from "../src/tokens"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REGISTRY_ROOT = path.resolve(__dirname, "..")
const SRC_DIR = path.join(REGISTRY_ROOT, "src")

const OUTPUT_DIR = path.resolve(REGISTRY_ROOT, "..", "..", "apps", "www", "public", "r")

// npm deps in registry.ts are bare names; the version range each consumer
// receives is resolved from this package's own dependencies, so the published
// registry always matches what the workspace typechecks and tests against.
const DEP_RANGES: Record<string, string> = JSON.parse(
  readFileSync(path.join(REGISTRY_ROOT, "package.json"), "utf8")
).dependencies ?? {}

function withVersionRanges(deps: string[] | undefined): string[] | undefined {
  return deps?.map((dep) => `${dep}@${DEP_RANGES[dep]}`)
}

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
    source: z.enum(["shadcn", "magicui", "radix", "reactbits", "lorre"]),
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
  // npm deps must be bare names declared (and therefore tested) in this
  // package's dependencies — that's where their published range comes from
  for (const item of registry) {
    for (const dep of item.dependencies ?? []) {
      if (!DEP_RANGES[dep]) {
        console.error(
          `✗ "${item.name}" npm dep "${dep}" is not in packages/registry/package.json dependencies — add it there (bare name in registry.ts, range in package.json)`
        )
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
    const built: BuiltRegistryItem = {
      ...item,
      dependencies: withVersionRanges(item.dependencies),
      files,
      checksum,
    }

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

  // ---- Themes + DTCG tokens ----
  const themesDir = path.join(OUTPUT_DIR, "themes")
  const tokensDir = path.join(OUTPUT_DIR, "tokens")
  await fs.mkdir(themesDir, { recursive: true })
  await fs.mkdir(tokensDir, { recursive: true })

  const resolvedThemes = allResolvedThemes()
  let basicCss: string | null = null

  for (const theme of resolvedThemes) {
    const css = themeToCss(theme)
    if (theme.name === "basic") basicCss = css

    await fs.writeFile(
      path.join(themesDir, `${theme.name}.json`),
      JSON.stringify(
        {
          name: theme.name,
          description: theme.description,
          extends: theme.extends,
          css,
        },
        null,
        2
      ) + "\n",
      "utf8"
    )
    await fs.writeFile(
      path.join(tokensDir, `${theme.name}.json`),
      JSON.stringify(themeToDtcg(theme), null, 2) + "\n",
      "utf8"
    )
    console.log(`✓ theme ${theme.name} -> r/themes/${theme.name}.json + r/tokens/${theme.name}.json`)
  }

  await fs.writeFile(
    path.join(themesDir, "index.json"),
    JSON.stringify(
      resolvedThemes.map((t) => ({
        name: t.name,
        description: t.description,
        extends: t.extends,
      })),
      null,
      2
    ) + "\n",
    "utf8"
  )
  console.log(`✓ themes index -> r/themes/index.json (${resolvedThemes.length} theme(s))`)

  if (!basicCss) throw new Error('Root theme "basic" was not built')

  // Canonical stylesheet consumed by apps/www — generated, do not edit by hand.
  const generatedHeader =
    "/* GENERATED by scripts/build-registry.ts from src/tokens — do not edit.\n" +
    "   This is the \"basic\" theme; other themes live at /r/themes/<name>.json. */\n\n"
  await fs.writeFile(
    path.join(SRC_DIR, "styles", "theme.css"),
    generatedHeader + basicCss,
    "utf8"
  )
  console.log("✓ src/styles/theme.css regenerated from tokens (basic)")

  // Back-compat endpoint for CLI <= 0.2.x: /r/theme.json = basic theme CSS.
  await fs.writeFile(
    path.join(OUTPUT_DIR, "theme.json"),
    JSON.stringify({ css: basicCss }, null, 2) + "\n",
    "utf8"
  )
  console.log("✓ theme -> r/theme.json (basic)")

  const manifest: RegistryManifest = {
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    itemCount: index.length,
    sources: [...new Set(index.map((i) => i.source))],
    categories: [...new Set(index.map((i) => i.category))],
    themes: [
      ...new Set([
        ...resolvedThemes.map((t) => t.name),
        ...index.flatMap((i) => i.themes ?? []),
      ]),
    ],
  }
  await fs.writeFile(
    path.join(OUTPUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8"
  )
  console.log(`✓ manifest -> r/manifest.json (schema v${REGISTRY_SCHEMA_VERSION})`)
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
