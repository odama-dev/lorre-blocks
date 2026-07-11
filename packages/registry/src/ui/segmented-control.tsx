"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

import { cn } from "@/lib/utils"

/**
 * Radix Themes' SegmentedControl: a single-choice control for mutually
 * exclusive options (view switchers, filters) — joined segments on a muted
 * track, active segment lifted like a card. Built on the Radix ToggleGroup
 * primitive with selection always required.
 */
function SegmentedControl({
  className,
  value,
  onValueChange,
  ...props
}: Omit<
  ToggleGroupPrimitive.ToggleGroupSingleProps,
  "type" | "value" | "onValueChange"
> & {
  value?: string
  onValueChange?: (value: string) => void
}) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="segmented-control"
      type="single"
      value={value}
      onValueChange={(next) => {
        // Radix Themes semantics: one segment is always selected.
        if (next) onValueChange?.(next)
      }}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function SegmentedControlItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="segmented-control-item"
      className={cn(
        "inline-flex h-7 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none",
        "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

export { SegmentedControl, SegmentedControlItem }
