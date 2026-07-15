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

describe("explicit ramps (R1)", () => {
  /**
   * A fixture shaped like a hand-tuned palette — chroma peaking mid-scale
   * rather than falling away from the solid, which is the shape a seed cannot
   * reach. Ten of the twelve steps are AlignUI blue; steps 1 and 12 are
   * invented, because AlignUI ships 11 shades and a Lorre ramp takes 12, and
   * how those two vocabularies line up is still an open question (see the
   * odama theme work) — not something to quietly settle inside a fixture.
   */
  const BLUE_LIGHT = [
    "#F5F8FF", "#EBF1FF", "#D5E2FF", "#C0D5FF", "#97BAFF", "#6895FF",
    "#335CFF", "#3559E9", "#2547D0", "#1F3BAD", "#182F8B", "#122368",
  ] as const
  const BLUE_DARK = [
    "#0E1B4E", "#122368", "#182F8B", "#1F3BAD", "#2547D0", "#3559E9",
    "#335CFF", "#6895FF", "#97BAFF", "#C0D5FF", "#D5E2FF", "#EBF1FF",
  ] as const
  const ramp = { steps: BLUE_LIGHT, dark: { steps: BLUE_DARK } }

  it("emits the pinned steps verbatim, not a generated curve", () => {
    const light = generateScale(ramp, "light")
    expect(light).toHaveLength(12)
    expect(light.map(oklchToHex)).toEqual(BLUE_LIGHT.map((h) => h.toLowerCase()))
  })

  it("reads dark from its own ramp — dark is not derived from light", () => {
    const dark = generateScale(ramp, "dark")
    expect(dark.map(oklchToHex)).toEqual(BLUE_DARK.map((h) => h.toLowerCase()))
    expect(dark.map(oklchToHex)).not.toEqual(
      generateScale(ramp, "light").map(oklchToHex)
    )
  })

  it("keeps the chroma peak a seed cannot reach", () => {
    // The generator multiplies one chroma by a fixed per-step factor, so chroma
    // can only fall away from the solid. This ramp peaks mid-scale and drops on
    // both sides — the shape that makes the pinned form necessary.
    const c = generateScale(ramp, "light").map((s) => s.c)
    const peak = c.indexOf(Math.max(...c))
    expect(peak).toBeGreaterThan(0)
    expect(peak).toBeLessThan(11)
    expect(c[peak]).toBeGreaterThan(c[peak - 1])
    expect(c[peak]).toBeGreaterThan(c[peak + 1])
  })

  it("derives on-solid from step 9 when not declared", () => {
    // Step 9 light is #2547D0 — dark, so text on it must be light.
    expect(onSolidColor(ramp, "light").l).toBeGreaterThan(0.9)
    // Step 9 dark is #97BAFF — light, so the text color flips.
    expect(onSolidColor(ramp, "dark").l).toBeLessThan(0.3)
  })

  it("honours an explicit onSolid over the derived one", () => {
    const forced = { ...ramp, onSolid: "dark" as const }
    expect(onSolidColor(forced, "light").l).toBeLessThan(0.3)
  })

  it("schema rejects a ramp that does not pin all 12 steps", () => {
    const short = themeDefinitionSchema.safeParse({
      name: "x", description: "d",
      colors: { accent: { steps: BLUE_LIGHT.slice(0, 11), dark: { steps: BLUE_DARK } } },
    })
    expect(short.success).toBe(false)
  })

  it("schema rejects a ramp with no dark mode", () => {
    const noDark = themeDefinitionSchema.safeParse({
      name: "x", description: "d",
      colors: { accent: { steps: BLUE_LIGHT } },
    })
    expect(noDark.success).toBe(false)
  })

  it("schema accepts a well-formed ramp, and still accepts a seed", () => {
    expect(
      themeDefinitionSchema.safeParse({
        name: "x", description: "d",
        colors: {
          accent: { steps: BLUE_LIGHT, dark: { steps: BLUE_DARK } },
          danger: { hue: 27, chroma: 0.22, lightness: 0.58 },
        },
      }).success
    ).toBe(true)
  })

  it("a ramped theme resolves and reaches the CSS in both modes", () => {
    const theme = resolveTheme({
      name: "ramped", description: "d", extends: "basic",
      colors: { accent: { steps: BLUE_LIGHT, dark: { steps: BLUE_DARK } } },
    })
    const css = themeToCss(theme)
    // Step 9 is pinned, so :root and .dark each carry their own --accent-9.
    expect(css).toContain(`--accent-9: ${formatOklch(hexToOklch("#2547D0"))};`)
    expect(css).toContain(`--accent-9: ${formatOklch(hexToOklch("#97BAFF"))};`)
  })

  it("leaves seeded scales in the same theme untouched", () => {
    const ramped = resolveTheme({
      name: "ramped", description: "d", extends: "basic",
      colors: { accent: { steps: BLUE_LIGHT, dark: { steps: BLUE_DARK } } },
    })
    const basic = getResolvedTheme("basic")!
    // danger is still a seed here; pinning accent must not disturb it.
    expect(generateScale(ramped.colors.danger, "light")).toEqual(
      generateScale(basic.colors.danger, "light")
    )
  })
})

