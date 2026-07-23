import type { RegistryIndexItem, RegistryItem } from "../registry/schema"
import { ROOT_THEME } from "./config"

export async function fetchRegistryItem(
  registry: string,
  name: string
): Promise<RegistryItem> {
  const base = registry.replace(/\/$/, "")
  const url = `${base}/r/${name}.json`

  let res: Response
  try {
    res = await fetch(url)
  } catch (err) {
    throw new Error(
      `Could not reach the registry at ${url}. Is it running / correct?\n${
        (err as Error).message
      }`
    )
  }

  if (res.status === 404) {
    throw new Error(`Component "${name}" was not found in the registry (${url}).`)
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} (HTTP ${res.status}).`)
  }

  return (await res.json()) as RegistryItem
}

export async function fetchIndex(
  registry: string
): Promise<RegistryIndexItem[]> {
  const base = registry.replace(/\/$/, "")
  const url = `${base}/r/index.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url} (HTTP ${res.status}).`)
  return (await res.json()) as RegistryIndexItem[]
}

export interface RegistryManifest {
  schemaVersion: number
  itemCount: number
  sources: string[]
  categories: string[]
  themes: string[]
}

/** Registry-level metadata. Absent on registries older than schema v2. */
export async function fetchManifest(
  registry: string
): Promise<RegistryManifest | null> {
  const base = registry.replace(/\/$/, "")
  const res = await fetch(`${base}/r/manifest.json`)
  if (!res.ok) return null
  return (await res.json()) as RegistryManifest
}

export async function fetchTheme(registry: string): Promise<string> {
  const base = registry.replace(/\/$/, "")
  const url = `${base}/r/theme.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url} (HTTP ${res.status}).`)
  const data = (await res.json()) as { css: string }
  return data.css
}

export interface ThemeInfo {
  name: string
  description?: string
  extends?: string
}

export async function fetchThemesIndex(registry: string): Promise<ThemeInfo[]> {
  const base = registry.replace(/\/$/, "")
  const url = `${base}/r/themes/index.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url} (HTTP ${res.status}).`)
  return (await res.json()) as ThemeInfo[]
}

/**
 * Fetch one theme's CSS by name. Falls back to the legacy /r/theme.json
 * endpoint when the registry predates named themes and "basic" is requested.
 */
export async function fetchThemeCss(
  registry: string,
  name: string
): Promise<string> {
  const base = registry.replace(/\/$/, "")
  const url = `${base}/r/themes/${name}.json`
  const res = await fetch(url)

  if (res.status === 404) {
    if (name === ROOT_THEME) return fetchTheme(registry)
    let available = ""
    try {
      const themes = await fetchThemesIndex(registry)
      available = ` Available: ${themes.map((t) => t.name).join(", ")}.`
    } catch {
      // registry has no themes index either; leave the message plain
    }
    throw new Error(`Theme "${name}" was not found in the registry.${available}`)
  }
  if (!res.ok) throw new Error(`Failed to fetch ${url} (HTTP ${res.status}).`)

  const data = (await res.json()) as { css: string }
  return data.css
}

export async function resolveTree(
  registry: string,
  names: string[]
): Promise<RegistryItem[]> {
  const resolved = new Map<string, RegistryItem>()

  async function visit(name: string) {
    if (resolved.has(name)) return
    const item = await fetchRegistryItem(registry, name)
    for (const dep of item.registryDependencies ?? []) {
      await visit(dep)
    }
    if (!resolved.has(name)) resolved.set(name, item)
  }

  for (const name of names) {
    await visit(name)
  }

  return [...resolved.values()]
}
