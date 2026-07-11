import * as React from "react"

import { cn } from "@/lib/utils"

export type AnimatedGradientProps = React.ComponentProps<"span">

/**
 * Text filled with a slowly drifting gradient built from the theme's accent
 * scale (`--primary` → `--accent-8`), driven by the `--animate-gradient`
 * token. Pure CSS; `motion-reduce` parks the gradient still (it stays
 * legible, it just stops moving). Re-themes automatically — dreamy drifts
 * violet, utilitarian stays monochrome.
 */
function AnimatedGradient({ className, children, ...props }: AnimatedGradientProps) {
  return (
    <span
      data-slot="animated-gradient"
      className={cn(
        "inline-block bg-clip-text text-transparent",
        "bg-[linear-gradient(90deg,var(--primary),var(--accent-8),var(--primary))]",
        "bg-[length:200%_100%] animate-gradient motion-reduce:animate-none",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { AnimatedGradient }
