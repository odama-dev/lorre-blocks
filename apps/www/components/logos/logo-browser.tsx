"use client"

import * as React from "react"
import { Check, Copy, Download, Search } from "lucide-react"

import { cn } from "@lorre-blocks/registry/lib/utils"
import { Button } from "@lorre-blocks/registry/ui/button"
import { Input } from "@lorre-blocks/registry/ui/input"
import { Label } from "@lorre-blocks/registry/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lorre-blocks/registry/ui/popover"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@lorre-blocks/registry/ui/toggle-group"
import { LOGOS, type LogoDef } from "@www/components/logos/logos-data"

type Mode = "light" | "dark"
type ColorMode = "brand" | "mono"

const TILE_BG: Record<Mode, string> = { light: "#ffffff", dark: "#0b0b0d" }
const INK: Record<Mode, string> = { light: "#0b0b0f", dark: "#ffffff" }

function logoSvg(logo: LogoDef, fill: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24" width="24" height="24" fill="${fill}"><title>${logo.title}</title><path d="${logo.path}"/></svg>`
}

function download(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "image/svg+xml" }))
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Brand logos from simple-icons (CC0). Preview them on a light or dark surface,
 * in brand color or monochrome, then copy each as SVG or inline JSX or download.
 * Trademarks belong to their owners.
 */
export function LogoBrowser() {
  const [query, setQuery] = React.useState("")
  const [mode, setMode] = React.useState<Mode>("light")
  const [color, setColor] = React.useState<ColorMode>("brand")

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return q
      ? LOGOS.filter(
          (l) => l.title.toLowerCase().includes(q) || l.slug.includes(q)
        )
      : LOGOS
  }, [query])

  const fillFor = (logo: LogoDef) =>
    color === "brand" ? logo.hex : INK[mode]

  return (
    <div className="space-y-4">
      {/* Toolbar — search + the light/dark and brand/mono filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${LOGOS.length} logos`}
            className="rounded-none border-dashed pl-9"
            aria-label="Search logos"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Mode
          </Label>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => v && setMode(v as Mode)}
            className="gap-1"
          >
            {(["light", "dark"] as Mode[]).map((m) => (
              <ToggleGroupItem
                key={m}
                value={m}
                size="sm"
                variant="outline"
                className="rounded-none border-dashed text-xs capitalize data-[state=on]:border-solid"
              >
                {m}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex items-center gap-1.5">
          <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Color
          </Label>
          <ToggleGroup
            type="single"
            value={color}
            onValueChange={(v) => v && setColor(v as ColorMode)}
            className="gap-1"
          >
            {(["brand", "mono"] as ColorMode[]).map((c) => (
              <ToggleGroupItem
                key={c}
                value={c}
                size="sm"
                variant="outline"
                className="rounded-none border-dashed text-xs capitalize data-[state=on]:border-solid"
              >
                {c}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {matches.length} logo{matches.length === 1 ? "" : "s"} · simple-icons
        (CC0)
      </p>

      {matches.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No logos match “{query}”.
        </p>
      ) : (
        <div
          className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] border-l border-t border-dashed"
          style={{ backgroundColor: TILE_BG[mode] }}
        >
          {matches.map((logo) => (
            <LogoCell
              key={logo.slug}
              logo={logo}
              mode={mode}
              fill={fillFor(logo)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LogoCell({
  logo,
  mode,
  fill,
}: {
  logo: LogoDef
  mode: Mode
  fill: string
}) {
  const [copied, setCopied] = React.useState<"svg" | "jsx" | null>(null)
  const dark = mode === "dark"

  const copy = (kind: "svg" | "jsx") => {
    void navigator.clipboard.writeText(logoSvg(logo, fill))
    setCopied(kind)
    setTimeout(() => setCopied(null), 1200)
  }

  return (
    <Popover>
      <div
        className="group relative flex aspect-square items-center justify-center border-b border-r border-dashed transition-colors duration-200 ease-out"
        style={{ backgroundColor: TILE_BG[mode] }}
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 truncate px-1 pt-0.5 text-center font-mono text-[9px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
          style={{ color: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)" }}
        >
          {logo.title}
        </span>
        <PopoverTrigger
          className="flex h-full w-full items-center justify-center outline-none"
          title={logo.title}
          aria-label={logo.title}
        >
          <svg
            viewBox="0 0 24 24"
            style={{ width: 40, height: 40 }}
            fill={fill}
            aria-hidden
          >
            <path d={logo.path} />
          </svg>
        </PopoverTrigger>
        <div className="pointer-events-none absolute inset-x-1 bottom-1 flex gap-1 opacity-0 transition-opacity duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
          <LogoHoverCopy
            label="SVG"
            dark={dark}
            active={copied === "svg"}
            onClick={() => copy("svg")}
          />
          <LogoHoverCopy
            label="JSX"
            dark={dark}
            active={copied === "jsx"}
            onClick={() => copy("jsx")}
          />
        </div>
      </div>
      <PopoverContent
        className="w-80 space-y-2 rounded-none border-dashed"
        align="start"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center border"
            style={{ backgroundColor: TILE_BG[mode] }}
          >
            <svg viewBox="0 0 24 24" width={24} height={24} fill={fill} aria-hidden>
              <path d={logo.path} />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{logo.title}</p>
            <p className="font-mono text-xs text-muted-foreground">{logo.hex}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-none border-dashed text-xs"
            onClick={() => copy("svg")}
          >
            {copied === "svg" ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            Copy SVG
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-none border-dashed text-xs"
            onClick={() => copy("jsx")}
          >
            {copied === "jsx" ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            Copy JSX
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="col-span-2 gap-1.5 rounded-none border-dashed text-xs"
            onClick={() => download(logoSvg(logo, fill), `${logo.slug}.svg`)}
          >
            <Download className="h-3 w-3" /> Download SVG
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function LogoHoverCopy({
  label,
  dark,
  active,
  onClick,
}: {
  label: string
  dark: boolean
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={`Copy ${label}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "flex flex-1 items-center justify-center gap-1 border px-1.5 py-1 text-[10px] font-medium shadow-sm backdrop-blur-sm transition-colors",
        active
          ? "border-transparent bg-emerald-500 text-white"
          : dark
            ? "border-white/25 bg-black/60 text-white/90 hover:bg-black"
            : "border-black/15 bg-white/90 text-black/80 hover:bg-white"
      )}
    >
      {active ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {label}
    </button>
  )
}
