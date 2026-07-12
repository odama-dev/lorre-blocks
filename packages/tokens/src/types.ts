/**
 * Token source-of-truth types (Phase 1, extended in Phase 7.1).
 *
 * A theme is *data*: color seeds + token values. Everything else — 12-step
 * OKLCH scales, semantic aliases, Tailwind v4 CSS, DTCG JSON — is generated
 * from it at build time. Components never see theme-specific values; they
 * only reference semantic tokens.
 */

import type { IconSetName } from "./icons"

export type ColorMode = "light" | "dark"

/** The five scales every theme must define. */
export type CoreScaleName = "neutral" | "accent" | "danger" | "success" | "warning"

/** Core scales plus the optional second brand scale. */
export type ScaleName = CoreScaleName | "secondary"

export const SCALE_NAMES: CoreScaleName[] = [
  "neutral",
  "accent",
  "danger",
  "success",
  "warning",
]

/** Color scales carried by a resolved theme; `secondary` is opt-in. */
export type ThemeColors = Record<CoreScaleName, ColorSeed> & {
  secondary?: ColorSeed
}

/** Scales a theme actually carries, in emission order (secondary follows accent). */
export function themeScaleNames(colors: ThemeColors): ScaleName[] {
  return colors.secondary
    ? ["neutral", "accent", "secondary", "danger", "success", "warning"]
    : [...SCALE_NAMES]
}

/** Seed for one 12-step scale. Steps 9–10 (solid) come straight from the seed. */
export interface ColorSeed {
  /** OKLCH hue, 0–360 */
  hue: number
  /** OKLCH chroma at the solid steps */
  chroma: number
  /** OKLCH lightness of solid step 9 */
  lightness: number
  /** Text color on top of the solid steps. Computed from lightness when omitted. */
  onSolid?: "light" | "dark"
  /** Overrides applied in dark mode (e.g. monochrome accents flip to light solids). */
  dark?: Partial<Pick<ColorSeed, "hue" | "chroma" | "lightness" | "onSolid">>
}

export type SemanticColorName =
  | "background"
  | "foreground"
  | "card"
  | "card-foreground"
  | "popover"
  | "popover-foreground"
  | "primary"
  | "primary-foreground"
  | "secondary"
  | "secondary-foreground"
  | "muted"
  | "muted-foreground"
  | "accent"
  | "accent-foreground"
  | "destructive"
  | "destructive-foreground"
  | "success"
  | "success-foreground"
  | "warning"
  | "warning-foreground"
  | "border"
  | "input"
  | "ring"

/**
 * Semantic value reference. Allowed forms:
 *  - "<scale>-<step>"  e.g. "accent-9"  → resolves to that scale step
 *  - "on-<scale>"      e.g. "on-accent" → computed text color on that scale's solid
 *  - any literal CSS color, e.g. "oklch(0.5 0.1 250)"
 */
export type SemanticRef = string

export type SemanticColors = Record<SemanticColorName, SemanticRef>

export interface Typography {
  /** Font stacks as arrays (DTCG fontFamily format); joined for CSS. */
  fontSans: string[]
  fontMono: string[]
  fontDisplay?: string[]
  /** Modular heading scale; omitted = no --text-h* tokens are emitted. */
  typeScale?: TypeScale
}

/**
 * Modular type scale: `base` is the body size, each heading step multiplies
 * by `ratio` (h6 = base·ratio¹ … h1 = base·ratio⁶, small = base/ratio).
 * `fluid` (default true) renders headings as viewport-interpolated `clamp()`
 * values so they shrink on small screens with zero media queries.
 */
export interface TypeScale {
  /** Body font size in rem, e.g. "1rem". */
  base: string
  /** Step multiplier, e.g. 1.25. */
  ratio: number
  fluid?: boolean
}

export interface RadiusScale {
  /** Legacy shadcn `--radius` base, kept for compatibility. */
  base: string
  sm: string
  md: string
  lg: string
  xl: string
  "2xl": string
}

export interface ShadowScale {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
}

/** Cubic bezier as [x1, y1, x2, y2] (DTCG cubicBezier format). */
export type Bezier = [number, number, number, number]

export interface MotionTokens {
  durationFast: string
  durationNormal: string
  durationSlow: string
  easeSmooth: Bezier
  easeSnappy: Bezier
}

/**
 * Spacing density. `--spacing` is Tailwind v4's base unit — every spacing
 * utility (p-4, gap-2, h-9, …) is a multiple of it — so `scaling` rescales
 * the whole layout Radix-Themes-style (0.9 = 90% … 1.1 = 110%).
 */
export interface SpacingTokens {
  scaling: number
}

/**
 * Per-component token surface — the "important set" only. Each entry becomes
 * a `--<component>-<key>` CSS variable that the component consumes; defaults
 * reference global tokens so themes only override what they care about.
 * `input` also covers textarea/select; `panel` covers dialog/popover/sheet;
 * `control` covers checkbox/radio.
 */
export const KEY_COMPONENTS = {
  button: ["radius", "height", "px"],
  input: ["radius", "height", "px"],
  card: ["radius", "padding"],
  panel: ["radius", "padding"],
  badge: ["radius", "px", "py"],
  tabs: ["radius", "trigger-radius"],
  control: ["radius", "size"],
  tooltip: ["radius", "px", "py"],
} as const

export type KeyComponent = keyof typeof KEY_COMPONENTS

export type ComponentTokens = {
  [K in KeyComponent]?: Partial<
    Record<(typeof KEY_COMPONENTS)[K][number], string>
  >
}

export interface ThemeDefinition {
  name: string
  description: string
  /** Name of the theme this one extends. Unset = root theme. */
  extends?: string
  colors?: Partial<Record<ScaleName, ColorSeed>>
  semantics?: Partial<SemanticColors>
  typography?: Partial<Typography>
  radius?: Partial<RadiusScale>
  shadows?: Partial<ShadowScale>
  motion?: Partial<MotionTokens>
  spacing?: Partial<SpacingTokens>
  components?: ComponentTokens
  icons?: IconChoice
}

export interface ResolvedTheme {
  name: string
  description: string
  extends?: string
  colors: ThemeColors
  semantics: SemanticColors
  typography: Typography
  radius: RadiusScale
  shadows: ShadowScale
  motion: MotionTokens
  /** Optional groups: present when the theme (or an ancestor) defines them. */
  spacing?: SpacingTokens
  components?: ComponentTokens
  icons?: IconChoice
}

/** The icon set (and, where the set has them, style) a project uses. */
export interface IconChoice {
  set: IconSetName
  style?: string
}
