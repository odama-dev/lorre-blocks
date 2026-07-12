"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SplitTextProps extends React.ComponentProps<"span"> {
  /** The text to split and animate. */
  text: string
  /** Animate per character (default) or per word. */
  by?: "chars" | "words"
  /** ms between one unit and the next. */
  staggerMs?: number
}

/**
 * React Bits' SplitText, reimplemented on IntersectionObserver + CSS
 * transitions (upstream is GSAP): units rise and fade in one after another
 * the first time the text scrolls into view. Screen readers get the whole
 * string via aria-label; motion-reduce renders everything immediately.
 */
function SplitText({
  text,
  by = "chars",
  staggerMs = 40,
  className,
  ...props
}: SplitTextProps) {
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
      data-slot="split-text"
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
            "inline-block whitespace-pre transition-[opacity,transform] duration-500 ease-out",
            "motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:transform-none",
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
          style={{ transitionDelay: `${index * staggerMs}ms` }}
        >
          {unit}
        </span>
      ))}
    </span>
  )
}

export { SplitText }
