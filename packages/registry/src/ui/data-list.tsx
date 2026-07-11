import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Radix Themes' DataList: label/value metadata pairs (order details, user
 * profiles, API records) as a semantic <dl>. Horizontal by default, stacks
 * with orientation="vertical".
 */
function DataList({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"dl"> & {
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <dl
      data-slot="data-list"
      data-orientation={orientation}
      className={cn(
        "group/data-list flex flex-col gap-3 text-sm",
        className
      )}
      {...props}
    />
  )
}

function DataListItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-list-item"
      className={cn(
        "flex gap-2 group-data-[orientation=horizontal]/data-list:items-baseline group-data-[orientation=vertical]/data-list:flex-col group-data-[orientation=vertical]/data-list:gap-1",
        className
      )}
      {...props}
    />
  )
}

function DataListLabel({ className, ...props }: React.ComponentProps<"dt">) {
  return (
    <dt
      data-slot="data-list-label"
      className={cn(
        "text-muted-foreground group-data-[orientation=horizontal]/data-list:w-32 group-data-[orientation=horizontal]/data-list:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function DataListValue({ className, ...props }: React.ComponentProps<"dd">) {
  return (
    <dd
      data-slot="data-list-value"
      className={cn("m-0 min-w-0 text-foreground", className)}
      {...props}
    />
  )
}

export { DataList, DataListItem, DataListLabel, DataListValue }
