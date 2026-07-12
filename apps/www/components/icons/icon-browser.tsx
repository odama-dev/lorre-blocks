"use client"

import * as React from "react"
import Link from "next/link"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { Check, Download, Search } from "lucide-react"
import { ICON_SETS, type IconSetName } from "@lorre-blocks/tokens"

import { cn } from "@lorre-blocks/registry/lib/utils"
import { Badge } from "@lorre-blocks/registry/ui/badge"
import { Button } from "@lorre-blocks/registry/ui/button"
import { Input } from "@lorre-blocks/registry/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lorre-blocks/registry/ui/popover"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@lorre-blocks/registry/ui/tabs"
import { encodeDefinition, EMPTY_DEFINITION } from "@www/lib/studio"
import { loadIconSet, searchIcons, type LoadedIconSet } from "@www/lib/icon-sets"

const GRID_CAP = 240

/**
 * Multi-set icon browser: set switcher on top (Lorre carries several sets —
 * Radix's /icons has one), per-set style chips, search, hover-copy SVG/JSX,
 * click for details. Icons render with currentColor so they follow the theme.
 */
export function IconBrowser() {
  const [setName, setSetName] = React.useState<IconSetName>("lucide")
  const [style, setStyle] = React.useState<string | undefined>(undefined)
  const [query, setQuery] = React.useState("")
  const [loaded, setLoaded] = React.useState<LoadedIconSet | null>(null)
  const [loading, setLoading] = React.useState(true)

  const setInfo = ICON_SETS.find((s) => s.name === setName)!

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    void loadIconSet(setName, style).then((result) => {
      if (cancelled) return
      setLoaded(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [setName, style])

  const allNames = React.useMemo(
    () => (loaded ? Object.keys(loaded.icons).sort() : []),
    [loaded]
  )
  const matches = React.useMemo(
    () => searchIcons(allNames, query),
    [allNames, query]
  )
  const visible = matches.slice(0, GRID_CAP)

  const studioHref = `/themes?t=${encodeDefinition({
    ...EMPTY_DEFINITION,
    icons: style ? { set: setName, style } : { set: setName },
  })}`

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={setName}
          onValueChange={(v) => {
            setSetName(v as IconSetName)
            setStyle(undefined)
          }}
        >
          <TabsList>
            {ICON_SETS.map((s) => (
              <TabsTrigger key={s.name} value={s.name}>
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Badge variant="outline" className="font-mono text-[10px]">
          {setInfo.license}
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={studioHref}>Use this set in the Studio</Link>
          </Button>
        </div>
      </div>

      {setInfo.styles.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {setInfo.styles.map((s) => (
            <Button
              key={s}
              variant={(style ?? defaultStyle(setName)) === s ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setStyle(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${allNames.length || "…"} icons`}
          className="pl-9"
          aria-label="Search icons"
        />
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading {setInfo.label}…
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {matches.length} match{matches.length === 1 ? "" : "es"}
            {matches.length > GRID_CAP ? ` — showing ${GRID_CAP}, search to narrow` : ""}
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-1">
            {visible.map((name) => (
              <IconCell key={name} name={name} loaded={loaded!} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function defaultStyle(set: IconSetName): string | undefined {
  if (set === "phosphor") return "regular"
  if (set === "heroicons") return "outline"
  return undefined
}

function IconCell({ name, loaded }: { name: string; loaded: LoadedIconSet }) {
  const Icon = loaded.icons[name]
  const [copied, setCopied] = React.useState<"svg" | "jsx" | null>(null)

  const copy = (kind: "svg" | "jsx") => {
    const text = kind === "svg" ? svgMarkup(Icon) : loaded.jsxSnippet(name)
    void navigator.clipboard.writeText(text)
    setCopied(kind)
    setTimeout(() => setCopied(null), 1200)
  }

  return (
    <Popover>
      <div className="group relative flex aspect-square flex-col items-center justify-center rounded-md border border-transparent hover:border-border hover:bg-accent/50">
        <PopoverTrigger
          className="flex h-full w-full items-center justify-center"
          title={name}
          aria-label={name}
        >
          <Icon className="size-5" />
        </PopoverTrigger>
        <div className="absolute inset-x-0 bottom-0 hidden justify-center gap-0.5 pb-0.5 group-hover:flex">
          <HoverCopy label="SVG" active={copied === "svg"} onClick={() => copy("svg")} />
          <HoverCopy label="JSX" active={copied === "jsx"} onClick={() => copy("jsx")} />
        </div>
      </div>
      <PopoverContent className="w-80 space-y-2" align="start">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm">{name}</p>
          </div>
        </div>
        <CopyRow label="Import" text={loaded.importLine(name)} />
        <CopyRow label="JSX" text={loaded.jsxSnippet(name)} />
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => copy("svg")}
          >
            {copied === "svg" ? <Check className="h-3 w-3" /> : null} Copy SVG
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => downloadSvg(name, svgMarkup(Icon))}
          >
            <Download className="h-3 w-3" /> .svg
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function HoverCopy({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "rounded bg-foreground/85 px-1 py-px text-[9px] font-medium text-background",
        active && "bg-success text-success-foreground"
      )}
    >
      {active ? "✓" : label}
    </button>
  )
}

function CopyRow({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      className="block w-full rounded-md border bg-card p-2 text-left hover:bg-accent/50"
      onClick={() => {
        void navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
    >
      <span className="flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
        {copied ? <Check className="h-3 w-3 text-success" /> : null}
      </span>
      <code className="block truncate font-mono text-xs">{text}</code>
    </button>
  )
}

/**
 * Synchronous client-side render → SVG string. react-dom/server is not
 * available in app-router client components; flushSync into a detached root
 * produces identical markup.
 */
function svgMarkup(Icon: React.ComponentType<{ className?: string }>): string {
  const host = document.createElement("div")
  const root = createRoot(host)
  flushSync(() => {
    root.render(React.createElement(Icon))
  })
  const svg = host.querySelector("svg")?.outerHTML ?? ""
  root.unmount()
  return svg
}

function downloadSvg(name: string, markup: string) {
  const blob = new Blob([markup], { type: "image/svg+xml" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${name}.svg`
  a.click()
  URL.revokeObjectURL(url)
}
