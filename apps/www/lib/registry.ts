import { promises as fs } from "node:fs"
import path from "node:path"

import { registry } from "@lorre-blocks/registry/registry"
import type { RegistryItem } from "@lorre-blocks/registry/schema"

/** UI items shown in the docs sidebar and component pages, alphabetical. */
export const uiItems: RegistryItem[] = registry
  .filter((item) => item.type === "registry:ui")
  .sort((a, b) => a.name.localeCompare(b.name))

/** Block items (full page sections), alphabetical. */
export const blockItems: RegistryItem[] = registry
  .filter((item) => item.type === "registry:block")
  .sort((a, b) => a.name.localeCompare(b.name))

export function getItem(name: string): RegistryItem | undefined {
  return registry.find((item) => item.name === name)
}

/**
 * Read a registry file's source from the workspace at build time.
 * Docs pages are statically generated, so this never runs on a server at request time.
 */
export async function readItemSource(item: RegistryItem): Promise<string> {
  const file = item.files[0]
  const abs = path.join(
    process.cwd(),
    "..",
    "..",
    "packages",
    "registry",
    "src",
    file.path
  )
  return fs.readFile(abs, "utf8")
}
