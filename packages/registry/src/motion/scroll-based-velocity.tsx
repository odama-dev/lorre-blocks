"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ScrollVelocityProps extends React.ComponentProps<"div"> {
  /** Baseline drift in px per second; negative reverses direction. */
  baseVelocity?: number
  /** The text (or inline content) to repeat across the row. */
  children: React.ReactNode
}

/**
 * Magic UI's ScrollBasedVelocity: a repeating text row that drifts sideways
 * and speeds up with your scroll velocity — one requestAnimationFrame loop,
 * no framer-motion. Content is repeated four times and wrapped modulo 25%
 * so the loop is seamless. Under prefers-reduced-motion the row is static.
 */
function ScrollVelocity({
  baseVelocity = 40,
  className,
  children,
  ...props
}: ScrollVelocityProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const track = trackRef.current
    if (!track) return
    let offset = 0
    let lastY = window.scrollY
    let lastTime = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const dt = Math.min(64, now - lastTime) / 1000
      lastTime = now
      const scrollDelta = window.scrollY - lastY
      lastY = window.scrollY
      // Scrolling in either direction boosts the drift along its own sign.
      offset += (baseVelocity + scrollDelta * 6) * dt
      const width = track.scrollWidth / 4
      if (width > 0) offset = ((offset % width) + width) % width
      track.style.transform = `translateX(${-offset}px)`
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [baseVelocity])

  return (
    <div
      data-slot="scroll-velocity"
      className={cn("w-full overflow-hidden whitespace-nowrap", className)}
      {...props}
    >
      <div ref={trackRef} className="flex w-max">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} aria-hidden={index > 0} className="pr-8">
            {children}
          </span>
        ))}
      </div>
    </div>
  )
}

export { ScrollVelocity }
