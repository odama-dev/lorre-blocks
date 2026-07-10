import { afterEach, describe, expect, it, vi } from "vitest"

import * as out from "./output"

function captureStdout() {
  const chunks: string[] = []
  const spy = vi
    .spyOn(process.stdout, "write")
    .mockImplementation((chunk: unknown) => {
      chunks.push(String(chunk))
      return true
    })
  return { chunks, spy }
}

afterEach(() => {
  vi.restoreAllMocks()
  out.setJsonMode(false)
})

describe("output in JSON mode", () => {
  it("emits exactly one JSON document with ok: true", () => {
    out.setJsonMode(true)
    const { chunks } = captureStdout()

    out.emit({ count: 2 })

    expect(chunks).toHaveLength(1)
    const parsed = JSON.parse(chunks[0])
    expect(parsed).toEqual({ ok: true, count: 2 })
  })

  it("suppresses human output so stdout stays parseable", () => {
    out.setJsonMode(true)
    const { chunks } = captureStdout()

    out.intro("hello")
    out.success("wrote a file")
    out.message("some text")
    out.outro("bye")
    out.emit({ done: true })

    expect(chunks).toHaveLength(1)
    expect(() => JSON.parse(chunks[0])).not.toThrow()
  })

  it("collects warnings into the emitted document instead of printing them", () => {
    out.setJsonMode(true)
    const { chunks } = captureStdout()

    out.warn("theme could not be fetched")
    out.emit({ done: true })

    const parsed = JSON.parse(chunks[0])
    expect(parsed.warnings).toEqual(["theme could not be fetched"])
  })

  it("hands back a no-op spinner that writes nothing", () => {
    out.setJsonMode(true)
    const { chunks } = captureStdout()

    const s = out.spinner()
    s.start("resolving")
    s.stop("resolved")

    expect(chunks).toHaveLength(0)
  })

  it("resets collected warnings between commands", () => {
    out.setJsonMode(true)
    out.warn("first")
    out.setJsonMode(true) // simulates a fresh command
    const { chunks } = captureStdout()
    out.emit({})
    expect(JSON.parse(chunks[0]).warnings).toBeUndefined()
  })
})

describe("output in human mode", () => {
  it("emit() writes nothing — the command prints its own prose", () => {
    out.setJsonMode(false)
    const { chunks } = captureStdout()
    out.emit({ count: 2 })
    expect(chunks).toHaveLength(0)
  })

  it("isJsonMode reflects the current mode", () => {
    out.setJsonMode(false)
    expect(out.isJsonMode()).toBe(false)
    out.setJsonMode(true)
    expect(out.isJsonMode()).toBe(true)
  })
})
