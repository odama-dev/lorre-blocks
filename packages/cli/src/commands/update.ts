import { promises as fs } from "node:fs"
import path from "node:path"
import color from "picocolors"

import { readConfig } from "../utils/config"
import { resolveTree } from "../utils/registry"
import {
  detectPackageManager,
  installDependencies,
  type PackageManager,
} from "../utils/package-manager"
import { resolveBaseDir, rewriteImports, targetDirForType } from "../utils/paths"
import { LOCK_FILE, readLock, recordInstall, sha256, toPosix, writeLock } from "../utils/lock"
import { decideUpdate, type UpdateReason } from "../utils/update"
import type { RegistryItem } from "../registry/schema"
import * as out from "../utils/output"

export interface UpdateOptions {
  cwd: string
  components: string[]
  force?: boolean
}

interface UpdateEntry {
  name: string
  file: string
  action: "updated" | "added" | "kept" | "skipped"
  reason: UpdateReason | "new-dependency"
}

const SKIP_HINT: Record<string, string> = {
  both: "diverged (local edits + registry update); pass --force to overwrite",
  unknown: "no lorre.lock entry for this file; pass --force to overwrite",
  missing: "file was deleted locally; pass --force to restore",
}

/**
 * Pull upstream changes for installed items. Writes only files that are
 * provably untouched locally (they still hash to what an install wrote);
 * local edits are kept, diverged files need --force. New registry
 * dependencies an update introduces are added like `add` would.
 */
export async function runUpdate(options: UpdateOptions): Promise<void> {
  const { cwd } = options

  out.intro(color.bgCyan(color.black(" lorre-blocks update ")))

  const config = await readConfig(cwd)
  if (!config) {
    out.fail("No components.json found. Run `lorre-blocks init` first.")
  }
  const lock = await readLock(cwd)
  if (!lock || Object.keys(lock.items).length === 0) {
    out.fail(
      `No ${LOCK_FILE} found. It is written by init/add/apply since CLI 0.6.0 — ` +
        "re-add your items once (add <names> --overwrite) to start tracking them."
    )
  }

  const requested =
    options.components.length > 0
      ? options.components
      : Object.keys(lock.items).sort()
  const requestedSet = new Set(requested)

  const notLocked = requested.filter((name) => !lock.items[name])
  if (options.components.length > 0 && notLocked.length > 0) {
    out.warn(
      `Not in ${LOCK_FILE} (will only write missing files): ${notLocked.join(", ")}`
    )
  }

  const spinner = out.spinner()
  spinner.start("Resolving items from the registry")
  let tree: RegistryItem[]
  try {
    tree = await resolveTree(config.registry, requested)
  } catch (err) {
    spinner.stop("Failed to resolve items.")
    out.fail((err as Error).message)
  }
  spinner.stop(`Resolved ${tree.length} item(s).`)

  const baseDir = await resolveBaseDir(cwd)
  const entries: UpdateEntry[] = []
  const itemsWithWrites: RegistryItem[] = []
  let lockDirty = false

  for (const item of tree) {
    // Items pulled in only as dependencies are not updated in place — but a
    // brand-new dependency of an updated item must be written or the update
    // would not compile.
    const isRequested = requestedSet.has(item.name)
    const isLocked = Boolean(lock.items[item.name])
    const writtenForItem: Array<{ rel: string; content: string }> = []

    for (const file of item.files) {
      const dir = targetDirForType(file.type, config.aliases, baseDir)
      const dest = path.join(dir, path.basename(file.path))
      const rel = path.relative(cwd, dest)
      const registryContent = rewriteImports(file.content, config)
      const local = await readIfExists(dest)

      if (!isRequested) {
        if (local === null) {
          await fs.mkdir(dir, { recursive: true })
          await fs.writeFile(dest, registryContent, "utf8")
          writtenForItem.push({ rel, content: registryContent })
          entries.push({ name: item.name, file: rel, action: "added", reason: "new-dependency" })
          out.success(`Added new dependency ${item.name} (${rel})`)
        }
        continue
      }

      const lockedHash = lock.items[item.name]?.files[toPosix(rel)]
      const decision = decideUpdate(local, registryContent, lockedHash, Boolean(options.force))

      if (decision.action === "write") {
        await fs.mkdir(dir, { recursive: true })
        await fs.writeFile(dest, registryContent, "utf8")
        writtenForItem.push({ rel, content: registryContent })
        entries.push({ name: item.name, file: rel, action: "updated", reason: decision.reason })
        out.success(`Updated ${rel} (${decision.reason === "upstream" ? "registry update" : decision.reason})`)
      } else if (decision.action === "skip") {
        entries.push({ name: item.name, file: rel, action: "skipped", reason: decision.reason })
        out.warn(`Skipped ${rel} — ${SKIP_HINT[decision.reason] ?? decision.reason}`)
      } else {
        entries.push({ name: item.name, file: rel, action: "kept", reason: decision.reason })
        if (decision.reason === "local") {
          out.message(`${color.dim(`Kept ${rel} (your edits; registry unchanged)`)}`)
        }
        // Content matches the registry again (e.g. an edit was reverted, or
        // the install predates the lock): refresh a missing or stale lock
        // hash so future diffs attribute correctly.
        if (
          decision.reason === "up-to-date" &&
          local !== null &&
          (!isLocked || lock.items[item.name].files[toPosix(rel)] !== sha256(local))
        ) {
          writtenForItem.push({ rel, content: local })
        }
      }
    }

    if (writtenForItem.length > 0) {
      recordInstall(lock, item, writtenForItem)
      itemsWithWrites.push(item)
      lockDirty = true
    }
  }

  // npm deps of items we actually touched (same behavior as add).
  const npmDeps = [...new Set(itemsWithWrites.flatMap((t) => t.dependencies ?? []))]
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

  if (lockDirty) {
    await writeLock(cwd, lock)
    out.success(`Recorded ${LOCK_FILE}`)
  }

  const updated = entries.filter((e) => e.action === "updated")
  const skipped = entries.filter((e) => e.action === "skipped")

  if (out.isJsonMode()) {
    out.emit({
      requested,
      entries,
      updated: updated.map((e) => e.file),
      skipped: skipped.map((e) => ({ file: e.file, reason: e.reason })),
      npmDependencies: npmDeps,
      packageManager: packageManager ?? null,
      lock: lockDirty ? LOCK_FILE : null,
    })
    return
  }

  out.outro(
    updated.length === 0 && skipped.length === 0
      ? `${color.green("✔")} Everything is up to date.`
      : `${color.green("✔")} ${updated.length} file(s) updated` +
          (skipped.length > 0 ? `, ${skipped.length} skipped (see warnings above).` : ".")
  )
}

async function readIfExists(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, "utf8")
  } catch {
    return null
  }
}
