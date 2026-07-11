"use client"

import * as React from "react"
import { InfoIcon, TriangleAlertIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Callout, CalloutText } from "@/components/ui/callout"
import {
  DataList,
  DataListItem,
  DataListLabel,
  DataListValue,
} from "@/components/ui/data-list"
import { Kbd } from "@/components/ui/kbd"
import { Quote } from "@/components/ui/quote"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control"
import { Spinner } from "@/components/ui/spinner"

export function CalloutDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Callout>
        <InfoIcon />
        <CalloutText>
          You will need admin privileges to install and access this application.
        </CalloutText>
      </Callout>
      <Callout variant="warning">
        <TriangleAlertIcon />
        <CalloutText>Your subscription renews in 3 days.</CalloutText>
      </Callout>
    </div>
  )
}

export function KbdDemo() {
  return (
    <p className="text-sm text-muted-foreground">
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search, <Kbd>Esc</Kbd> to dismiss.
    </p>
  )
}

export function SpinnerDemo() {
  return (
    <div className="flex items-center gap-6">
      <Spinner className="size-4" />
      <Spinner className="size-6 text-primary" />
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Generating…
      </span>
    </div>
  )
}

export function SegmentedControlDemo() {
  const [view, setView] = React.useState("preview")
  return (
    <div className="flex flex-col items-center gap-3">
      <SegmentedControl value={view} onValueChange={setView}>
        <SegmentedControlItem value="preview">Preview</SegmentedControlItem>
        <SegmentedControlItem value="code">Code</SegmentedControlItem>
        <SegmentedControlItem value="tokens">Tokens</SegmentedControlItem>
      </SegmentedControl>
      <p className="text-xs text-muted-foreground">active: {view}</p>
    </div>
  )
}

export function QuoteDemo() {
  return (
    <p className="max-w-md text-sm leading-relaxed">
      As the Radix docs put it, <Quote>a design system is a product serving
      products</Quote> — the registry is exactly that.
    </p>
  )
}

export function DataListDemo() {
  return (
    <DataList className="w-full max-w-sm">
      <DataListItem>
        <DataListLabel>Status</DataListLabel>
        <DataListValue>
          <Badge variant="secondary">Authorized</Badge>
        </DataListValue>
      </DataListItem>
      <DataListItem>
        <DataListLabel>Name</DataListLabel>
        <DataListValue>Lorre Studio</DataListValue>
      </DataListItem>
      <DataListItem>
        <DataListLabel>Email</DataListLabel>
        <DataListValue className="font-mono text-xs">
          hello@lorre.studio
        </DataListValue>
      </DataListItem>
    </DataList>
  )
}
