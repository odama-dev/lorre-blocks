"use client"

import * as React from "react"
import { CloudIcon, PaletteIcon, TerminalIcon, ZapIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Masonry } from "@/components/ui/masonry"
import { Stack } from "@/components/ui/stack"
import { Step, Stepper } from "@/components/ui/stepper"
import { TiltedCard } from "@/components/ui/tilted-card"
import { BlobCursor } from "@lorre-blocks/registry/motion/blob-cursor"
import { ClickSpark } from "@lorre-blocks/registry/motion/click-spark"
import { InfiniteScroll } from "@lorre-blocks/registry/motion/infinite-scroll"
import { Magnet } from "@lorre-blocks/registry/motion/magnet"
import { PixelTrail } from "@lorre-blocks/registry/motion/pixel-trail"
import { StarBorder } from "@lorre-blocks/registry/motion/star-border"

export function ClickSparkDemo() {
  return (
    <ClickSpark className="flex h-40 w-full max-w-sm items-center justify-center rounded-xl border bg-card">
      <span className="text-sm text-muted-foreground">Click anywhere in here</span>
    </ClickSpark>
  )
}

export function MagnetDemo() {
  return (
    <Magnet>
      <Button>Hover near me</Button>
    </Magnet>
  )
}

export function StarBorderDemo() {
  return <StarBorder className="font-medium">Star border</StarBorder>
}

export function PixelTrailDemo() {
  return (
    <div className="relative h-48 w-full max-w-sm overflow-hidden rounded-xl border bg-card">
      <PixelTrail />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
        Move your pointer
      </span>
    </div>
  )
}

export function BlobCursorDemo() {
  return (
    <div className="relative h-48 w-full max-w-sm overflow-hidden rounded-xl border bg-card">
      <BlobCursor />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
        Move your pointer
      </span>
    </div>
  )
}

const FEED = [
  { icon: ZapIcon, label: "count-up" },
  { icon: PaletteIcon, label: "aurora-text" },
  { icon: TerminalIcon, label: "terminal" },
  { icon: CloudIcon, label: "border-beam" },
]

export function InfiniteScrollDemo() {
  return (
    <div className="flex h-64 w-full items-center justify-center overflow-hidden">
      <InfiniteScroll className="h-56 w-56">
        {FEED.map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
            <item.icon className="size-4 text-primary" />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}

export function TiltedCardDemo() {
  return (
    <TiltedCard className="w-64">
      <h3 className="font-semibold">Tilted card</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Move the pointer around — the card follows in 3D.
      </p>
    </TiltedCard>
  )
}

export function StackDemo() {
  const cards = ["basic", "dreamy", "utilitarian"]
  return (
    <Stack>
      {cards.map((theme) => (
        <div key={theme} className="flex size-full items-center justify-center">
          <span className="font-semibold capitalize">{theme}</span>
        </div>
      ))}
    </Stack>
  )
}

export function StepperDemo() {
  return (
    <Stepper>
      <Step>
        <h4 className="font-semibold">Install</h4>
        <p className="mt-1 text-muted-foreground">npx lorre-blocks init</p>
      </Step>
      <Step>
        <h4 className="font-semibold">Add components</h4>
        <p className="mt-1 text-muted-foreground">npx lorre-blocks add stepper</p>
      </Step>
      <Step>
        <h4 className="font-semibold">Ship</h4>
        <p className="mt-1 text-muted-foreground">Tokens do the theming.</p>
      </Step>
    </Stepper>
  )
}

export function MasonryDemo() {
  const heights = [88, 140, 104, 172, 96, 128]
  return (
    <Masonry columns={3} className="w-full max-w-xl">
      {heights.map((height, index) => (
        <div
          key={index}
          className="flex items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground"
          style={{ height }}
        >
          {index + 1}
        </div>
      ))}
    </Masonry>
  )
}
