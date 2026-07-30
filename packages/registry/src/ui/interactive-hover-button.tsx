import * as React from "react"
import { ArrowRight as ArrowRightIcon } from "@untitledui/icons"
import { cn } from "@/lib/utils"

/**
 * Magic UI's InteractiveHoverButton: a dot that expands to flood the button
 * on hover while the label slides out and returns with an arrow. Pure CSS
 * group transitions; motion-reduce collapses to a plain hover state.
 */
function InteractiveHoverButton({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="interactive-hover-button"
      className={cn(
        "group relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-background px-6 py-2.5 text-sm font-semibold",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div
          aria-hidden
          className="size-2 rounded-full bg-primary transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[100.8] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <span className="inline-block transition-[opacity,transform] duration-300 motion-reduce:transition-none group-hover:translate-x-12 group-hover:opacity-0 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:opacity-100">
          {children}
        </span>
      </div>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-[opacity,transform] duration-300 motion-reduce:transition-none group-hover:-translate-x-0 group-hover:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:opacity-0">
        <span>{children}</span>
        <ArrowRightIcon className="size-4" />
      </div>
    </button>
  )
}

export { InteractiveHoverButton }
