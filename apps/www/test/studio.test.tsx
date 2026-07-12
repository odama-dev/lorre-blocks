import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { resolveTheme, themeToCss, type ThemeDefinition } from "@lorre-blocks/tokens"
import {
  decodeDefinition,
  EMPTY_DEFINITION,
  encodeDefinition,
  previewCss,
  radiusScaleFromBase,
  seedFromHex,
  studioCss,
} from "@www/lib/studio"
import { ThemeStudio } from "@www/components/studio/theme-studio"

afterEach(cleanup)

const sample: ThemeDefinition = {
  name: "acme",
  description: "Parity fixture",
  extends: "basic",
  colors: {
    accent: { hue: 292, chroma: 0.2, lightness: 0.57 },
    secondary: { hue: 50, chroma: 0.17, lightness: 0.65 },
  },
  typography: { typeScale: { base: "1rem", ratio: 1.2 } },
  radius: radiusScaleFromBase(1),
  spacing: { scaling: 1.05 },
  components: { button: { radius: "9999px" } },
  icons: { set: "phosphor", style: "duotone" },
}

describe("studio parity (the Phase 7 acceptance bar)", () => {
  it("export CSS is exactly the engine output the CLI injects", () => {
    expect(studioCss(sample)).toBe(themeToCss(resolveTheme(sample)))
  })

  it("preview CSS carries the same :root/.dark declarations as the export", () => {
    const preview = previewCss(sample)
    const full = studioCss(sample)
    // Every custom property in the export's :root block appears in the preview.
    const rootBlock = full.slice(full.indexOf(":root {"), full.indexOf("\n}", full.indexOf(":root {")))
    for (const line of rootBlock.split("\n").filter((l) => l.trim().startsWith("--"))) {
      expect(preview).toContain(line.trim())
    }
    // The build-time @theme block must never reach the runtime preview.
    expect(preview).not.toContain("@theme")
    // Fonts are appended explicitly (inlined at build time otherwise).
    expect(preview).toContain("body { font-family: var(--font-sans); }")
  })

  it("preview reflects the definition's overrides", () => {
    const preview = previewCss(sample)
    expect(preview).toContain("--accent-9: oklch(0.57 0.2 292);")
    expect(preview).toContain("--secondary-9: oklch(0.65 0.17 50);")
    expect(preview).toContain("--button-radius: 9999px;")
    expect(preview).toContain("--spacing: 0.2625rem;")
  })
})

describe("share URLs", () => {
  it("round-trips a definition through the ?t= encoding", () => {
    expect(decodeDefinition(encodeDefinition(sample))).toEqual(sample)
  })

  it("rejects garbage and structurally broken definitions", () => {
    expect(decodeDefinition("not-base64!!")).toBeNull()
    const broken = encodeDefinition({
      ...sample,
      extends: "does-not-exist",
    } as ThemeDefinition)
    expect(decodeDefinition(broken)).toBeNull()
  })
})

describe("helpers", () => {
  it("seedFromHex returns null on bad input instead of throwing", () => {
    expect(seedFromHex("nope")).toBeNull()
    expect(seedFromHex("#7C3AED")).not.toBeNull()
  })

  it("radius presets follow the CLI's ratios", () => {
    expect(radiusScaleFromBase(1)).toEqual({
      base: "1rem",
      sm: "0.5rem",
      md: "0.75rem",
      lg: "1rem",
      xl: "1.5rem",
      "2xl": "2rem",
    })
  })
})

describe("ThemeStudio", () => {
  it("renders controls, preview and export", () => {
    const { container, getAllByText } = render(<ThemeStudio />)
    expect(container.innerHTML).toContain("Theme")
    expect(getAllByText("Export").length).toBeGreaterThan(0)
    // preview style injected into head after mount effects
    expect(document.getElementById("lorre-studio-preview")).not.toBeNull()
  })

  it("starts from the empty definition", () => {
    render(<ThemeStudio />)
    const style = document.getElementById("lorre-studio-preview")
    // basic extends nothing custom: preview still resolves and injects
    expect(style?.textContent).toContain(":root {")
    expect(EMPTY_DEFINITION.extends).toBe("basic")
  })
})
