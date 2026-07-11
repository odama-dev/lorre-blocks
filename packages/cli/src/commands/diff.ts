import { promises as fs } from "node:fs"
import path from "node:path"
import color from "picocolors"
import { createTwoFilesPatch } from "diff"

import { readConfig } from "../utils/config"
import { fetchRegistryItem, fetchIndex } from "../utils/registry"
import { resolveBaseDir, rewriteImports, targetDirForType } from "../utils/paths"
import { classifyChange, readLock, toPosix, type ChangeCause } from "../utils/lock"
import * as out from "../utils/output"

export interface DiffOptions {
  cwd: string
  components: string[]
}

type FileStatus = "up-to-date" | "modified" | "not-added"

interface DiffEntry {
  name: string
  file: string
  status: FileStatus
  /** Who moved since install — only known when lorre.lock has the file. */
  cause?: ChangeCause
  patch?: string
}

const CAUSE_LABEL: Record<ChangeCause, string> = {
  local: "local edits",
  upstream: "registry updated",
  both: "diverged: local edits + registry update",
  unknown: "no lock entry; cause unknown",
}

export async function runDiff(options: DiffOptions): Promise<void> {
  const { cwd } = options

  out.intro(color.bgCyan(color.black(" lorre-blocks diff ")))

  const config = await readConfig(cwd)
  if (!config) {
    out.fail("No components.json found. Run `lorre-blocks init` first.")
  }

  const baseDir = await resolveBaseDir(cwd)
  const lock = await readLock(cwd)

  let names = options.components
  if (names.length === 0) {
    // The lock knows every installed item (blocks, motion, lib included);
    // without one, fall back to scanning the ui directory.
    if (lock && Object.keys(lock.items).length > 0) {
      names = Object.keys(lock.items).sort()
    } else {
      const uiDir = targetDirForType("registry:ui", config.aliases, baseDir)
      const present = await listComponentNames(uiDir)
      const index = await fetchIndex(config.registry).catch(() => [])
      const known = new Set(index.map((i) => i.name))
      names = present.filter((n) => known.has(n))
    }
    if (names.length === 0) {
      if (out.isJsonMode()) {
        out.emit({ changed: 0, entries: [], lock: lock !== null })
        return
      }
      out.fail("No known components found in your project to diff.")
    }
  }

  const entries: DiffEntry[] = []

  for (const name of names) {
    let item
    try {
      item = await fetchRegistryItem(config.registry, name)
    } catch (err) {
      out.fail((err as Error).message)
    }

    for (const file of item.files) {
      const dir = targetDirForType(file.type, config.aliases, baseDir)
      const dest = path.join(dir, path.basename(file.path))
      const rel = path.relative(cwd, dest)
      const local = await readIfExists(dest)
      const registryContent = rewriteImports(file.content, config)

      if (local === null) {
        entries.push({ name, file: rel, status: "not-added" })
        out.warn(`${name}: ${rel} not added yet`)
        continue
      }
      if (local === registryContent) {
        entries.push({ name, file: rel, status: "up-to-date" })
        out.success(`${name}: up to date`)
        continue
      }

      const lockedHash = lock?.items[name]?.files[toPosix(rel)]
      const cause = classifyChange(local, registryContent, lockedHash)
      const patch = createTwoFilesPatch(
        "your version",
        "registry",
        local,
        registryContent,
        "",
        ""
      )
      entries.push({ name, file: rel, status: "modified", cause, patch })
      out.message(
        `${color.bold(name)} — ${rel} (${CAUSE_LABEL[cause]})\n${colorizePatch(patch)}`
      )
    }
  }

  const changed = entries.filter((e) => e.status === "modified").length

  if (out.isJsonMode()) {
    out.emit({ changed, entries, lock: lock !== null })
    return
  }

  out.outro(
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
