import * as React from "react"

import { cn } from "@/lib/utils"

export interface GlitchTextProps extends React.ComponentProps<"span"> {
  /** The text to glitch. */
  text: string
}

/**
 * React Bits' GlitchText on pure CSS: two clipped copies jitter over the
 * base text via the `--animate-glitch` token, chromatic edges from the
 * theme's danger/accent scales (re-themes instead of hardcoded red/cyan).
 * Server-renderable; motion-reduce hides the glitch layers.
 */
function GlitchText({ text, className, ...props }: GlitchTextProps) {
  return (
    <span
      data-slot="glitch-text"
      className={cn("relative inline-block font-bold", className)}
      {...props}
    >
      {text}
      <span
        aria-hidden
        className="absolute inset-0 animate-glitch text-danger-9 motion-reduce:hidden"
        style={{ textShadow: "-1.5px 0 currentColor" }}
      >
        {text}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 animate-glitch text-accent-9 [animation-direction:reverse] [animation-duration:2.1s] motion-reduce:hidden"
        style={{ textShadow: "1.5px 0 currentColor" }}
      >
        {text}
      </span>
    </span>
  )
}

export { GlitchText }
