import * as React from "react"
import { Check } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export interface PricingTier {
  name: string
  /** Rendered as-is, so "Free", "$29" and "Custom" all work. */
  price: string
  /** Shown after the price, e.g. "/month". */
  period?: string
  description?: string
  features: string[]
  cta: { label: string; href: string }
  /** Visually emphasize this tier (accent border + filled button). */
  highlighted?: boolean
  /** Small badge on the tier card, e.g. "Most popular". */
  badge?: string
}

export interface PricingProps extends React.ComponentProps<"section"> {
  title?: string
  description?: string
  tiers: PricingTier[]
}

/**
 * Pricing section: a header plus a responsive grid of tier cards with feature
 * lists. Highlight one tier with `highlighted`; prices are free-form strings.
 */
function Pricing({ title, description, tiers, className, ...props }: PricingProps) {
  return (
    <section
      data-slot="pricing"
      className={cn("w-full py-16 md:py-24", className)}
      {...props}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
        {(title || description) && (
          <div
            data-slot="pricing-header"
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
          data-slot="pricing-tiers"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              data-slot="pricing-tier"
              className={cn(
                "flex flex-col",
                tier.highlighted && "border-primary shadow-md"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  {tier.badge && <Badge>{tier.badge}</Badge>}
                </div>
                <div data-slot="pricing-price" className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  )}
                </div>
                {tier.description && (
                  <CardDescription>{tier.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <ul data-slot="pricing-features" className="flex flex-col gap-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <a
                  href={tier.cta.href}
                  className={cn(
                    buttonVariants({
                      variant: tier.highlighted ? "default" : "outline",
                    }),
                    "w-full"
                  )}
                >
                  {tier.cta.label}
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export { Pricing }
