"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface BlobCursorProps extends React.ComponentProps<"div"> {
  /** Trailing blob count (each lags a little more). */
  blobCount?: number
  /** Lead blob diameter in px; trailing blobs shrink from it. */
  size?: number
}

/**
 * React Bits' BlobCursor, reimplemented on one rAF loop (upstream is GSAP):
 * soft blobs chase the pointer inside the container, each lagging a little
 * more, blended with blur for the gooey look. Fill a relative
 * overflow-hidden container. prefers-reduced-motion parks the blobs.
 */
function BlobCursor({ blobCount = 3, size = 40, className, ...props }: BlobCursorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const container = containerRef.current
    if (!container) return
    const blobs = Array.from(container.querySelectorAll<HTMLElement>("[data-blob]"))
    const positions = blobs.map(() => ({ x: 0, y: 0 }))
    let target = { x: 0, y: 0 }
    let running = false
    let frame = 0

    const tick = () => {
      let previous = target
      let settled = true
      positions.forEach((position, index) => {
        // Each blob eases toward the one before it — the gooey lag.
        const ease = 0.35 - index * 0.08
        position.x += (previous.x - position.x) * ease
        position.y += (previous.y - position.y) * ease
        if (Math.hypot(previous.x - position.x, previous.y - position.y) > 0.5) settled = false
        blobs[index].style.transform = `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`
        previous = position
      })
      frame = settled ? ((running = false), 0) : requestAnimationFrame(tick)
    }
    const onMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      target = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      if (!running) {
        running = true
        frame = requestAnimationFrame(tick)
      }
    }
    container.addEventListener("pointermove", onMove)
    return () => {
      container.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      data-slot="blob-cursor"
      aria-hidden
      className={cn("pointer-events-auto absolute inset-0 overflow-hidden", className)}
      {...props}
    >
      {Array.from({ length: blobCount }).map((_, index) => (
        <span
          key={index}
          data-blob
          className="absolute left-0 top-0 rounded-full bg-primary/60 blur-sm will-change-transform"
          style={{ width: size * (1 - index * 0.25), height: size * (1 - index * 0.25) }}
        />
      ))}
    </div>
  )
}

export { BlobCursor }
