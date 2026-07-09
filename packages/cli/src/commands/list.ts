import color from "picocolors"

import { readConfig, DEFAULT_REGISTRY } from "../utils/config"
import { fetchIndex, fetchManifest } from "../utils/registry"
import * as out from "../utils/output"

export interface ListOptions {
  cwd: string
  registry?: string
}

export async function runList(options: ListOptions): Promise<void> {
  const config = await readConfig(options.cwd)
  const registry = options.registry ?? config?.registry ?? DEFAULT_REGISTRY

  let items
  try {
    items = await fetchIndex(registry)
  } catch (err) {
    out.fail((err as Error).message)
  }

  if (out.isJsonMode()) {
    const manifest = await fetchManifest(registry)
    out.emit({ registry, manifest, count: items.length, items })
    return
  }

  out.intro(color.bgCyan(color.black(" lorre-blocks list ")))

  const width = Math.max(...items.map((i) => i.name.length), 4)
  const lines = items.map(
    (i) =>
      `  ${color.green(i.name.padEnd(width))}  ${color.dim(i.description ?? "")}`
  )
  out.message(`${items.length} component(s):\n${lines.join("\n")}`)

  out.outro(`Add one with ${color.cyan("lorre-blocks add <name>")}.`)
}
