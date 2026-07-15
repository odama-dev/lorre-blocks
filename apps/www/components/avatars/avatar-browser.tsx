"use client"

import * as React from "react"
import {
  Check,
  Copy,
  Download,
  ImagePlus,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react"

import { cn } from "@lorre-blocks/registry/lib/utils"
import { Button } from "@lorre-blocks/registry/ui/button"
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
import {
  buildAvatarSvg,
  downloadBlob,
  photoDataUri,
  SAMPLE_SEEDS,
  svgToPngBlob,
  type AvatarBg,
  type AvatarShape,
  type AvatarStyle,
} from "@www/components/avatars/avatar-lib"

const STYLES: AvatarStyle[] = ["photo", "person", "gradient", "geometric", "rings", "initials"]
const SHAPES: AvatarShape[] = ["circle", "rounded", "square"]
const DEFAULTS = { style: "photo" as AvatarStyle, bg: "neutral" as AvatarBg, shape: "circle" as AvatarShape, size: 64 }

async function copyPng(svg: string, fallbackName: string) {
  const blob = await svgToPngBlob(svg, 256)
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ])
  } catch {
    downloadBlob(blob, `${fallbackName}.png`)
  }
}

/**
 * Generated avatars (seeded SVG) with an upload path. Tune style, background
 * (neutral / transparent), shape and size, then copy each as SVG or PNG or
 * download it — or drop in your own image and frame it the same way.
 */
