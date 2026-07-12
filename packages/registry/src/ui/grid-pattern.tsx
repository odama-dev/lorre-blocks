import * as React from "react"

import { cn } from "@/lib/utils"

export interface GridPatternProps extends React.ComponentProps<"svg"> {
  /** Cell size in px. */
  cellSize?: number
  /** Stroke width in px. */
  strokeWidth?: number
}

/**
 * Magic UI's GridPattern: a static SVG line grid for section backgrounds —
 * color rides currentColor (defaults to the border token), fade it with a
 * mask-image utility. Fill a relative container; server-renderable.
 */
function GridPattern({ cellSize = 40, strokeWidth = 1, className, ...props }: GridPatternProps) {
  const patternId = React.useId()
  return (
    <svg
      data-slot="grid-pattern"
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 size-full text-border",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={patternId}
          width={cellSize}
          height={cellSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}

export { GridPattern }
