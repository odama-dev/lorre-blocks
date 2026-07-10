import { describe, expect, it } from "vitest"

import { searchRegistry } from "./search"
import type { RegistryIndexItem } from "../registry/schema"

const items: RegistryIndexItem[] = [
  {
    name: "button",
    type: "registry:ui",
    category: "component",
    source: "shadcn",
    description: "Displays a clickable button with variants and sizes.",
    tags: ["action", "cta", "form"],
  },
  {
    name: "input",
    type: "registry:ui",
    category: "component",
    source: "shadcn",
    description: "A styled text input field for forms.",
    tags: ["form", "text"],
  },
  {
    name: "hero-split",
    type: "registry:block",
    category: "block",
    source: "lorre",
    description: "A marketing hero section with a split image layout.",
    tags: ["marketing", "landing"],
    themes: ["dreamy"],
  },
  {
    name: "utils",
    type: "registry:lib",
    category: "lib",
    source: "shadcn",
    description: "cn() helper for merging Tailwind class names.",
  },
]

describe("searchRegistry", () => {
  it("ranks an exact name match above a description match", () => {
    const hits = searchRegistry(items, "button")
    expect(hits[0].item.name).toBe("button")
    expect(hits[0].matched).toContain("name")
  })

  it("matches tags", () => {
    const hits = searchRegistry(items, "form")
    const names = hits.map((h) => h.item.name)
    expect(names).toContain("button")
    expect(names).toContain("input")
    expect(hits.every((h) => h.matched.includes("tags") || h.matched.includes("description"))).toBe(true)
  })

  it("returns nothing when no field matches", () => {
    expect(searchRegistry(items, "zzzznomatch")).toEqual([])
  })

  it("an empty query returns every item that passes the filters", () => {
    expect(searchRegistry(items, "")).toHaveLength(items.length)
    expect(searchRegistry(items, "", { category: "component" })).toHaveLength(2)
  })

  it("filters by source and type", () => {
    expect(searchRegistry(items, "", { source: "lorre" }).map((h) => h.item.name)).toEqual([
      "hero-split",
    ])
    expect(searchRegistry(items, "", { type: "registry:block" })).toHaveLength(1)
  })

  it("treats items without `themes` as theme-agnostic", () => {
    const dreamy = searchRegistry(items, "", { theme: "dreamy" }).map((h) => h.item.name)
    expect(dreamy).toContain("hero-split")
    expect(dreamy).toContain("button")

    const basic = searchRegistry(items, "", { theme: "basic" }).map((h) => h.item.name)
    expect(basic).toContain("button")
    expect(basic).not.toContain("hero-split")
  })

  it("sorts equal scores by name for a stable, deterministic order", () => {
    const hits = searchRegistry(items, "", { category: "component" })
    expect(hits.map((h) => h.item.name)).toEqual(["button", "input"])
  })

  it("combines a query with a filter", () => {
    const hits = searchRegistry(items, "marketing", { source: "lorre" })
    expect(hits).toHaveLength(1)
    expect(hits[0].item.name).toBe("hero-split")
  })
})
