import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

export interface TestimonialItem {
  quote: string
  author: string
  /** Role and/or company line under the author name. */
  role?: string
  /** Avatar image URL; falls back to the author's initials. */
  avatar?: string
}

export interface TestimonialsProps extends React.ComponentProps<"section"> {
  title?: string
  description?: string
  items: TestimonialItem[]
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/**
 * Testimonials section: a header plus a responsive grid of quote cards with
 * author attribution and avatar (image or initials fallback).
 */
function Testimonials({
  title,
  description,
  items,
  className,
  ...props
}: TestimonialsProps) {
  return (
    <section
      data-slot="testimonials"
      className={cn("w-full py-16 md:py-24", className)}
      {...props}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
        {(title || description) && (
          <div
            data-slot="testimonials-header"
            className="mx-auto flex max-w-2xl flex-col gap-4 text-center"
          >
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <div
          data-slot="testimonials-grid"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item) => (
            <Card key={item.author + item.quote.slice(0, 16)} data-slot="testimonials-item">
              <CardContent className="flex h-full flex-col gap-6 p-6">
                <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <Avatar>
                    {item.avatar && (
                      <AvatarImage src={item.avatar} alt={item.author} />
                    )}
                    <AvatarFallback>{initials(item.author)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {item.author}
                    </span>
                    {item.role && (
                      <span className="text-xs text-muted-foreground">
                        {item.role}
                      </span>
                    )}
                  </div>
                </figcaption>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export { Testimonials }
