"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface HyperspeedProps extends React.ComponentProps<"canvas"> {
  /** Stars in flight. */
  starCount?: number
  /** Warp factor; higher is faster. */
  speed?: number
}

/**
 * React Bits' Hyperspeed reimagined as a 2D-canvas starfield warp
 * (upstream is a three.js highway — WebGL gated out per the Phase 6
 * dependency policy): stars streak outward from the center, color from the
 * foreground token. Fill a relative container. prefers-reduced-motion
 * draws a static field once.
 */
function Hyperspeed({ starCount = 160, speed = 1, className, ...props }: HyperspeedProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let width = 0
    let height = 0
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    // z shrinks toward the viewer; x/y in [-0.5, 0.5] around the center.
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() - 0.5,
      y: Math.random() - 0.5,
      z: Math.random(),
    }))

    const draw = (warp: number) => {
      context.clearRect(0, 0, width, height)
      const color = getComputedStyle(canvas).color
      for (const star of stars) {
        star.z -= warp
        if (star.z <= 0.02) {
          star.x = Math.random() - 0.5
          star.y = Math.random() - 0.5
          star.z = 1
        }
        const scale = 0.5 / star.z
        const x = width / 2 + star.x * scale * width
        const y = height / 2 + star.y * scale * height
        const prevScale = 0.5 / (star.z + warp * 6)
        const px = width / 2 + star.x * prevScale * width
        const py = height / 2 + star.y * prevScale * height
        context.strokeStyle = color
        context.globalAlpha = Math.min(1, (1 - star.z) * 1.2)
        context.lineWidth = Math.max(0.5, (1 - star.z) * 2)
        context.beginPath()
        context.moveTo(px, py)
        context.lineTo(x, y)
        context.stroke()
      }
      context.globalAlpha = 1
    }

    if (reduced) {
      draw(0)
      return () => observer.disconnect()
    }
    let frame = requestAnimationFrame(function tick() {
      draw(0.004 * speed)
      frame = requestAnimationFrame(tick)
    })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [starCount, speed])

  return (
    <canvas
      ref={canvasRef}
      data-slot="hyperspeed"
      aria-hidden
      className={cn("absolute inset-0 size-full text-foreground", className)}
      {...props}
    />
  )
}

export { Hyperspeed }
