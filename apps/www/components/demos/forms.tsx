"use client"

import * as React from "react"
import { Bold, Italic, Underline } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@lorre-blocks/registry/ui/button"
import { Calendar } from "@lorre-blocks/registry/ui/calendar"
import { Checkbox } from "@lorre-blocks/registry/ui/checkbox"
import { Combobox } from "@lorre-blocks/registry/ui/combobox"
import { DatePicker } from "@lorre-blocks/registry/ui/date-picker"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@lorre-blocks/registry/ui/form"
import { Input } from "@lorre-blocks/registry/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@lorre-blocks/registry/ui/input-otp"
import { Label } from "@lorre-blocks/registry/ui/label"
import { Progress } from "@lorre-blocks/registry/ui/progress"
import {
  RadioGroup,
  RadioGroupItem,
} from "@lorre-blocks/registry/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lorre-blocks/registry/ui/select"
import { Slider } from "@lorre-blocks/registry/ui/slider"
import { Switch } from "@lorre-blocks/registry/ui/switch"
import { Textarea } from "@lorre-blocks/registry/ui/textarea"
import { Toggle } from "@lorre-blocks/registry/ui/toggle"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@lorre-blocks/registry/ui/toggle-group"

export function CheckboxDemo() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" defaultChecked />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  )
}

export function SwitchDemo() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="airplane" />
      <Label htmlFor="airplane">Airplane mode</Label>
    </div>
  )
}

export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable">
      {["default", "comfortable", "compact"].map((value) => (
        <div key={value} className="flex items-center gap-2">
          <RadioGroupItem value={value} id={value} />
          <Label htmlFor={value} className="capitalize">
            {value}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}

export function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
        <SelectItem value="mango">Mango</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function SliderDemo() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <Slider defaultValue={[50]} max={100} step={1} />
      <Slider defaultValue={[20, 80]} max={100} step={1} />
    </div>
  )
}

export function ToggleDemo() {
  return (
    <div className="flex items-center gap-2">
      <Toggle aria-label="Toggle bold" defaultPressed>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle underline" variant="outline">
        <Underline className="h-4 w-4" />
      </Toggle>
    </div>
  )
}

export function ProgressDemo() {
  const [value, setValue] = React.useState(15)
  React.useEffect(() => {
    const timer = setTimeout(() => setValue(66), 600)
    return () => clearTimeout(timer)
  }, [])
  return <Progress value={value} className="w-full max-w-sm" />
}

export function FormDemo() {
  const form = useForm({ defaultValues: { username: "" } })
  return (
    <Form {...form}>
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={form.handleSubmit(() => {})}
      >
        <FormField
          control={form.control}
          name="username"
          rules={{
            required: "Username is required.",
            minLength: { value: 3, message: "At least 3 characters." },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="lorre" {...field} />
              </FormControl>
              <FormDescription>Your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

export function ComboboxDemo() {
  return (
    <Combobox
      options={[
        { value: "next", label: "Next.js" },
        { value: "vite", label: "Vite" },
        { value: "remix", label: "Remix" },
        { value: "astro", label: "Astro" },
      ]}
      placeholder="Select framework…"
    />
  )
}

export function DatePickerDemo() {
  return <DatePicker />
}

export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  )
}

export function TextareaDemo() {
  return (
    <div className="grid w-full max-w-md gap-2">
      <Label htmlFor="message">Your message</Label>
      <Textarea id="message" placeholder="Type your message here." />
    </div>
  )
}

export function InputOTPDemo() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}

export function ToggleGroupDemo() {
  return (
    <ToggleGroup type="multiple" variant="outline" defaultValue={["bold"]}>
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
