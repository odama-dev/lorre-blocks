"use client"

import * as React from "react"

import { cn } from "@lorre-blocks/registry/lib/utils"
import {
  THEMES,
  applyTheme,
  currentTheme,
  onThemeChange,
  type ThemeName,
} from "@www/lib/theme"

const BLURBS: Record<ThemeName, string> = {
  basic: "blue accent · balanced radii · the neutral default",
  dreamy: "violet accent · large radii · plush shadows · slow motion",
  utilitarian: "monochrome accent · sharp corners · fast motion",
}

const INTERVAL_MS = 4000

/**
 * The landing page's theme-switching carousel: everything on the page re-themes
 * live because a theme is just a token block. Auto-advances through the three
 * themes until the visitor interacts (or prefers reduced motion), then hands
 * over control. Kept in sync with the header picker via lib/theme events.
 */
export function ThemeCarousel() {
  const [active, setActive] = React.useState<ThemeName>("basic")
  const [auto, setAuto] = React.useState(false)
  const hovering = React.useRef(false)

  React.useEffect(() => {
    setActive(currentTheme())
    // Only auto-cycle for fresh visitors on the default theme; a stored choice
    // or an OS reduced-motion preference means we leave the theme alone.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setAuto(!reduced && currentTheme() === "basic")
    return onThemeChange((name) => {
      setActive(name)
    })
  }, [])

  React.useEffect(() => {
    if (!auto) return
    const id = window.setInterval(() => {
      if (hovering.current) return
      const next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length]
      void applyTheme(next)
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [auto])

  const pick = (name: ThemeName) => {
    setAuto(false)
    void applyTheme(name)
  }

  return (
    <div
      className="flex flex-col items-center gap-3"
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
    >
      <div
        role="tablist"
        aria-label="Theme"
        className="flex items-center gap-1 rounded-full border bg-card p-1 shadow-sm"
      >
        {THEMES.map((name) => (
          <button
            key={name}
            role="tab"
            aria-selected={active === name}
            onClick={() => pick(name)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              active === name
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {name}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {BLURBS[active]}
        {auto && " · cycling, click to take over"}
      </p>
    </div>
  )
}
