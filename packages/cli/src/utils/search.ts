import type { RegistryIndexItem } from "../registry/schema"

export interface SearchFilters {
  category?: string
  source?: string
  theme?: string
  type?: string
}

export interface SearchHit {
  item: RegistryIndexItem
  score: number
  /** Which fields the query matched, for agents deciding how confident to be. */
  matched: string[]
}

/** Field weights: a name hit beats a tag hit beats a description hit. */
const WEIGHTS = {
  name: 10,
  tag: 6,
  category: 4,
  description: 2,
} as const

function matchesFilters(item: RegistryIndexItem, filters: SearchFilters): boolean {
  if (filters.category && item.category !== filters.category) return false
  if (filters.source && item.source !== filters.source) return false
  if (filters.type && item.type !== filters.type) return false
  if (filters.theme) {
    // No `themes` means theme-agnostic — it works with every theme.
    if (item.themes && item.themes.length > 0 && !item.themes.includes(filters.theme)) {
      return false
    }
  }
  return true
}

function scoreItem(item: RegistryIndexItem, terms: string[]): SearchHit | null {
  if (terms.length === 0) return { item, score: 0, matched: [] }

  let score = 0
  const matched = new Set<string>()

  for (const term of terms) {
    const name = item.name.toLowerCase()
    if (name === term) {
      score += WEIGHTS.name * 2
      matched.add("name")
    } else if (name.includes(term)) {
      score += WEIGHTS.name
      matched.add("name")
    }

    if (item.tags?.some((t) => t.toLowerCase().includes(term))) {
      score += WEIGHTS.tag
      matched.add("tags")
    }
    if (item.category?.toLowerCase().includes(term)) {
      score += WEIGHTS.category
      matched.add("category")
    }
    if (item.description?.toLowerCase().includes(term)) {
      score += WEIGHTS.description
      matched.add("description")
    }
  }

  if (score === 0) return null
  return { item, score, matched: [...matched].sort() }
}

/**
 * Rank registry items against a free-text query plus optional facet filters.
 * An empty query returns every item that passes the filters (score 0), so
 * `search --category component --json` works as a faceted listing.
 */
export function searchRegistry(
  items: RegistryIndexItem[],
  query: string,
  filters: SearchFilters = {}
): SearchHit[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)

  const hits: SearchHit[] = []
  for (const item of items) {
    if (!matchesFilters(item, filters)) continue
    const hit = scoreItem(item, terms)
    if (hit) hits.push(hit)
  }

  return hits.sort(
    (a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name)
  )
}
