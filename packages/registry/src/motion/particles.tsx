"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
}

/**
 * Magic UI's Particles: drifting dots on a canvas that lean gently toward
 * the pointer. Plain rAF — no deps; the color defaults to the theme's
 * foreground. Skips animating entirely under prefers-reduced-motion
 * (a static field is drawn once instead).
 */
function Particles({
  className,
  quantity = 80,
  ease = 50,
  color,
  ...props
}: React.ComponentProps<"div"> & {
  quantity?: number
  /** Higher = lazier pointer follow. */
  ease?: number
  /** CSS color; defaults to the computed foreground token. */
  color?: string
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return
    const context = canvas.getContext("2d")
    if (!context) return

    const dpr = window.devicePixelRatio || 1
    let width = 0
    let height = 0
    let raf = 0
    const mouse = { x: -9999, y: -9999 }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const resolvedColor =
      color || getComputedStyle(wrapper).getPropertyValue("color") || "#888"

    let particles: Particle[] = []

    const resize = () => {
      width = wrapper.clientWidth
      height = wrapper.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: quantity }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.15,
      }))
      if (reduced) draw()
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)
      context.fillStyle = resolvedColor
      for (const p of particles) {
        context.globalAlpha = p.alpha
        context.beginPath()
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        context.fill()
      }
      context.globalAlpha = 1
    }

    const tick = () => {
      for (const p of particles) {
        p.x += p.vx + (mouse.x > 0 ? (mouse.x - p.x) / (ease * 100) : 0)
        p.y += p.vy + (mouse.y > 0 ? (mouse.y - p.y) / (ease * 100) : 0)
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0
      }
      draw()
      raf = requestAnimationFrame(tick)
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect()
      mouse.x = event.clientX - rect.left
      mouse.y = event.clientY - rect.top
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(wrapper)
    wrapper.addEventListener("pointermove", onPointerMove)
    if (!reduced) raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      wrapper.removeEventListener("pointermove", onPointerMove)
    }
  }, [quantity, ease, color])

  return (
    <div
      ref={wrapperRef}
      data-slot="particles"
      aria-hidden
      className={cn("pointer-events-auto absolute inset-0 text-foreground", className)}
      {...props}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  )
}

export { Particles }
