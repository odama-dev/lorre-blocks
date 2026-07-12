"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's Terminal: a mock terminal window that plays a scripted
 * session. Sequence lines with explicit `delay` props — `TypingAnimation`
 * types character by character (JS timer), `AnimatedSpan` fades in via the
 * fade-in token. motion-reduce (and any JS-off render) shows the full
 * transcript immediately.
 */
function Terminal({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="terminal"
      className={cn(
        "w-full max-w-lg rounded-xl border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex gap-1.5 border-b p-3">
        <span className="size-3 rounded-full bg-red-500/80" />
        <span className="size-3 rounded-full bg-yellow-500/80" />
        <span className="size-3 rounded-full bg-green-500/80" />
      </div>
      <pre className="grid gap-1 overflow-x-auto p-4 font-mono text-sm whitespace-pre-wrap">
        {children}
      </pre>
    </div>
  )
}

export interface AnimatedSpanProps extends React.ComponentProps<"span"> {
  /** ms after mount before this line appears. */
  delay?: number
}

/** A transcript line that fades in `delay` ms after mount. */
function AnimatedSpan({ delay = 0, className, style, ...props }: AnimatedSpanProps) {
  return (
    <span
      data-slot="animated-span"
      className={cn(
        "block animate-fade-in [animation-fill-mode:backwards] motion-reduce:animate-none",
        className
      )}
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...props}
    />
  )
}

export interface TypingAnimationProps extends React.ComponentProps<"span"> {
  children: string
  /** ms after mount before typing starts. */
  delay?: number
  /** ms per character. */
  duration?: number
}

/** A transcript line typed out character by character. */
function TypingAnimation({
  children,
  delay = 0,
  duration = 60,
  className,
  ...props
}: TypingAnimationProps) {
  const [length, setLength] = React.useState(0)
  const [started, setStarted] = React.useState(false)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLength(children.length)
      setStarted(true)
      return
    }
    setLength(0)
    setStarted(false)
    const start = setTimeout(() => {
      setStarted(true)
      const timer = setInterval(() => {
        setLength((current) => {
          if (current >= children.length) {
            clearInterval(timer)
            return current
          }
          return current + 1
        })
      }, duration)
    }, delay)
    return () => clearTimeout(start)
  }, [children, delay, duration])

  return (
    <span
      data-slot="typing-animation"
      className={cn("block", !started && "invisible", className)}
      {...props}
    >
      {children.slice(0, length) || " "}
    </span>
  )
}

export { Terminal, AnimatedSpan, TypingAnimation }