describe("mode-aware semantics (R2)", () => {
  it("a single literal is frozen across modes — the hole R2 exists to close", () => {
    const theme = resolveTheme({
      name: "lit", description: "d", extends: "basic",
      semantics: { background: "#ffffff" },
    })
    const css = themeToCss(theme)
    const root = css.slice(css.indexOf(":root {"), css.indexOf(".dark {"))
    const dark = css.slice(css.indexOf(".dark {"), css.indexOf("@theme inline"))
    expect(root).toContain("--background: #ffffff;")
    expect(dark).toContain("--background: #ffffff;")
  })

  it("a split literal resolves per mode", () => {
    const theme = resolveTheme({
      name: "split", description: "d", extends: "basic",
      semantics: { background: { light: "#ffffff", dark: "#171717" } },
    })
    const css = themeToCss(theme)
    const root = css.slice(css.indexOf(":root {"), css.indexOf(".dark {"))
    const dark = css.slice(css.indexOf(".dark {"), css.indexOf("@theme inline"))
    expect(root).toContain("--background: #ffffff;")
    expect(root).not.toContain("--background: #171717;")
    expect(dark).toContain("--background: #171717;")
  })

  it("carries a dark mode that no inversion rule predicts", () => {
    // AlignUI's bg-weak-50 goes 50 → 800, not the 950 an inversion implies.
    const theme = resolveTheme({
      name: "compressed", description: "d", extends: "basic",
      semantics: { muted: { light: "neutral-2", dark: "neutral-9" } },
    })
    const css = themeToCss(theme)
    const dark = css.slice(css.indexOf(".dark {"), css.indexOf("@theme inline"))
    expect(dark).toContain("--muted: var(--neutral-9);")
  })

  it("splits scale refs per mode too, not just literals", () => {
    const theme = resolveTheme({
      name: "split-scale", description: "d", extends: "basic",
      semantics: { border: { light: "neutral-6", dark: "neutral-8" } },
    })
    const css = themeToCss(theme)
    const root = css.slice(css.indexOf(":root {"), css.indexOf(".dark {"))
    const dark = css.slice(css.indexOf(".dark {"), css.indexOf("@theme inline"))
    expect(root).toContain("--border: var(--neutral-6);")
    expect(dark).toContain("--border: var(--neutral-8);")
  })

  it("DTCG keeps the two modes distinct", () => {
    const theme = resolveTheme({
      name: "dtcg-split", description: "d", extends: "basic",
      semantics: {
        border: { light: "neutral-6", dark: "neutral-8" },
        background: { light: "#ffffff", dark: "#171717" },
      },
    })
    const doc = themeToDtcg(theme) as any
    expect(doc.color.semantic.border.$value).toBe("{color.light.neutral.6}")
    expect(doc.color.semantic.border.$extensions["io.lorre.dark"]).toBe(
      "{color.dark.neutral.8}"
    )
    expect(doc.color.semantic.background.$value).toBe("#ffffff")
    expect(doc.color.semantic.background.$extensions["io.lorre.dark-value"]).toBe(
      "#171717"
    )
  })

  it("schema takes both forms and rejects a half-split", () => {
    const base = { name: "x", description: "d" }
    expect(
      themeDefinitionSchema.safeParse({
        ...base, semantics: { background: "neutral-1" },
      }).success
    ).toBe(true)
    expect(
      themeDefinitionSchema.safeParse({
        ...base, semantics: { background: { light: "neutral-1", dark: "neutral-12" } },
      }).success
    ).toBe(true)
    expect(
      themeDefinitionSchema.safeParse({
        ...base, semantics: { background: { light: "neutral-1" } },
      }).success
    ).toBe(false)
  })
})

