"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface BoxRevealProps extends React.ComponentProps<"div"> {
  /** Cover panel color; any CSS color, defaults to the primary token. */
  boxColor?: string
  /** Reveal duration in seconds. */
  duration?: number
  /** Delay before the reveal, in ms — stagger siblings with 0/150/300… */
  delay?: number
}

/**
 * Magic UI's BoxReveal: a solid panel wipes off the content the first time
 * it scrolls into view (IntersectionObserver + CSS transitions — no
 * framer-motion). motion-reduce shows the content immediately, no panel.
 */
function BoxReveal({
  boxColor = "var(--primary)",
  duration = 0.5,
  delay = 0,
  className,
  children,
  ...props
}: BoxRevealProps) {
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
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-slot="box-reveal"
      data-state={visible ? "visible" : "hidden"}
      className={cn("relative inline-block overflow-hidden", className)}
      {...props}
    >
      <div
        className={cn(
          "transition-[opacity,transform] ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:transform-none",
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        )}
        style={{ transitionDuration: `${duration}s`, transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 z-10 transition-transform motion-reduce:transition-none ease-[var(--ease-smooth)] motion-reduce:hidden",
          visible ? "translate-x-full" : "translate-x-0"
        )}
        style={{
          background: boxColor,
          transitionDuration: `${duration}s`,
          transitionDelay: `${delay}ms`,
        }}
      />
    </div>
  )
}

export { BoxReveal }
