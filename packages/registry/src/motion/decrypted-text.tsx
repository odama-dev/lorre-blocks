"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const GLYPHS = "!<>-_\\/[]{}—=+*^?#________"

export interface DecryptedTextProps extends React.ComponentProps<"span"> {
  /** The text to decrypt into view. */
  text: string
  /** ms per animation frame. */
  speed?: number
  /** Frames each character stays scrambled before locking in. */
  framesPerChar?: number
}

/**
 * React Bits' DecryptedText, reimplemented on a plain JS timer (upstream is
 * framer-motion): characters churn through random glyphs and lock in left to
 * right the first time the text scrolls into view. SSR renders the plain
 * string (no hydration drift); prefers-reduced-motion keeps it plain.
 */
function DecryptedText({
  text,
  speed = 35,
  framesPerChar = 3,
  className,
  ...props
}: DecryptedTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = React.useState(text)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const el = ref.current
    if (!el) return
    let timer: ReturnType<typeof setInterval>
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        let frame = 0
        timer = setInterval(() => {
          frame += 1
          const locked = Math.floor(frame / framesPerChar)
          if (locked >= text.length) {
            setDisplay(text)
            clearInterval(timer)
            return
          }
          setDisplay(
            text
              .split("")
              .map((char, index) => {
                if (index < locked || char === " ") return char
                return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
              })
              .join("")
          )
        }, speed)
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      clearInterval(timer)
    }
  }, [text, speed, framesPerChar])

  return (
    <span
      ref={ref}
      data-slot="decrypted-text"
      aria-label={text}
      className={cn("font-mono whitespace-pre-wrap", className)}
      {...props}
    >
      <span aria-hidden>{display}</span>
    </span>
  )
}

export { DecryptedText }
