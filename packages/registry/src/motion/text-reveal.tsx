"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextRevealProps extends React.ComponentProps<"div"> {
  /** The copy to reveal, split on whitespace. */
  text: string
}

/**
 * Magic UI's TextReveal: a tall scroll section with sticky copy whose words
 * brighten one by one as you scroll through it — a plain rAF-throttled
 * scroll listener, no scroll-timeline, no framer-motion. Under
 * prefers-reduced-motion every word renders at full opacity.
 */
function TextReveal({ text, className, ...props }: TextRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [progress, setProgress] = React.useState(0)
  const [reduced, setReduced] = React.useState(false)
  const words = text.split(/\s+/).filter(Boolean)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true)
      return
    }
    let frame = 0
    const update = () => {
      frame = 0
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) {
        setProgress(rect.top < 0 ? 1 : 0)
        return
      }
      setProgress(Math.min(1, Math.max(0, -rect.top / total)))
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
      data-slot="text-reveal"
      className={cn("relative h-[200vh]", className)}
      {...props}
    >
      <div className="sticky top-0 flex h-screen items-center">
        <p className="flex flex-wrap p-6 text-2xl font-bold md:text-4xl">
          {words.map((word, index) => {
            // Each word owns an equal slice of the scroll progress.
            const start = index / words.length
            const end = (index + 1) / words.length
            const opacity = reduced
              ? 1
              : 0.2 + 0.8 * Math.min(1, Math.max(0, (progress - start) / (end - start)))
            return (
              <span key={index} className="mx-1" style={{ opacity }}>
                {word}
              </span>
            )
          })}
        </p>
      </div>
    </div>
  )
}

export { TextReveal }
