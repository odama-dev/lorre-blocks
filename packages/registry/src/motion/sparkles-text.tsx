import * as React from "react"

import { cn } from "@/lib/utils"

export interface SparklesTextProps extends React.ComponentProps<"span"> {
  /** How many sparkles twinkle over the text. */
  sparklesCount?: number
}

/**
 * Magic UI's SparklesText: star glyphs twinkle around the text, driven by
 * the `--animate-sparkle` token. Positions, delays and colors are seeded
 * from the index (SSR-safe, no hydration drift). motion-reduce hides the
 * sparkles and leaves the text plain.
 */
function SparklesText({
  sparklesCount = 10,
  className,
  children,
  ...props
}: SparklesTextProps) {
  return (
    <span
      data-slot="sparkles-text"
      className={cn("relative inline-block font-bold", className)}
      {...props}
    >
      {Array.from({ length: sparklesCount }).map((_, index) => {
        // Deterministic pseudo-random spread — no Math.random, no hydration drift.
        const left = (index * 53) % 100
        const top = (index * 31 + 7) % 100
        const delay = ((index * 97) % 20) / 10
        const scale = 0.6 + ((index * 41) % 5) / 10
        return (
          <svg
            key={index}
            aria-hidden
            viewBox="0 0 21 21"
            className="pointer-events-none absolute z-10 size-3 animate-sparkle motion-reduce:hidden"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `${delay}s`,
              color: index % 2 ? "var(--accent-8)" : "var(--primary)",
              scale: `${scale}`,
            }}
          >
            <path
              fill="currentColor"
              d="M10.5 0l2.7 7.8 7.8 2.7-7.8 2.7-2.7 7.8-2.7-7.8L0 10.5l7.8-2.7L10.5 0z"
            />
          </svg>
        )
      })}
      <span className="relative">{children}</span>
    </span>
  )
}

export { SparklesText }
