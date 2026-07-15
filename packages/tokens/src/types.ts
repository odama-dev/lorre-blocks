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
export type ThemeColors = Record<CoreScaleName, ColorSpec> & {
  secondary?: ColorSpec
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

/** A ramp carries one hex per step, in step order 1 → 12. */
export type RampSteps = readonly [
  string, string, string, string, string, string,
  string, string, string, string, string, string,
]

/**
 * A scale pinned step by step, for palettes that were tuned by hand and so
 * cannot be reached from a seed — the generator walks a fixed lightness/chroma
 * curve at one hue, which is the wrong shape for a ramp whose chroma peaks
 * mid-scale or whose steps carry no Radix role.
 *
 * `dark` is required, unlike `ColorSeed.dark`: a seed without it still yields a
 * real dark scale from DARK_STEPS, but a ramp has no curve to fall back on, and
 * a hand-tuned dark mode is not a function of its light mode — measured against
 * AlignUI, 9 of 20 semantic tokens break the naive `1000 - step` inversion.
 */
export interface ColorRamp {
  /** Steps 1–12 as hex (`#rgb` or `#rrggbb`). */
  steps: RampSteps
  dark: { steps: RampSteps }
  /** Text color on top of steps 9–10. Derived from step 9 when omitted. */
  onSolid?: "light" | "dark"
}

/** How a theme spells one scale: generated from a seed, or pinned step by step. */
export type ColorSpec = ColorSeed | ColorRamp

export function isRamp(spec: ColorSpec): spec is ColorRamp {
  return "steps" in spec
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

/**
 * A semantic is either one ref for both modes, or a ref per mode.
 *
 * A single ref only tracks the mode when it points at a scale: `--neutral-1` is
 * re-declared under `.dark`, so "neutral-1" follows. A *literal* has nothing to
 * re-declare, so one literal is frozen across both modes — which is why pinning
 * exact colors needs the split form.
 *
 * Splitting is also the only way to say what a hand-tuned dark mode does: it is
 * not a function of the light mode. Against AlignUI, 9 of 20 semantics break the
 * naive inversion — `bg-weak-50` goes 50 → 800 where the rule predicts 950, and
 * `text-soft-400` goes 400 → 500 where it predicts 600. Dark consistently
 * compresses the range rather than mirroring it.
 */
export type SemanticValue =
  | SemanticRef
  | { light: SemanticRef; dark: SemanticRef }

export type SemanticColors = Record<SemanticColorName, SemanticValue>

/** The ref a semantic resolves to in one mode. */
export function semanticRefFor(
  value: SemanticValue,
  mode: ColorMode
): SemanticRef {
  return typeof value === "string" ? value : value[mode]
}

export interface Typography {
  /** Font stacks as arrays (DTCG fontFamily format); joined for CSS. */
  fontSans: string[]
  fontMono: string[]
  fontDisplay?: string[]
  /** Modular heading scale; omitted = no --text-h* tokens are emitted. */
  typeScale?: TypeScale
}

/** Which font stack a text style renders in. */
export type FontRole = "sans" | "mono" | "display"

/** One text style, measured rather than derived. */
export interface TypeStepSpec {
  /** CSS font-size — a rem literal, or any length/clamp(). */
  size: string
  /** Unitless ratio, or any CSS line-height. */
  lineHeight: number | string
  /** CSS letter-spacing, e.g. "-1%" or "-0.01em". */
  letterSpacing?: string
  weight?: number
  /** Defaults to `sans`. */
  family?: FontRole
}

/**
 * Modular type scale: `base` is the body size, each heading step multiplies
 * by `ratio` (h6 = base·ratio¹ … h1 = base·ratio⁶, small = base/ratio).
 * `fluid` (default true) renders headings as viewport-interpolated `clamp()`
 * values so they shrink on small screens with zero media queries.
 */
export interface ModularTypeScale {
  /** Body font size in rem, e.g. "1rem". */
  base: string
  /** Step multiplier, e.g. 1.25. */
  ratio: number
  fluid?: boolean
}

/**
 * Every step named and measured, for a scale that was tuned by hand rather
 * than derived — the type-side twin of `ColorRamp`.
 *
 * A ratio cannot reach such a scale. Measured against AlignUI: its steps run
 * 56 → 48 → 40 → 32 → 24 → 20, whose ratios are 1.17, 1.20, 1.25, 1.33, 1.20 —
 * no single multiplier produces them. Worse, size alone stops identifying a
 * style: Label/Small and Paragraph/Small are both 14/20 and differ only in
 * weight (500 vs 400), while Subheading/Small is *also* 14/20 at weight 500 and
 * differs from Label/Small only in letter-spacing (+6% vs -0.6%) — a property
 * the modular form cannot express at all.
 */
export interface ExplicitTypeScale {
  /** Token name → style. `--text-<name>` follows insertion order. */
  steps: Record<string, TypeStepSpec>
}

export type TypeScale = ModularTypeScale | ExplicitTypeScale

export function isExplicitTypeScale(
  scale: TypeScale
): scale is ExplicitTypeScale {
  return "steps" in scale
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
 * `input` also covers textarea and the select trigger; `panel` covers the
 * modal surfaces (dialog, alert-dialog, sheet) — floating surfaces like
 * popover/dropdown keep their own smaller radius; `control` covers
 * checkbox/radio (radio stays rounded-full).
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
  colors?: Partial<Record<ScaleName, ColorSpec>>
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
