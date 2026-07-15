import { hexToOklch, oklchToHex, type Oklch } from "./oklch"
import { generateScale, onSolidColor } from "./scale"
import {
  semanticRefFor,
  themeScaleNames,
  type ColorMode,
  type ColorSpec,
  type ResolvedTheme,
  type SemanticColorName,
} from "./types"

/**
 * Contrast checking for the semantic pairs (Phase 7.7).
 *
 * A seeded scale gets its text color from `onSolidColor`, which reads the
 * seed's lightness — contrast is a property of the generator, so it holds by
 * construction. Pinned ramps and split semantics (R1/R2) hand that choice to
 * whoever wrote the theme, and nothing then stops a value that matches the
 * design reference but cannot be read. These checks are what keeps "looks like
 * the reference" from quietly outranking "is legible".
 */

/** WCAG 2.2 relative luminance of an sRGB hex. */
export function relativeLuminance(hex: string): number {
  const m = hex.trim().match(/^#?([0-9a-fA-F]{6})$/)
  if (!m) throw new Error(`Expected a 6-digit hex color, got "${hex}"`)
  const channels = [0, 2, 4].map((i) => {
    const srgb = parseInt(m[1].slice(i, i + 2), 16) / 255
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

/** WCAG 2.2 contrast ratio, 1–21. Order does not matter. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * The concrete color a semantic lands on, for one mode. Mirrors the CSS
 * emitter's resolution, but returns a value rather than a `var()`.
 */
export function resolveSemanticColor(
  theme: ResolvedTheme,
  name: SemanticColorName,
  mode: ColorMode
): Oklch {
  const scales = themeScaleNames(theme.colors) as string[]
  const ref = semanticRefFor(theme.semantics[name], mode)

  const scaleRef = ref.match(/^([a-z]+)-(\d{1,2})$/)
  if (scaleRef && scales.includes(scaleRef[1])) {
    const spec = theme.colors[scaleRef[1] as keyof typeof theme.colors] as ColorSpec
    return generateScale(spec, mode)[Number(scaleRef[2]) - 1]
  }

  const onRef = ref.match(/^on-([a-z]+)$/)
  if (onRef && scales.includes(onRef[1])) {
    const spec = theme.colors[onRef[1] as keyof typeof theme.colors] as ColorSpec
    return onSolidColor(spec, mode)
  }

  return hexToOklch(ref) // literal; hex only
}

/** Surface → text pairs every theme must keep legible. */
export const SEMANTIC_PAIRS: ReadonlyArray<
  readonly [SemanticColorName, SemanticColorName]
> = [
  ["background", "foreground"],
  ["card", "card-foreground"],
  ["popover", "popover-foreground"],
  ["primary", "primary-foreground"],
  ["secondary", "secondary-foreground"],
  ["muted", "muted-foreground"],
  ["accent", "accent-foreground"],
  ["destructive", "destructive-foreground"],
  ["success", "success-foreground"],
  ["warning", "warning-foreground"],
]

export interface ContrastResult {
  surface: SemanticColorName
  text: SemanticColorName
  mode: ColorMode
  ratio: number
}

/** Every semantic pair's contrast, both modes, in SEMANTIC_PAIRS order. */
export function checkContrast(theme: ResolvedTheme): ContrastResult[] {
  const out: ContrastResult[] = []
  for (const mode of ["light", "dark"] as const) {
    for (const [surface, text] of SEMANTIC_PAIRS) {
      out.push({
        surface,
        text,
        mode,
        ratio: contrastRatio(
          oklchToHex(resolveSemanticColor(theme, surface, mode)),
          oklchToHex(resolveSemanticColor(theme, text, mode))
        ),
      })
    }
  }
  return out
}
