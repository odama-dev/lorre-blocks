import * as React from "react"

import { cn } from "@/lib/utils"

export type ShimmerProps = React.ComponentProps<"span">

/**
 * Text with a highlight that sweeps through it, driven by the
 * `--animate-shimmer` token. Pure CSS: a moving gradient clipped to the text;
 * `motion-reduce` freezes it to plain muted text. Use for loading labels or
 * subtle emphasis ("AI is thinking…").
 */
function Shimmer({ className, children, ...props }: ShimmerProps) {
  return (
    <span
      data-slot="shimmer"
      className={cn(
        "inline-block bg-clip-text text-transparent",
        "bg-[linear-gradient(110deg,var(--muted-foreground)_40%,var(--foreground)_50%,var(--muted-foreground)_60%)]",
        "bg-[length:200%_100%] animate-shimmer",
        "motion-reduce:animate-none motion-reduce:bg-none motion-reduce:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Shimmer }
