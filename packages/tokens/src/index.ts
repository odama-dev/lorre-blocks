import { basic } from "./themes/basic"
import { odama } from "./themes/odama"
import { dreamy } from "./themes/dreamy"
import { utilitarian } from "./themes/utilitarian"
import type {
  ComponentTokens,
  ResolvedTheme,
  SemanticColors,
  ThemeDefinition,
} from "./types"

export * from "./types"
export * from "./oklch"
export * from "./scale"
export * from "./contrast"
export * from "./icons"
export * from "./type-scale"
export * from "./schema"
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
export const themeDefinitions: ThemeDefinition[] = [basic, dreamy, utilitarian, odama]

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
  // When a theme adds a secondary scale without saying what it means, point
  // the `secondary` semantic at it — but only if no theme in the chain chose
  // its own mapping (dreamy maps secondary to tinted accent surfaces).
  const secondaryExplicit = chain.some(
    (t) =>
      t.semantics &&
      ("secondary" in t.semantics || "secondary-foreground" in t.semantics)
  )
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
    if (t.spacing) merged.spacing = { ...merged.spacing, ...t.spacing } as ResolvedTheme["spacing"]
    if (t.components) merged.components = mergeComponents(merged.components, t.components)
    if (t.icons) merged.icons = t.icons
  }
  if (merged.colors?.secondary && !secondaryExplicit) {
    merged.semantics.secondary = "secondary-9"
    merged.semantics["secondary-foreground"] = "on-secondary"
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
    spacing: merged.spacing,
    components: merged.components,
    icons: merged.icons,
  }
}

/** Two-level merge: per component, then per token key. */
function mergeComponents(
  base: ComponentTokens | undefined,
  override: ComponentTokens
): ComponentTokens {
  const out: Record<string, Record<string, string>> = {
    ...(base as Record<string, Record<string, string>>),
  }
  for (const [component, tokens] of Object.entries(override)) {
    out[component] = { ...out[component], ...tokens }
  }
  return out as ComponentTokens
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