export function AvatarBrowser() {
  const [style, setStyle] = React.useState<AvatarStyle>(DEFAULTS.style)
  const [bg, setBg] = React.useState<AvatarBg>(DEFAULTS.bg)
  const [shape, setShape] = React.useState<AvatarShape>(DEFAULTS.shape)
  const [size, setSize] = React.useState(DEFAULTS.size)
  const [upload, setUpload] = React.useState<string | null>(null)

  const opts = { style, bg, shape, size }

  const onUpload = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setUpload(String(reader.result))
    reader.readAsDataURL(file)
  }

  const reset = () => {
    setStyle(DEFAULTS.style)
    setBg(DEFAULTS.bg)
    setShape(DEFAULTS.shape)
    setSize(DEFAULTS.size)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar — upload up front, appearance in a popover */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="cursor-pointer gap-2 rounded-none border-dashed"
        >
          <label>
            <ImagePlus className="h-4 w-4" />
            Upload image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
          </label>
        </Button>

        <span className="text-xs text-muted-foreground">
          Generated placeholders on Lorre tokens · your image never leaves the
          browser
        </span>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-2 rounded-none border-dashed"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Customize
              <span className="font-mono text-[10px] capitalize text-muted-foreground">
                {style}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-72 space-y-4 rounded-none border-dashed"
          >
            <Field label="Style">
              <ToggleGroup
                type="single"
                value={style}
                onValueChange={(v) => v && setStyle(v as AvatarStyle)}
                className="flex-wrap justify-start gap-1"
              >
                {STYLES.map((s) => (
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
            <Field label="Background">
              <ToggleGroup
                type="single"
                value={bg}
                onValueChange={(v) => v && setBg(v as AvatarBg)}
                className="justify-start gap-1"
              >
                {(["neutral", "transparent"] as AvatarBg[]).map((b) => (
                  <ToggleGroupItem
                    key={b}
                    value={b}
                    size="sm"
                    variant="outline"
                    className="rounded-none border-dashed text-xs capitalize data-[state=on]:border-solid"
                  >
                    {b}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
            <Field label="Shape">
              <ToggleGroup
                type="single"
                value={shape}
                onValueChange={(v) => v && setShape(v as AvatarShape)}
                className="justify-start gap-1"
              >
                {SHAPES.map((s) => (
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
            <Field label={`Size — ${size}px`}>
              <Slider
                value={[size]}
                min={40}
                max={96}
                step={4}
                onValueChange={([v]) => setSize(v)}
                className="w-full"
              />
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

      {/* Uploaded avatar */}
      {upload && (
        <div className="flex items-center gap-4 border border-dashed bg-muted/20 p-4">
          <span
            className="shrink-0"
            style={{ width: size, height: size }}
            dangerouslySetInnerHTML={{
              __html: buildAvatarSvg({ ...opts, imageHref: upload }),
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Your image</p>
            <p className="text-xs text-muted-foreground">
              Framed as {shape} · {size}px — export it below
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-none border-dashed text-xs"
              onClick={() =>
                copyPng(
                  buildAvatarSvg({ ...opts, imageHref: upload, size: 256 }),
                  "avatar"
                )
              }
            >
              <Copy className="h-3 w-3" /> Copy PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-none border-dashed text-xs"
              onClick={async () =>
                downloadBlob(
                  await svgToPngBlob(
                    buildAvatarSvg({ ...opts, imageHref: upload, size: 256 }),
                    256
                  ),
                  "avatar.png"
                )
              }
            >
              <Download className="h-3 w-3" /> Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove image"
              className="h-8 w-8 rounded-none"
              onClick={() => setUpload(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {SAMPLE_SEEDS.length} sample avatars · deterministic from the name
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] border-l border-t border-dashed">
        {SAMPLE_SEEDS.map((seed) => (
          <AvatarCell key={seed} seed={seed} opts={opts} />
        ))}
      </div>
    </div>
  )
}

function AvatarCell({
  seed,
  opts,
}: {
  seed: string
  opts: { style: AvatarStyle; bg: AvatarBg; shape: AvatarShape; size: number }
}) {
  const [copied, setCopied] = React.useState<"svg" | "png" | null>(null)
  const slug = seed.toLowerCase().replace(/\s+/g, "-")

  // Photo avatars load their portrait through the proxy as a data URI, so the
  // rest of the pipeline (framing, copy, PNG export) stays self-contained.
  const isPhoto = opts.style === "photo"
  const [photoUri, setPhotoUri] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!isPhoto) return
    let alive = true
    setPhotoUri(null)
    photoDataUri(seed).then(
      (uri) => alive && setPhotoUri(uri),
      () => {}
    )
    return () => {
      alive = false
    }
  }, [isPhoto, seed])

  const imageHref = isPhoto ? photoUri ?? undefined : undefined
  const ready = !isPhoto || photoUri !== null
  const display = ready ? buildAvatarSvg({ ...opts, seed, imageHref }) : ""
  const exportSvg = () => buildAvatarSvg({ ...opts, seed, imageHref, size: 256 })

  const flash = (k: "svg" | "png") => {
    setCopied(k)
    setTimeout(() => setCopied(null), 1200)
  }
  const doCopy = (k: "svg" | "png") => {
    if (!ready) return
    if (k === "svg") {
      void navigator.clipboard.writeText(exportSvg())
    } else {
      void copyPng(exportSvg(), slug)
    }
    flash(k)
  }

  return (
    <Popover>
      <div className="group relative flex aspect-square items-center justify-center border-b border-r border-dashed transition-colors duration-200 ease-out hover:bg-accent/40">
        <span className="pointer-events-none absolute inset-x-0 top-0 truncate px-1 pt-0.5 text-center font-mono text-[9px] text-muted-foreground opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
          {seed}
        </span>
        <PopoverTrigger
          className="flex h-full w-full items-center justify-center outline-none"
          title={seed}
          aria-label={seed}
        >
          {ready ? (
            <span
              style={{ width: opts.size, height: opts.size }}
              dangerouslySetInnerHTML={{ __html: display }}
            />
          ) : (
            <span
              className={cn(
                "animate-pulse bg-muted",
                opts.shape === "circle"
                  ? "rounded-full"
                  : opts.shape === "rounded"
                    ? "rounded-lg"
                    : ""
              )}
              style={{ width: opts.size, height: opts.size }}
            />
          )}
        </PopoverTrigger>
        <div className="pointer-events-none absolute inset-x-1 bottom-1 flex gap-1 opacity-0 transition-opacity duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
          <HoverCopy
            label="PNG"
            active={copied === "png"}
            onClick={() => doCopy("png")}
          />
          <HoverCopy
            label="SVG"
            active={copied === "svg"}
            onClick={() => doCopy("svg")}
          />
        </div>
      </div>
      <PopoverContent
        className="w-72 space-y-2 rounded-none border-dashed"
        align="start"
      >
        <div className="flex items-center gap-3">
          <span
            className="shrink-0"
            style={{ width: 44, height: 44 }}
            dangerouslySetInnerHTML={{
              __html: buildAvatarSvg({ ...opts, seed, imageHref, size: 44 }),
            }}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{seed}</p>
            <p className="text-xs capitalize text-muted-foreground">
              {opts.style} · {opts.shape} · {opts.size}px
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-none border-dashed text-xs"
            onClick={() => doCopy("svg")}
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
            onClick={() => doCopy("png")}
          >
            {copied === "png" ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            Copy PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-none border-dashed text-xs"
            onClick={() =>
              downloadBlob(
                new Blob([exportSvg()], { type: "image/svg+xml" }),
                `${slug}.svg`
              )
            }
          >
            <Download className="h-3 w-3" /> SVG
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-none border-dashed text-xs"
            onClick={async () =>
              downloadBlob(await svgToPngBlob(exportSvg(), 256), `${slug}.png`)
            }
          >
            <Download className="h-3 w-3" /> PNG
          </Button>
        </div>
      </PopoverContent>
    </Popover>
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
