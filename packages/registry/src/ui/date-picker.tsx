"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, type CalendarProps } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  /** Formats the selected date for the trigger. Defaults to the locale long date. */
  formatDate?: (date: Date) => string
  disabled?: boolean
  className?: string
  /** Forwarded to the underlying calendar, e.g. `disabled` matchers or `startMonth`. */
  calendarProps?: Omit<
    CalendarProps,
    "mode" | "selected" | "onSelect" | "required"
  >
  ref?: React.Ref<HTMLButtonElement>
}

const defaultFormatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

/**
 * Single-date picker built from popover + calendar + button.
 * Controlled via `date`/`onDateChange`, or leave both off for uncontrolled use.
 */
function DatePicker({
  date: dateProp,
  onDateChange,
  placeholder = "Pick a date",
  formatDate = defaultFormatDate,
  disabled,
  className,
  calendarProps,
  ref,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [uncontrolledDate, setUncontrolledDate] = React.useState<
    Date | undefined
  >(undefined)
  const date = dateProp ?? uncontrolledDate

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          data-slot="date-picker-trigger"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDate(date) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          {...calendarProps}
          mode="single"
          selected={date}
          onSelect={(next) => {
            if (dateProp === undefined) setUncontrolledDate(next)
            onDateChange?.(next)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
