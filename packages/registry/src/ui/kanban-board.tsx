import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// CS-TEST-01 ← CMP-TEST-01 — kanban-board (kanban-card + kanban-column + board)
// Sumber: Figma § Kanban (26:2), sliced 2026-07-27, lulus gerbang binding-diff.
// state di-render statis; wiring drag-drop nyata terjadi di Coded Flow.

const kanbanCardVariants = cva(
  "flex w-70 flex-col gap-3 rounded-lg border border-border bg-card p-4",
  {
    variants: {
      state: {
        default: "",
        hover: "shadow-xs",
        // Figma mengikat garis kartu yang sedang diseret ke semantic/border-active
        // (#335CFF). Tokennya kini ada di kode, jadi tidak lagi memakai ring.
        dragging: "border-border-active opacity-95 shadow-xs",
      },
    },
    defaultVariants: { state: "default" },
  }
)

const AVATAR_TONES = ["bg-warning", "bg-success", "bg-primary"]

export interface KanbanCardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof kanbanCardVariants> {
  title: string
  description?: string
  statusLabel?: string
  assignees?: string[]
  assigneeOverflow?: number
  /** Nama perusahaan calon klien/klien — ditampilkan di baris atas kartu. */
  companyName?: string
  /** URL logo perusahaan. Opsional; bila kosong dipakai inisial (AC-002-07/08). */
  companyLogo?: string
  /** Inisial fallback. Bila kosong, diturunkan dari `companyName`. */
  companyInitials?: string
}

/** "PT Maju Jaya" → "MJ". Membuang prefiks badan usaha yang umum di Indonesia. */
function initialsFrom(name: string) {
  const words = name
    .replace(/^(PT|CV|UD|PD|Tbk)\.?\s+/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  return words.slice(0, 2).map((w) => w[0]!.toUpperCase()).join("")
}

function KanbanCard({
  className,
  state,
  title,
  description,
  statusLabel,
  assignees = [],
  assigneeOverflow = 0,
  companyName,
  companyLogo,
  companyInitials,
  ...props
}: KanbanCardProps) {
  return (
    <div className={cn(kanbanCardVariants({ state }), className)} {...props}>
      {companyName && (
        <div className="flex w-full items-center gap-2.5">
          <Avatar className="size-5 shrink-0 bg-muted">
            {companyLogo && <AvatarImage src={companyLogo} alt={companyName} />}
            <AvatarFallback className="bg-muted text-[9px] text-muted-foreground">
              {companyInitials ?? initialsFrom(companyName)}
            </AvatarFallback>
          </Avatar>
          <p className="min-w-0 flex-1 truncate text-[13px] text-card-foreground">
            {companyName}
          </p>
        </div>
      )}
      <div className="flex w-full flex-col gap-2">
        <p className="w-full truncate text-sm font-medium text-card-foreground">
          {title}
        </p>
        {description && (
          <p className="line-clamp-3 w-full text-[13px] text-neutral-8">
            {description}
          </p>
        )}
      </div>
      <div className="flex w-full items-center justify-between">
        {statusLabel && (
          <Badge
            variant="success"
            className="gap-1 bg-success-2 font-medium text-success-11"
          >
            <span className="size-1.5 rounded-full bg-success-9" />
            {statusLabel}
          </Badge>
        )}
        {(assignees.length > 0 || assigneeOverflow > 0) && (
          <div className="flex -space-x-2">
            {assignees.map((initials, i) => (
              <Avatar key={i} className="size-6 ring-2 ring-card">
                <AvatarFallback
                  className={cn(
                    "text-xs font-medium text-white", // putih literal: disengaja (kandidat token avatar-foreground)
                    AVATAR_TONES[i % AVATAR_TONES.length]
                  )}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {assigneeOverflow > 0 && (
              <div className="z-10 flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-card">
                +{assigneeOverflow}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const kanbanColumnVariants = cva("flex w-80 flex-col gap-2 rounded-lg p-3", {
  variants: {
    state: {
      default: "bg-secondary",
      empty: "bg-muted",
      "dragging-over": "border border-ring bg-muted",
    },
  },
  defaultVariants: { state: "default" },
})

export interface KanbanColumnProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof kanbanColumnVariants> {
  title: string
  count?: number
  /** override body (mis. `overflow-visible` selama drag agar card tidak terpotong) */
  bodyClassName?: string
}

function KanbanColumn({
  className,
  state,
  title,
  count = 0,
  bodyClassName,
  children,
  ...props
}: KanbanColumnProps) {
  return (
    <div className={cn(kanbanColumnVariants({ state }), className)} {...props}>
      <div className="flex w-full shrink-0 items-center gap-2 p-1">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-muted-foreground">
          {title}
        </p>
        <Badge
          variant="secondary"
          className="rounded-md bg-background px-2.5 py-0.5 text-secondary-foreground"
        >
          {count}
        </Badge>
      </div>
      <div
        className={cn(
          "flex min-h-0 w-full flex-1 flex-col gap-2 overflow-y-auto",
          bodyClassName
        )}
      >
        {state === "empty" ? (
          <div className="h-24 w-full shrink-0 rounded-lg border border-dashed border-border" />
        ) : (
          children
        )}
      </div>
    </div>
  )
}

// Ghost slot yang menandai posisi drop (update Figma 2026-07-27:
// menggantikan drop-indicator garis). Tinggi diatur pemakai (ikuti card yang di-drag).
function KanbanCardGhost({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "w-full shrink-0 rounded-lg border border-border bg-neutral-3",
        className
      )}
      {...props}
    />
  )
}

export interface KanbanBoardProps extends React.ComponentProps<"div"> {
  emptyLabel?: string
}

function KanbanBoard({
  className,
  emptyLabel = "Belum ada kolom",
  children,
  ...props
}: KanbanBoardProps) {
  const isEmpty = React.Children.count(children) === 0
  return (
    <div
      className={cn(
        "flex w-full gap-4 overflow-x-auto rounded-xl border border-border bg-background p-4",
        isEmpty && "min-h-48 items-center justify-center",
        className
      )}
      {...props}
    >
      {isEmpty ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        children
      )}
    </div>
  )
}

export {
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  KanbanCardGhost,
  kanbanCardVariants,
  kanbanColumnVariants,
}
