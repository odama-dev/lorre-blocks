/**
 * Token source-of-truth types (Phase 1).
 *
 * A theme is *data*: color seeds + token values. Everything else — 12-step
 * OKLCH scales, semantic aliases, Tailwind v4 CSS, DTCG JSON — is generated
 * from it at build time. Components never see theme-specific values; they
 * only reference semantic tokens.
 */

export type ColorMode = "light" | "dark"

export type ScaleName = "neutral" | "accent" | "danger" | "success" | "warning"

export const SCALE_NAMES: ScaleName[] = [
  "neutral",
  "accent",
  "danger",
  "success",
  "warning",
]

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
}

export interface ResolvedTheme {
  name: string
  description: string
  extends?: string
  colors: Record<ScaleName, ColorSeed>
  semantics: SemanticColors
  typography: Typography
  radius: RadiusScale
  shadows: ShadowScale
  motion: MotionTokens
}
