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
