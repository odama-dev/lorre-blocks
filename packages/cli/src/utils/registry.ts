import type { RegistryItem } from "../registry/schema"

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
): Promise<Array<{ name: string; description?: string }>> {
  const base = registry.replace(/\/$/, "")
  const url = `${base}/r/index.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url} (HTTP ${res.status}).`)
  return (await res.json()) as Array<{ name: string; description?: string }>
}

export async function fetchTheme(registry: string): Promise<string> {
  const base = registry.replace(/\/$/, "")
  const url = `${base}/r/theme.json`
  const res = await fetch(url)
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
