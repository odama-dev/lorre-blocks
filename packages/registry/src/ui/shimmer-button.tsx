import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's ShimmerButton: a pill button with a light streak orbiting its
 * border. Pure CSS — a rotating conic gradient clipped behind an inset
 * surface (Tailwind's built-in spin keyframe, slowed). motion-reduce parks
 * the streak.
 */
function ShimmerButton({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="shimmer-button"
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-2.5 text-sm font-medium text-primary-foreground",
        "transition-transform active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {/* orbiting streak */}
      <span
        aria-hidden
        className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_70%,var(--primary-foreground)_85%,transparent_100%)] opacity-60 motion-reduce:animate-none"
      />
      {/* surface */}
      <span aria-hidden className="absolute inset-px rounded-full bg-primary" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  )
}

export { ShimmerButton }
