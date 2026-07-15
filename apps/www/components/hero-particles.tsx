"use client"

import * as React from "react"
import type P5Instance from "p5"

import { cn } from "@lorre-blocks/registry/lib/utils"

type Particle = {
  x: number
  y: number
  r0: number
  cx: number
  cy: number
  dir: number
}

/**
 * p5.js hero field: one dense orbit of particles rotating around the hero
 * centre, leaving motion trails (a translucent background is painted each
 * frame instead of a full clear). Hovering spins up a counter-rotating vortex
 * at the pointer — particles near the cursor swirl the opposite way and gather
 * in, then ease back to their ring when you leave.
 *
 * p5 is dynamically imported (client only, so no SSR window access) and the
 * wrapper is pointer-events-none — pointer tracking rides on `window`, so the
 * hero buttons stay clickable and hovering anywhere still reacts. Colours come
 * from the theme (foreground dots, page background for the trail) and refresh
 * on the dark/light toggle; reduced-motion draws a single static frame.
 */
export function HeroParticles({
  className,
  count = 900,
}: {
  className?: string
  count?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    let instance: { remove: () => void } | null = null
    let refresh: (() => void) | null = null
    let disposed = false

    const mouse = { x: -9999, y: -9999, active: false }
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      mouse.x = event.clientX - rect.left
      mouse.y = event.clientY - rect.top
      mouse.active =
        mouse.x >= 0 &&
        mouse.x <= rect.width &&
        mouse.y >= 0 &&
        mouse.y <= rect.height
    }
    const onLeave = () => {
      mouse.active = false
    }

    void import("p5").then(({ default: P5 }) => {
      if (disposed) return
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

      const parseRGB = (value: string): [number, number, number] | null => {
        const match = value && value.match(/rgba?\(([^)]+)\)/)
        if (!match) return null
        const n = match[1].split(/[ ,/]+/).map(Number)
        return [n[0], n[1], n[2]]
      }
      const isDark = () => document.documentElement.classList.contains("dark")

      const sketch = (p: P5Instance) => {
        let particles: Particle[] = []
        let fg: [number, number, number] = [130, 136, 150]
        let bg: [number, number, number] = [253, 253, 253]

        // Three counter-rotating orbits: a big clockwise one in the middle plus
        // two smaller anticlockwise ones flanking it, so the box fills with
        // particles spinning against each other.
        const FIELDS = [
          { fx: 0.5, fy: 0.5, scale: 1, dir: 1, share: 0.5 },
          { fx: 0.2, fy: 0.48, scale: 0.62, dir: -1, share: 0.25 },
          { fx: 0.8, fy: 0.52, scale: 0.62, dir: -1, share: 0.25 },
        ]
        const SPEED = 22 // linear tangential speed (inner rings spin faster)
        const SPRING = 1.6 // pull back toward each particle's ring
        const HOVER_R = 150 // pointer influence radius
        const HOVER_SPEED = 32 // counter-swirl speed at the cursor

        const readColors = () => {
          const dark = isDark()
          // Kept deliberately low-contrast so the hero copy stays readable.
          fg = parseRGB(getComputedStyle(el).color) || (dark ? [140, 146, 162] : [120, 126, 140])
          bg =
            parseRGB(getComputedStyle(document.body).backgroundColor) ||
            (dark ? [20, 21, 24] : [253, 253, 253])
        }

        const seed = () => {
          const w = el.clientWidth
          const h = el.clientHeight
          const base = Math.min(w * 0.5, h * 0.95)
          particles = []
          for (const field of FIELDS) {
            const cx = w * field.fx
            const cy = h * field.fy
            const R = base * field.scale
            const n = Math.round(count * field.share)
            for (let i = 0; i < n; i++) {
              const r0 = Math.sqrt(Math.random()) * R + 6
              const a = Math.random() * Math.PI * 2
              particles.push({
                x: cx + Math.cos(a) * r0,
                y: cy + Math.sin(a) * r0,
                r0,
                cx,
                cy,
                dir: field.dir,
              })
            }
          }
        }

        const paintBase = () => {
          p.background(bg[0], bg[1], bg[2])
        }

        p.setup = () => {
          p.createCanvas(el.clientWidth, el.clientHeight)
          p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2))
          readColors()
          seed()
          paintBase()
          if (reduced) {
            p.noStroke()
            p.fill(fg[0], fg[1], fg[2], 70)
            for (const pt of particles) p.circle(pt.x, pt.y, 1.4)
            p.noLoop()
          }
        }

        p.draw = () => {
          const dt = Math.min(p.deltaTime / 1000, 0.05)

          // Trail: lay a translucent slab of the page background over the last
          // frame so particles fade into streaks instead of vanishing.
          p.noStroke()
          p.fill(bg[0], bg[1], bg[2], 22)
          p.rect(0, 0, p.width, p.height)

          p.stroke(fg[0], fg[1], fg[2], 55)
          p.strokeWeight(1.25)
          for (const pt of particles) {
            const dx = pt.x - pt.cx
            const dy = pt.y - pt.cy
            const dist = Math.hypot(dx, dy) || 0.001
            const nx = dx / dist
            const ny = dy / dist

            // Base orbit: tangent in this field's direction + a spring back to
            // the ring radius.
            let vx = pt.dir * ny * SPEED - nx * (dist - pt.r0) * SPRING
            let vy = -pt.dir * nx * SPEED - ny * (dist - pt.r0) * SPRING

            if (mouse.active) {
              const mx = pt.x - mouse.x
              const my = pt.y - mouse.y
              const md = Math.hypot(mx, my)
              if (md < HOVER_R) {
                const w = 1 - md / HOVER_R
                const mnx = mx / (md || 0.001)
                const mny = my / (md || 0.001)
                // Counter-clockwise tangent around the cursor + a slight inward
                // gather, blended in by how close the particle is.
                const hvx = (-mny - mnx * 0.3) * HOVER_SPEED
                const hvy = (mnx - mny * 0.3) * HOVER_SPEED
                vx = vx * (1 - w) + hvx * w
                vy = vy * (1 - w) + hvy * w
              }
            }

            pt.x += vx * dt
            pt.y += vy * dt
            p.point(pt.x, pt.y)
          }
        }

        p.windowResized = () => {
          p.resizeCanvas(el.clientWidth, el.clientHeight)
          seed()
          paintBase()
        }

        refresh = () => {
          readColors()
          paintBase()
        }
      }

      instance = new P5(sketch, el) as unknown as { remove: () => void }
    })

    const observer = new MutationObserver(() => refresh?.())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerout", onLeave)

    return () => {
      disposed = true
      observer.disconnect()
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerout", onLeave)
      instance?.remove()
    }
  }, [count])

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 text-foreground",
        className
      )}
    />
  )
}
