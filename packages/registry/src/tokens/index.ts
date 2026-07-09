import { basic } from "./themes/basic"
import { dreamy } from "./themes/dreamy"
import { utilitarian } from "./themes/utilitarian"
import type {
  ResolvedTheme,
  SemanticColors,
  ThemeDefinition,
} from "./types"

export * from "./types"
export * from "./oklch"
export * from "./scale"
export { themeToCss } from "./build-css"
export { themeToDtcg } from "./build-dtcg"

/** Default semantic aliases; themes override entries via `semantics`. */
export const DEFAULT_SEMANTICS: SemanticColors = {
  background: "neutral-1",
  foreground: "neutral-12",
  card: "neutral-1",
  "card-foreground": "neutral-12",
  popover: "neutral-1",
  "popover-foreground": "neutral-12",
  primary: "accent-9",
  "primary-foreground": "on-accent",
  secondary: "neutral-3",
  "secondary-foreground": "neutral-12",
  muted: "neutral-3",
  "muted-foreground": "neutral-11",
  accent: "neutral-4",
  "accent-foreground": "neutral-12",
  destructive: "danger-9",
  "destructive-foreground": "on-danger",
  success: "success-9",
  "success-foreground": "on-success",
  warning: "warning-9",
  "warning-foreground": "on-warning",
  border: "neutral-6",
  input: "neutral-7",
  ring: "accent-8",
}

/** All theme definitions, in display order. */
export const themeDefinitions: ThemeDefinition[] = [basic, dreamy, utilitarian]

const byName = new Map(themeDefinitions.map((t) => [t.name, t]))

export function resolveTheme(def: ThemeDefinition): ResolvedTheme {
  const chain: ThemeDefinition[] = []
  let current: ThemeDefinition | undefined = def
  const seen = new Set<string>()
  while (current) {
    if (seen.has(current.name)) {
      throw new Error(`Theme extends cycle detected at "${current.name}"`)
    }
    seen.add(current.name)
    chain.unshift(current)
    if (current.extends) {
      const parent = byName.get(current.extends)
      if (!parent) {
        throw new Error(
          `Theme "${current.name}" extends unknown theme "${current.extends}"`
        )
      }
      current = parent
    } else {
      current = undefined
    }
  }

  const merged: Partial<ResolvedTheme> & { semantics: SemanticColors } = {
    semantics: { ...DEFAULT_SEMANTICS },
  }
  for (const t of chain) {
    merged.colors = { ...merged.colors, ...t.colors } as ResolvedTheme["colors"]
    merged.semantics = { ...merged.semantics, ...t.semantics }
    merged.typography = {
      ...merged.typography,
      ...t.typography,
    } as ResolvedTheme["typography"]
    merged.radius = { ...merged.radius, ...t.radius } as ResolvedTheme["radius"]
    merged.shadows = { ...merged.shadows, ...t.shadows } as ResolvedTheme["shadows"]
    merged.motion = { ...merged.motion, ...t.motion } as ResolvedTheme["motion"]
  }

  const required = ["colors", "typography", "radius", "shadows", "motion"] as const
  for (const key of required) {
    if (!merged[key]) {
      throw new Error(`Theme "${def.name}" is missing token group "${key}"`)
    }
  }

  return {
    name: def.name,
    description: def.description,
    extends: def.extends,
    colors: merged.colors!,
    semantics: merged.semantics,
    typography: merged.typography!,
    radius: merged.radius!,
    shadows: merged.shadows!,
    motion: merged.motion!,
  }
}

export function getResolvedTheme(name: string): ResolvedTheme {
  const def = byName.get(name)
  if (!def) {
    throw new Error(
      `Unknown theme "${name}". Available: ${[...byName.keys()].join(", ")}`
    )
  }
  return resolveTheme(def)
}

export function allResolvedThemes(): ResolvedTheme[] {
  return themeDefinitions.map(resolveTheme)
}
