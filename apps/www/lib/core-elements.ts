import {
  computeTypeScale,
  generateScale,
  getResolvedTheme,
  isExplicitTypeScale,
  oklchToHex,
  resolveSemanticColor,
  themeScaleNames,
  type ColorMode,
  type FontRole,
  type Oklch,
  type SemanticColorName,
  type TypeStep,
} from "@lorre-blocks/tokens"

/**
 * Data behind the Core Elements pages.
 *
 * Everything here is *read* from the theme, never restated. A docs page that
 * spells out "#335CFF" is a second source of truth: it drifts the first time
 * someone edits the theme, and nothing fails — the page keeps rendering, it
 * just starts lying. Resolving through the same helpers the CSS is generated
 * from means the page and the stylesheet cannot disagree.
 */

/** The theme the docs specimen. `init` starts new projects on this one. */
export const HOUSE_THEME = "odama"

export interface Swatch {
  step: number
  hex: string
}

export interface ScaleSpecimen {
  name: string
  light: Swatch[]
  dark: Swatch[]
}

function swatches(scale: Oklch[]): Swatch[] {
  return scale.map((color, i) => ({ step: i + 1, hex: oklchToHex(color) }))
}

/** The 12-step scales, per mode. Seeded or pinned — the generator hides which. */
export function colorSpecimens(themeName = HOUSE_THEME): ScaleSpecimen[] {
  const theme = getResolvedTheme(themeName)
  return themeScaleNames(theme.colors).map((name) => {
    const spec = theme.colors[name]!
    return {
      name,
      light: swatches(generateScale(spec, "light")),
      dark: swatches(generateScale(spec, "dark")),
    }
  })
}

export interface SemanticSpecimen {
  name: SemanticColorName
  light: string
  dark: string
}

/**
 * The 23 semantic names resolved to hex per mode — the layer components read
 * (73 of 75 reference nothing else), and where odama's exact AlignUI values land.
 */
export function semanticSpecimens(themeName = HOUSE_THEME): SemanticSpecimen[] {
  const theme = getResolvedTheme(themeName)
  const at = (name: SemanticColorName, mode: ColorMode) =>
    oklchToHex(resolveSemanticColor(theme, name, mode))
  return (Object.keys(theme.semantics) as SemanticColorName[]).map((name) => ({
    name,
    light: at(name, "light"),
    dark: at(name, "dark"),
  }))
}

export interface TypeSpecimen extends TypeStep {
  /** True when the theme measured this step rather than deriving it from a ratio. */
  measured: boolean
  /** The step's font stack, resolved from the theme. */
  fontFamily: string
}

/**
 * The stack for a role, read from the theme rather than through
 * `var(--font-display)`.
 *
 * The var would be wrong here: this site's stylesheet is generated from `basic`,
 * which declares no display face, so `--font-display` resolves to nothing and
 * the title steps would quietly render in the body font while the page labelled
 * them "display" — a specimen that lies is worse than no specimen.
 */
function fontStack(theme: ReturnType<typeof getResolvedTheme>, role?: FontRole) {
  const { fontSans, fontMono, fontDisplay } = theme.typography
  const stack =
    role === "mono" ? fontMono : role === "display" ? fontDisplay : fontSans
  return (stack ?? fontSans).join(", ")
}

export function typeSpecimens(themeName = HOUSE_THEME): TypeSpecimen[] {
  const theme = getResolvedTheme(themeName)
  const scale = theme.typography.typeScale
  if (!scale) return []
  const measured = isExplicitTypeScale(scale)
  return computeTypeScale(scale).map((step) => ({
    ...step,
    measured,
    fontFamily: fontStack(theme, step.family),
  }))
}

export function radiusSpecimens(themeName = HOUSE_THEME) {
  const theme = getResolvedTheme(themeName)
  return Object.entries(theme.radius).map(([name, value]) => ({ name, value }))
}
