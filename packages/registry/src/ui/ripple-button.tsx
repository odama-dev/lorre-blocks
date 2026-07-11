"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface Ripple {
  key: number
  x: number
  y: number
  size: number
}

/**
 * Magic UI's RippleButton: a material-style click ripple expanding from the
 * pointer, driven by the `--animate-ripple` token. Ripples are removed when
 * their animation ends; under prefers-reduced-motion the animation is a
 * no-op and the ripple is dropped immediately.
 */
function RippleButton({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const [ripples, setRipples] = React.useState<Ripple[]>([])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) / 2
    setRipples((current) => [
      ...current,
      {
        key: Date.now(),
        x: event.clientX - rect.left - size / 2,
        y: event.clientY - rect.top - size / 2,
        size,
      },
    ])
    onClick?.(event)
  }

  return (
    <button
      data-slot="ripple-button"
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-lg border bg-background px-6 py-2.5 text-sm font-medium text-foreground",
        "transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {ripples.map((ripple) => (
        <span
          key={ripple.key}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-primary/30 animate-ripple motion-reduce:hidden"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
          onAnimationEnd={() =>
            setRipples((current) => current.filter((r) => r.key !== ripple.key))
          }
        />
      ))}
    </button>
  )
}

export { RippleButton }
