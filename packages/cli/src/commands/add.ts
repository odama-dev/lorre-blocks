import { promises as fs } from "node:fs"
import path from "node:path"
import * as p from "@clack/prompts"
import color from "picocolors"

import { readConfig } from "../utils/config"
import { resolveTree } from "../utils/registry"
import {
  detectPackageManager,
  installDependencies,
  type PackageManager,
} from "../utils/package-manager"
import {
  resolveBaseDir,
  rewriteImports,
  targetDirForType,
} from "../utils/paths"
import type { RegistryItem } from "../registry/schema"
import { LOCK_FILE, emptyLock, readLock, recordInstall, writeLock } from "../utils/lock"
import * as out from "../utils/output"

export interface AddOptions {
  cwd: string
  components: string[]
  yes?: boolean
  overwrite?: boolean
}

export async function runAdd(options: AddOptions): Promise<void> {
  const { cwd, components } = options

  out.intro(color.bgCyan(color.black(" lorre-blocks add ")))

  const config = await readConfig(cwd)
  if (!config) {
    out.fail("No components.json found. Run `lorre-blocks init` first.")
  }

  if (components.length === 0) {
    out.fail("Specify at least one component, e.g. `lorre-blocks add button`.")
  }

  const spinner = out.spinner()
  spinner.start("Resolving components from the registry")
  let tree: RegistryItem[]
  try {
    tree = await resolveTree(config.registry, components)
  } catch (err) {
    spinner.stop("Failed to resolve components.")
    out.fail((err as Error).message)
  }
  spinner.stop(
    `Resolved ${tree.length} item(s): ${tree.map((t) => t.name).join(", ")}`
  )

  const npmDeps = [...new Set(tree.flatMap((t) => t.dependencies ?? []))]
  let packageManager: PackageManager | undefined
  if (npmDeps.length > 0) {
    packageManager = await detectPackageManager(cwd)
    const depSpinner = out.spinner()
    depSpinner.start(`Installing ${npmDeps.length} dependency(ies) with ${packageManager}`)
    try {
      await installDependencies(cwd, packageManager, npmDeps, { silent: out.isJsonMode() })
      depSpinner.stop(`Installed: ${npmDeps.join(", ")}`)
    } catch (err) {
      depSpinner.stop("Dependency install failed.")
      out.fail((err as Error).message)
    }
  }

  const baseDir = await resolveBaseDir(cwd)
  const written: string[] = []
  const skipped: string[] = []
  const lock = (await readLock(cwd)) ?? emptyLock(config.registry)
  lock.registry = config.registry
  let lockDirty = false

  for (const item of tree) {
    const writtenForItem: Array<{ rel: string; content: string }> = []
    for (const file of item.files) {
      const dir = targetDirForType(file.type, config.aliases, baseDir)
      const dest = path.join(dir, path.basename(file.path))
      const rel = path.relative(cwd, dest)

      if (await fileExists(dest)) {
        // JSON mode never prompts: --overwrite decides, otherwise we skip.
        const shouldOverwrite =
          options.overwrite ||
          options.yes ||
          (out.isJsonMode()
            ? false
            : await p.confirm({
                message: `${rel} exists. Overwrite?`,
                initialValue: false,
              }))
        if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
          out.warn(`Skipped ${rel} (already exists; pass --overwrite to replace)`)
          skipped.push(rel)
          continue
        }
      }

      const content = rewriteImports(file.content, config)
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(dest, content, "utf8")
      written.push(rel)
      writtenForItem.push({ rel, content })
    }
    if (writtenForItem.length > 0) {
      recordInstall(lock, item, writtenForItem)
      lockDirty = true
    }
  }

  if (lockDirty) {
    await writeLock(cwd, lock)
    out.success(`Recorded ${LOCK_FILE}`)
  }

  if (out.isJsonMode()) {
    out.emit({
      resolved: tree.map((t) => t.name),
      written,
      skipped,
      npmDependencies: npmDeps,
      packageManager: packageManager ?? null,
      lock: lockDirty ? LOCK_FILE : null,
    })
    return
  }

  if (written.length > 0) {
    out.success(`Added:\n${written.map((f) => `  ${color.green(f)}`).join("\n")}`)
  }
  out.outro(`${color.green("✔")} Done.`)
}

async function fileExists(f: string): Promise<boolean> {
  try {
    await fs.access(f)
    return true
  } catch {
    return false
  }
}
