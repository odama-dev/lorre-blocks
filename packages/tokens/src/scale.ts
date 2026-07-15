import { hexToOklch, type Oklch } from "./oklch"
import {
  isRamp,
  type ColorMode,
  type ColorRamp,
  type ColorSeed,
  type ColorSpec,
} from "./types"

/**
 * 12-step scale generator, following Radix step semantics:
 *  1–2 app backgrounds · 3–5 component backgrounds (rest/hover/active) ·
 *  6–8 borders (subtle/default/strong) · 9–10 solid (rest/hover) ·
 *  11–12 text (low/high contrast).
 *
 * Steps 9–10 come from the seed; every other step follows a fixed
 * lightness/chroma curve so all scales in a theme feel consistent.
 *
 * A scale can also be pinned step by step (`ColorRamp`), which skips the curve
 * entirely. Both forms resolve to the same 12 Oklch values here, so everything
 * downstream — CSS, DTCG, semantic refs — stays unaware of which was used.
 */

interface Step {
  l: number
  /** Multiplier applied to the seed's chroma. */
  c: number
}

const LIGHT_STEPS: Array<Step | null> = [
  { l: 0.993, c: 0.06 },
  { l: 0.981, c: 0.1 },
  { l: 0.955, c: 0.2 },
  { l: 0.928, c: 0.28 },
  { l: 0.898, c: 0.36 },
  { l: 0.862, c: 0.44 },
  { l: 0.808, c: 0.54 },
  { l: 0.733, c: 0.7 },
  null, // 9: seed
  null, // 10: seed hover
  { l: 0.51, c: 0.8 },
  { l: 0.24, c: 0.35 },
]

const DARK_STEPS: Array<Step | null> = [
  { l: 0.185, c: 0.1 },
  { l: 0.213, c: 0.14 },
  { l: 0.255, c: 0.24 },
  { l: 0.29, c: 0.32 },
  { l: 0.325, c: 0.4 },
  { l: 0.365, c: 0.46 },
  { l: 0.42, c: 0.54 },
  { l: 0.5, c: 0.66 },
  null,
  null,
  { l: 0.78, c: 0.72 },
  { l: 0.945, c: 0.3 },
]

/** Seed with dark-mode overrides applied for the requested mode. */
export function effectiveSeed(seed: ColorSeed, mode: ColorMode): ColorSeed {
  return mode === "dark" ? { ...seed, ...seed.dark } : seed
}

export function generateScale(spec: ColorSpec, mode: ColorMode): Oklch[] {
  if (isRamp(spec)) {
    const steps = mode === "dark" ? spec.dark.steps : spec.steps
    return steps.map(hexToOklch)
  }

  const s = effectiveSeed(spec, mode)
  const steps = mode === "dark" ? DARK_STEPS : LIGHT_STEPS

  return steps.map((step, i) => {
    if (step === null) {
      // Step 10 (index 9) is the hover shade of the solid step 9.
      const hoverShift = i === 9 ? (mode === "dark" ? 0.06 : -0.05) : 0
      return { l: clamp01(s.lightness + hoverShift), c: s.chroma, h: s.hue }
    }
    return { l: step.l, c: s.chroma * step.c, h: s.hue }
  })
}

/** Text color that sits on the scale's solid steps (9–10). */
export function onSolidColor(spec: ColorSpec, mode: ColorMode): Oklch {
  // A ramp has no seed to read, so step 9 — the solid itself — stands in for it.
  const { lightness, hue, onSolid } = isRamp(spec)
    ? { ...hexToSolid(spec, mode), onSolid: spec.onSolid }
    : effectiveSeed(spec, mode)

  const tone = onSolid ?? (lightness >= 0.68 ? "dark" : "light")
  return tone === "light"
    ? { l: 0.985, c: 0.005, h: hue }
    : { l: 0.235, c: 0.012, h: hue }
}

function hexToSolid(
  ramp: ColorRamp,
  mode: ColorMode
): { lightness: number; hue: number } {
  const { l, h } = hexToOklch((mode === "dark" ? ramp.dark.steps : ramp.steps)[8])
  return { lightness: l, hue: h }
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}
