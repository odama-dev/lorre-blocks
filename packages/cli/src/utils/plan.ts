import type { RegistryItem } from "../registry/schema"
import { fetchRegistryItem, fetchThemesIndex, resolveTree } from "./registry"
import { validateDefinition } from "./theme-def"

/**
 * Phase 4.2 plan format (see docs/phase-4.2-design.md). The CLI never writes
 * plans — an agent (or human) authors plan.json; `plan check` validates and
 * resolves it, `apply` executes it. Validation is hand-rolled so problems come
 * back as one flat list an agent can iterate on.
 */

export interface PlanPage {
  path: string
  blocks: string[]
}

export interface PlanGap {
  need: string
  decision?: "sculpt" | "create"
  suggestion?: string
}

export interface Plan {
  $schema?: string
  name: string
  /**
   * Either a registry theme reference ({"name": "dreamy"}) or, since Phase
   * 7.3, an inline custom-theme definition (lorre.theme.json format —
   * detected by any key beyond "name"). Inline themes are generated locally
   * by `apply` and recorded to lorre.theme.json.
   */
  theme: { name: string; [key: string]: unknown }
  add: string[]
  /** Documentation-only in v1: apply does not scaffold pages. */
  pages?: PlanPage[]
  /** v1 scope: semantic name -> scale-step reference (e.g. primary: accent-10). */
  tokenOverrides?: Record<string, string>
  gaps?: PlanGap[]
  notes?: string
}

const KEBAB_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

/** Any key beyond "name" (and $-prefixed noise) marks an inline definition. */
export function themeIsInline(theme: Record<string, unknown>): boolean {
  return Object.keys(theme).some((k) => k !== "name" && !k.startsWith("$"))
}
const SCALE_STEP_RE = /^(neutral|accent|danger|success|warning)-(?:[1-9]|1[0-2])$/

/** Structural validation. Returns problems; an empty array means the shape is valid. */
export function validatePlanShape(data: unknown): string[] {
  const problems: string[] = []
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return ["plan must be a JSON object"]
  }
  const plan = data as Record<string, unknown>

  if (typeof plan.name !== "string" || !KEBAB_RE.test(plan.name)) {
    problems.push(`"name" must be a kebab-case string (got ${JSON.stringify(plan.name)})`)
  }

  const theme = plan.theme as Record<string, unknown> | undefined
  if (typeof theme !== "object" || theme === null || typeof theme.name !== "string") {
    problems.push('"theme" must be an object with a "name" string, e.g. {"name": "basic"}')
  } else if (themeIsInline(theme)) {
    // Inline custom definition: validate against the lorre.theme.json contract.
    const { problems: themeProblems } = validateDefinition(theme)
    problems.push(...themeProblems.map((p) => `theme.${p}`))
  }

  if (
    !Array.isArray(plan.add) ||
    plan.add.length === 0 ||
    plan.add.some((n) => typeof n !== "string")
  ) {
    problems.push('"add" must be a non-empty array of registry item names')
  }

  if (plan.pages !== undefined) {
    if (!Array.isArray(plan.pages)) {
      problems.push('"pages" must be an array of {path, blocks}')
    } else {
      const addSet = new Set(Array.isArray(plan.add) ? (plan.add as string[]) : [])
      for (const page of plan.pages as unknown[]) {
        const pg = page as Record<string, unknown>
        if (typeof pg?.path !== "string" || !Array.isArray(pg?.blocks)) {
          problems.push('every page must be {path: string, blocks: string[]}')
          continue
        }
        for (const block of pg.blocks as unknown[]) {
          if (typeof block !== "string" || !addSet.has(block)) {
            problems.push(
              `page "${pg.path}" references "${String(block)}" which is not in "add"`
            )
          }
        }
      }
    }
  }

  if (plan.tokenOverrides !== undefined) {
    if (
      typeof plan.tokenOverrides !== "object" ||
      plan.tokenOverrides === null ||
      Array.isArray(plan.tokenOverrides)
    ) {
      problems.push('"tokenOverrides" must be an object of semantic -> scale-step')
    } else {
      for (const [key, value] of Object.entries(plan.tokenOverrides)) {
        if (!KEBAB_RE.test(key)) {
          problems.push(`tokenOverrides key "${key}" is not a kebab-case semantic name`)
        }
        if (typeof value !== "string" || !SCALE_STEP_RE.test(value)) {
          problems.push(
            `tokenOverrides.${key} must be a scale step like "accent-10" (got ${JSON.stringify(value)})`
          )
        }
      }
    }
  }

  if (plan.gaps !== undefined) {
    if (!Array.isArray(plan.gaps)) {
      problems.push('"gaps" must be an array of {need, decision?, suggestion?}')
    } else {
      for (const gap of plan.gaps as unknown[]) {
        const g = gap as Record<string, unknown>
        if (typeof g?.need !== "string") {
          problems.push('every gap must have a "need" string')
        } else if (
          g.decision !== undefined &&
          g.decision !== "sculpt" &&
          g.decision !== "create"
        ) {
          problems.push(`gap "${g.need}": decision must be "sculpt" or "create"`)
        }
      }
    }
  }

  return problems
}

