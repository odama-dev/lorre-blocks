"use client"

import * as React from "react"

import { DotPattern } from "@/components/ui/dot-pattern"
import { GridPattern } from "@/components/ui/grid-pattern"
import { Aurora } from "@lorre-blocks/registry/motion/aurora"
import { Globe } from "@lorre-blocks/registry/motion/globe"
import { Hyperspeed } from "@lorre-blocks/registry/motion/hyperspeed"
import { RetroGrid } from "@lorre-blocks/registry/motion/retro-grid"
import { Ripple } from "@lorre-blocks/registry/motion/ripple"
import { Waves } from "@lorre-blocks/registry/motion/waves"

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative flex h-48 w-full max-w-sm items-center justify-center overflow-hidden rounded-xl border bg-card">
      {children}
      <span className="pointer-events-none z-10 text-sm font-semibold">{label}</span>
    </div>
  )
}

export function RetroGridDemo() {
  return (
    <Frame label="Retro grid">
      <RetroGrid />
    </Frame>
  )
}

export function RippleDemo() {
  return (
    <Frame label="Ripple">
      <Ripple />
    </Frame>
  )
}

export function DotPatternDemo() {
  return (
    <Frame label="Dot pattern">
      <DotPattern className="[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
    </Frame>
  )
}

export function GridPatternDemo() {
  return (
    <Frame label="Grid pattern">
      <GridPattern className="[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
    </Frame>
  )
}

export function AuroraDemo() {
  return (
    <Frame label="Aurora">
      <Aurora />
    </Frame>
  )
}

export function HyperspeedDemo() {
  return (
    <Frame label="Hyperspeed">
      <Hyperspeed />
    </Frame>
  )
}

export function WavesDemo() {
  return (
    <Frame label="Waves">
      <Waves />
    </Frame>
  )
}

export function GlobeDemo() {
  return <Globe className="max-w-xs" markers={[{ location: [-6.2, 106.8], size: 0.1 }]} />
}
