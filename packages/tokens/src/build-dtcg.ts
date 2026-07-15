import { formatOklch, oklchToHex } from "./oklch"
import { generateScale, onSolidColor } from "./scale"
import { computeTypeScale } from "./type-scale"
import {
  KEY_COMPONENTS,
  themeScaleNames,
  type ColorMode,
  type ColorSeed,
  type KeyComponent,
  type ResolvedTheme,
  type SemanticColorName,
} from "./types"

/**
 * Emits a W3C DTCG (Design Tokens Community Group format) document for one
 * resolved theme — the machine-readable twin of the CSS output, for agents
 * and design tooling (Tokens Studio, Style Dictionary, ...).
 *
 * Color values are sRGB hex (broadest tool support); the exact OKLCH value
 * is kept in `$extensions["io.lorre.oklch"]`. Light/dark modes are separate
 * groups; semantic tokens alias the light group and carry their dark alias
 * in `$extensions["io.lorre.dark"]`.
 */

type Dtcg = Record<string, unknown>

function colorToken(oklch: { l: number; c: number; h: number }): Dtcg {
  return {
    $type: "color",
    $value: oklchToHex(oklch),
    $extensions: { "io.lorre.oklch": formatOklch(oklch) },
  }
}

function scaleGroup(theme: ResolvedTheme, mode: ColorMode): Dtcg {
  const group: Dtcg = {}
  for (const scale of themeScaleNames(theme.colors)) {
    const steps = generateScale(theme.colors[scale]!, mode)
    const scaleGroup: Dtcg = {}
    steps.forEach((color, i) => {
      scaleGroup[String(i + 1)] = colorToken(color)
    })
    group[scale] = scaleGroup
  }
  return group
}

function semanticGroup(theme: ResolvedTheme): Dtcg {
  const group: Dtcg = {}
  const scales = themeScaleNames(theme.colors) as string[]
  for (const name of Object.keys(theme.semantics) as SemanticColorName[]) {
    const ref = theme.semantics[name]
    const scaleRef = ref.match(/^([a-z]+)-(\d{1,2})$/)
    const onRef = ref.match(/^on-([a-z]+)$/)

    if (scaleRef && scales.includes(scaleRef[1])) {
      group[name] = {
        $type: "color",
        $value: `{color.light.${scaleRef[1]}.${scaleRef[2]}}`,
        $extensions: {
          "io.lorre.dark": `{color.dark.${scaleRef[1]}.${scaleRef[2]}}`,
        },
      }
    } else if (onRef && scales.includes(onRef[1])) {
      const spec = theme.colors[onRef[1] as keyof typeof theme.colors] as ColorSpec
      group[name] = {
        $type: "color",
        $value: oklchToHex(onSolidColor(spec, "light")),
        $extensions: {
          "io.lorre.oklch": formatOklch(onSolidColor(spec, "light")),
          "io.lorre.dark-value": oklchToHex(onSolidColor(spec, "dark")),
        },
      }
    } else {
      group[name] = { $type: "color", $value: ref }
    }
  }
  return group
}

function dimensionGroup(values: Record<string, string>): Dtcg {
  const group: Dtcg = {}
  for (const [key, value] of Object.entries(values)) {
    group[key] = { $type: "dimension", $value: value }
  }
  return group
}

function layoutTokens(theme: ResolvedTheme): Dtcg {
  const scaling = theme.spacing?.scaling ?? 1
  const spacing: Dtcg = {
    base: {
      $type: "dimension",
      $value: scaling === 1 ? "0.25rem" : `${Math.round(0.25 * scaling * 10000) / 10000}rem`,
      $description: "Base spacing unit; Tailwind spacing utilities are multiples of it.",
    },
  }
  if (theme.spacing) {
    spacing.scaling = {
      $type: "number",
      $value: scaling,
      $description: "Density factor applied to the base spacing unit (0.9 = 90%).",
    }
  }
  return {
    spacing,
    breakpoint: dimensionGroup({
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    }),
  }
}

/** `var(--radius-md)` component defaults become DTCG aliases (`{radius.md}`). */
function componentGroup(theme: ResolvedTheme): Dtcg | undefined {
  if (!theme.components) return undefined
  const group: Dtcg = {}
  for (const component of Object.keys(KEY_COMPONENTS) as KeyComponent[]) {
    const tokens = theme.components[component]
    if (!tokens) continue
    const componentTokens: Dtcg = {}
    for (const key of KEY_COMPONENTS[component]) {
      const value = (tokens as Record<string, string>)[key]
      if (value === undefined) continue
      const radiusRef = value.match(/^var\(--radius-([a-z0-9]+)\)$/)
      componentTokens[key] = {
        $type: "dimension",
        $value: radiusRef ? `{radius.${radiusRef[1]}}` : value,
      }
    }
    group[component] = componentTokens
  }
  return group
}

const FONT_SIZE_TOKENS: Dtcg = dimensionGroup({
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
})

export function themeToDtcg(theme: ResolvedTheme): Dtcg {
  const fontFamilies: Dtcg = {
    sans: { $type: "fontFamily", $value: theme.typography.fontSans },
    mono: { $type: "fontFamily", $value: theme.typography.fontMono },
  }
  if (theme.typography.fontDisplay) {
    fontFamilies.display = {
      $type: "fontFamily",
      $value: theme.typography.fontDisplay,
    }
  }

  const typeScale: Dtcg = {}
  if (theme.typography.typeScale) {
    for (const step of computeTypeScale(theme.typography.typeScale)) {
      typeScale[step.name] = {
        $type: "dimension",
        $value: step.size,
        $extensions: { "io.lorre.line-height": step.lineHeight },
      }
    }
  }

  const components = componentGroup(theme)

  return {
    $description: `Lorre Blocks theme "${theme.name}" — ${theme.description}`,
    ...(theme.icons
      ? { $extensions: { "io.lorre.icons": theme.icons } }
      : {}),
    color: {
      light: scaleGroup(theme, "light"),
      dark: scaleGroup(theme, "dark"),
      semantic: semanticGroup(theme),
    },
    typography: {
      "font-family": fontFamilies,
      "font-size": FONT_SIZE_TOKENS,
      ...(Object.keys(typeScale).length > 0 ? { "type-scale": typeScale } : {}),
    },
    radius: dimensionGroup({
      base: theme.radius.base,
      sm: theme.radius.sm,
      md: theme.radius.md,
      lg: theme.radius.lg,
      xl: theme.radius.xl,
      "2xl": theme.radius["2xl"],
    }),
    shadow: Object.fromEntries(
      Object.entries(theme.shadows).map(([key, value]) => [
        key,
        {
          $type: "shadow",
          $value: value,
          $description: "CSS box-shadow string (may be multi-layer).",
        },
      ])
    ),
    motion: {
      duration: {
        fast: { $type: "duration", $value: theme.motion.durationFast },
        normal: { $type: "duration", $value: theme.motion.durationNormal },
        slow: { $type: "duration", $value: theme.motion.durationSlow },
      },
      easing: {
        smooth: { $type: "cubicBezier", $value: theme.motion.easeSmooth },
        snappy: { $type: "cubicBezier", $value: theme.motion.easeSnappy },
      },
    },
    ...(components ? { component: components } : {}),
    layout: layoutTokens(theme),
  }
}
