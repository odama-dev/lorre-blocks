import { describe, expect, it } from "vitest"

import {
  applyFlags,
  definitionToCss,
  iconPackageFor,
  parseColorInput,
  radiusFromInput,
  validateDefinition,
} from "./theme-def"

describe("parseColorInput", () => {
  it("accepts hex and returns an OKLCH seed", () => {
    const seed = parseColorInput("#7C3AED")
    expect(seed.hue).toBeGreaterThan(280)
    expect(seed.hue).toBeLessThan(305)
    expect(seed.chroma).toBeGreaterThan(0.15)
  })

  it("accepts an OKLCH triple", () => {
    expect(parseColorInput("262:0.21:0.55")).toEqual({
      hue: 262,
      chroma: 0.21,
      lightness: 0.55,
    })
  })

  it("rejects garbage with the hex error", () => {
    expect(() => parseColorInput("purple")).toThrow(/6-digit hex/)
  })
})

describe("radiusFromInput", () => {
  it("expands presets with the shipped-theme ratios", () => {
    expect(radiusFromInput("xl")).toEqual({
      base: "1rem",
      sm: "0.5rem",
      md: "0.75rem",
      lg: "1rem",
      xl: "1.5rem",
      "2xl": "2rem",
    })
    expect(radiusFromInput("none").base).toBe("0rem")
  })

  it("expands a custom rem base", () => {
    expect(radiusFromInput("0.5rem")).toMatchObject({
      base: "0.5rem",
      md: "0.375rem",
      "2xl": "1rem",
    })
  })

  it("rejects unknown presets", () => {
    expect(() => radiusFromInput("huge")).toThrow(/--radius must be/)
  })
})

describe("applyFlags", () => {
  it("fills defaults for an empty base", () => {
    const def = applyFlags({}, {})
    expect(def.name).toBe("custom")
    expect(def.extends).toBe("basic")
    expect(def.description).toContain("custom")
  })

  it("flags win over --from values", () => {
    const def = applyFlags(
      { name: "from-file", colors: { accent: { hue: 1, chroma: 0.1, lightness: 0.5 } } },
      { name: "flagged", accent: "200:0.1:0.6" }
    )
    expect(def.name).toBe("flagged")
    expect((def.colors as any).accent.hue).toBe(200)
  })

  it("converts percentage scaling and keeps factors", () => {
    expect((applyFlags({}, { scaling: 105 }).spacing as any).scaling).toBe(1.05)
    expect((applyFlags({}, { scaling: 0.9 }).spacing as any).scaling).toBe(0.9)
  })

  it("parses icons set:style", () => {
    expect(applyFlags({}, { icons: "phosphor:duotone" }).icons).toEqual({
      set: "phosphor",
      style: "duotone",
    })
    expect(applyFlags({}, { icons: "lucide" }).icons).toEqual({ set: "lucide" })
  })

  it("builds a font stack with fallbacks", () => {
    const def = applyFlags({}, { fontSans: "Geist" })
    expect((def.typography as any).fontSans[0]).toBe("Geist")
    expect((def.typography as any).fontSans).toContain("sans-serif")
  })
})

describe("validateDefinition", () => {
  it("flattens zod problems into agent-iterable strings", () => {
    const { def, problems } = validateDefinition({
      name: "Bad Name",
      description: "x",
      spacing: { scaling: 9 },
    })
    expect(def).toBeNull()
    expect(problems.some((p) => p.startsWith("name:"))).toBe(true)
    expect(problems.some((p) => p.startsWith("spacing.scaling:"))).toBe(true)
  })

  it("rejects unknown extends against the bundled base themes", () => {
    const { def, problems } = validateDefinition({
      name: "x",
      description: "extends something unknown",
      extends: "nope",
    })
    expect(def).toBeNull()
    expect(problems[0]).toMatch(/unknown base theme "nope"/)
  })

  it("valid definition round-trips into CSS offline", () => {
    const { def } = validateDefinition({
      name: "acme",
      description: "test theme",
      extends: "basic",
      colors: { accent: { hue: 150, chroma: 0.15, lightness: 0.55 } },
    })
    expect(def).not.toBeNull()
    const css = definitionToCss(def!)
    expect(css).toContain("--accent-9: oklch(0.55 0.15 150);")
    expect(css).toContain("@theme inline {")
  })
})

describe("iconPackageFor", () => {
  it("maps the icon choice to its npm package", () => {
    const { def } = validateDefinition({
      name: "x",
      description: "icons test",
      extends: "basic",
      icons: { set: "phosphor", style: "duotone" },
    })
    expect(iconPackageFor(def!)).toBe("@phosphor-icons/react")
  })

  it("returns null without an icon choice", () => {
    const { def } = validateDefinition({
      name: "x",
      description: "no icons",
      extends: "basic",
    })
    expect(iconPackageFor(def!)).toBeNull()
  })
})
