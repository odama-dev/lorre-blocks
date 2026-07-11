"use client"

import * as React from "react"
import { SparklesIcon } from "lucide-react"

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { MagicCard } from "@/components/ui/magic-card"
import { NeonGradientCard } from "@/components/ui/neon-gradient-card"
import { PulsatingButton } from "@/components/ui/pulsating-button"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { RippleButton } from "@/components/ui/ripple-button"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { ShineBorder } from "@lorre-blocks/registry/motion/shine-border"

export function ShimmerButtonDemo() {
  return (
    <ShimmerButton>
      <SparklesIcon className="size-4" />
      Ship it
    </ShimmerButton>
  )
}

export function RainbowButtonDemo() {
  return <RainbowButton>Get unlimited access</RainbowButton>
}

export function PulsatingButtonDemo() {
  return <PulsatingButton>Claim your spot</PulsatingButton>
}

export function RippleButtonDemo() {
  return <RippleButton>Click me</RippleButton>
}

export function InteractiveHoverButtonDemo() {
  return <InteractiveHoverButton>Explore the registry</InteractiveHoverButton>
}

export function MagicCardDemo() {
  return (
    <MagicCard className="w-full max-w-sm">
      <div className="p-6">
        <h3 className="font-semibold">Move your pointer here</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The spotlight tints the border with the theme's primary and washes
          the surface with accent-3 — swap themes and it follows.
        </p>
      </div>
    </MagicCard>
  )
}

export function NeonGradientCardDemo() {
  return (
    <NeonGradientCard className="w-full max-w-sm">
      <h3 className="text-lg font-semibold">Neon, but on-brand</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        The glow is the accent scale of whichever theme is active — violet in
        dreamy, monochrome in utilitarian.
      </p>
    </NeonGradientCard>
  )
}

export function ShineBorderDemo() {
  return (
    <ShineBorder className="w-full max-w-sm rounded-xl border bg-card">
      <div className="p-6">
        <h3 className="font-semibold">Shine border</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          A highlight orbits this card's border — the content underneath is a
          plain card, untouched.
        </p>
      </div>
    </ShineBorder>
  )
}
