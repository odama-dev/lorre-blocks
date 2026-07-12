import * as React from "react"

import { cn } from "@/lib/utils"

export type AuroraTextProps = React.ComponentProps<"span">

/**
 * Magic UI's AuroraText: text filled with a drifting multi-stop aurora
 * built from the theme's accent scale, plus a blurred glow copy behind it.
 * Rides the existing `--animate-gradient` token — pure CSS. motion-reduce
 * parks the aurora still; it stays legible, it just stops moving.
 * (Distinct from `animated-gradient`: that one is a simple two-stop drift,
 * this adds the multi-hue spread and the glow.)
 */
function AuroraText({ className, children, ...props }: AuroraTextProps) {
  const aurora = cn(
    "bg-clip-text text-transparent",
    "bg-[linear-gradient(135deg,var(--primary),var(--accent-7),var(--accent-10),var(--accent-8),var(--primary))]",
    "bg-[length:300%_100%] animate-gradient motion-reduce:animate-none"
  )
  return (
    <span
      data-slot="aurora-text"
      className={cn("relative inline-block", className)}
      {...props}
    >
      <span aria-hidden className={cn("absolute inset-0 blur-lg opacity-60 select-none", aurora)}>
        {children}
      </span>
      <span className={cn("relative", aurora)}>{children}</span>
    </span>
  )
}

export { AuroraText }
