/**
 * Minimal OKLCH → sRGB hex conversion (for DTCG output; CSS uses oklch() natively).
 * Matrices from Björn Ottosson's OKLab reference implementation (public domain).
 * Out-of-gamut colors are channel-clamped.
 */

export interface Oklch {
  l: number
  c: number
  h: number
}

export function formatOklch({ l, c, h }: Oklch): string {
  return `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 2)})`
}

export function oklchToHex({ l, c, h }: Oklch): string {
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b

  const ll = l_ ** 3
  const mm = m_ ** 3
  const ss = s_ ** 3

  const r = +4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss
  const g = -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss
  const bl = -0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss

  return `#${channel(r)}${channel(g)}${channel(bl)}`
}

/**
 * sRGB hex → OKLCH (inverse of oklchToHex; same Ottosson matrices). Lets
 * users seed scales from brand hexes anywhere a ColorSeed is accepted.
 */
export function hexToOklch(hex: string): Oklch {
  const match = hex.trim().match(/^#?([0-9a-fA-F]{6})$/)
  if (!match) {
    throw new Error(`Expected a 6-digit hex color like "#5B6CFF", got "${hex}"`)
  }
  const [r, g, b] = [0, 2, 4].map((i) =>
    linearChannel(parseInt(match[1].slice(i, i + 2), 16) / 255)
  )

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  const c = Math.sqrt(a * a + bb * bb)
  let h = (Math.atan2(bb, a) * 180) / Math.PI
  if (h < 0) h += 360
  // Achromatic colors have no meaningful hue; pin it for determinism.
  if (c < 1e-6) h = 0

  return { l: round(L, 4), c: round(c, 4), h: round(h, 2) }
}

/** Brand hex → scale seed: solid steps take the hex's lightness/chroma/hue. */
export function hexToSeed(hex: string): {
  hue: number
  chroma: number
  lightness: number
} {
  const { l, c, h } = hexToOklch(hex)
  return { hue: h, chroma: c, lightness: l }
}

function linearChannel(srgb: number): number {
  return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
}

function channel(linear: number): string {
  const srgb =
    linear <= 0.0031308
      ? 12.92 * linear
      : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055
  const clamped = Math.min(1, Math.max(0, srgb))
  return Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0")
}

function round(n: number, places: number): number {
  const f = 10 ** places
  return Math.round(n * f) / f
}
