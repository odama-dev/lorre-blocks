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
import {
  THEMES,
  applyTheme,
  currentTheme,
  onThemeChange,
  type ThemeName,
} from "@www/lib/theme"

export function ThemeControls() {
  const [theme, setTheme] = React.useState<string>("basic")
  const [dark, setDark] = React.useState(false)

  React.useEffect(() => {
    setTheme(currentTheme())
    setDark(document.documentElement.classList.contains("dark"))
    // Stay in sync when something else (the landing carousel) swaps the theme.
    return onThemeChange(setTheme)
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
              void applyTheme(value as ThemeName)
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
