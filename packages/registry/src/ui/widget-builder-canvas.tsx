"use client"

import * as React from "react"
import GridLayout, {
  useContainerWidth,
  type LayoutItem,
} from "react-grid-layout"
import { DotsGrid, DotsVertical, Plus, Copy01, Trash01 } from "@untitledui/icons"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

/**
 * CS-112 ← CMP-112 (BR-022) — Widget Builder Canvas
 *
 * Sumber: AC-022-02, D-022-01. Menyusun dashboard: tarik widget ke kanvas,
 * atur posisi dan ukuran pada grid.
 * Library terkunci: react-grid-layout v2.2.3 (DL-DS-007).
 *
 * Di luar cakupan (spec §9): konfigurasi isi widget (CS-113), daftar dashboard
 * (CS-111), share (CS-114), filter tanggal (CS-115), kolaborasi realtime,
 * undo/redo multi-langkah, kanvas free-form tanpa grid.
 *
 * ⚠️ react-grid-layout TIDAK punya dukungan keyboard (spec §10). Alternatif
 * keyboard di §5 dibangun di sini: widget fokusable, panah = geser,
 * Shift+panah = ubah ukuran.
 */

export type WidgetItem = {
  i: string
  title: string
  x: number
  y: number
  w: number
  h: number
  /** Isi ringkas widget. Konten sebenarnya dirender CS-113 (spec §9); ini
      hanya nilai contoh agar preview sesuai Figma. */
  value?: string
  caption?: string
}

export type WidgetPlacement = { x: number; y: number; w: number; h: number }

export type WidgetBuilderCanvasProps = {
  widgets: WidgetItem[]
  onLayoutChange?: (widgets: WidgetItem[]) => void
  sources?: string[]
  /** `placement` terisi bila widget dijatuhkan ke petak tertentu; kosong bila ditambah lewat klik/keyboard. */
  onAddWidget?: (source: string, placement?: WidgetPlacement) => void
  onDuplicateWidget?: (id: string) => void
  onRemoveWidget?: (id: string) => void
  cols?: number
  rowHeight?: number
  /** Override lebar. Kosongkan agar mengukur kontainer sendiri. */
  width?: number
  className?: string
}

const DEFAULT_SOURCES = ["Metric Card", "Chart", "Table"]

