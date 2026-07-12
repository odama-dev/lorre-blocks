import * as React from "react"

import { cn } from "@/lib/utils"

export type AuroraProps = React.ComponentProps<"div">

/**
 * React Bits' Aurora as a CSS approximation (upstream is an OGL shader —
 * WebGL gated out per the Phase 6 dependency policy): blurred accent-scale
 * blobs wander behind the content via the `--animate-aurora` token, each on
 * its own duration/delay. Fill a relative overflow-hidden container.
 * motion-reduce parks the blobs — still a nice static wash.
 */
function Aurora({ className, ...props }: AuroraProps) {
  const blob =
    "absolute rounded-full blur-3xl animate-aurora motion-reduce:animate-none"
  return (
    <div
      data-slot="aurora"
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      {...props}
    >
      <span
        className={cn(blob, "left-[-10%] top-[-20%] h-3/4 w-3/5 bg-accent-6/60")}
      />
      <span
        className={cn(blob, "right-[-15%] top-[-10%] h-2/3 w-1/2 bg-accent-8/40 [animation-duration:14s] [animation-delay:-4s]")}
      />
      <span
        className={cn(blob, "bottom-[-25%] left-[20%] h-3/4 w-3/5 bg-accent-4/50 [animation-duration:18s] [animation-delay:-9s]")}
      />
    </div>
  )
}

export { Aurora }
