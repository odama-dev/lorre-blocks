import * as React from "react"

import { cn } from "@/lib/utils"

export interface MasonryProps extends React.ComponentProps<"div"> {
  /** Column count at the widest breakpoint (1–4). */
  columns?: 1 | 2 | 3 | 4
}

/**
 * React Bits' Masonry on CSS columns (upstream measures + GSAP-positions
 * every item; column flow is the platform's version of the same layout):
 * items keep their width and stack into the shortest column. Pure CSS,
 * server-renderable — pair items with fade-in for entrance animation.
 */
function Masonry({ columns = 3, className, children, ...props }: MasonryProps) {
  return (
    <div
      data-slot="masonry"
      className={cn(
        "gap-4 [column-fill:balance]",
        {
          1: "columns-1",
          2: "columns-1 sm:columns-2",
          3: "columns-1 sm:columns-2 lg:columns-3",
          4: "columns-1 sm:columns-2 lg:columns-4",
        }[columns],
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => (
        <div className="mb-4 break-inside-avoid">{child}</div>
      ))}
    </div>
  )
}

export { Masonry }
