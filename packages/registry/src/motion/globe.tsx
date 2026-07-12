"use client"

import * as React from "react"
import createGlobe from "cobe"

import { cn } from "@/lib/utils"

export interface GlobeProps extends React.ComponentProps<"div"> {
  /** [latitude, longitude] markers. */
  markers?: { location: [number, number]; size?: number }[]
}

/** Resolve a CSS color (any syntax the browser knows) to 0–1 RGB for cobe. */
function cssColorToRgb(color: string): [number, number, number] {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const context = canvas.getContext("2d")
  if (!context) return [0.5, 0.5, 0.5]
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return [r / 255, g / 255, b / 255]
}

/**
 * Magic UI's Globe on `cobe` — the one WebGL dependency that passed the
 * Phase 6 gate (~5 kB, the ecosystem standard for this exact visual; adds
 * a WebGL context, so budget one instance per page). Base/marker/glow
 * colors are resolved from the live primary + neutral tokens at mount, so
 * it re-themes. Drag to spin; prefers-reduced-motion stops the
 * auto-rotation (drag still works).
 */
function Globe({ markers = [], className, ...props }: GlobeProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const styles = getComputedStyle(document.documentElement)
    const primary = cssColorToRgb(styles.getPropertyValue("--primary").trim() || "#888")
    const neutral = cssColorToRgb(styles.getPropertyValue("--muted").trim() || "#ddd")
    const dark = document.documentElement.classList.contains("dark")

    let phi = 0
    let dragStart: number | null = null
    let dragPhi = 0
    let width = canvas.offsetWidth

    const onResize = () => (width = canvas.offsetWidth)
    window.addEventListener("resize", onResize)
    const onPointerDown = (event: PointerEvent) => {
      dragStart = event.clientX
      dragPhi = phi
      canvas.setPointerCapture(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (dragStart !== null) phi = dragPhi + (event.clientX - dragStart) / 100
    }
    const onPointerUp = () => (dragStart = null)
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerup", onPointerUp)

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: dark ? 1 : 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: dark ? 5 : 1.6,
      baseColor: neutral,
      markerColor: primary,
      glowColor: dark ? [0.15, 0.15, 0.15] : [0.9, 0.9, 0.9],
      markers: markers.map((marker) => ({ size: 0.08, ...marker })),
    })

    // cobe v2 has no per-frame callback — drive rotation with our own loop.
    let frame = requestAnimationFrame(function tick() {
      if (!reduced && dragStart === null) phi += 0.004
      globe.update({ phi, width: width * 2, height: width * 2 })
      frame = requestAnimationFrame(tick)
    })

    return () => {
      cancelAnimationFrame(frame)
      globe.destroy()
      window.removeEventListener("resize", onResize)
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", onPointerUp)
    }
  }, [markers])

  return (
    <div
      data-slot="globe"
      className={cn("relative aspect-square w-full max-w-md", className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="size-full cursor-grab touch-none active:cursor-grabbing [contain:layout_paint_size]"
        aria-label="Interactive globe"
      />
    </div>
  )
}

export { Globe }
