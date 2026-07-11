"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const DockContext = React.createContext<{
  mouseX: number | null
  magnification: number
  distance: number
}>({ mouseX: null, magnification: 1.6, distance: 120 })

/**
 * Magic UI's Dock: a macOS-style dock whose icons magnify near the pointer.
 * Upstream uses framer-motion springs; here each icon's scale is a linear
 * falloff of its distance to the pointer, smoothed by a CSS transition —
 * zero runtime deps. motion-reduce disables the magnification entirely.
 */
function Dock({
  className,
  children,
  magnification = 1.6,
  distance = 120,
  ...props
}: React.ComponentProps<"div"> & {
  /** Max scale at the pointer. */
  magnification?: number
  /** px radius of the magnification falloff. */
  distance?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [mouseX, setMouseX] = React.useState<number | null>(null)

  return (
    <DockContext.Provider value={{ mouseX, magnification, distance }}>
      <div
        ref={ref}
        data-slot="dock"
        onPointerMove={(event) => {
          const rect = ref.current?.getBoundingClientRect()
          if (rect) setMouseX(event.clientX - rect.left)
        }}
        onPointerLeave={() => setMouseX(null)}
        className={cn(
          "mx-auto flex h-14 w-max items-end gap-2 rounded-2xl border bg-card/80 px-2 pb-1.5 backdrop-blur-md",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </DockContext.Provider>
  )
}

function DockIcon({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { mouseX, magnification, distance } = React.useContext(DockContext)
  const ref = React.useRef<HTMLDivElement>(null)

  let scale = 1
  if (mouseX !== null && ref.current) {
    const rect = ref.current
    const center = rect.offsetLeft + rect.offsetWidth / 2
    const d = Math.abs(mouseX - center)
    if (d < distance) {
      scale = 1 + (magnification - 1) * (1 - d / distance)
    }
  }

  return (
    <div
      ref={ref}
      data-slot="dock-icon"
      className={cn(
        "flex aspect-square w-10 origin-bottom items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform duration-100 ease-out hover:text-foreground motion-reduce:!scale-100 motion-reduce:transition-none",
        "[&_svg]:size-5",
        className
      )}
      style={{ transform: `scale(${scale})` }}
      {...props}
    >
      {children}
    </div>
  )
}

export { Dock, DockIcon }
