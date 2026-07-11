"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TypewriterProps extends React.ComponentProps<"span"> {
  /** Words to type through, in order. */
  words: string[]
  /** ms per typed character. */
  typingSpeed?: number
  /** ms per deleted character. */
  deletingSpeed?: number
  /** Pause after a word is fully typed, in ms. */
  pauseMs?: number
  /** Loop back to the first word after the last (default). */
  loop?: boolean
}

/**
 * Types through `words` character by character with a blinking caret (the
 * theme's caret-blink keyframe). Under prefers-reduced-motion the first word
 * renders statically with no caret animation.
 */
function Typewriter({
  words,
  typingSpeed = 60,
  deletingSpeed = 40,
  pauseMs = 1800,
  loop = true,
  className,
  ...props
}: TypewriterProps) {
  const [text, setText] = React.useState("")
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true)
      setText(words[0] ?? "")
      return
    }
    let wordIndex = 0
    let length = 0
    let deleting = false
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const word = words[wordIndex] ?? ""
      length += deleting ? -1 : 1
      setText(word.slice(0, length))

      let delay = deleting ? deletingSpeed : typingSpeed
      if (!deleting && length === word.length) {
        const isLast = wordIndex === words.length - 1
        if (isLast && !loop) return
        deleting = true
        delay = pauseMs
      } else if (deleting && length === 0) {
        deleting = false
        wordIndex = (wordIndex + 1) % words.length
      }
      timer = setTimeout(tick, delay)
    }
    timer = setTimeout(tick, typingSpeed)
    return () => clearTimeout(timer)
  }, [words, typingSpeed, deletingSpeed, pauseMs, loop])

  return (
    <span data-slot="typewriter" className={cn("whitespace-pre", className)} {...props}>
      {text}
      <span
        aria-hidden
        className={cn(
          "ml-0.5 inline-block h-[1em] w-px translate-y-[0.15em] bg-current",
          !reduced && "animate-caret-blink"
        )}
      />
    </span>
  )
}

export { Typewriter }