describe("explicit type scale (R4)", () => {
  // AlignUI's three 14/20 styles, verbatim. Same size, same line-height —
  // they are only told apart by weight and letter-spacing.
  const steps = {
    "label-sm": { size: "0.875rem", lineHeight: 1.4286, weight: 500, letterSpacing: "-0.6%" },
    "paragraph-sm": { size: "0.875rem", lineHeight: 1.4286, weight: 400, letterSpacing: "-0.6%" },
    "subheading-sm": { size: "0.875rem", lineHeight: 1.4286, weight: 500, letterSpacing: "6%" },
    "title-h1": { size: "3.5rem", lineHeight: 1.1429, weight: 500, letterSpacing: "-1%", family: "display" as const },
  }

  it("passes measured steps through instead of deriving them", () => {
    const out = computeTypeScale({ steps })
    expect(out.map((s) => s.name)).toEqual([
      "label-sm", "paragraph-sm", "subheading-sm", "title-h1",
    ])
    expect(out[0].size).toBe("0.875rem")
    expect(out[3].family).toBe("display")
  })

  it("tells apart styles a modular scale would collapse", () => {
    const out = computeTypeScale({ steps })
    const [label, paragraph, subheading] = out
    // Identical size — so size alone cannot identify the style.
    expect(label.size).toBe(paragraph.size)
    expect(label.size).toBe(subheading.size)
    // Weight separates label from paragraph...
    expect(label.weight).not.toBe(paragraph.weight)
    // ...and letter-spacing separates label from subheading, at equal weight.
    expect(label.weight).toBe(subheading.weight)
    expect(label.letterSpacing).not.toBe(subheading.letterSpacing)
  })

  it("emits the Tailwind modifiers for each measured property", () => {
    const theme = resolveTheme({
      name: "typed", description: "d", extends: "basic",
      typography: { typeScale: { steps } },
    })
    const css = themeToCss(theme)
    expect(css).toContain("--text-subheading-sm: 0.875rem;")
    expect(css).toContain("--text-subheading-sm--letter-spacing: 6%;")
    expect(css).toContain("--text-subheading-sm--font-weight: 500;")
    expect(css).toContain("--text-title-h1--font-family: var(--font-display);")
  })

  it("a modular scale still emits no letter-spacing or weight", () => {
    const css = themeToCss(getResolvedTheme("basic"))
    expect(css).toContain("--text-h1--line-height:")
    expect(css).not.toContain("--text-h1--letter-spacing:")
    expect(css).not.toContain("--text-h1--font-weight:")
  })

  it("DTCG carries the measured properties", () => {
    const theme = resolveTheme({
      name: "typed-dtcg", description: "d", extends: "basic",
      typography: { typeScale: { steps } },
    })
    const doc = themeToDtcg(theme) as any
    const sub = doc.typography["type-scale"]["subheading-sm"]
    expect(sub.$value).toBe("0.875rem")
    expect(sub.$extensions["io.lorre.letter-spacing"]).toBe("6%")
    expect(sub.$extensions["io.lorre.font-weight"]).toBe(500)
  })

  it("schema takes both forms and rejects a step with no size", () => {
    const base = { name: "x", description: "d" }
    expect(
      themeDefinitionSchema.safeParse({
        ...base, typography: { typeScale: { base: "1rem", ratio: 1.25 } },
      }).success
    ).toBe(true)
    expect(
      themeDefinitionSchema.safeParse({
        ...base, typography: { typeScale: { steps } },
      }).success
    ).toBe(true)
    expect(
      themeDefinitionSchema.safeParse({
        ...base,
        typography: { typeScale: { steps: { bad: { lineHeight: 1.5 } } } },
      }).success
    ).toBe(false)
  })
})
