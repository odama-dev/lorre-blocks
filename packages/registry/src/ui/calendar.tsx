"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "@untitledui/icons"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-4",
        nav: "absolute inset-x-0 top-0 z-10 flex w-full items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 p-0 opacity-50 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 p-0 opacity-50 hover:opacity-100"
        ),
        month_caption: "flex h-7 items-center justify-center",
        caption_label: "text-sm font-medium",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground",
        week: "mt-2 flex w-full",
        day: cn(
          "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        range_start: "day-range-start",
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", chevronClassName)} />
          ) : (
            <ChevronRight className={cn("h-4 w-4", chevronClassName)} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