export interface PlanResolution {
  theme: string
  installOrder: string[]
  npmDependencies: string[]
  items: RegistryItem[]
}

/**
 * Registry-side validation + resolution. Collects *all* problems (unknown
 * theme, every unknown item) instead of failing on the first, so one check
 * round-trip tells an agent everything to fix.
 */
export async function resolvePlan(
  registry: string,
  plan: Plan
): Promise<{ resolution: PlanResolution | null; problems: string[] }> {
  const problems: string[] = []

  if (themeIsInline(plan.theme)) {
    // Inline definitions resolve offline (extends is validated in the shape
    // pass against the bundled base themes) — nothing to check remotely.
  } else {
    try {
      const themes = await fetchThemesIndex(registry)
      if (!themes.some((t) => t.name === plan.theme.name)) {
        problems.push(
          `theme "${plan.theme.name}" not found; available: ${themes.map((t) => t.name).join(", ")}`
        )
      }
    } catch {
      // Registry predates named themes: only "basic" can work.
      if (plan.theme.name !== "basic") {
        problems.push(`registry has no themes index; only "basic" is supported`)
      }
    }
  }

  for (const name of plan.add) {
    try {
      await fetchRegistryItem(registry, name)
    } catch {
      problems.push(`registry item "${name}" not found`)
    }
  }

  if (problems.length > 0) return { resolution: null, problems }

  const items = await resolveTree(registry, plan.add)
  return {
    resolution: {
      theme: plan.theme.name,
      installOrder: items.map((i) => i.name),
      npmDependencies: [...new Set(items.flatMap((i) => i.dependencies ?? []))],
      items,
    },
    problems,
  }
}

export const OVERRIDES_START = "/* lorre-blocks overrides start */"
export const OVERRIDES_END = "/* lorre-blocks overrides end */"

/**
 * Emit the token-override block. Every override is re-declared under `.dark` —
 * a custom property resolves its var() refs on the element that declares it,
 * so a :root-only override would leak light values into dark subtrees (the
 * Phase 1 dark-mode lesson).
 */
export function overridesToCss(overrides: Record<string, string>): string {
  const entries = Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b))
  const decls = entries
    .map(([semantic, step]) => `  --${semantic}: var(--${step});`)
    .join("\n")
  return `:root {\n${decls}\n}\n\n.dark {\n${decls}\n}`
}

/** Insert or replace the overrides block, kept directly after the theme block. */
export function injectOverridesBlock(cssContent: string, overridesCss: string): string {
  const block = `${OVERRIDES_START}\n${overridesCss.trim()}\n${OVERRIDES_END}`

  if (cssContent.includes(OVERRIDES_START)) {
    return cssContent.replace(
      new RegExp(`${escapeRegExp(OVERRIDES_START)}[\\s\\S]*?${escapeRegExp(OVERRIDES_END)}`),
      block
    )
  }

  const themeEnd = "/* lorre-blocks theme end */"
  if (cssContent.includes(themeEnd)) {
    return cssContent.replace(themeEnd, `${themeEnd}\n\n${block}`)
  }

  const trimmed = cssContent.trimEnd()
  return `${trimmed.length > 0 ? `${trimmed}\n\n` : ""}${block}\n`
}

/** Remove any overrides block (used when a re-applied plan has no overrides). */
export function stripOverridesBlock(cssContent: string): string {
  if (!cssContent.includes(OVERRIDES_START)) return cssContent
  return cssContent.replace(
    new RegExp(`\\n*${escapeRegExp(OVERRIDES_START)}[\\s\\S]*?${escapeRegExp(OVERRIDES_END)}\\n*`),
    "\n"
  )
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
