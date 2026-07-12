import { describe, expect, it } from "vitest"

import { themeToCss } from "./build-css"
import { themeToDtcg } from "./build-dtcg"
import { formatOklch, oklchToHex } from "./oklch"
import { generateScale, onSolidColor } from "./scale"
import { allResolvedThemes, getResolvedTheme, resolveTheme } from "./index"

describe("oklch", () => {
  it("converts white and black", () => {
    expect(oklchToHex({ l: 1, c: 0, h: 0 })).toBe("#ffffff")
    expect(oklchToHex({ l: 0, c: 0, h: 0 })).toBe("#000000")
  })

  it("converts pure red approximately", () => {
    // oklch(0.628 0.258 29.23) ≈ #ff0000
    const hex = oklchToHex({ l: 0.628, c: 0.258, h: 29.23 })
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    expect(r).toBeGreaterThan(250)
    expect(g).toBeLessThan(10)
    expect(b).toBeLessThan(10)
  })

  it("formats oklch strings", () => {
    expect(formatOklch({ l: 0.55, c: 0.21, h: 262 })).toBe("oklch(0.55 0.21 262)")
  })
})

describe("scale generator", () => {
  const seed = { hue: 262, chroma: 0.21, lightness: 0.55 }

  it("produces 12 steps; backgrounds through solid descend in light mode, text steps darkest", () => {
    const scale = generateScale(seed, "light")
    expect(scale).toHaveLength(12)
    // Steps 1-9 (backgrounds → borders → solid) must get progressively darker.
    for (let i = 1; i < 9; i++) {
      expect(scale[i].l).toBeLessThan(scale[i - 1].l)
    }
    // Text steps: 12 (high contrast) darker than 11, and 12 darker than any background/border.
    expect(scale[11].l).toBeLessThan(scale[10].l)
    expect(scale[11].l).toBeLessThan(scale[7].l)
  })

  it("produces 12 steps; backgrounds through solid ascend in dark mode, text steps lightest", () => {
    const scale = generateScale(seed, "dark")
    expect(scale).toHaveLength(12)
    for (let i = 1; i < 9; i++) {
      expect(scale[i].l).toBeGreaterThan(scale[i - 1].l)
    }
    expect(scale[11].l).toBeGreaterThan(scale[10].l)
    expect(scale[11].l).toBeGreaterThan(scale[7].l)
  })

  it("uses the seed for step 9", () => {
    const scale = generateScale(seed, "light")
    expect(scale[8]).toEqual({ l: 0.55, c: 0.21, h: 262 })
  })

  it("applies dark-mode seed overrides", () => {
    const mono = { ...seed, dark: { lightness: 0.92, chroma: 0.006 } }
    expect(generateScale(mono, "dark")[8].l).toBe(0.92)
    expect(generateScale(mono, "light")[8].l).toBe(0.55)
  })

  it("computes on-solid text color from lightness", () => {
    expect(onSolidColor({ hue: 262, chroma: 0.2, lightness: 0.55 }, "light").l).toBe(0.985)
    expect(onSolidColor({ hue: 75, chroma: 0.16, lightness: 0.77 }, "light").l).toBe(0.235)
  })
})

describe("theme resolution", () => {
  it("resolves all three shipped themes", () => {
    const names = allResolvedThemes().map((t) => t.name)
    expect(names).toEqual(["basic", "dreamy", "utilitarian"])
  })

  it("inherits unset groups from the parent theme", () => {
    const child = getResolvedTheme("basic")
    const synthetic = resolveTheme({
      name: "synthetic",
      description: "only overrides radius",
      extends: "basic",
      radius: { base: "2rem" },
    })
    expect(synthetic.radius.base).toBe("2rem")
    expect(synthetic.radius.sm).toBe(child.radius.sm) // inherited
    expect(synthetic.typography).toEqual(child.typography)
    expect(synthetic.colors.accent).toEqual(child.colors.accent)
  })

  it("applies semantic overrides (dreamy uses tinted interaction surfaces)", () => {
    expect(getResolvedTheme("dreamy").semantics.accent).toBe("accent-3")
    expect(getResolvedTheme("basic").semantics.accent).toBe("neutral-4")
  })

  it("throws on unknown theme extends", () => {
    expect(() =>
      resolveTheme({ name: "x", description: "x", extends: "nope" })
    ).toThrow(/unknown theme/)
  })
})

