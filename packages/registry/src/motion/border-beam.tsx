import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's BorderBeam: a glowing segment traveling around the host's
 * border. Pure CSS — the beam rides `offset-path: rect(...)` along the
 * border ring, driven by the `--animate-border-beam` token. Put it inside
 * any `relative overflow-hidden rounded-*` container. motion-reduce hides it.
 */
function BorderBeam({
  className,
  size = 60,
  duration,
  delay = 0,
  reverse = false,
  ...props
}: React.ComponentProps<"div"> & {
  /** Beam length in px. */
  size?: number
  /** Seconds per lap; omit for the token default. */
  duration?: number
  /** Negative delays stagger multiple beams. */
  delay?: number
  reverse?: boolean
}) {
  return (
    <div
      aria-hidden
      data-slot="border-beam"
      className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#fff,#fff)]"
      {...props}
    >
      <div
        className={cn(
          "absolute aspect-square bg-gradient-to-l from-primary via-accent-8 to-transparent",
          "animate-border-beam [offset-path:rect(0_auto_auto_0_round_var(--beam-size))] motion-reduce:hidden",
          reverse && "[animation-direction:reverse]",
          className
        )}
        style={
          {
            width: size,
            "--beam-size": `${size}px`,
            animationDuration: duration ? `${duration}s` : undefined,
            animationDelay: `${delay}s`,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

export { BorderBeam }
