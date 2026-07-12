"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface InfiniteScrollProps extends React.ComponentProps<"div"> {
  /** Auto-scroll speed in px per second; negative reverses. */
  speed?: number
  /** Pause while the pointer is over the list. */
  pauseOnHover?: boolean
  /** Degrees of the signature card tilt; 0 disables it. */
  tilt?: number
}

/**
 * React Bits' InfiniteScroll, reimplemented on one rAF loop (upstream is
 * GSAP): a vertical column of items drifts forever — content is rendered
 * twice and wrapped at half height for a seamless cycle, with the signature
 * tilt as a plain CSS transform. prefers-reduced-motion renders it static.
 * (marquee stays the canonical horizontal text loop; this one is a vertical
 * item feed.)
 */
function InfiniteScroll({
  speed = 40,
  pauseOnHover = true,
  tilt = 6,
  className,
  children,
  ...props
}: InfiniteScrollProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const paused = React.useRef(false)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const track = trackRef.current
    if (!track) return
    let offset = 0
    let last = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const dt = Math.min(64, now - last) / 1000
      last = now
      if (!paused.current) {
        // Wrap period = where the duplicate block starts (height + gap).
        const period = (track.children[1] as HTMLElement | undefined)?.offsetTop ?? 0
        if (period > 0) {
          offset = (((offset + speed * dt) % period) + period) % period
          track.style.transform = `translateY(${-offset}px)`
        }
      }
      frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [speed])

  return (
    <div
      data-slot="infinite-scroll"
      className={cn("relative h-full overflow-hidden", className)}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
      onPointerEnter={pauseOnHover ? () => (paused.current = true) : undefined}
      onPointerLeave={pauseOnHover ? () => (paused.current = false) : undefined}
      {...props}
    >
      <div ref={trackRef} className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">{children}</div>
        <div aria-hidden className="flex flex-col gap-3">
          {children}
        </div>
      </div>
    </div>
  )
}

export { InfiniteScroll }
