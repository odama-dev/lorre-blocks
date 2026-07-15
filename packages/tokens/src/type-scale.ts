import { isExplicitTypeScale, type FontRole, type TypeScale } from "./types"

/**
 * Modular type-scale generator. Sizes are pure powers of the ratio
 * (h6 = base·r¹ … h1 = base·r⁶, body = base, small = base/r); fluid steps
 * interpolate between 75% of the target size (floored at the body size) on a
 * 24rem viewport and the full size on an 80rem viewport, emitted as a single
 * `clamp()` so headings are responsive without media queries.
 *
 * An explicit scale skips all of that and passes its steps through. Both forms
 * land on the same `TypeStep[]`, so the emitters stay unaware of which was used.
 */

export interface TypeStep {
  /** Token suffix: --text-<name> */
  name: string
  /** CSS font-size value (rem literal, or clamp() when fluid). */
  size: string
  lineHeight: number | string
  /** Only set by explicit scales; a ratio has nothing to say about these. */
  letterSpacing?: string
  weight?: number
  family?: FontRole
}

const VIEWPORT_MIN_REM = 24
const VIEWPORT_MAX_REM = 80
/** Small-viewport headings render at this fraction of their full size. */
const FLUID_MIN_FACTOR = 0.75

const HEADING_LINE_HEIGHTS: Record<string, number> = {
  h1: 1.1,
  h2: 1.1,
  h3: 1.2,
  h4: 1.2,
  h5: 1.3,
  h6: 1.3,
}

export function computeTypeScale(scale: TypeScale): TypeStep[] {
  if (isExplicitTypeScale(scale)) {
    return Object.entries(scale.steps).map(([name, spec]) => ({
      name,
      ...spec,
    }))
  }

  const base = parseRem(scale.base)
  const fluid = scale.fluid !== false
  const steps: TypeStep[] = []

  for (let level = 1; level <= 6; level++) {
    const name = `h${level}`
    const max = round(base * scale.ratio ** (7 - level))
    const min = Math.max(base, round(max * FLUID_MIN_FACTOR))
    steps.push({
      name,
      size: fluid && min < max ? fluidClamp(min, max) : `${max}rem`,
      lineHeight: HEADING_LINE_HEIGHTS[name],
    })
  }

  steps.push({ name: "body", size: `${round(base)}rem`, lineHeight: 1.5 })
  steps.push({
    name: "small",
    size: `${round(base / scale.ratio)}rem`,
    lineHeight: 1.5,
  })

  return steps
}

function fluidClamp(minRem: number, maxRem: number): string {
  const slopeVw = round(
    ((maxRem - minRem) / (VIEWPORT_MAX_REM - VIEWPORT_MIN_REM)) * 100
  )
  const interceptRem = round(minRem - (slopeVw * VIEWPORT_MIN_REM) / 100)
  return `clamp(${minRem}rem, ${interceptRem}rem + ${slopeVw}vw, ${maxRem}rem)`
}

function parseRem(value: string): number {
  const match = value.trim().match(/^(\d*\.?\d+)rem$/)
  if (!match) {
    throw new Error(
      `typeScale.base must be a rem value like "1rem", got "${value}"`
    )
  }
  return Number(match[1])
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000
}