function WidgetFrame({
  item,
  focused,
  onFocus,
  onKeyDown,
  onDuplicate,
  onRemove,
}: {
  item: WidgetItem
  focused: boolean
  onFocus: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onDuplicate?: () => void
  onRemove?: () => void
}) {
  return (
    <div
      data-slot="widget"
      tabIndex={0}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      aria-label={`Widget ${item.title}. Panah untuk geser, Shift+panah untuk ubah ukuran.`}
      className={cn(
        "flex h-full w-full flex-col gap-2.5 rounded-(--radius-md) border border-border bg-card p-3",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        focused && "ring-1 ring-ring"
      )}
    >
      <div className="flex items-center gap-2">
        {/* Handle drag — selector `.drag-handle` dipakai react-grid-layout.
            Target sentuh dibuat 24px; ikon 12px saja terlalu kecil untuk digenggam. */}
        <span
          className="drag-handle -m-1 inline-flex size-6 cursor-grab items-center justify-center rounded-(--button-radius) text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing"
          aria-hidden
        >
          <DotsGrid className="size-3.5" />
        </span>
        <span className="truncate text-xs font-medium text-foreground">
          {item.title}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Menu ${item.title}`}
              // Cegah pointerdown menembus ke handler drag react-grid-layout
              onPointerDown={(e) => e.stopPropagation()}
              className="-m-1 ml-auto inline-flex size-6 items-center justify-center rounded-(--button-radius) text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <DotsVertical className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          {/* Gaya menu mengikuti node Figma `ContextMenu` 17:32 — inilah gaya
              menu rumah untuk seluruh design system. Beda dari default registry:
              radius `radius/lg` (bukan md), teks 13px (bukan 14px),
              shadow `lorre/odama/shadow-sm` (bukan shadow-lg).
              ⚠️ 13px & 11px belum punya text-style token — kandidat token baru,
              lihat catatan tipografi di decision log. */}
          <DropdownMenuContent
            align="end"
            className="w-[180px] rounded-(--radius-lg) border-border bg-popover p-1 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.04),0px_6px_7px_-11px_rgba(0,0,0,0.03)]"
          >
            <DropdownMenuItem
              onSelect={() => onDuplicate?.()}
              className="justify-between rounded-(--radius-sm) px-2 py-1.5 text-[13px] text-foreground focus:bg-[var(--surface-1)] focus:text-accent-foreground"
            >
              <span className="flex items-center gap-2">
                <Copy01 />
                Duplikat
              </span>
              <span className="text-[11px] text-muted-foreground">⌘D</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onRemove?.()}
              className="justify-between rounded-(--radius-sm) px-2 py-1.5 text-[13px] text-destructive focus:bg-[var(--surface-1)] focus:text-destructive"
            >
              <span className="flex items-center gap-2">
                <Trash01 />
                Hapus
              </span>
              <span className="text-[11px] text-muted-foreground">⌫</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Slot isi — CS-113 yang mengisi sebenarnya (spec §9). Nilai contoh
          ditampilkan agar sesuai Figma. */}
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-1 rounded-(--radius-md) bg-muted p-3">
        {item.value && (
          <span className="text-[22px] font-medium leading-tight text-foreground">
            {item.value}
          </span>
        )}
        {item.caption && (
          <span className="text-[11px] text-muted-foreground">{item.caption}</span>
        )}
      </div>
    </div>
  )
}

function WidgetBuilderCanvas({
  widgets,
  onLayoutChange,
  sources = DEFAULT_SOURCES,
  onAddWidget,
  onDuplicateWidget,
  onRemoveWidget,
  cols = 12,
  rowHeight = 48,
  width,
  className,
}: WidgetBuilderCanvasProps) {
  const [focused, setFocused] = React.useState<string | null>(null)
  const [dragSource, setDragSource] = React.useState<string | null>(null)
  // Lebar WAJIB diukur dari kontainer. Nilai tetap membuat widget diposisikan
  // absolut di luar kanvas saat kontainernya lebih sempit.
  const { width: measured, mounted, containerRef } = useContainerWidth()
  const gridWidth = width ?? measured

  const apply = React.useCallback(
    (next: readonly LayoutItem[]) => {
      onLayoutChange?.(
        widgets.map((wgt) => {
          const l = next.find((n) => n.i === wgt.i)
          return l ? { ...wgt, x: l.x, y: l.y, w: l.w, h: l.h } : wgt
        })
      )
    },
    [onLayoutChange, widgets]
  )

  // Alternatif keyboard — react-grid-layout tidak menyediakannya (spec §10)
  const onKeyDown = React.useCallback(
    (id: string) => (e: React.KeyboardEvent) => {
      const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
      if (!keys.includes(e.key)) return
      e.preventDefault()
      onLayoutChange?.(
        widgets.map((wgt) => {
          if (wgt.i !== id) return wgt
          if (e.shiftKey) {
            if (e.key === "ArrowRight") return { ...wgt, w: Math.min(cols - wgt.x, wgt.w + 1) }
            if (e.key === "ArrowLeft") return { ...wgt, w: Math.max(1, wgt.w - 1) }
            if (e.key === "ArrowDown") return { ...wgt, h: wgt.h + 1 }
            if (e.key === "ArrowUp") return { ...wgt, h: Math.max(1, wgt.h - 1) }
            return wgt
          }
          if (e.key === "ArrowRight") return { ...wgt, x: Math.min(cols - wgt.w, wgt.x + 1) }
          if (e.key === "ArrowLeft") return { ...wgt, x: Math.max(0, wgt.x - 1) }
          if (e.key === "ArrowDown") return { ...wgt, y: wgt.y + 1 }
          if (e.key === "ArrowUp") return { ...wgt, y: Math.max(0, wgt.y - 1) }
          return wgt
        })
      )
    },
    [cols, onLayoutChange, widgets]
  )

  return (
    <div
      data-slot="widget-builder-canvas"
      data-state={widgets.length ? "default" : "empty"}
      className={cn("flex w-full gap-4 rounded-(--radius-lg) border border-border bg-card p-4", className)}
    >
      {/* panel sumber widget — bisa DITARIK ke kanvas (spec §5) maupun diklik
          (jalur keyboard; drag saja tidak dapat diakses keyboard) */}
      <div data-slot="source-panel" className="flex w-[180px] shrink-0 flex-col gap-2 rounded-(--radius-md) bg-muted p-3">
        <span className="text-xs font-medium text-muted-foreground">Widget</span>
        {sources.map((s) => (
          <button
            key={s}
            type="button"
            draggable
            onDragStart={(e) => {
              setDragSource(s)
              // Payload wajib diisi, kalau tidak Firefox membatalkan drag.
              e.dataTransfer.setData("text/plain", s)
              e.dataTransfer.effectAllowed = "copy"
            }}
            onDragEnd={() => setDragSource(null)}
            onClick={() => onAddWidget?.(s)}
            aria-label={`Tambah widget ${s}. Bisa ditarik ke kanvas atau tekan Enter.`}
            className={cn(
              "flex cursor-grab items-center gap-2.5 rounded-(--radius-md) border border-border bg-card px-3 py-2.5 text-left text-[13px] text-foreground transition-colors",
              "hover:border-primary active:cursor-grabbing",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              dragSource === s && "border-primary opacity-60"
            )}
          >
            <DotsGrid className="size-4 text-muted-foreground" />
            {s}
          </button>
        ))}
      </div>

      {/* kanvas */}
      <div
        ref={containerRef}
        data-slot="canvas"
        className={cn(
          "relative min-h-64 min-w-0 flex-1 overflow-hidden rounded-(--radius-md) border border-dashed border-border bg-background p-4 transition-colors",
          dragSource && "border-primary bg-accent/40"
        )}
      >
        {/* GridLayout SELALU dirender — termasuk saat kosong — supaya kanvas
            kosong tetap bisa menerima drop. Pesan ajakan ditumpuk di atasnya. */}
        {widgets.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 py-8">
            <Plus className="size-6 text-muted-foreground" />
            <span className="text-[13px] text-muted-foreground">
              Tarik widget ke sini untuk mulai
            </span>
          </div>
        )}
        {mounted || width ? (
          // API v2: cols/rowHeight/margin masuk `gridConfig`, handle drag masuk
          // `dragConfig` — berbeda dari v1 yang memakai prop datar.
          <GridLayout
            className="min-h-56 [&_.react-grid-placeholder]:!bg-primary/20 [&_.react-grid-placeholder]:rounded-(--radius-md)"
            layout={widgets.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }))}
            width={gridWidth}
            gridConfig={{ cols, rowHeight, margin: [12, 12] }}
            dragConfig={{ handle: ".drag-handle" }}
            dropConfig={{ enabled: true, defaultItem: { w: 4, h: 3 } }}
            droppingItem={{ i: "__dropping__", x: 0, y: 0, w: 4, h: 3 }}
            onDrop={(_layout, item) => {
              if (!dragSource) return
              onAddWidget?.(
                dragSource,
                item ? { x: item.x, y: item.y, w: item.w, h: item.h } : undefined
              )
              setDragSource(null)
            }}
            onLayoutChange={apply}
          >
            {widgets.map((wgt) => (
              <div key={wgt.i}>
                <WidgetFrame
                  item={wgt}
                  focused={focused === wgt.i}
                  onFocus={() => setFocused(wgt.i)}
                  onKeyDown={onKeyDown(wgt.i)}
                  onDuplicate={() => onDuplicateWidget?.(wgt.i)}
                  onRemove={() => onRemoveWidget?.(wgt.i)}
                />
              </div>
            ))}
          </GridLayout>
        ) : null}
      </div>
    </div>
  )
}

export { WidgetBuilderCanvas }
