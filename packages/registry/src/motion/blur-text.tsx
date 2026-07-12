"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface BlurTextProps extends React.ComponentProps<"span"> {
  /** The text to animate in. */
  text: string
  /** Animate per word (default) or per character. */
  by?: "words" | "chars"
  /** ms between one unit and the next. */
  staggerMs?: number
  /** Units drift down from above (default) or up from below. */
  direction?: "top" | "bottom"
}

/**
 * React Bits' BlurText, reimplemented on IntersectionObserver + CSS
 * transitions (upstream is framer-motion): words sharpen out of a blur as
 * they drift into place the first time they enter the viewport. aria-label
 * carries the whole string; motion-reduce renders everything immediately.
 * (fade-in stays the canonical block-level reveal — this one is per-word.)
 */
function BlurText({
  text,
  by = "words",
  staggerMs = 80,
  direction = "top",
  className,
  ...props
}: BlurTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = React.useState(false)
  const units =
    by === "words" ? text.split(/(\s+)/).filter(Boolean) : Array.from(text)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <span
      ref={ref}
      data-slot="blur-text"
      data-state={visible ? "visible" : "hidden"}
      aria-label={text}
      className={cn("inline-block", className)}
      {...props}
    >
      {units.map((unit, index) => (
        <span
          key={index}
          aria-hidden
          className={cn(
            "inline-block whitespace-pre transition-[opacity,transform,filter] duration-500 ease-out",
            "motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:transform-none motion-reduce:blur-none",
            visible
              ? "translate-y-0 opacity-100 blur-none"
              : cn("opacity-0 blur-sm", direction === "top" ? "-translate-y-3" : "translate-y-3")
          )}
          style={{ transitionDelay: `${index * staggerMs}ms` }}
        >
          {unit}
        </span>
      ))}
    </span>
  )
}

export { BlurText }
