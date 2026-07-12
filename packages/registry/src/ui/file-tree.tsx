"use client"

import * as React from "react"
import { ChevronRightIcon, FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's FileTree: a collapsible file explorer for docs and hero
 * mockups. Compose declaratively with `Tree` → `Folder` → `File`; folders
 * toggle open state locally (no context, no external state). Keyboard and
 * screen-reader basics via native <button> + aria-expanded.
 */
function Tree({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tree"
      role="tree"
      className={cn("w-full max-w-xs select-none rounded-lg border bg-card p-2 text-sm", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export interface FolderProps extends React.ComponentProps<"div"> {
  /** The folder label. */
  element: string
  defaultOpen?: boolean
}

function Folder({ element, defaultOpen = false, className, children, ...props }: FolderProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div data-slot="folder" role="treeitem" aria-expanded={open} className={className} {...props}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronRightIcon
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
            open && "rotate-90"
          )}
        />
        {open ? (
          <FolderOpenIcon className="size-4 shrink-0 text-primary" />
        ) : (
          <FolderIcon className="size-4 shrink-0 text-primary" />
        )}
        <span className="truncate">{element}</span>
      </button>
      {open && (
        <div role="group" className="ml-3.5 border-l pl-2.5">
          {children}
        </div>
      )}
    </div>
  )
}

export interface FileProps extends React.ComponentProps<"button"> {
  /** Highlight as the active file. */
  selected?: boolean
}

function File({ selected = false, className, children, ...props }: FileProps) {
  return (
    <button
      type="button"
      data-slot="file"
      role="treeitem"
      aria-selected={selected}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-md px-2 py-1 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    >
      <FileIcon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{children}</span>
    </button>
  )
}

export { Tree, Folder, File }
