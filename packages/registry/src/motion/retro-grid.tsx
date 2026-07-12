import * as React from "react"

import { cn } from "@/lib/utils"

export interface RetroGridProps extends React.ComponentProps<"div"> {
  /** Grid cell size in px. */
  cellSize?: number
}

/**
 * Magic UI's RetroGrid: a perspective-tilted grid scrolling toward the
 * horizon, synthwave style — pure CSS (repeating linear gradients on a
 * rotated plane, driven by the `--animate-retro-grid` token) with a fade
 * mask at the horizon. Fill a relative overflow-hidden container.
 * motion-reduce parks the grid.
 */
function RetroGrid({ cellSize = 60, className, ...props }: RetroGridProps) {
  return (
    <div
      data-slot="retro-grid"
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [perspective:200px]",
        "[mask-image:linear-gradient(to_bottom,transparent,black_40%)]",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 [transform:rotateX(60deg)]">
        <div
          className={cn(
            "animate-retro-grid motion-reduce:animate-none",
            "[background-image:linear-gradient(to_right,var(--border)_1px,transparent_0),linear-gradient(to_bottom,var(--border)_1px,transparent_0)]",
            "[inset:0%_0px] [margin-left:-200%] [height:300vh] [width:600vw] [transform-origin:100%_0_0]"
          )}
          style={
            {
              backgroundSize: `${cellSize}px ${cellSize}px`,
              "--retro-grid-cell": `${cellSize}px`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  )
}

export { RetroGrid }
