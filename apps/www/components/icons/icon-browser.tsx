"use client"

import * as React from "react"
import Link from "next/link"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import {
  Check,
  Copy,
  Download,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { PUBLIC_ICON_SETS, type IconSetName } from "@lorre-blocks/tokens"

import { cn } from "@lorre-blocks/registry/lib/utils"
import { Button } from "@lorre-blocks/registry/ui/button"
import { Input } from "@lorre-blocks/registry/ui/input"
import { Label } from "@lorre-blocks/registry/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lorre-blocks/registry/ui/popover"
import { Slider } from "@lorre-blocks/registry/ui/slider"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@lorre-blocks/registry/ui/toggle-group"
import { encodeDefinition, EMPTY_DEFINITION } from "@www/lib/studio"
import { ALL_CATEGORIES, type CategoryCount } from "@www/lib/icon-categories"
import {
  type IconRenderOptions,
  type LoadedIconSet,
} from "@www/lib/icon-sets"
import { useIcons } from "@www/components/icons/icons-context"

const GRID_CAP = 240
const DEFAULT_SIZE = 24
const DEFAULT_STROKE = 2
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

const SWATCHES: { label: string; value: string }[] = [
  { label: "Theme", value: "currentColor" },
  { label: "Slate", value: "#334155" },
  { label: "Blue", value: "#2563eb" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Pink", value: "#db2777" },
  { label: "Red", value: "#dc2626" },
  { label: "Amber", value: "#d97706" },
  { label: "Emerald", value: "#059669" },
]

/**
 * Icon explorer content (the category filter lives in the global sidebar via
 * {@link IconCategoryNav}; shared state comes from {@link useIcons}). Tune size /
 * stroke / color, then copy an icon as SVG or JSX or download it. Color is
 * applied via `currentColor` on the grid — and, while dragging the wheel,
 * straight to the DOM — so recoloring never re-renders the icons.
 */
export function IconBrowser() {
  const {
    setName,
    changeSet,
    style,
    setStyle,
    activeStyle,
    supportsStroke,
    loading,
    loaded,
    allNames,
    categories,
    category,
    setCategory,
    query,
    setQuery,
    matches,
  } = useIcons()

  const [size, setSize] = React.useState(DEFAULT_SIZE)
  const [strokeWidth, setStrokeWidth] = React.useState(DEFAULT_STROKE)
  const [color, setColor] = React.useState("currentColor")
  const [hexText, setHexText] = React.useState("")

  const setInfo = PUBLIC_ICON_SETS.find((s) => s.name === setName)!
  const visible = matches.slice(0, GRID_CAP)

  React.useEffect(() => {
    setHexText(color === "currentColor" ? "" : color)
  }, [color])

  const renderStyle = React.useMemo<React.CSSProperties>(
    () => ({
      width: size,
      height: size,
      ...(supportsStroke ? { strokeWidth } : {}),
    }),
    [size, strokeWidth, supportsStroke]
  )
  const optsRef = React.useRef<IconRenderOptions>({})
  optsRef.current = {
    size,
    strokeWidth: supportsStroke ? strokeWidth : undefined,
    color,
  }

  // Off-React-path recolor while the wheel is dragged (see previous notes).
  const gridRef = React.useRef<HTMLDivElement>(null)
  const colorRaf = React.useRef<number | undefined>(undefined)
  const colorCommit = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const pendingColor = React.useRef("")

  const applyColorLive = React.useCallback((value: string) => {
    pendingColor.current = value
    if (colorRaf.current != null) return
    colorRaf.current = requestAnimationFrame(() => {
      colorRaf.current = undefined
      if (gridRef.current) gridRef.current.style.color = pendingColor.current
      optsRef.current.color = pendingColor.current
    })
  }, [])

  const commitColor = (value: string) => {
    applyColorLive(value)
    if (colorCommit.current) clearTimeout(colorCommit.current)
    colorCommit.current = setTimeout(() => setColor(value), 150)
  }

  React.useEffect(
    () => () => {
      if (colorRaf.current != null) cancelAnimationFrame(colorRaf.current)
      if (colorCommit.current) clearTimeout(colorCommit.current)
    },
    []
  )

  const pickColor = (value: string) => {
    if (colorCommit.current) clearTimeout(colorCommit.current)
    setColor(value)
  }

  const reset = () => {
    setStyle(undefined)
    setQuery("")
    setCategory(ALL_CATEGORIES)
    setSize(DEFAULT_SIZE)
    setStrokeWidth(DEFAULT_STROKE)
    if (colorCommit.current) clearTimeout(colorCommit.current)
    setColor("currentColor")
  }

  const studioHref = `/themes?t=${encodeDefinition({
    ...EMPTY_DEFINITION,
    icons: style ? { set: setName, style } : { set: setName },
  })}`

  return (
    <div className="space-y-4">
      {/* Toolbar — set + search come first; appearance is tucked away */}
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup
          type="single"
          value={setName}
          onValueChange={(value) => value && changeSet(value as IconSetName)}
          className="flex-wrap justify-start gap-1"
        >
          {PUBLIC_ICON_SETS.map((s) => (
            <ToggleGroupItem
              key={s.name}
              value={s.name}
              variant="outline"
              className="rounded-none border-dashed data-[state=on]:border-solid"
            >
              {s.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="relative min-w-[12rem] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${allNames.length || "…"} icons`}
            className="rounded-none border-dashed pl-9"
            aria-label="Search icons"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-none border-dashed"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Customize
              <span className="font-mono text-[10px] text-muted-foreground">
                {size}px
              </span>
              <span
                aria-hidden
                className="h-3.5 w-3.5 border border-border"
                style={
                  color === "currentColor"
                    ? undefined
                    : { backgroundColor: color }
                }
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-72 space-y-4 rounded-none border-dashed"
          >
            {setInfo.styles.length > 0 && (
              <Field label="Style">
                <ToggleGroup
                  type="single"
                  value={activeStyle}
                  onValueChange={(value) => value && setStyle(value)}
                  className="flex-wrap justify-start gap-1"
                >
                  {setInfo.styles.map((s) => (
                    <ToggleGroupItem
                      key={s}
                      value={s}
                      size="sm"
                      variant="outline"
                      className="rounded-none border-dashed text-xs capitalize data-[state=on]:border-solid"
                    >
                      {s}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
            )}
            <Field label={`Size — ${size}px`}>
              <Slider
                value={[size]}
                min={16}
                max={48}
                step={2}
                onValueChange={([v]) => setSize(v)}
                className="w-full"
              />
            </Field>
            {supportsStroke && (
              <Field label={`Stroke — ${strokeWidth}`}>
                <Slider
                  value={[strokeWidth]}
                  min={0.5}
                  max={3}
                  step={0.25}
                  onValueChange={([v]) => setStrokeWidth(v)}
                  className="w-full"
                />
              </Field>
            )}
            <Field label="Color">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {SWATCHES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      title={s.label}
                      aria-label={s.label}
                      onClick={() => pickColor(s.value)}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center border",
                        color === s.value
                          ? "border-solid border-foreground ring-2 ring-ring ring-offset-1 ring-offset-background"
                          : "border-dashed border-border"
                      )}
                      style={
                        s.value === "currentColor"
                          ? undefined
                          : { backgroundColor: s.value, borderStyle: "solid" }
                      }
                    >
                      {s.value === "currentColor" && (
                        <span className="text-[10px] font-semibold">A</span>
                      )}
                    </button>
                  ))}
                  <label className="relative flex h-6 w-6 cursor-pointer items-center justify-center border border-dashed border-border hover:border-foreground">
                    <span className="text-[10px]">+</span>
                    <input
                      type="color"
                      aria-label="Custom color"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={(e) => commitColor(e.target.value)}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={hexText}
                  spellCheck={false}
                  placeholder="#hex or theme"
                  aria-label="Hex color"
                  onChange={(e) => {
                    const text = e.target.value.trim()
                    setHexText(text)
                    if (HEX_RE.test(text)) commitColor(text)
                  }}
                  className="h-7 w-full border border-dashed border-border bg-background px-2 font-mono text-xs outline-none focus:border-foreground"
                />
              </div>
            </Field>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="w-full justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset all
            </Button>
          </PopoverContent>
        </Popover>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="rounded-none text-muted-foreground hover:text-foreground"
        >
          <Link href={studioHref}>Open in Studio</Link>
        </Button>
      </div>

      {/* Category filter — secondary, light-weight pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {categories.map((c) => (
            <CategoryPill
              key={c.label}
              category={c}
              active={category === c.label}
              onSelect={setCategory}
            />
          ))}
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading {setInfo.label}…
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {matches.length} {setInfo.label} icon
            {matches.length === 1 ? "" : "s"}
            {category !== ALL_CATEGORIES ? ` in ${category}` : ""} ·{" "}
            {setInfo.license}
            {matches.length > GRID_CAP
              ? ` — showing ${GRID_CAP}, search to narrow`
              : ""}
          </p>
          {visible.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No icons match. Try another search or category.
            </p>
          ) : (
            <div
              ref={gridRef}
              className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] border-l border-t border-dashed"
              style={color === "currentColor" ? undefined : { color }}
            >
              {visible.map((name) => (
                <IconCell
                  key={name}
                  name={name}
                  loaded={loaded!}
                  renderStyle={renderStyle}
                  optsRef={optsRef}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CategoryPill({
  category,
  active,
  onSelect,
}: {
  category: CategoryCount
  active: boolean
  onSelect: (label: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.label)}
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 text-xs transition-colors",
        active
          ? "bg-foreground font-medium text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {category.label}
      <span className="font-mono text-[10px] opacity-60">{category.count}</span>
    </button>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

const IconCell = React.memo(function IconCell({
  name,
  loaded,
  renderStyle,
  optsRef,
}: {
  name: string
  loaded: LoadedIconSet
  renderStyle: React.CSSProperties
  optsRef: React.RefObject<IconRenderOptions>
}) {
  const Icon = loaded.icons[name]
  const [copied, setCopied] = React.useState<"svg" | "jsx" | null>(null)

  const copy = (kind: "svg" | "jsx") => {
    const opts = optsRef.current
    const text =
      kind === "svg" ? svgMarkup(Icon, opts) : loaded.jsxSnippet(name, opts)
    void navigator.clipboard.writeText(text)
    setCopied(kind)
    setTimeout(() => setCopied(null), 1200)
  }

  const opts = optsRef.current
  const previewStyle: React.CSSProperties = {
    ...renderStyle,
    ...(opts.color && opts.color !== "currentColor"
      ? { color: opts.color }
      : {}),
  }

  return (
    <Popover>
      <div className="group relative flex aspect-square items-center justify-center border-b border-r border-dashed transition-colors duration-200 ease-out hover:bg-accent/40">
        <PopoverTrigger
          className="flex h-full w-full items-center justify-center outline-none"
          title={name}
          aria-label={name}
        >
          <Icon style={renderStyle} />
        </PopoverTrigger>
        <span className="pointer-events-none absolute inset-x-0 top-0 truncate px-2 pt-1.5 text-center font-mono text-[9px] text-muted-foreground opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
          {name}
        </span>
        <div className="pointer-events-none absolute inset-x-1 bottom-1 flex gap-1 opacity-0 transition-opacity duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
          <HoverCopy
            label="SVG"
            active={copied === "svg"}
            onClick={() => copy("svg")}
          />
          <HoverCopy
            label="JSX"
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
          <span className="flex h-12 w-12 items-center justify-center border border-dashed">
            <Icon style={previewStyle} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm">{name}</p>
            <p className="text-xs text-muted-foreground">
              {opts.size}px
              {opts.strokeWidth ? ` · stroke ${opts.strokeWidth}` : ""}
            </p>
          </div>
        </div>
        <CopyRow label="Import" text={loaded.importLine(name)} />
        <CopyRow label="JSX / TSX" text={loaded.jsxSnippet(name, opts)} />
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
            onClick={() => downloadSvg(name, svgMarkup(Icon, optsRef.current))}
          >
            <Download className="h-3 w-3" /> Download
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
})

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
      title={`Copy ${label}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "flex flex-1 items-center justify-center gap-1 border px-1.5 py-1 text-[10px] font-medium shadow-sm backdrop-blur-sm transition-colors",
        active
          ? "border-success bg-success text-success-foreground"
          : "border-border bg-background/95 text-muted-foreground hover:border-foreground hover:bg-background hover:text-foreground"
      )}
    >
      {active ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {label}
    </button>
  )
}

function CopyRow({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      className="block w-full border border-dashed bg-card p-2 text-left hover:bg-accent/50"
      onClick={() => {
        void navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
    >
      <span className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
        {copied ? <Check className="h-3 w-3 text-success" /> : null}
      </span>
      <code className="block truncate font-mono text-xs">{text}</code>
    </button>
  )
}

/**
 * Synchronous client-side render → SVG string with the customizer baked in.
 * react-dom/server is not available in app-router client components; flushSync
 * into a detached root produces identical markup. Size and stroke are written
 * as attributes and a chosen color replaces currentColor, so the output drops
 * cleanly into Figma or any editor.
 */
function svgMarkup(
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>,
  opts: IconRenderOptions
): string {
  const host = document.createElement("div")
  const root = createRoot(host)
  flushSync(() => {
    root.render(React.createElement(Icon))
  })
  const svg = host.querySelector("svg")
  let markup = ""
  if (svg) {
    if (opts.size) {
      svg.setAttribute("width", String(opts.size))
      svg.setAttribute("height", String(opts.size))
    }
    if (opts.strokeWidth && svg.hasAttribute("stroke")) {
      svg.setAttribute("stroke-width", String(opts.strokeWidth))
    }
    markup = svg.outerHTML
    if (opts.color && opts.color !== "currentColor") {
      markup = markup.replace(/currentColor/g, opts.color)
    }
  }
  root.unmount()
  return markup
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
