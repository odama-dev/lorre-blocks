"use client"

import * as React from "react"
import type { ThemeDefinition } from "@lorre-blocks/tokens"

import {
  decodeDefinition,
  encodeDefinition,
  EMPTY_DEFINITION,
  googleFontsHref,
  MONO_FONTS,
  previewCss,
  SANS_FONTS,
} from "@www/lib/studio"
import { StudioControls } from "@www/components/studio/studio-controls"
import { StudioExport } from "@www/components/studio/studio-export"
import { StudioPreview } from "@www/components/studio/studio-preview"

const PREVIEW_STYLE_ID = "lorre-studio-preview"
const FONTS_LINK_ID = "lorre-studio-fonts"

/**
 * The Theme Studio: tweak a ThemeDefinition on the left, watch the whole page
 * re-theme live via a page-wide injected <style> (portal-rendered overlays stay
 * themed too), copy the result as CSS / JSON / a CLI command. State round-trips
 * through the `?t=` share param.
 */
export function ThemeStudio() {
  const [def, setDef] = React.useState<ThemeDefinition>(EMPTY_DEFINITION)
  const [hydrated, setHydrated] = React.useState(false)

  // Restore a shared definition once on mount.
  React.useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get("t")
    if (encoded) {
      const restored = decodeDefinition(encoded)
      if (restored) setDef(restored)
    }
    setHydrated(true)
  }, [])

  // Preview fonts are runtime-loaded for the Studio only; the link tag lives
  // and dies with this component so docs pages never pay for it.
  React.useEffect(() => {
    const href = googleFontsHref([...SANS_FONTS, ...MONO_FONTS])
    if (!href || document.getElementById(FONTS_LINK_ID)) return
    const link = document.createElement("link")
    link.id = FONTS_LINK_ID
    link.rel = "stylesheet"
    link.href = href
    document.head.appendChild(link)
    return () => link.remove()
  }, [])

  // Live preview: inject the definition's custom-property blocks page-wide.
  React.useEffect(() => {
    if (!hydrated) return
    let css: string
    try {
      css = previewCss(def)
    } catch {
      return // mid-edit invalid state; keep the last good preview
    }
    let style = document.getElementById(PREVIEW_STYLE_ID) as HTMLStyleElement | null
    if (!style) {
      style = document.createElement("style")
      style.id = PREVIEW_STYLE_ID
      document.head.appendChild(style)
    }
    style.textContent = css
  }, [def, hydrated])

  React.useEffect(() => {
    return () => document.getElementById(PREVIEW_STYLE_ID)?.remove()
  }, [])

  // Debounced share URL.
  React.useEffect(() => {
    if (!hydrated) return
    const handle = setTimeout(() => {
      const url = new URL(window.location.href)
      url.searchParams.set("t", encodeDefinition(def))
      window.history.replaceState(null, "", url)
    }, 300)
    return () => clearTimeout(handle)
  }, [def, hydrated])

  const patch = React.useCallback((update: Partial<ThemeDefinition>) => {
    setDef((prev) => ({ ...prev, ...update }))
  }, [])

  const reset = React.useCallback(() => {
    setDef(EMPTY_DEFINITION)
    const url = new URL(window.location.href)
    url.searchParams.delete("t")
    window.history.replaceState(null, "", url)
  }, [])

  return (
    <div className="grid gap-8 px-6 py-8 lg:grid-cols-[300px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto lg:border-r lg:border-dashed lg:pr-4">
        <StudioControls def={def} patch={patch} reset={reset} />
      </aside>
      <div className="min-w-0 space-y-8">
        <StudioPreview def={def} />
        <StudioExport def={def} />
      </div>
    </div>
  )
}
