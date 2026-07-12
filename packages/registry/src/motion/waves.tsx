"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface WavesProps extends React.ComponentProps<"canvas"> {
  /** Horizontal lines in the field. */
  lineCount?: number
  /** Wave height in px. */
  amplitude?: number
}

/**
 * React Bits' Waves as a 2D-canvas approximation (upstream drives a
 * perlin-noise line field): layered sine lines drift across the container,
 * color from the border token. Fill a relative container.
 * prefers-reduced-motion draws the field once, still.
 */
function Waves({ lineCount = 14, amplitude = 14, className, ...props }: WavesProps) {
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

    const draw = (t: number) => {
      context.clearRect(0, 0, width, height)
      context.strokeStyle = getComputedStyle(canvas).color
      context.lineWidth = 1
      for (let line = 0; line < lineCount; line++) {
        const baseY = (height / (lineCount + 1)) * (line + 1)
        context.globalAlpha = 0.25 + 0.5 * (line / lineCount)
        context.beginPath()
        for (let x = 0; x <= width; x += 6) {
          // Two offset sine octaves give an organic, non-repeating look.
          const y =
            baseY +
            Math.sin(x / 90 + t + line * 0.6) * amplitude +
            Math.sin(x / 37 - t * 1.4 + line) * (amplitude / 3)
          if (x === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.stroke()
      }
      context.globalAlpha = 1
    }

    if (reduced) {
      draw(0)
      return () => observer.disconnect()
    }
    let frame = requestAnimationFrame(function tick(now) {
      draw(now / 1600)
      frame = requestAnimationFrame(tick)
    })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [lineCount, amplitude])

  return (
    <canvas
      ref={canvasRef}
      data-slot="waves"
      aria-hidden
      className={cn("absolute inset-0 size-full text-border", className)}
      {...props}
    />
  )
}

export { Waves }
