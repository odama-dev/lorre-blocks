"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "@untitledui/icons"
import { cn } from "@/lib/utils"
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
 * Single-date picker built from popover + calendar.
 *
 * The trigger is styled as an INPUT, not a button: it is a field the user
 * fills, so it carries the same `--input-*` geometry and the same three states
 * as `Input` — default (placeholder `neutral-6`), focused/open (border
 * `border-active` + bg `background`), filled (value in `foreground`). Using a
 * Button here made a form field look like an action.
 *
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
        <button
          type="button"
          ref={ref}
          data-slot="date-picker-trigger"
          data-filled={date ? "" : undefined}
          disabled={disabled}
          className={cn(
            // Geometri & warna DISALIN dari Input — jangan diubah sepihak di sini
            "flex h-(--input-height) w-full items-center gap-2 rounded-(--input-radius) border border-neutral-3 bg-card px-(--input-px) py-1 text-left text-(length:--input-font-size) transition-colors",
            "focus-visible:border-border-active focus-visible:bg-background focus-visible:outline-none",
            // Kalender terbuka = tetap terlihat fokus meski fokus pindah ke popover
            "data-[state=open]:border-border-active data-[state=open]:bg-background",
            "disabled:cursor-not-allowed disabled:bg-background disabled:opacity-50",
            date ? "text-foreground" : "text-neutral-6",
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          {date ? formatDate(date) : <span>{placeholder}</span>}
        </button>
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
