"use client"

import * as React from "react"
import { Check, Copy, RotateCcw, Search, SlidersHorizontal } from "lucide-react"

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
import { LOADERS, type LoaderDef } from "@www/components/loaders/loaders-data"

const DEFAULTS = { size: 44, speed: 2, stroke: 4 }
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

type Opts = { size: number; speed: number; stroke: number; color: string }

/**
 * Animated loaders from ldrs (uiball). Tune size / speed / stroke / color and
 * copy each as a React component or a web-component tag, or the install line.
 * Loaders inherit `currentColor`, so recoloring is a single style write on the
 * grid (dragging the wheel stays smooth) and follows light/dark.
 */
export function LoaderBrowser() {
  const [size, setSize] = React.useState(DEFAULTS.size)
  const [speed, setSpeed] = React.useState(DEFAULTS.speed)
  const [stroke, setStroke] = React.useState(DEFAULTS.stroke)
  const [color, setColor] = React.useState("currentColor")
  const [hexText, setHexText] = React.useState("")
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    setHexText(color === "currentColor" ? "" : color)
  }, [color])

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? LOADERS.filter((l) => l.name.includes(q)) : LOADERS
  }, [query])

  const renderProps = React.useMemo(
    () => ({ size, speed, stroke }),
    [size, speed, stroke]
  )
  const optsRef = React.useRef<Opts>({ size, speed, stroke, color })
  optsRef.current = { size, speed, stroke, color }

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
  const pickColor = (value: string) => {
    if (colorCommit.current) clearTimeout(colorCommit.current)
    setColor(value)
  }

  React.useEffect(
    () => () => {
      if (colorRaf.current != null) cancelAnimationFrame(colorRaf.current)
      if (colorCommit.current) clearTimeout(colorCommit.current)
    },
    []
  )

  const reset = () => {
    setQuery("")
    setSize(DEFAULTS.size)
    setSpeed(DEFAULTS.speed)
    setStroke(DEFAULTS.stroke)
    if (colorCommit.current) clearTimeout(colorCommit.current)
    setColor("currentColor")
  }

  return (
    <div className="space-y-4">
      {/* Toolbar — search first, appearance in a popover */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${LOADERS.length} loaders`}
            className="rounded-none border-dashed pl-9"
            aria-label="Search loaders"
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
            <Field label={`Size — ${size}px`}>
              <Slider
                value={[size]}
                min={24}
                max={72}
                step={2}
                onValueChange={([v]) => setSize(v)}
                className="w-full"
              />
            </Field>
            <Field label={`Speed — ${speed}s`}>
              <Slider
                value={[speed]}
                min={0.4}
                max={3}
                step={0.1}
                onValueChange={([v]) => setSpeed(v)}
                className="w-full"
              />
            </Field>
            <Field label={`Stroke — ${stroke}`}>
              <Slider
                value={[stroke]}
                min={1}
                max={8}
                step={0.5}
                onValueChange={([v]) => setStroke(v)}
                className="w-full"
              />
            </Field>
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
      </div>

      <p className="text-xs text-muted-foreground">
        {matches.length} loader{matches.length === 1 ? "" : "s"} · ldrs (MIT)
      </p>

      {matches.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No loaders match “{query}”.
        </p>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] border-l border-t border-dashed"
          style={color === "currentColor" ? undefined : { color }}
        >
          {matches.map((def) => (
            <LoaderCell
              key={def.name}
              def={def}
              renderProps={renderProps}
              optsRef={optsRef}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function reactSnippet(def: LoaderDef, o: Opts): string {
  const attrs = [`size={${o.size}}`, `speed={${o.speed}}`]
  if (def.hasStroke) attrs.push(`stroke={${o.stroke}}`)
  attrs.push(`color="${o.color}"`)
  return `import { ${def.pascal} } from "ldrs/react"\nimport "ldrs/react/${def.pascal}.css"\n\n<${def.pascal} ${attrs.join(" ")} />`
}

function htmlSnippet(def: LoaderDef, o: Opts): string {
  const attrs = [`size="${o.size}"`, `speed="${o.speed}"`]
  if (def.hasStroke) attrs.push(`stroke="${o.stroke}"`)
  attrs.push(`color="${o.color}"`)
  return `import "ldrs/${def.register}"\n\n<${def.tag} ${attrs.join(" ")}></${def.tag}>`
}

const LoaderCell = React.memo(function LoaderCell({
  def,
  renderProps,
  optsRef,
}: {
  def: LoaderDef
  renderProps: { size: number; speed: number; stroke: number }
  optsRef: React.RefObject<Opts>
}) {
  const [copied, setCopied] = React.useState<"jsx" | "html" | null>(null)
  const Loader = def.Component

  const copy = (kind: "jsx" | "html") => {
    const text =
      kind === "jsx"
        ? reactSnippet(def, optsRef.current)
        : htmlSnippet(def, optsRef.current)
    void navigator.clipboard.writeText(text)
    setCopied(kind)
    setTimeout(() => setCopied(null), 1200)
  }

  return (
    <Popover>
      <div className="group relative flex aspect-square items-center justify-center border-b border-r border-dashed p-2 transition-colors duration-200 ease-out hover:bg-accent/40">
        <span className="pointer-events-none absolute inset-x-0 top-0 max-w-full truncate px-1 pt-0.5 text-center font-mono text-[10px] text-muted-foreground">
          {def.name}
        </span>
        <PopoverTrigger
          className="flex h-full w-full items-center justify-center outline-none"
          title={def.name}
          aria-label={def.name}
        >
          <Loader
            size={renderProps.size}
            speed={renderProps.speed}
            stroke={def.hasStroke ? renderProps.stroke : undefined}
            color="currentColor"
          />
        </PopoverTrigger>
        <div className="pointer-events-none absolute inset-x-1 bottom-1 flex gap-1 opacity-0 transition-opacity duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
          <HoverCopy
            label="JSX"
            active={copied === "jsx"}
            onClick={() => copy("jsx")}
          />
          <HoverCopy
            label="HTML"
            active={copied === "html"}
            onClick={() => copy("html")}
          />
        </div>
      </div>
      <PopoverContent
        className="w-96 space-y-2 rounded-none border-dashed"
        align="start"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center border border-dashed">
            <Loader
              size={28}
              speed={optsRef.current.speed}
              stroke={def.hasStroke ? optsRef.current.stroke : undefined}
              color="currentColor"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm">{def.name}</p>
            <p className="text-xs text-muted-foreground">
              {optsRef.current.size}px · {optsRef.current.speed}s
              {def.hasStroke ? ` · stroke ${optsRef.current.stroke}` : ""}
            </p>
          </div>
        </div>
        <CopyBlock label="React" text={reactSnippet(def, optsRef.current)} />
        <CopyBlock label="Web component" text={htmlSnippet(def, optsRef.current)} />
        <CopyBlock label="Install" text="npm i ldrs" />
      </PopoverContent>
    </Popover>
  )
})

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

function CopyBlock({ label, text }: { label: string; text: string }) {
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
      <span className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
        {copied ? (
          <Check className="h-3 w-3 text-success" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </span>
      <code className="block whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">
        {text}
      </code>
    </button>
  )
}
