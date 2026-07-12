"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ScrollProgressProps = React.ComponentProps<"div">

/**
 * Magic UI's ScrollProgress: a thin gradient bar fixed to the top of the
 * viewport that fills as the page scrolls — an rAF-throttled scroll
 * listener scaling the bar, no scroll-timeline, no framer-motion. It only
 * mirrors the user's own scrolling (never moves by itself), so it stays on
 * under prefers-reduced-motion.
 */
function ScrollProgress({ className, ...props }: ScrollProgressProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = ref.current
      if (!el) return
      const total = document.documentElement.scrollHeight - window.innerHeight
      const progress = total > 0 ? Math.min(1, window.scrollY / total) : 0
      el.style.transform = `scaleX(${progress})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <div
      ref={ref}
      data-slot="scroll-progress"
      aria-hidden
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-1 origin-left scale-x-0",
        "bg-[linear-gradient(90deg,var(--primary),var(--accent-8))]",
        className
      )}
      {...props}
    />
  )
}

export { ScrollProgress }
