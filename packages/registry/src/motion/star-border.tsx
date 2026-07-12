import * as React from "react"

import { cn } from "@/lib/utils"

export interface StarBorderProps extends React.ComponentProps<"div"> {
  /** Seconds per sweep; omit for the token default. */
  duration?: number
}

/**
 * React Bits' StarBorder: soft glowing "stars" sweep along the top and
 * bottom edges of a bordered container — two radial-gradient layers riding
 * the `--animate-star-border` token (pure CSS, server-renderable). Distinct
 * from border-beam (a beam orbiting the border ring) and shine-border (a
 * sheen over the border itself). motion-reduce hides the sweep.
 */
function StarBorder({ duration, className, children, ...props }: StarBorderProps) {
  const layer =
    "pointer-events-none absolute h-1/2 w-[300%] animate-star-border rounded-full opacity-70 motion-reduce:hidden"
  const glow = "radial-gradient(circle, var(--primary), transparent 12%)"
  const style = duration ? { animationDuration: `${duration}s` } : undefined
  return (
    <div
      data-slot="star-border"
      className={cn(
        "relative inline-block overflow-hidden rounded-xl border bg-card px-6 py-3",
        className
      )}
      {...props}
    >
      <span aria-hidden className={cn(layer, "bottom-[-12px] right-[-250%]")} style={{ background: glow, ...style }} />
      <span
        aria-hidden
        className={cn(layer, "top-[-12px] left-[-250%] [animation-direction:reverse]")}
        style={{ background: glow, ...style }}
      />
      <span className="relative z-10">{children}</span>
    </div>
  )
}

export { StarBorder }
