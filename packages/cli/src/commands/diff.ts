import { promises as fs } from "node:fs"
import path from "node:path"
import * as p from "@clack/prompts"
import color from "picocolors"
import { createTwoFilesPatch } from "diff"

import { readConfig } from "../utils/config"
import { fetchRegistryItem, fetchIndex } from "../utils/registry"
import { resolveBaseDir, rewriteImports, targetDirForType } from "../utils/paths"

export interface DiffOptions {
  cwd: string
  components: string[]
}

export async function runDiff(options: DiffOptions): Promise<void> {
  const { cwd } = options

  p.intro(color.bgCyan(color.black(" lorre-blocks diff ")))

  const config = await readConfig(cwd)
  if (!config) {
    p.cancel("No components.json found. Run `lorre-blocks init` first.")
    process.exit(1)
  }

  const baseDir = await resolveBaseDir(cwd)

  let names = options.components
  if (names.length === 0) {
    const uiDir = targetDirForType("registry:ui", config.aliases, baseDir)
    const present = await listComponentNames(uiDir)
    const index = await fetchIndex(config.registry).catch(() => [])
    const known = new Set(index.map((i) => i.name))
    names = present.filter((n) => known.has(n))
    if (names.length === 0) {
      p.cancel("No known components found in your project to diff.")
      process.exit(0)
    }
  }

  let changed = 0
  for (const name of names) {
    const item = await fetchRegistryItem(config.registry, name)
    for (const file of item.files) {
      const dir = targetDirForType(file.type, config.aliases, baseDir)
      const dest = path.join(dir, path.basename(file.path))
      const local = await readIfExists(dest)
      const registryContent = rewriteImports(file.content, config)

      if (local === null) {
        p.log.warn(`${name}: ${path.relative(cwd, dest)} not added yet`)
        continue
      }
      if (local === registryContent) {
        p.log.success(`${name}: up to date`)
        continue
      }

      changed++
      const patch = createTwoFilesPatch(
        "your version",
        "registry",
        local,
        registryContent,
        "",
        ""
      )
      p.log.message(`${color.bold(name)} — ${path.relative(cwd, dest)}\n${colorizePatch(patch)}`)
    }
  }

  p.outro(
    changed === 0
      ? `${color.green("✔")} Everything matches the registry.`
      : `${changed} file(s) differ from the registry.`
  )
}

function colorizePatch(patch: string): string {
  return patch
    .split("\n")
    .map((line) => {
      if (line.startsWith("+") && !line.startsWith("+++")) return color.green(line)
      if (line.startsWith("-") && !line.startsWith("---")) return color.red(line)
      if (line.startsWith("@@")) return color.cyan(line)
      return color.dim(line)
    })
    .join("\n")
}

async function listComponentNames(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir)
    return entries
      .filter((f) => /\.(tsx|jsx|ts|js)$/.test(f))
      .map((f) => f.replace(/\.(tsx|jsx|ts|js)$/, ""))
  } catch {
    return []
  }
}

async function readIfExists(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, "utf8")
  } catch {
    return null
  }
}
