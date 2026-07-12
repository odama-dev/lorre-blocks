"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface MorphingTextProps extends React.ComponentProps<"span"> {
  /** Words to morph through, in order. */
  words: string[]
  /** ms each word stays fully formed. */
  holdMs?: number
  /** Crossfade duration in ms. */
  morphMs?: number
}

/**
 * Magic UI's MorphingText: words dissolve into each other with a blur
 * crossfade — CSS transitions on stacked spans, cycled by a timer (no
 * framer-motion, no SVG filter). Under prefers-reduced-motion the first
 * word renders statically.
 */
function MorphingText({
  words,
  holdMs = 2000,
  morphMs = 700,
  className,
  ...props
}: MorphingTextProps) {
  const [active, setActive] = React.useState(0)
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true)
      return
    }
    if (words.length < 2) return
    const timer = setInterval(
      () => setActive((index) => (index + 1) % words.length),
      holdMs + morphMs
    )
    return () => clearInterval(timer)
  }, [words.length, holdMs, morphMs])

  return (
    <span
      data-slot="morphing-text"
      className={cn("inline-grid overflow-visible font-bold", className)}
      {...props}
    >
      {words.map((word, index) => {
        const isActive = reduced ? index === 0 : index === active
        return (
          <span
            key={word + index}
            aria-hidden={!isActive}
            className={cn(
              "[grid-area:1/1] justify-self-center whitespace-nowrap transition-[opacity,filter] ease-out motion-reduce:transition-none",
              isActive ? "opacity-100 blur-none" : "opacity-0 blur-md"
            )}
            style={{ transitionDuration: `${morphMs}ms` }}
          >
            {word}
          </span>
        )
      })}
    </span>
  )
}

export { MorphingText }
