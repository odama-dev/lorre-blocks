import * as React from "react"
import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { ICON_SETS } from "@lorre-blocks/tokens"
import { kebab, loadIconSet, pascal, searchIcons } from "@www/lib/icon-sets"

afterEach(cleanup)

describe("icon catalog", () => {
  it("carries the permissive sets plus the house one — Untitled UI must never appear", () => {
    expect(ICON_SETS.map((s) => s.name)).toEqual([
      "lucide",
      "radix",
      "phosphor",
      "heroicons",
      "lorre",
    ])
    expect(ICON_SETS.every((s) => ["MIT", "ISC"].includes(s.license))).toBe(true)
  })
})

describe("name conversion", () => {
  it("round-trips pascal ↔ kebab", () => {
    expect(kebab("ArrowRight")).toBe("arrow-right")
    expect(kebab("AlertCircle")).toBe("alert-circle")
    expect(pascal("arrow-right")).toBe("ArrowRight")
    expect(pascal(kebab("FileJson2"))).toBe("FileJson2")
  })
})

describe("searchIcons", () => {
  const names = ["arrow-right", "arrow-left", "chart-bar", "car"]
  it("ranks startsWith before contains", () => {
    expect(searchIcons(names, "ar")).toEqual([
      "arrow-right",
      "arrow-left",
      "chart-bar",
      "car",
    ])
    expect(searchIcons(names, "car")).toEqual(["car"])
    expect(searchIcons(names, "bar")).toEqual(["chart-bar"])
  })
  it("empty query returns everything", () => {
    expect(searchIcons(names, " ")).toEqual(names)
  })
})

describe("set adapters", () => {
  it("lucide loads and renders arrow-right with snippets", async () => {
    const set = await loadIconSet("lucide", undefined)
    expect(Object.keys(set.icons).length).toBeGreaterThan(1000)
    expect(set.icons["arrow-right"]).toBeDefined()
    expect(set.importLine("arrow-right")).toBe(
      'import { ArrowRight } from "lucide-react"'
    )
    // Snippets carry only what the customizer set; bare means lucide's own defaults.
    expect(set.jsxSnippet("arrow-right")).toBe("<ArrowRight />")
    expect(
      set.jsxSnippet("arrow-right", {
        size: 16,
        strokeWidth: 1.5,
        color: "#ff0000",
      })
    ).toBe('<ArrowRight size={16} strokeWidth={1.5} color="#ff0000" />')
    // "currentColor" is the inherit-the-theme default, so it never gets baked in.
    expect(set.jsxSnippet("arrow-right", { size: 16, color: "currentColor" })).toBe(
      "<ArrowRight size={16} />"
    )
  })

  it("radix strips the Icon suffix for display names", async () => {
    const set = await loadIconSet("radix", undefined)
    expect(Object.keys(set.icons).length).toBeGreaterThan(250)
    expect(set.icons["arrow-right"]).toBeDefined()
    expect(set.importLine("arrow-right")).toBe(
      'import { ArrowRightIcon } from "@radix-ui/react-icons"'
    )
  })

  // The phosphor namespace is ~3k exports; first import takes >20s in vitest.
  it("phosphor dedupes Icon aliases and bakes the weight in", { timeout: 60_000 }, async () => {
    const set = await loadIconSet("phosphor", "duotone")
    const names = Object.keys(set.icons)
    expect(names.length).toBeGreaterThan(1000)
    expect(names.some((n) => n.endsWith("-icon"))).toBe(false)
    // Phosphor always emits a size — 24 is its own default when the customizer is bare.
    expect(set.jsxSnippet("acorn")).toBe('<Acorn size={24} weight="duotone" />')
    expect(set.jsxSnippet("acorn", { size: 16 })).toBe(
      '<Acorn size={16} weight="duotone" />'
    )
  })

  it("lorre loads a style entry point and keeps the _2 duplicates addressable", async () => {
    const set = await loadIconSet("lorre", "stroke-1.5")
    expect(Object.keys(set.icons)).toHaveLength(585)
    expect(set.icons["arrow-top"]).toBeDefined()
    expect(set.importLine("arrow-top")).toBe(
      'import { ArrowTop } from "lorre-icons/stroke-1.5"'
    )
    // pascal("arrow-top_2") would be "ArrowTop_2"'s wrong sibling, so the
    // adapter has to remember the real export name rather than derive it.
    expect(set.icons["arrow-top_2"]).toBeDefined()
    expect(set.importLine("arrow-top_2")).toBe(
      'import { ArrowTop_2 } from "lorre-icons/stroke-1.5"'
    )
    expect(set.jsxSnippet("arrow-top", { size: 16 })).toBe(
      "<ArrowTop style={{ width: 16, height: 16 }} />"
    )
  })

  it("lorre icons render as themeable SVG", async () => {
    const set = await loadIconSet("lorre", "stroke-1.5")
    const { container } = render(React.createElement(set.icons["arrow-top"]))
    const svg = container.querySelector("svg")!
    expect(svg).toBeTruthy()
    expect(svg.getAttribute("viewBox")).toBe("0 0 24 24")
    // No baked size or color: the icon inherits both, like text does.
    expect(svg.getAttribute("width")).toBeNull()
    expect(svg.querySelector("[stroke]")?.getAttribute("stroke")).toBe("currentColor")
  })

  it("lorre defaults to stroke-1.5 and serves every style", async () => {
    const fallback = await loadIconSet("lorre", undefined)
    expect(fallback.importLine("arrow-top")).toContain("stroke-1.5")
    for (const style of ["stroke-1", "stroke-2", "filled-1", "filled-1.5", "filled-2"]) {
      const set = await loadIconSet("lorre", style)
      expect(Object.keys(set.icons)).toHaveLength(585)
      expect(set.importLine("arrow-top")).toBe(
        `import { ArrowTop } from "lorre-icons/${style}"`
      )
    }
  })

  it("heroicons resolves the style subpath", async () => {
    const outline = await loadIconSet("heroicons", "outline")
    expect(outline.importLine("academic-cap")).toBe(
      'import { AcademicCapIcon } from "@heroicons/react/24/outline"'
    )
    const mini = await loadIconSet("heroicons", "mini")
    expect(mini.importLine("academic-cap")).toBe(
      'import { AcademicCapIcon } from "@heroicons/react/20/solid"'
    )
  })
})
