"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@lorre-blocks/registry/lib/utils"
import { useIcons } from "@www/components/icons/icons-context"

/**
 * Category filter that lives in the global Resources sidebar (below "Build"),
 * so the icons page keeps a single sidebar. Collapsible because the list is
 * long, and it scrolls within its own area when open.
 */
export function IconCategoryNav() {
  const { categories, category, setCategory, loading } = useIcons()
  const [open, setOpen] = React.useState(true)

  return (
    <div className="mt-6 border-t border-dashed pt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mb-2 flex w-full items-center gap-1.5 px-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight
          className={cn("h-3 w-3 transition-transform", open && "rotate-90")}
        />
        Categories
        {category !== "All" && (
          <span className="ml-auto max-w-[7rem] truncate font-sans text-[10px] normal-case tracking-normal text-foreground">
            {category}
          </span>
        )}
      </button>
      {open && (
        <div className="max-h-[calc(100vh-16rem)] space-y-0.5 overflow-y-auto pr-1">
          {loading ? (
            <p className="px-2 py-1 text-xs text-muted-foreground">Loading…</p>
          ) : (
            categories.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setCategory(c.label)}
                className={cn(
                  "flex w-full items-center gap-2 border border-dashed border-transparent px-2 py-1 text-left text-sm transition-colors",
                  category === c.label
                    ? "border-border bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:border-border/60 hover:text-foreground"
                )}
              >
                <span className="truncate">{c.label}</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {c.count}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
