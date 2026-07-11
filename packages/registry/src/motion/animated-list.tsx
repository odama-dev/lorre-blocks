"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's AnimatedList: children appear one by one (newest on top), each
 * sliding in — notification-feed style. Reveal cadence via `delay`; the
 * enter animation is tw-animate-css utilities, so motion-reduce disables it.
 * Loops back to one item after the full list has shown (like upstream).
 */
function AnimatedList({
  className,
  children,
  delay = 1200,
  ...props
}: React.ComponentProps<"div"> & {
  /** ms between reveals. */
  delay?: number
}) {
  const items = React.Children.toArray(children)
  const [count, setCount] = React.useState(1)

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setCount((current) => (current >= items.length ? 1 : current + 1))
    }, delay)
    return () => window.clearInterval(id)
  }, [items.length, delay])

  return (
    <div
      data-slot="animated-list"
      className={cn("flex flex-col-reverse gap-3", className)}
      {...props}
    >
      {items.slice(0, count).map((item, index) => (
        <div
          key={index}
          className="animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-500 motion-reduce:animate-none"
        >
          {item}
        </div>
      ))}
    </div>
  )
}

export { AnimatedList }
