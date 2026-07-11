"use client"

export const THEMES = ["basic", "dreamy", "utilitarian"] as const
export type ThemeName = (typeof THEMES)[number]

const EVENT = "lorre-theme-change"

/**
 * The theme override works exactly like the CLI's `theme apply`, but at runtime:
 * fetch the theme's generated CSS from /r/themes/<name>.json and let it win over
 * the baked-in basic theme via a <style> appended to <head>. Shared by the header
 * picker and the landing carousel; a window event keeps both in sync.
 */
export async function applyTheme(name: ThemeName) {
  const existing = document.getElementById("lorre-theme-override")
  if (name === "basic") {
    existing?.remove()
    localStorage.setItem("lorre-theme", "basic")
    localStorage.removeItem("lorre-theme-css")
  } else {
    const res = await fetch(`/r/themes/${name}.json`)
    const { css } = (await res.json()) as { css: string }
    const style = existing ?? document.createElement("style")
    style.id = "lorre-theme-override"
    style.textContent = css
    if (!existing) document.head.appendChild(style)
    localStorage.setItem("lorre-theme", name)
    localStorage.setItem("lorre-theme-css", css)
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: name }))
}

export function currentTheme(): ThemeName {
  const stored = localStorage.getItem("lorre-theme")
  return (THEMES as readonly string[]).includes(stored ?? "")
    ? (stored as ThemeName)
    : "basic"
}

export function onThemeChange(callback: (name: ThemeName) => void): () => void {
  const handler = (event: Event) =>
    callback((event as CustomEvent<ThemeName>).detail)
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
