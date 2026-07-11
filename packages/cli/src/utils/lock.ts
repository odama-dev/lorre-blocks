import { createHash } from "node:crypto"
import { promises as fs } from "node:fs"
import path from "node:path"

import type { RegistryItem, RegistryItemType } from "../registry/schema"

export const LOCK_FILE = "lorre.lock"

export interface LockItem {
  type: RegistryItemType
  /** Registry-declared item checksum at install time (provenance). */
  checksum?: string
  /** Project-relative posix path -> sha256 of the content as written
   * (after import rewriting), so local edits are detectable later. */
  files: Record<string, string>
}

export interface LockFile {
  schemaVersion: 1
  registry: string
  items: Record<string, LockItem>
}

export function sha256(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex")
}

/** Lock keys are posix paths so the file is portable across OSes. */
export function toPosix(rel: string): string {
  return rel.split(path.sep).join("/")
}

export function lockPath(cwd: string): string {
  return path.join(cwd, LOCK_FILE)
}

export async function readLock(cwd: string): Promise<LockFile | null> {
  try {
    const raw = await fs.readFile(lockPath(cwd), "utf8")
    const parsed = JSON.parse(raw) as LockFile
    if (parsed.schemaVersion !== 1 || typeof parsed.items !== "object") {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/** Deterministic output: item and file keys are sorted on every write. */
export async function writeLock(cwd: string, lock: LockFile): Promise<void> {
  const items: Record<string, LockItem> = {}
  for (const name of Object.keys(lock.items).sort()) {
    const item = lock.items[name]
    const files: Record<string, string> = {}
    for (const file of Object.keys(item.files).sort()) {
      files[file] = item.files[file]
    }
    items[name] = { ...item, files }
  }
  const out: LockFile = { schemaVersion: 1, registry: lock.registry, items }
  await fs.writeFile(lockPath(cwd), JSON.stringify(out, null, 2) + "\n", "utf8")
}

/**
 * Merge one install into the lock. Only called when at least one file was
 * written: written files get fresh hashes, files skipped this run keep the
 * hash from the install that actually wrote them.
 */
export function recordInstall(
  lock: LockFile,
  item: RegistryItem,
  written: Array<{ rel: string; content: string }>
): void {
  const existing = lock.items[item.name]
  const files = { ...existing?.files }
  for (const file of written) {
    files[toPosix(file.rel)] = sha256(file.content)
  }
  lock.items[item.name] = { type: item.type, checksum: item.checksum, files }
}

export function emptyLock(registry: string): LockFile {
  return { schemaVersion: 1, registry, items: {} }
}

export type ChangeCause = "local" | "upstream" | "both" | "unknown"

/**
 * Attribute a modified file (local != current registry content) using the
 * locked hash of what was originally written:
 *   local matches the lock  -> the registry moved        -> "upstream"
 *   registry matches the lock -> the user edited          -> "local"
 *   neither matches           -> both sides changed       -> "both"
 * No lock entry means the install predates lorre.lock -> "unknown".
 */
export function classifyChange(
  localContent: string,
  registryContent: string,
  lockedHash: string | undefined
): ChangeCause {
  if (!lockedHash) return "unknown"
  if (sha256(localContent) === lockedHash) return "upstream"
  if (sha256(registryContent) === lockedHash) return "local"
  return "both"
}
