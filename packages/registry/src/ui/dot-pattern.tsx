import * as React from "react"

import { cn } from "@/lib/utils"

export interface DotPatternProps extends React.ComponentProps<"svg"> {
  /** Grid spacing in px. */
  spacing?: number
  /** Dot radius in px. */
  dotRadius?: number
}

/**
 * Magic UI's DotPattern: a static SVG dot grid for section backgrounds —
 * color rides currentColor (defaults to the border token), fade it with a
 * mask-image utility. Fill a relative container; server-renderable.
 */
function DotPattern({ spacing = 16, dotRadius = 1, className, ...props }: DotPatternProps) {
  const patternId = React.useId()
  return (
    <svg
      data-slot="dot-pattern"
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
          width={spacing}
          height={spacing}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={dotRadius} cy={dotRadius} r={dotRadius} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}

export { DotPattern }
