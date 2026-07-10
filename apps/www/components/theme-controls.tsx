"use client"

import * as React from "react"
import { Moon, Palette, Sun } from "lucide-react"

import { Button } from "@lorre-blocks/registry/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@lorre-blocks/registry/ui/dropdown-menu"

const THEMES = ["basic", "dreamy", "utilitarian"] as const

/**
 * The theme override works exactly like the CLI's `theme apply`, but at runtime:
 * fetch the theme's generated CSS from /r/themes/<name>.json and let it win over
 * the baked-in basic theme via a <style> appended to <head>.
 */
async function applyTheme(name: string) {
  const existing = document.getElementById("lorre-theme-override")
  if (name === "basic") {
    existing?.remove()
    localStorage.setItem("lorre-theme", "basic")
    localStorage.removeItem("lorre-theme-css")
    return
  }
  const res = await fetch(`/r/themes/${name}.json`)
  const { css } = (await res.json()) as { css: string }
  const style = existing ?? document.createElement("style")
  style.id = "lorre-theme-override"
  style.textContent = css
  if (!existing) document.head.appendChild(style)
  localStorage.setItem("lorre-theme", name)
  localStorage.setItem("lorre-theme-css", css)
}

export function ThemeControls() {
  const [theme, setTheme] = React.useState<string>("basic")
  const [dark, setDark] = React.useState(false)

  React.useEffect(() => {
    setTheme(localStorage.getItem("lorre-theme") ?? "basic")
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("lorre-mode", next ? "dark" : "light")
  }

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="capitalize max-sm:hidden">{theme}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(value) => {
              setTheme(value)
              void applyTheme(value)
            }}
          >
            {THEMES.map((name) => (
              <DropdownMenuRadioItem
                key={name}
                value={name}
                className="capitalize"
              >
                {name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle dark mode"
        onClick={toggleDark}
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  )
}
