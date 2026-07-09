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
  out.push(".dark {")
  out.push(...scaleLines(theme, "dark"))
  const darkSemantics: string[] = []
  for (const name of SEMANTIC_ORDER) {
    const light = resolveSemantic(theme, theme.semantics[name], "light")
    const dark = resolveSemantic(theme, theme.semantics[name], "dark")
    if (light !== dark) darkSemantics.push(`  --${name}: ${dark};`)
  }
  if (darkSemantics.length > 0) {
    out.push("")
    out.push(...darkSemantics)
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
