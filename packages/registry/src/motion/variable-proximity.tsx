"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface VariableProximityProps extends React.ComponentProps<"span"> {
  /** The text whose weight follows the pointer. */
  text: string
  /** Pointer radius in px of full influence falloff. */
  radius?: number
  /** Font weight far from the pointer. */
  fromWeight?: number
  /** Font weight directly under the pointer. */
  toWeight?: number
}

/**
 * React Bits' VariableProximity: characters swell toward `toWeight` as the
 * pointer nears them — per-char `font-variation-settings` driven by
 * pointermove + rAF. Needs a variable font (the default Inter stack
 * qualifies); on static fonts it simply stays at `fromWeight`.
 * prefers-reduced-motion disables the effect.
 */
function VariableProximity({
  text,
  radius = 80,
  fromWeight = 400,
  toWeight = 900,
  className,
  ...props
}: VariableProximityProps) {
  const containerRef = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const el = containerRef.current
    if (!el) return
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-char]"))
    let pointer: { x: number; y: number } | null = null
    let frame = 0
    const update = () => {
      frame = 0
      for (const span of spans) {
        const rect = span.getBoundingClientRect()
        const dx = pointer ? pointer.x - (rect.left + rect.width / 2) : Infinity
        const dy = pointer ? pointer.y - (rect.top + rect.height / 2) : Infinity
        const distance = Math.hypot(dx, dy)
        const t = Math.max(0, 1 - distance / radius)
        const weight = Math.round(fromWeight + (toWeight - fromWeight) * t)
        span.style.fontVariationSettings = `'wght' ${weight}`
      }
    }
    const onMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY }
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onLeave = () => {
      pointer = null
      if (!frame) frame = requestAnimationFrame(update)
    }
    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerleave", onLeave)
    return () => {
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerleave", onLeave)
      cancelAnimationFrame(frame)
    }
  }, [radius, fromWeight, toWeight, text])

  return (
    <span
      ref={containerRef}
      data-slot="variable-proximity"
      aria-label={text}
      className={cn("inline-block", className)}
      style={{ fontWeight: fromWeight }}
      {...props}
    >
      {Array.from(text).map((char, index) => (
        <span key={index} data-char aria-hidden className="inline-block whitespace-pre">
          {char}
        </span>
      ))}
    </span>
  )
}

export { VariableProximity }
