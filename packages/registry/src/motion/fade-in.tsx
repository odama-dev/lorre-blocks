"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface FadeInProps extends React.ComponentProps<"div"> {
  /** Delay before the reveal, in ms — stagger siblings with 0/100/200… */
  delay?: number
}

/**
 * Reveal-on-scroll wrapper: children start slightly shifted and transparent,
 * then transition in the first time they enter the viewport. Duration rides
 * the theme's `--motion-duration-slow` token, so `utilitarian` reveals faster
 * than `dreamy`; `motion-reduce` disables the transition entirely.
 */
function FadeIn({ delay = 0, className, style, children, ...props }: FadeInProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

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
    <div
      ref={ref}
      data-slot="fade-in"
      data-state={visible ? "visible" : "hidden"}
      className={cn(
        "transition-[opacity,transform] ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:transform-none",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        className
      )}
      style={{
        transitionDuration: "var(--motion-duration-slow)",
        transitionDelay: `${delay}ms`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export { FadeIn }
