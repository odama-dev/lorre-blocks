"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const GLYPHS = "!<>-_\\/[]{}—=+*^?#"

export interface ScrambleTextProps extends React.ComponentProps<"span"> {
  /** The text to scramble under the pointer. */
  text: string
  /** Pointer radius in px within which characters churn. */
  radius?: number
  /** ms a disturbed character keeps churning after the pointer leaves it. */
  settleMs?: number
}

/**
 * React Bits' ScrambleText, reimplemented on pointer events + a JS timer
 * (upstream is GSAP ScrambleText): characters near the pointer churn
 * through random glyphs and settle back once it moves away. Layout is
 * locked per character so nothing shifts. prefers-reduced-motion disables
 * the effect entirely.
 */
function ScrambleText({
  text,
  radius = 40,
  settleMs = 250,
  className,
  ...props
}: ScrambleTextProps) {
  const containerRef = React.useRef<HTMLSpanElement>(null)
  const disturbedUntil = React.useRef<number[]>([])
  const [chars, setChars] = React.useState<string[]>(() => Array.from(text))
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    setChars(Array.from(text))
    disturbedUntil.current = Array.from(text, () => 0)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true)
      return
    }
    let frame = 0
    const tick = () => {
      const now = performance.now()
      let anyActive = false
      setChars(
        Array.from(text, (char, index) => {
          if (char === " " || disturbedUntil.current[index] <= now) return char
          anyActive = true
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        })
      )
      frame = anyActive ? requestAnimationFrame(tick) : 0
    }
    const el = containerRef.current
    if (!el) return
    const onMove = (event: PointerEvent) => {
      const spans = el.querySelectorAll<HTMLElement>("[data-char]")
      const until = performance.now() + settleMs
      spans.forEach((span, index) => {
        const rect = span.getBoundingClientRect()
        const dx = event.clientX - (rect.left + rect.width / 2)
        const dy = event.clientY - (rect.top + rect.height / 2)
        if (Math.hypot(dx, dy) < radius) disturbedUntil.current[index] = until
      })
      if (!frame) frame = requestAnimationFrame(tick)
    }
    el.addEventListener("pointermove", onMove)
    return () => {
      el.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(frame)
    }
  }, [text, radius, settleMs])

  return (
    <span
      ref={containerRef}
      data-slot="scramble-text"
      aria-label={text}
      className={cn("font-mono", className)}
      {...props}
    >
      {chars.map((char, index) => (
        <span
          key={index}
          data-char
          aria-hidden
          className="inline-block whitespace-pre text-center"
          style={reduced ? undefined : { width: char === " " ? undefined : "1ch" }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

export { ScrambleText }
