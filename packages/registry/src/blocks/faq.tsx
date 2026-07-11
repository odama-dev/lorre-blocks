import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqProps extends React.ComponentProps<"section"> {
  title?: string
  description?: string
  items: FaqItem[]
}

/**
 * FAQ section: a header plus an accordion of question/answer pairs.
 * One item open at a time; all items start closed.
 */
function Faq({
  title = "Frequently asked questions",
  description,
  items,
  className,
  ...props
}: FaqProps) {
  return (
    <section
      data-slot="faq"
      className={cn("w-full py-16 md:py-24", className)}
      {...props}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6">
        <div data-slot="faq-header" className="flex flex-col gap-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>
        <Accordion data-slot="faq-items" type="single" collapsible>
          {items.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

export { Faq }
