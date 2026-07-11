import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's Meteors: diagonal streaks falling across the container, driven
 * by the `--animate-meteor` token. Positions/delays are seeded
 * deterministically (index-based) so SSR and client render identically.
 * Put inside a `relative overflow-hidden` container. motion-reduce hides them.
 */
function Meteors({
  number = 12,
  className,
  ...props
}: React.ComponentProps<"span"> & {
  number?: number
}) {
  return (
    <>
      {Array.from({ length: number }).map((_, index) => {
        // Deterministic pseudo-random spread — no Math.random, no hydration drift.
        const left = ((index * 47) % 100) + 0
        const delay = ((index * 137) % 50) / 10
        const durationS = 3 + ((index * 61) % 40) / 10
        return (
          <span
            key={index}
            data-slot="meteor"
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-0 size-0.5 rotate-[215deg] rounded-full bg-foreground/60 shadow-[0_0_0_1px_#ffffff10]",
              "animate-meteor motion-reduce:hidden",
              "before:absolute before:top-1/2 before:h-px before:w-[50px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-foreground/60 before:to-transparent before:content-['']",
              className
            )}
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${durationS}s`,
            }}
            {...props}
          />
        )
      })}
    </>
  )
}

export { Meteors }
