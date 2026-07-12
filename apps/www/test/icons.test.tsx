import { describe, expect, it } from "vitest"

import { ICON_SETS } from "@lorre-blocks/tokens"
import { kebab, loadIconSet, pascal, searchIcons } from "@www/lib/icon-sets"

describe("icon catalog", () => {
  it("carries the four permissive sets — Untitled UI must never appear", () => {
    expect(ICON_SETS.map((s) => s.name)).toEqual([
      "lucide",
      "radix",
      "phosphor",
      "heroicons",
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
    expect(set.jsxSnippet("arrow-right")).toBe('<ArrowRight className="size-4" />')
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
    expect(set.jsxSnippet("acorn")).toBe('<Acorn size={16} weight="duotone" />')
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
