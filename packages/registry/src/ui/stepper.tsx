"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface StepperProps extends React.ComponentProps<"div"> {
  /** One <Step> per step, in order. */
  children: React.ReactNode
  /** Called with the new 1-based step on every change. */
  onStepChange?: (step: number) => void
  /** Label for the final button. */
  finishLabel?: string
}

/**
 * React Bits' Stepper, recomposed on Lorre primitives (upstream is
 * framer-motion): numbered indicators with check marks, sliding content and
 * Back/Continue controls driven by CSS transitions. Composes the Lorre
 * Button; announces progress via aria-current.
 */
function Stepper({
  children,
  onStepChange,
  finishLabel = "Finish",
  className,
  ...props
}: StepperProps) {
  const steps = React.Children.toArray(children)
  const [active, setActive] = React.useState(0)
  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, next))
    setActive(clamped)
    onStepChange?.(clamped + 1)
  }

  return (
    <div
      data-slot="stepper"
      className={cn("w-full max-w-md rounded-xl border bg-card p-6", className)}
      {...props}
    >
      <ol className="flex items-center gap-2">
        {steps.map((_, index) => {
          const done = index < active
          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <li aria-hidden className="h-px flex-1 bg-border">
                  <div
                    className="h-px bg-primary transition-[width] duration-300 motion-reduce:transition-none"
                    style={{ width: done || index === active ? "100%" : "0%" }}
                  />
                </li>
              )}
              <li>
                <button
                  type="button"
                  aria-current={index === active ? "step" : undefined}
                  aria-label={`Step ${index + 1}`}
                  onClick={() => go(index)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                    index === active && "border-primary bg-primary text-primary-foreground",
                    done && "border-primary bg-primary/15 text-primary",
                    index > active && "text-muted-foreground"
                  )}
                >
                  {done ? <CheckIcon className="size-4" /> : index + 1}
                </button>
              </li>
            </React.Fragment>
          )
        })}
      </ol>
      <div className="relative mt-6 overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {steps.map((step, index) => (
            <div key={index} aria-hidden={index !== active} className="w-full shrink-0 px-1">
              {step}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={() => go(active - 1)} disabled={active === 0}>
          Back
        </Button>
        <Button onClick={() => go(active + 1)} disabled={active === steps.length - 1}>
          {active === steps.length - 1 ? finishLabel : "Continue"}
        </Button>
      </div>
    </div>
  )
}

/** One step's content inside a Stepper. */
function Step({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="step" className={cn("text-sm", className)} {...props} />
}

export { Stepper, Step }
