import {
  hexToSeed,
  oklchToHex,
  resolveTheme,
  themeToCss,
  type ColorSeed,
  type RadiusScale,
  type ResolvedTheme,
  type ThemeDefinition,
} from "@lorre-blocks/tokens"

/**
 * Theme Studio helpers (Phase 7.4). All pure — the same engine the CLI
 * bundles runs here in the browser, so the Studio's export is byte-identical
 * to what `lorre-blocks theme create` injects (the phase-wide parity bar).
 */

export const EMPTY_DEFINITION: ThemeDefinition = {
  name: "custom",
  description: "Tailored with the Lorre Theme Studio.",
  extends: "basic",
}

export function resolveStudioTheme(def: ThemeDefinition): ResolvedTheme {
  return resolveTheme(def)
}

export function studioCss(def: ThemeDefinition): string {
  return themeToCss(resolveTheme(def))
}

/**
 * Runtime preview CSS: only the `:root` / `.dark` custom-property blocks from
 * the generated file (the `@theme inline` block is a build-time Tailwind
 * construct — utilities already resolve through these vars at runtime, the
 * mechanism the site's theme switcher proved). Fonts are appended explicitly:
 * `@theme inline` inlines font stacks into utilities at build time, so a
 * runtime font change needs a real `font-family` rule.
 */
export function previewCss(def: ThemeDefinition): string {
  const resolved = resolveTheme(def)
  const css = themeToCss(resolved)

  const root = sliceBlock(css, ":root {")
  const dark = sliceBlock(css, ".dark {")
  const sans = resolved.typography.fontSans.join(", ")
  const mono = resolved.typography.fontMono.join(", ")
  const display = (resolved.typography.fontDisplay ?? resolved.typography.fontSans).join(", ")

  return [
    `:root {\n${root}\n  --font-sans: ${sans};\n  --font-mono: ${mono};\n  --font-display: ${display};\n}`,
    `.dark {\n${dark}\n}`,
    `body { font-family: var(--font-sans); }`,
  ].join("\n\n")
}

/** Declarations inside the first `marker … }` block (generated CSS never nests there). */
function sliceBlock(css: string, marker: string): string {
  const start = css.indexOf(marker)
  if (start === -1) throw new Error(`marker "${marker}" not found in generated CSS`)
  const bodyStart = start + marker.length
  const end = css.indexOf("\n}", bodyStart)
  return css.slice(bodyStart, end).replace(/^\n/, "")
}

// ---- share URLs ----

export function encodeDefinition(def: ThemeDefinition): string {
  const json = JSON.stringify(def)
  const utf8 = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16))
  )
  return btoa(utf8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function decodeDefinition(encoded: string): ThemeDefinition | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/")
    const utf8 = atob(b64)
    const json = decodeURIComponent(
      utf8
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    )
    const def = JSON.parse(json) as ThemeDefinition
    // Sanity: resolving throws on structurally broken definitions.
    resolveTheme(def)
    return def
  } catch {
    return null
  }
}

// ---- control presets ----

export interface ColorPreset {
  name: string
  seed: ColorSeed
}

/** Accent swatches — the basic theme's chroma/lightness across the hue wheel. */
export const ACCENT_PRESETS: ColorPreset[] = [
  { name: "blue", seed: { hue: 262, chroma: 0.21, lightness: 0.55 } },
  { name: "indigo", seed: { hue: 277, chroma: 0.2, lightness: 0.55 } },
  { name: "violet", seed: { hue: 292, chroma: 0.2, lightness: 0.57 } },
  { name: "purple", seed: { hue: 308, chroma: 0.2, lightness: 0.57 } },
  { name: "pink", seed: { hue: 350, chroma: 0.19, lightness: 0.6 } },
  { name: "red", seed: { hue: 27, chroma: 0.21, lightness: 0.58 } },
  { name: "orange", seed: { hue: 50, chroma: 0.17, lightness: 0.65 } },
  { name: "amber", seed: { hue: 75, chroma: 0.16, lightness: 0.77 } },
  { name: "lime", seed: { hue: 125, chroma: 0.16, lightness: 0.72 } },
  { name: "green", seed: { hue: 152, chroma: 0.14, lightness: 0.58 } },
  { name: "teal", seed: { hue: 180, chroma: 0.12, lightness: 0.58 } },
  { name: "cyan", seed: { hue: 215, chroma: 0.14, lightness: 0.6 } },
]

