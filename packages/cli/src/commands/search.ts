import color from "picocolors"

import { DEFAULT_REGISTRY, readConfig } from "../utils/config"
import { fetchIndex } from "../utils/registry"
import { searchRegistry, type SearchFilters } from "../utils/search"
import * as out from "../utils/output"

export interface SearchOptions extends SearchFilters {
  cwd: string
  query: string
  registry?: string
  limit?: number
}

export async function runSearch(options: SearchOptions): Promise<void> {
  const config = await readConfig(options.cwd)
  const registry = options.registry ?? config?.registry ?? DEFAULT_REGISTRY

  const filters: SearchFilters = {
    category: options.category,
    source: options.source,
    theme: options.theme,
    type: options.type,
  }

  let items
  try {
    items = await fetchIndex(registry)
  } catch (err) {
    out.fail((err as Error).message)
  }

  let hits = searchRegistry(items, options.query, filters)
  if (options.limit && options.limit > 0) hits = hits.slice(0, options.limit)

  if (out.isJsonMode()) {
    out.emit({
      query: options.query,
      filters,
      count: hits.length,
      results: hits.map((h) => ({
        name: h.item.name,
        score: h.score,
        matched: h.matched,
        type: h.item.type,
        category: h.item.category,
        source: h.item.source,
        description: h.item.description,
        tags: h.item.tags,
        themes: h.item.themes,
        registryDependencies: h.item.registryDependencies,
      })),
    })
    return
  }

  out.intro(color.bgCyan(color.black(" lorre-blocks search ")))

  if (hits.length === 0) {
    out.message(`No components matched ${color.bold(options.query || "(any)")}.`)
    out.outro("Try a broader query, or `lorre-blocks list`.")
    return
  }

  const width = Math.max(...hits.map((h) => h.item.name.length))
  const lines = hits.map((h) => {
    const facets = [h.item.category, h.item.source].filter(Boolean).join(" · ")
    return `  ${color.green(h.item.name.padEnd(width))}  ${color.dim(facets)}\n    ${color.dim(h.item.description ?? "")}`
  })
  out.message(`${hits.length} match(es):\n${lines.join("\n")}`)
  out.outro(`Inspect one with ${color.cyan("lorre-blocks info <name>")}.`)
}
