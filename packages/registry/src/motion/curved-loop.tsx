"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface CurvedLoopProps extends React.ComponentProps<"svg"> {
  /** The phrase to loop along the curve (a separator is appended). */
  text: string
  /** Drift speed in px per second; negative reverses. */
  speed?: number
  /** Curve depth: 0 is flat, positive bows downward. */
  curve?: number
}

/**
 * React Bits' CurvedLoop: a marquee riding an SVG curve — the text repeats
 * along a path and one rAF loop slides `startOffset` for a seamless cycle.
 * prefers-reduced-motion renders it parked.
 */
function CurvedLoop({
  text,
  speed = 60,
  curve = 80,
  className,
  ...props
}: CurvedLoopProps) {
  const pathId = React.useId()
  const textPathRef = React.useRef<SVGTextPathElement>(null)
  const repeated = Array.from({ length: 8 }, () => text.trim()).join(" · ") + " · "

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const textPath = textPathRef.current
    const textEl = textPath?.parentNode as SVGTextContentElement | null
    // getComputedTextLength is missing in non-browser DOMs (jsdom).
    if (!textPath || typeof textEl?.getComputedTextLength !== "function") return
    // One repetition's width — the loop wraps every `unit` px.
    const unit = textEl.getComputedTextLength() / 8
    if (!unit) return
    let offset = 0
    let last = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const dt = Math.min(64, now - last) / 1000
      last = now
      offset = (offset + speed * dt) % unit
      textPath.setAttribute("startOffset", `${-offset}`)
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [speed, text])

  return (
    <svg
      data-slot="curved-loop"
      viewBox="0 0 1200 260"
      className={cn("w-full select-none", className)}
      role="img"
      aria-label={text}
      {...props}
    >
      <path
        id={pathId}
        d={`M -40 130 Q 600 ${130 + curve * 2} 1240 130`}
        fill="none"
      />
      <text className="fill-current text-[72px] font-bold uppercase tracking-tight">
        <textPath ref={textPathRef} href={`#${pathId}`} startOffset="0">
          {repeated}
        </textPath>
      </text>
    </svg>
  )
}

export { CurvedLoop }
