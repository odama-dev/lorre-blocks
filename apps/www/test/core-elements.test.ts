import { describe, expect, it } from "vitest"

import { getResolvedTheme, oklchToHex, resolveSemanticColor } from "@lorre-blocks/tokens"
import {
  HOUSE_THEME,
  colorSpecimens,
  radiusSpecimens,
  semanticSpecimens,
  typeSpecimens,
} from "@www/lib/core-elements"

/**
 * The Core Elements pages exist to state what the theme is. The failure mode
 * worth guarding is not a crash — it is a page that renders happily while
 * showing values the stylesheet no longer uses. So these assert the specimens
 * agree with the theme, not merely that they are non-empty.
 */

describe("the house theme is the one init ships", () => {
  it("names a theme that exists", () => {
    expect(() => getResolvedTheme(HOUSE_THEME)).not.toThrow()
  })

  // packages/cli's DEFAULT_THEME must stay in step with what the docs specimen;
  // documenting odama while init hands out something else is worse than silence.
  it("matches the CLI default", async () => {
    const { DEFAULT_THEME } = await import("../../../packages/cli/src/utils/config")
    expect(HOUSE_THEME).toBe(DEFAULT_THEME)
  })
})

describe("color specimens", () => {
  const scales = colorSpecimens()

  it("covers every scale the theme carries, 12 steps per mode", () => {
    expect(scales.map((s) => s.name)).toEqual([
      "neutral",
      "accent",
      "danger",
      "success",
      "warning",
    ])
    for (const scale of scales) {
      expect(scale.light).toHaveLength(12)
      expect(scale.dark).toHaveLength(12)
    }
  })

  it("renders real hex, and light is not silently reused for dark", () => {
    for (const scale of scales) {
      for (const swatch of [...scale.light, ...scale.dark]) {
        expect(swatch.hex).toMatch(/^#[0-9a-f]{6}$/)
      }
      expect(scale.light.map((s) => s.hex)).not.toEqual(
        scale.dark.map((s) => s.hex)
      )
    }
  })
})

describe("semantic specimens", () => {
  const semantics = semanticSpecimens()

  it("lists all 23 semantic names", () => {
    expect(semantics).toHaveLength(23)
  })

  it("agrees with the theme rather than restating it", () => {
    const theme = getResolvedTheme(HOUSE_THEME)
    for (const entry of semantics) {
      expect(entry.light).toBe(
        oklchToHex(resolveSemanticColor(theme, entry.name, "light"))
      )
      expect(entry.dark).toBe(
        oklchToHex(resolveSemanticColor(theme, entry.name, "dark"))
      )
    }
  })

  it("carries AlignUI's values on the tokens the theme pins", () => {
    const byName = new Map(semantics.map((s) => [s.name, s]))
    // Spot-checks, not a second copy of the theme: if these drift, the page is
    // no longer showing AlignUI and the whole exercise has quietly failed.
    expect(byName.get("background")).toMatchObject({
      light: "#ffffff",
      dark: "#171717",
    })
    expect(byName.get("primary")?.light).toBe("#335cff")
  })
})

describe("type specimens", () => {
  const steps = typeSpecimens()

  it("reads all 22 measured AlignUI styles", () => {
    expect(steps).toHaveLength(22)
    expect(steps.every((s) => s.measured)).toBe(true)
  })

  it("keeps the properties a ratio cannot express", () => {
    const byName = new Map(steps.map((s) => [s.name, s]))
    // The three 14/20 styles that prove size alone stops identifying a style.
    expect(byName.get("label-sm")).toMatchObject({ weight: 500, letterSpacing: "-0.6%" })
    expect(byName.get("paragraph-sm")).toMatchObject({ weight: 400 })
    expect(byName.get("subheading-sm")).toMatchObject({ weight: 500, letterSpacing: "6%" })
    expect(byName.get("title-h1")?.family).toBe("display")
  })

  // This site's stylesheet comes from `basic`, which declares no display face,
  // so `var(--font-display)` resolves to nothing here. A specimen leaning on it
  // would render titles in the body font while labelling them "display". The
  // stack has to come from the theme.
  it("resolves each step's stack from the theme, not from a CSS var", () => {
    const byName = new Map(steps.map((s) => [s.name, s]))
    expect(byName.get("title-h1")?.fontFamily).toMatch(/^Inter Display,/)
    expect(byName.get("paragraph-md")?.fontFamily).toMatch(/^Inter,/)
    for (const step of steps) {
      expect(step.fontFamily).not.toContain("var(")
    }
  })
})

describe("radius specimens", () => {
  it("reads every radius the theme defines", () => {
    expect(radiusSpecimens().map((r) => r.name)).toEqual([
      "base",
      "sm",
      "md",
      "lg",
      "xl",
      "2xl",
    ])
  })
})
