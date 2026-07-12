import { describe, expect, it } from "vitest"

import { themeToCss } from "./build-css"
import { themeToDtcg } from "./build-dtcg"
import { formatOklch, hexToOklch, hexToSeed, oklchToHex } from "./oklch"
import { generateScale, onSolidColor } from "./scale"
import { themeDefinitionSchema } from "./schema"
import { computeTypeScale } from "./type-scale"
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

describe("hex conversion (7.1)", () => {
  it("round-trips in-gamut colors through hex", () => {
    const original = { l: 0.55, c: 0.15, h: 262 }
    const back = hexToOklch(oklchToHex(original))
    expect(back.l).toBeCloseTo(original.l, 2)
    expect(back.c).toBeCloseTo(original.c, 2)
    expect(Math.abs(back.h - original.h)).toBeLessThan(1.5)
  })

  it("derives a usable seed from a brand hex", () => {
    const seed = hexToSeed("#5B6CFF")
    expect(seed.hue).toBeGreaterThan(250)
    expect(seed.hue).toBeLessThan(290)
    expect(seed.chroma).toBeGreaterThan(0.1)
    expect(seed.lightness).toBeGreaterThan(0.4)
    expect(seed.lightness).toBeLessThan(0.75)
  })

  it("pins hue to 0 for achromatic colors and accepts bare hex", () => {
    expect(hexToOklch("808080").h).toBe(0)
    expect(hexToOklch("#ffffff").l).toBeCloseTo(1, 2)
  })

  it("rejects malformed hex", () => {
    expect(() => hexToOklch("#12345")).toThrow(/6-digit hex/)
    expect(() => hexToOklch("blue")).toThrow(/6-digit hex/)
  })
})

describe("type scale (7.1)", () => {
  const steps = computeTypeScale({ base: "1rem", ratio: 1.25 })
  const byName = Object.fromEntries(steps.map((s) => [s.name, s]))

  it("emits h1-h6, body, small", () => {
    expect(steps.map((s) => s.name)).toEqual([
      "h1", "h2", "h3", "h4", "h5", "h6", "body", "small",
    ])
  })

  it("headings are fluid clamps bounded by 75% and the full modular size", () => {
    expect(byName.h1.size).toMatch(/^clamp\(2\.861rem, .+vw, 3\.8147rem\)$/)
    expect(byName.h6.size).toMatch(/^clamp\(1rem, .+vw, 1\.25rem\)$/) // floored at base
  })

  it("body and small are static", () => {
    expect(byName.body.size).toBe("1rem")
    expect(byName.small.size).toBe("0.8rem")
  })

  it("fluid: false emits static heading sizes", () => {
    const fixed = computeTypeScale({ base: "1rem", ratio: 1.25, fluid: false })
    expect(fixed[0].size).toBe("3.8147rem")
  })

  it("rejects non-rem base", () => {
    expect(() => computeTypeScale({ base: "16px", ratio: 1.25 })).toThrow(/rem/)
  })
})

