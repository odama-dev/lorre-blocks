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
  for (const side of ["top", "bottom", "left", "right"]) {
    out.push(
      `  --animate-slide-in-${side}: lorre-slide-in-${side} var(--motion-duration-slow) var(--ease-smooth);`
    )
  }
  // Fixed cadence on purpose: a text caret blinks at OS speed regardless of
  // how fast a theme's panels animate.
  out.push(
    "  --animate-caret-blink: lorre-caret-blink 1.25s ease-out infinite;"
  )
  // Fixed duration too: marquee speed is content pacing, not UI motion —
  // consumers override with [animation-duration:_20s] utilities when needed.
  out.push("  --animate-marquee: lorre-marquee 40s linear infinite;")
  out.push("  --animate-shimmer: lorre-shimmer 2.5s linear infinite;")
  out.push("  --animate-gradient: lorre-gradient 6s ease-in-out infinite;")
  out.push("  --animate-ripple: lorre-ripple 0.6s ease-out forwards;")
  out.push("  --animate-border-beam: lorre-border-beam 6s linear infinite;")
  out.push("  --animate-meteor: lorre-meteor 5s linear infinite;")
  out.push("  --animate-sparkle: lorre-sparkle 1.4s ease-in-out infinite;")
  out.push("  --animate-glitch: lorre-glitch 2.8s steps(1, end) infinite;")
  out.push("  --animate-click-spark: lorre-click-spark 0.45s ease-out forwards;")
  out.push("  --animate-star-border: lorre-star-border 6s linear infinite alternate;")
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
  const slideFrom: Record<string, string> = {
    top: "translateY(-100%)",
    bottom: "translateY(100%)",
    left: "translateX(-100%)",
    right: "translateX(100%)",
  }
  for (const [side, transform] of Object.entries(slideFrom)) {
    out.push(`  @keyframes lorre-slide-in-${side} {`)
    out.push(`    from { transform: ${transform}; }`)
    out.push("  }")
  }
  out.push("  @keyframes lorre-caret-blink {")
  out.push("    0%, 70%, 100% { opacity: 1; }")
  out.push("    20%, 50% { opacity: 0; }")
  out.push("  }")
  // -50% because marquee renders its content twice for a seamless loop.
  out.push("  @keyframes lorre-marquee {")
  out.push("    to { transform: translateX(-50%); }")
  out.push("  }")
  // Both sweep a 200%-wide background across the element.
  out.push("  @keyframes lorre-shimmer {")
  out.push("    from { background-position: 200% 0; }")
  out.push("    to { background-position: -200% 0; }")
  out.push("  }")
  out.push("  @keyframes lorre-gradient {")
  out.push("    0%, 100% { background-position: 0% 50%; }")
  out.push("    50% { background-position: 100% 50%; }")
  out.push("  }")
  out.push("  @keyframes lorre-ripple {")
  out.push("    from { transform: scale(0); opacity: 0.5; }")
  out.push("    to { transform: scale(4); opacity: 0; }")
  out.push("  }")
  // Travels an offset-path laid along the host's border (border-beam).
  out.push("  @keyframes lorre-border-beam {")
  out.push("    to { offset-distance: 100%; }")
  out.push("  }")
  out.push("  @keyframes lorre-meteor {")
  out.push("    from { transform: rotate(215deg) translateX(0); opacity: 1; }")
  out.push("    70% { opacity: 1; }")
  out.push("    to { transform: rotate(215deg) translateX(-500px); opacity: 0; }")
  out.push("  }")
  out.push("  @keyframes lorre-sparkle {")
  out.push("    0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }")
  out.push("    50% { transform: scale(1) rotate(120deg); opacity: 1; }")
  out.push("  }")
  // Stepped clip-path slices + jitter for the glitch-text layers.
  out.push("  @keyframes lorre-glitch {")
  out.push("    0%, 100% { clip-path: inset(0 0 92% 0); transform: translate(-2px, -1px); }")
  out.push("    12% { clip-path: inset(44% 0 48% 0); transform: translate(2px, 1px); }")
  out.push("    24% { clip-path: inset(78% 0 6% 0); transform: translate(-2px, 0); }")
  out.push("    36% { clip-path: inset(12% 0 74% 0); transform: translate(2px, -1px); }")
  out.push("    48% { clip-path: inset(58% 0 32% 0); transform: translate(-1px, 1px); }")
  out.push("    60% { clip-path: inset(30% 0 62% 0); transform: translate(2px, 0); }")
  out.push("    72% { clip-path: inset(68% 0 18% 0); transform: translate(-2px, 1px); }")
  out.push("    84% { clip-path: inset(6% 0 86% 0); transform: translate(1px, -1px); }")
  out.push("    92% { clip-path: inset(50% 0 42% 0); transform: translate(-1px, 0); }")
  out.push("  }")
  out.push("  @keyframes lorre-click-spark {")
  out.push("    from { transform: translateY(6px) scaleY(1); opacity: 1; }")
  out.push("    to { transform: translateY(calc(-1 * var(--spark-distance, 24px))) scaleY(0.3); opacity: 0; }")
  out.push("  }")
  out.push("  @keyframes lorre-star-border {")
  out.push("    from { transform: translateX(0); }")
  out.push("    to { transform: translateX(30%); }")
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
