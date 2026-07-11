import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { registry } from "@lorre-blocks/registry/registry"
import { blockDemos, demos, motionDemos } from "@www/components/demos"

const DEMO_MAP_FOR_TYPE: Record<string, Record<string, React.ComponentType>> = {
  "registry:ui": demos,
  "registry:block": blockDemos,
  "registry:motion": motionDemos,
}

describe("demo coverage", () => {
  for (const item of registry) {
    const map = DEMO_MAP_FOR_TYPE[item.type]
    if (!map) continue // lib items (utils) have no docs page
    it(`${item.name} has a demo`, () => {
      expect(map[item.name], `add a demo for "${item.name}"`).toBeDefined()
    })
  }
})

/**
 * Render smoke test for every registry item that has a demo — which is all of
 * them, since the docs pages require one. The demos use each component the way
 * a consumer would, so this catches broken imports, missing "use client"
 * assumptions, bad prop types and render-time crashes across ui, blocks and
 * motion in one pass.
 */
afterEach(cleanup)

const suites: Array<[string, Record<string, React.ComponentType>]> = [
  ["ui", demos],
  ["blocks", blockDemos],
  ["motion", motionDemos],
]

for (const [group, map] of suites) {
  describe(`${group} demos render`, () => {
    const names = Object.keys(map)
    it(`has demos to test`, () => {
      expect(names.length).toBeGreaterThan(0)
    })
    for (const name of names) {
      it(name, () => {
        const Demo = map[name]
        const { container } = render(<Demo />)
        expect(container.innerHTML.length).toBeGreaterThan(0)
      })
    }
  })
}
