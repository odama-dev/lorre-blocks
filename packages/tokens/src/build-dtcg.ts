import { formatOklch, oklchToHex } from "./oklch"
import { generateScale, onSolidColor } from "./scale"
import {
  SCALE_NAMES,
  type ColorMode,
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
  for (const scale of SCALE_NAMES) {
    const steps = generateScale(theme.colors[scale], mode)
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
  for (const name of Object.keys(theme.semantics) as SemanticColorName[]) {
    const ref = theme.semantics[name]
    const scaleRef = ref.match(/^([a-z]+)-(\d{1,2})$/)
    const onRef = ref.match(/^on-([a-z]+)$/)

    if (scaleRef && (SCALE_NAMES as string[]).includes(scaleRef[1])) {
      group[name] = {
        $type: "color",
        $value: `{color.light.${scaleRef[1]}.${scaleRef[2]}}`,
        $extensions: {
          "io.lorre.dark": `{color.dark.${scaleRef[1]}.${scaleRef[2]}}`,
        },
      }
    } else if (onRef && (SCALE_NAMES as string[]).includes(onRef[1])) {
      const seed = theme.colors[onRef[1] as (typeof SCALE_NAMES)[number]]
      group[name] = {
        $type: "color",
        $value: oklchToHex(onSolidColor(seed, "light")),
        $extensions: {
          "io.lorre.oklch": formatOklch(onSolidColor(seed, "light")),
          "io.lorre.dark-value": oklchToHex(onSolidColor(seed, "dark")),
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

/** Layout tokens are shared across themes (Tailwind defaults, made explicit). */
const LAYOUT_TOKENS: Dtcg = {
  spacing: {
    base: {
      $type: "dimension",
      $value: "0.25rem",
      $description: "Base spacing unit; Tailwind spacing utilities are multiples of it.",
    },
  },
  breakpoint: dimensionGroup({
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  }),
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

  return {
    $description: `Lorre Blocks theme "${theme.name}" — ${theme.description}`,
    color: {
      light: scaleGroup(theme, "light"),
      dark: scaleGroup(theme, "dark"),
      semantic: semanticGroup(theme),
    },
    typography: {
      "font-family": fontFamilies,
      "font-size": FONT_SIZE_TOKENS,
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
    layout: LAYOUT_TOKENS,
  }
}
