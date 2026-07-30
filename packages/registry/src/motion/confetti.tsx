"use client"

import * as React from "react"
import confetti from "canvas-confetti"
import type { Options as ConfettiOptions } from "canvas-confetti"

import { cn } from "@/lib/utils"

/**
 * Magic UI's Confetti as a trigger button: fires a canvas-confetti burst from
 * the click position. Skipped entirely under prefers-reduced-motion. For
 * imperative use elsewhere, import `fireConfetti`.
 */
function fireConfetti(options?: ConfettiOptions) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  void confetti({
    particleCount: 90,
    spread: 70,
    startVelocity: 35,
    ticks: 200,
    ...options,
  })
}

function ConfettiButton({
  className,
  children,
  options,
  onClick,
  ...props
}: React.ComponentProps<"button"> & {
  options?: ConfettiOptions
}) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    fireConfetti({
      origin: {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      },
      ...options,
    })
    onClick?.(event)
  }

  return (
    <button
      data-slot="confetti-button"
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground",
        "transition-transform motion-reduce:transition-none hover:bg-primary/90 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

export { ConfettiButton, fireConfetti }
