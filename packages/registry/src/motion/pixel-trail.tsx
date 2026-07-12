"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface PixelTrailProps extends React.ComponentProps<"canvas"> {
  /** Pixel cell size in px. */
  pixelSize?: number
  /** ms it takes a lit pixel to fade out. */
  fadeMs?: number
}

/**
 * React Bits' PixelTrail, reimplemented on a 2D canvas (upstream is WebGL
 * fidelity we don't need): moving the pointer lights up grid cells that
 * fade back out — one rAF loop, color from the primary token. Fill the
 * nearest relative container. prefers-reduced-motion disables the trail.
 */
function PixelTrail({ pixelSize = 20, fadeMs = 600, className, ...props }: PixelTrailProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    const cells = new Map<string, number>() // "col,row" -> lit-at timestamp
    let frame = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      context.scale(devicePixelRatio, devicePixelRatio)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const draw = () => {
      const now = performance.now()
      const rect = canvas.getBoundingClientRect()
      context.clearRect(0, 0, rect.width, rect.height)
      const color = getComputedStyle(canvas).color
      for (const [key, litAt] of cells) {
        const age = now - litAt
        if (age > fadeMs) {
          cells.delete(key)
          continue
        }
        const [col, row] = key.split(",").map(Number)
        context.globalAlpha = 1 - age / fadeMs
        context.fillStyle = color
        context.fillRect(col * pixelSize, row * pixelSize, pixelSize - 2, pixelSize - 2)
      }
      context.globalAlpha = 1
      frame = cells.size ? requestAnimationFrame(draw) : 0
    }

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const col = Math.floor((event.clientX - rect.left) / pixelSize)
      const row = Math.floor((event.clientY - rect.top) / pixelSize)
      cells.set(`${col},${row}`, performance.now())
      if (!frame) frame = requestAnimationFrame(draw)
    }
    canvas.addEventListener("pointermove", onMove)
    return () => {
      canvas.removeEventListener("pointermove", onMove)
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [pixelSize, fadeMs])

  return (
    <canvas
      ref={canvasRef}
      data-slot="pixel-trail"
      aria-hidden
      className={cn("absolute inset-0 size-full text-primary", className)}
      {...props}
    />
  )
}

export { PixelTrail }