describe("css output", () => {
  const css = themeToCss(getResolvedTheme("basic"))

  it("emits scales, semantics, dark mode, and tailwind mapping", () => {
    expect(css).toContain("@custom-variant dark")
    expect(css).toContain("--neutral-1: oklch(")
    expect(css).toContain("--accent-9: oklch(0.55 0.21 262);")
    expect(css).toContain("--background: var(--neutral-1);")
    expect(css).toContain("--primary: var(--accent-9);")
    expect(css).toContain(".dark {")
    expect(css).toContain("@theme inline {")
    expect(css).toContain("--color-background: var(--background);")
    expect(css).toContain("--color-accent-9: var(--accent-9);")
    expect(css).toContain("--font-sans: Inter, ui-sans-serif, system-ui, sans-serif;")
    expect(css).toContain("@apply border-border;")
  })

  it("keeps semantic names the components depend on", () => {
    for (const name of ["primary", "destructive", "border", "input", "ring", "muted"]) {
      expect(css).toContain(`--color-${name}: var(--${name});`)
    }
  })

  it("re-declares every semantic in .dark (var() resolves where declared, not where used)", () => {
    const darkBlock = css.slice(css.indexOf(".dark {"), css.indexOf("@theme inline"))
    // Without these, --background computed on :root inherits the light value
    // into .dark subtrees and dark mode silently renders light.
    for (const name of ["background", "foreground", "primary", "border", "muted"]) {
      expect(darkBlock).toContain(`--${name}: var(`)
    }
  })

  it("resolves mode-dependent literals against the dark scales", () => {
    const util = themeToCss(getResolvedTheme("utilitarian"))
    const darkBlock = util.slice(util.indexOf(".dark {"), util.indexOf("@theme inline"))
    // utilitarian flips its accent solid from dark to light in dark mode,
    // so primary-foreground's computed literal differs from the light one.
    const lightBlock = util.slice(0, util.indexOf(".dark {"))
    const pick = (block: string) => block.match(/--primary-foreground: ([^;]+);/)?.[1]
    expect(pick(darkBlock)).toBeDefined()
    expect(pick(darkBlock)).not.toBe(pick(lightBlock))
  })

  it("is deterministic", () => {
    expect(themeToCss(getResolvedTheme("basic"))).toBe(css)
  })
})

describe("dtcg output", () => {
  const doc = themeToDtcg(getResolvedTheme("basic")) as any

  it("emits hex colors with oklch extensions", () => {
    const step = doc.color.light.neutral["1"]
    expect(step.$type).toBe("color")
    expect(step.$value).toMatch(/^#[0-9a-f]{6}$/)
    expect(step.$extensions["io.lorre.oklch"]).toMatch(/^oklch\(/)
  })

  it("emits semantic aliases as DTCG references", () => {
    expect(doc.color.semantic.background.$value).toBe("{color.light.neutral.1}")
    expect(doc.color.semantic.background.$extensions["io.lorre.dark"]).toBe(
      "{color.dark.neutral.1}"
    )
  })

  it("emits typed token groups", () => {
    expect(doc.typography["font-family"].sans.$type).toBe("fontFamily")
    expect(doc.radius.base.$type).toBe("dimension")
    expect(doc.motion.easing.smooth.$type).toBe("cubicBezier")
    expect(doc.motion.easing.smooth.$value).toHaveLength(4)
    expect(doc.motion.duration.fast.$type).toBe("duration")
  })
})
