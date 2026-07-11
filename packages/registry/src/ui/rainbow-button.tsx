import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's RainbowButton on Lorre colors: the "rainbow" is built from the
 * theme's own accent/success/warning/danger scales, so it re-themes instead
 * of hardcoding hues. The sliding gradient rides the shared gradient
 * keyframe; a blurred copy underneath provides the glow. motion-reduce parks
 * the slide.
 */
function RainbowButton({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const gradient =
    "bg-[linear-gradient(90deg,var(--accent-9),var(--success-9),var(--warning-9),var(--danger-9),var(--accent-9))] bg-[length:200%_100%] animate-gradient motion-reduce:animate-none"
  return (
    <button
      data-slot="rainbow-button"
      className={cn(
        "group relative inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium",
        "transition-transform active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {/* glow */}
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-1 left-1/2 h-1/3 w-4/5 -translate-x-1/2 blur-md",
          gradient
        )}
      />
      {/* animated border */}
      <span aria-hidden className={cn("absolute inset-0 rounded-lg", gradient)} />
      {/* surface */}
      <span aria-hidden className="absolute inset-[2px] rounded-[calc(var(--radius-lg)-2px)] bg-background" />
      <span className="relative z-10 flex items-center gap-2 text-foreground">
        {children}
      </span>
    </button>
  )
}

export { RainbowButton }
