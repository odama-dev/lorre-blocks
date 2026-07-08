import * as p from "@clack/prompts"
import color from "picocolors"

import { readConfig, DEFAULT_REGISTRY } from "../utils/config"
import { fetchIndex } from "../utils/registry"

export interface ListOptions {
  cwd: string
  registry?: string
}

export async function runList(options: ListOptions): Promise<void> {
  const config = await readConfig(options.cwd)
  const registry = options.registry ?? config?.registry ?? DEFAULT_REGISTRY

  p.intro(color.bgCyan(color.black(" lorre-blocks list ")))

  let items: Array<{ name: string; description?: string }>
  try {
    items = await fetchIndex(registry)
  } catch (err) {
    p.cancel((err as Error).message)
    process.exit(1)
  }

  const width = Math.max(...items.map((i) => i.name.length), 4)
  const lines = items.map(
    (i) =>
      `  ${color.green(i.name.padEnd(width))}  ${color.dim(i.description ?? "")}`
  )
  p.log.message(`${items.length} component(s):\n${lines.join("\n")}`)

  p.outro(`Add one with ${color.cyan("lorre-blocks add <name>")}.`)
}
