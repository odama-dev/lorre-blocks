"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface StackProps extends React.ComponentProps<"div"> {
  /** Cards, top of the deck first. */
  children: React.ReactNode
  /** Drag distance in px that sends the top card to the back. */
  threshold?: number
}

/**
 * React Bits' Stack, reimplemented on pointer capture + CSS transitions
 * (upstream is framer-motion drag): a fanned deck where dragging (or
 * clicking) the top card past the threshold sends it to the back. Keyboard
 * and reduced-motion users can Enter/click to cycle — the reorder itself is
 * instant state, only the drag is motion.
 */
function Stack({ threshold = 90, className, children, ...props }: StackProps) {
  const cards = React.Children.toArray(children)
  const [order, setOrder] = React.useState(() => cards.map((_, index) => index))
  const [drag, setDrag] = React.useState<{ dx: number; dy: number } | null>(null)
  const start = React.useRef<{ x: number; y: number } | null>(null)

  const cardCount = cards.length
  React.useEffect(() => {
    setOrder(Array.from({ length: cardCount }, (_, index) => index))
  }, [cardCount])

  const cycle = () => setOrder(([top, ...rest]) => [...rest, top])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    start.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current) return
    setDrag({ dx: event.clientX - start.current.x, dy: event.clientY - start.current.y })
  }
  const onPointerUp = () => {
    if (drag && Math.hypot(drag.dx, drag.dy) > threshold) cycle()
    start.current = null
    setDrag(null)
  }

  return (
    <div
      data-slot="stack"
      className={cn("relative h-56 w-44 select-none [perspective:600px]", className)}
      {...props}
    >
      {order.map((cardIndex, position) => {
        const isTop = position === 0
        const offset = isTop && drag ? drag : { dx: 0, dy: 0 }
        return (
          <div
            key={cardIndex}
            role={isTop ? "button" : undefined}
            tabIndex={isTop ? 0 : -1}
            aria-label={isTop ? "Send card to the back" : undefined}
            onKeyDown={isTop ? (e) => e.key === "Enter" && cycle() : undefined}
            onPointerDown={isTop ? onPointerDown : undefined}
            onPointerMove={isTop ? onPointerMove : undefined}
            onPointerUp={isTop ? onPointerUp : undefined}
            className={cn(
              "absolute inset-0 touch-none rounded-xl border bg-card shadow-md",
              isTop && "cursor-grab active:cursor-grabbing",
              !drag && "transition-transform duration-300 ease-out motion-reduce:transition-none"
            )}
            style={{
              zIndex: order.length - position,
              transform: `translate(${offset.dx}px, ${offset.dy}px) rotate(${
                isTop && drag ? offset.dx / 12 : position * 3
              }deg) scale(${1 - position * 0.04})`,
            }}
          >
            {cards[cardIndex]}
          </div>
        )
      })}
    </div>
  )
}

export { Stack }