describe("secondary scale (7.1)", () => {
  const withSecondary = resolveTheme({
    name: "branded",
    description: "adds a secondary scale",
    extends: "basic",
    colors: { secondary: { hue: 40, chroma: 0.18, lightness: 0.6 } },
  })

  it("emits the scale, tailwind mapping, and auto-remapped semantics", () => {
    const css = themeToCss(withSecondary)
    expect(css).toContain("--secondary-9: oklch(0.6 0.18 40);")
    expect(css).toContain("--color-secondary-9: var(--secondary-9);")
    expect(css).toContain("--secondary: var(--secondary-9);")
    // secondary-foreground resolves on-secondary to a literal
    expect(css).toMatch(/--secondary-foreground: oklch\(0\.985/)
  })

  it("keeps explicit semantic mappings (dreamy maps secondary to accent surfaces)", () => {
    const dreamyBranded = resolveTheme({
      name: "dreamy-branded",
      description: "secondary scale on a theme with explicit secondary semantics",
      extends: "dreamy",
      colors: { secondary: { hue: 40, chroma: 0.18, lightness: 0.6 } },
    })
    expect(dreamyBranded.semantics.secondary).toBe("accent-2")
  })

  it("themes without the scale emit no secondary steps", () => {
    const css = themeToCss(getResolvedTheme("basic"))
    expect(css).not.toContain("--secondary-1:")
    expect(css).toContain("--secondary: var(--neutral-3);")
  })
})

describe("spacing + component tokens (7.1)", () => {
  it("basic emits --spacing and the key-set component vars", () => {
    const css = themeToCss(getResolvedTheme("basic"))
    expect(css).toContain("--spacing: 0.25rem;")
    expect(css).toContain("--spacing: var(--spacing);") // @theme mapping
    expect(css).toContain("--button-radius: var(--radius-md);")
    expect(css).toContain("--button-height: calc(var(--spacing) * 9);")
    expect(css).toContain("--panel-padding: calc(var(--spacing) * 6);")
    expect(css).toContain("--tabs-trigger-radius: var(--radius-md);")
  })

  it("scaling rescales the base unit", () => {
    const dense = resolveTheme({
      name: "dense",
      description: "denser layout",
      extends: "basic",
      spacing: { scaling: 0.9 },
    })
    expect(themeToCss(dense)).toContain("--spacing: 0.225rem;")
  })

  it("component overrides merge per key, inheriting the rest", () => {
    const pill = resolveTheme({
      name: "pill",
      description: "pill buttons only",
      extends: "basic",
      components: { button: { radius: "9999px" } },
    })
    const css = themeToCss(pill)
    expect(css).toContain("--button-radius: 9999px;")
    expect(css).toContain("--button-height: calc(var(--spacing) * 9);") // inherited
  })

  it("emits type scale tokens with paired line heights", () => {
    const css = themeToCss(getResolvedTheme("basic"))
    expect(css).toContain("--text-h1: clamp(")
    expect(css).toContain("--text-h1--line-height: 1.1;")
    expect(css).toContain("--text-body: 1rem;")
  })
})

describe("themeDefinitionSchema (7.1)", () => {
  const valid = {
    name: "acme",
    description: "Acme brand theme",
    extends: "basic",
    colors: { accent: { hue: 280, chroma: 0.2, lightness: 0.55 } },
    typography: { typeScale: { base: "1rem", ratio: 1.2 } },
    spacing: { scaling: 1.05 },
    components: { button: { radius: "9999px" } },
    icons: { set: "phosphor", style: "duotone" },
  }

  it("accepts a full custom definition", () => {
    expect(themeDefinitionSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects unknown keys, bad names, and out-of-range scaling", () => {
    expect(themeDefinitionSchema.safeParse({ ...valid, bogus: 1 }).success).toBe(false)
    expect(themeDefinitionSchema.safeParse({ ...valid, name: "Not Kebab" }).success).toBe(false)
    expect(
      themeDefinitionSchema.safeParse({ ...valid, spacing: { scaling: 3 } }).success
    ).toBe(false)
  })

  it("validates icon style against the chosen set", () => {
    expect(
      themeDefinitionSchema.safeParse({ ...valid, icons: { set: "phosphor", style: "wavy" } })
        .success
    ).toBe(false)
    expect(
      themeDefinitionSchema.safeParse({ ...valid, icons: { set: "lucide", style: "solid" } })
        .success
    ).toBe(false)
    expect(
      themeDefinitionSchema.safeParse({ ...valid, icons: { set: "lucide" } }).success
    ).toBe(true)
  })

  it("rejects unknown component token keys", () => {
    expect(
      themeDefinitionSchema.safeParse({
        ...valid,
        components: { button: { rounding: "4px" } },
      }).success
    ).toBe(false)
  })
})

describe("dtcg v2 groups (7.1)", () => {
  const doc = themeToDtcg(getResolvedTheme("basic")) as any

  it("emits type-scale, component, spacing scaling, and icon extension", () => {
    expect(doc.typography["type-scale"].h1.$value).toMatch(/^clamp\(/)
    expect(doc.component.button.radius.$value).toBe("{radius.md}")
    expect(doc.component.button.height.$value).toBe("calc(var(--spacing) * 9)")
    expect(doc.layout.spacing.scaling.$value).toBe(1)
    expect(doc.$extensions["io.lorre.icons"]).toEqual({ set: "lucide" })
  })

  it("emits secondary scale groups only when defined", () => {
    expect(doc.color.light.secondary).toBeUndefined()
    const branded = themeToDtcg(
      resolveTheme({
        name: "branded",
        description: "with secondary",
        extends: "basic",
        colors: { secondary: { hue: 40, chroma: 0.18, lightness: 0.6 } },
      })
    ) as any
    expect(branded.color.light.secondary["9"].$value).toMatch(/^#/)
    expect(branded.color.semantic.secondary.$value).toBe("{color.light.secondary.9}")
  })
})
