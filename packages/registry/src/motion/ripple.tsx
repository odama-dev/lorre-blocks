import * as React from "react"

import { cn } from "@/lib/utils"

export interface RippleProps extends React.ComponentProps<"div"> {
  /** Concentric circles. */
  circleCount?: number
  /** Innermost circle diameter in px. */
  baseSize?: number
  /** Diameter step between circles in px. */
  sizeStep?: number
}

/**
 * Magic UI's Ripple: calm concentric circles pulsing outward from the
 * center — pure CSS via the `--animate-ripple-wave` token, staggered per
 * ring, border color from the theme. Fill a relative container (put your
 * CTA on top). motion-reduce parks the rings at rest opacity.
 */
function Ripple({
  circleCount = 6,
  baseSize = 120,
  sizeStep = 70,
  className,
  ...props
}: RippleProps) {
  return (
    <div
      data-slot="ripple"
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      {...props}
    >
      {Array.from({ length: circleCount }).map((_, index) => {
        const size = baseSize + index * sizeStep
        return (
          <span
            key={index}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30 bg-primary/5 animate-ripple-wave motion-reduce:animate-none"
            style={{
              width: size,
              height: size,
              animationDelay: `${index * 0.24}s`,
              opacity: 0.28 - index * 0.03,
            }}
          />
        )
      })}
    </div>
  )
}

export { Ripple }
