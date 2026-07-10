import { formatOklch } from "./oklch"
import { generateScale, onSolidColor } from "./scale"
import {
  SCALE_NAMES,
  type ColorMode,
  type ResolvedTheme,
  type Bezier,
  type SemanticColorName,
} from "./types"

/**
 * Emits a full Tailwind v4 theme block for one resolved theme. The output is
 * what `lorre-blocks init` injects into the consumer's global CSS (between
 * the lorre-blocks theme markers) and what `src/styles/theme.css` is
 * generated from.
 *
 * Structure: raw values live on `:root`/`.dark`; `@theme inline` maps them
 * into Tailwind utility namespaces. Semantic vars reference scale vars, so
 * dark mode only needs to re-declare the scales (plus any semantic whose
 * resolved literal differs between modes).
 */

const SEMANTIC_ORDER: SemanticColorName[] = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "border",
  "input",
  "ring",
]

const RADIUS_KEYS = ["sm", "md", "lg", "xl", "2xl"] as const
const SHADOW_KEYS = ["xs", "sm", "md", "lg", "xl"] as const

function bezierToCss(b: Bezier): string {
  return `cubic-bezier(${b.join(", ")})`
}

/** Resolve one semantic ref for a mode. Scale refs stay `var()`s; the rest become literals. */
function resolveSemantic(
  theme: ResolvedTheme,
  ref: string,
  mode: ColorMode
): string {
  const scaleRef = ref.match(/^([a-z]+)-(\d{1,2})$/)
  if (scaleRef && (SCALE_NAMES as string[]).includes(scaleRef[1])) {
    return `var(--${ref})`
  }
  const onRef = ref.match(/^on-([a-z]+)$/)
  if (onRef && (SCALE_NAMES as string[]).includes(onRef[1])) {
    const seed = theme.colors[onRef[1] as (typeof SCALE_NAMES)[number]]
    return formatOklch(onSolidColor(seed, mode))
  }
  return ref // literal CSS color
}

function scaleLines(theme: ResolvedTheme, mode: ColorMode): string[] {
  const lines: string[] = []
  for (const scale of SCALE_NAMES) {
    const steps = generateScale(theme.colors[scale], mode)
    steps.forEach((color, i) => {
      lines.push(`  --${scale}-${i + 1}: ${formatOklch(color)};`)
    })
  }
  return lines
}

export function themeToCss(theme: ResolvedTheme): string {
  const out: string[] = []

  out.push("@custom-variant dark (&:is(.dark *));", "")

  // ---- :root (light) ----
  out.push(":root {")
  out.push(...scaleLines(theme, "light"))
  out.push("")
  for (const name of SEMANTIC_ORDER) {
    out.push(`  --${name}: ${resolveSemantic(theme, theme.semantics[name], "light")};`)
  }
  out.push("")
  out.push(`  --radius: ${theme.radius.base};`)
  for (const key of RADIUS_KEYS) {
    out.push(`  --radius-${key}: ${theme.radius[key]};`)
  }
  for (const key of SHADOW_KEYS) {
    out.push(`  --shadow-${key}: ${theme.shadows[key]};`)
  }
  out.push(`  --motion-duration-fast: ${theme.motion.durationFast};`)
  out.push(`  --motion-duration-normal: ${theme.motion.durationNormal};`)
  out.push(`  --motion-duration-slow: ${theme.motion.durationSlow};`)
  out.push("}", "")

  // ---- .dark ----
  // Every semantic is re-declared here, not just the ones whose literal
  // differs: a custom property resolves its var() references on the element
  // that declares it, so `--background: var(--neutral-1)` computed on :root
  // inherits the *light* value. Re-declaring under .dark recomputes it
  // against the dark scales.
  out.push(".dark {")
  out.push(...scaleLines(theme, "dark"))
  out.push("")
  for (const name of SEMANTIC_ORDER) {
    out.push(`  --${name}: ${resolveSemantic(theme, theme.semantics[name], "dark")};`)
  }
  out.push("}", "")

  // ---- @theme inline: Tailwind utility mapping ----
  out.push("@theme inline {")
  for (const scale of SCALE_NAMES) {
    for (let i = 1; i <= 12; i++) {
      out.push(`  --color-${scale}-${i}: var(--${scale}-${i});`)
    }
  }
  out.push("")
  for (const name of SEMANTIC_ORDER) {
    out.push(`  --color-${name}: var(--${name});`)
  }
  out.push("")
  for (const key of RADIUS_KEYS) {
    out.push(`  --radius-${key}: var(--radius-${key});`)
  }
  for (const key of SHADOW_KEYS) {
    out.push(`  --shadow-${key}: var(--shadow-${key});`)
  }
  out.push("")
  out.push(`  --font-sans: ${theme.typography.fontSans.join(", ")};`)
  out.push(`  --font-mono: ${theme.typography.fontMono.join(", ")};`)
  if (theme.typography.fontDisplay) {
    out.push(`  --font-display: ${theme.typography.fontDisplay.join(", ")};`)
  }
  out.push("")
  out.push(`  --ease-smooth: ${bezierToCss(theme.motion.easeSmooth)};`)
  out.push(`  --ease-snappy: ${bezierToCss(theme.motion.easeSnappy)};`)
  out.push("")
  // Animation tokens for overlay/disclosure components. Durations reference the
  // theme's motion tokens, so e.g. `utilitarian` animates faster with zero
  // component changes. Keyframes are prefixed to avoid consumer collisions.
  out.push(
    "  --animate-fade-in: lorre-fade-in var(--motion-duration-fast) var(--ease-smooth);"
  )
  out.push(
    "  --animate-panel-in: lorre-panel-in var(--motion-duration-fast) var(--ease-smooth);"
  )
  out.push(
    "  --animate-accordion-down: lorre-accordion-down var(--motion-duration-normal) var(--ease-smooth);"
  )
  out.push(
    "  --animate-accordion-up: lorre-accordion-up var(--motion-duration-normal) var(--ease-smooth);"
  )
  out.push("")
  out.push("  @keyframes lorre-fade-in {")
  out.push("    from { opacity: 0; }")
  out.push("  }")
  out.push("  @keyframes lorre-panel-in {")
  out.push("    from { opacity: 0; transform: translateY(2px) scale(0.98); }")
  out.push("  }")
  out.push("  @keyframes lorre-accordion-down {")
  out.push("    from { height: 0; }")
  out.push("    to { height: var(--radix-accordion-content-height); }")
  out.push("  }")
  out.push("  @keyframes lorre-accordion-up {")
  out.push("    from { height: var(--radix-accordion-content-height); }")
  out.push("    to { height: 0; }")
  out.push("  }")
  out.push("}", "")

  out.push("@layer base {")
  out.push("  * {")
  out.push("    @apply border-border;")
  out.push("  }")
  out.push("  body {")
  out.push("    @apply bg-background text-foreground font-sans antialiased;")
  out.push("  }")
  out.push("}")

  return out.join("\n") + "\n"
}
