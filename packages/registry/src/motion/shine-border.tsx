import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's ShineBorder: an animated shine sweeping around any container's
 * border. Pure CSS — a moving gradient confined to the border ring via
 * mask-composite, riding the shared shimmer keyframe. Wrap it around a card
 * or section; content is untouched. motion-reduce parks the shine as a
 * static tinted border.
 */
function ShineBorder({
  className,
  borderWidth = 1,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** Border thickness in px. */
  borderWidth?: number
}) {
  return (
    <div
      data-slot="shine-border"
      className={cn("relative rounded-xl", className)}
      style={{ "--border-width": `${borderWidth}px` } as React.CSSProperties}
      {...props}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] p-(--border-width)",
          "bg-[linear-gradient(110deg,transparent_25%,var(--primary)_50%,transparent_75%)] bg-[length:250%_250%]",
          "animate-shimmer motion-reduce:animate-none",
          "[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
          "[mask-composite:exclude]"
        )}
      />
      {children}
    </div>
  )
}

export { ShineBorder }