export const NEUTRAL_PRESETS: ColorPreset[] = [
  { name: "gray", seed: { hue: 240, chroma: 0.006, lightness: 0.5 } },
  { name: "cool", seed: { hue: 255, chroma: 0.012, lightness: 0.55 } },
  { name: "slate", seed: { hue: 240, chroma: 0.02, lightness: 0.53 } },
  { name: "warm", seed: { hue: 60, chroma: 0.01, lightness: 0.53 } },
  { name: "lavender", seed: { hue: 300, chroma: 0.015, lightness: 0.55 } },
]

export function seedToHex(seed: ColorSeed): string {
  return oklchToHex({ l: seed.lightness, c: seed.chroma, h: seed.hue })
}

/** Hex input → seed; returns null instead of throwing (UI validation). */
export function seedFromHex(hex: string): ColorSeed | null {
  try {
    return hexToSeed(hex)
  } catch {
    return null
  }
}

/** Same base→scale ratios `theme create --radius` uses. */
export function radiusScaleFromBase(baseRem: number): RadiusScale {
  const r = (n: number) => `${Math.round(n * 10000) / 10000}rem`
  return {
    base: r(baseRem),
    sm: r(baseRem / 2),
    md: r(baseRem * 0.75),
    lg: r(baseRem),
    xl: r(baseRem * 1.5),
    "2xl": r(baseRem * 2),
  }
}

export const RADIUS_PRESETS = [
  { name: "none", base: 0 },
  { name: "sm", base: 0.25 },
  { name: "md", base: 0.5 },
  { name: "lg", base: 0.75 },
  { name: "xl", base: 1 },
] as const

export const SCALING_PRESETS = [0.9, 0.95, 1, 1.05, 1.1] as const

export interface FontOption {
  family: string
  /** Google Fonts family query; absent = system font, nothing to load. */
  google?: string
}

export const SANS_FONTS: FontOption[] = [
  { family: "Inter", google: "Inter:wght@400;500;600;700" },
  { family: "Geist", google: "Geist:wght@400;500;600;700" },
  { family: "DM Sans", google: "DM+Sans:wght@400;500;600;700" },
  { family: "Manrope", google: "Manrope:wght@400;500;600;700" },
  { family: "Nunito", google: "Nunito:wght@400;600;700" },
  { family: "Space Grotesk", google: "Space+Grotesk:wght@400;500;600;700" },
  { family: "system-ui" },
]

export const MONO_FONTS: FontOption[] = [
  { family: "ui-monospace" },
  { family: "JetBrains Mono", google: "JetBrains+Mono:wght@400;500;600" },
  { family: "IBM Plex Mono", google: "IBM+Plex+Mono:wght@400;500;600" },
  { family: "Fira Code", google: "Fira+Code:wght@400;500;600" },
]

const SANS_FALLBACK = ["ui-sans-serif", "system-ui", "sans-serif"]
const MONO_FALLBACK = ["ui-monospace", "SFMono-Regular", "monospace"]

export function sansStack(family: string): string[] {
  return family === "system-ui" ? SANS_FALLBACK : [family, ...SANS_FALLBACK]
}

export function monoStack(family: string): string[] {
  return family === "ui-monospace" ? MONO_FALLBACK : [family, ...MONO_FALLBACK]
}

/** Google Fonts stylesheet URL for every loadable family in the curated lists. */
export function googleFontsHref(families: FontOption[]): string | null {
  const queries = families.filter((f) => f.google).map((f) => `family=${f.google}`)
  if (queries.length === 0) return null
  return `https://fonts.googleapis.com/css2?${queries.join("&")}&display=swap`
}

export const CLI_SNIPPET = `npx lorre-blocks theme create --from lorre.theme.json`
