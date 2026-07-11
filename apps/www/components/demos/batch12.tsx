"use client"

import * as React from "react"
import {
  BellIcon,
  BotIcon,
  CloudIcon,
  CodeIcon,
  GlobeIcon,
  HomeIcon,
  MailIcon,
  PaletteIcon,
  SearchIcon,
  SettingsIcon,
  TerminalIcon,
  ZapIcon,
} from "lucide-react"

import { AvatarCircles } from "@/components/ui/avatar-circles"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { Dock, DockIcon } from "@/components/ui/dock"
import { AnimatedBeam } from "@lorre-blocks/registry/motion/animated-beam"
import { AnimatedList } from "@lorre-blocks/registry/motion/animated-list"
import { BorderBeam } from "@lorre-blocks/registry/motion/border-beam"
import { ConfettiButton } from "@lorre-blocks/registry/motion/confetti"
import { Meteors } from "@lorre-blocks/registry/motion/meteors"
import { OrbitingCircles } from "@lorre-blocks/registry/motion/orbiting-circles"
import { Particles } from "@lorre-blocks/registry/motion/particles"

export function BorderBeamDemo() {
  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-xl border bg-card p-6">
      <h3 className="font-semibold">Border beam</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        A glowing segment orbits this card's border on a CSS offset-path.
      </p>
      <BorderBeam />
      <BorderBeam delay={-3} />
    </div>
  )
}

export function AnimatedBeamDemo() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const fromRef = React.useRef<HTMLDivElement>(null)
  const toRef = React.useRef<HTMLDivElement>(null)
  return (
    <div
      ref={containerRef}
      className="relative flex w-full max-w-sm items-center justify-between rounded-xl border bg-card p-8"
    >
      <div ref={fromRef} className="z-10 flex size-12 items-center justify-center rounded-full border bg-background">
        <BotIcon className="size-5" />
      </div>
      <div ref={toRef} className="z-10 flex size-12 items-center justify-center rounded-full border bg-background">
        <CloudIcon className="size-5" />
      </div>
      <AnimatedBeam containerRef={containerRef} fromRef={fromRef} toRef={toRef} curvature={30} />
    </div>
  )
}

export function MeteorsDemo() {
  return (
    <div className="relative flex h-48 w-full max-w-sm items-center justify-center overflow-hidden rounded-xl border bg-card">
      <Meteors number={14} />
      <span className="text-lg font-semibold">Meteors</span>
    </div>
  )
}

export function ParticlesDemo() {
  return (
    <div className="relative flex h-48 w-full max-w-sm items-center justify-center overflow-hidden rounded-xl border bg-card">
      <Particles quantity={70} />
      <span className="pointer-events-none z-10 text-lg font-semibold">
        Move your pointer
      </span>
    </div>
  )
}

export function ConfettiDemo() {
  return <ConfettiButton>Celebrate 🎉</ConfettiButton>
}

export function OrbitingCirclesDemo() {
  return (
    <div className="relative flex h-64 w-full items-center justify-center overflow-hidden">
      <span className="text-sm font-semibold text-muted-foreground">lorre</span>
      <OrbitingCircles radius={60} duration={18}>
        <PaletteIcon className="size-5 text-primary" />
        <CodeIcon className="size-5 text-primary" />
        <ZapIcon className="size-5 text-primary" />
      </OrbitingCircles>
      <OrbitingCircles radius={100} duration={28} reverse>
        <GlobeIcon className="size-4 text-muted-foreground" />
        <TerminalIcon className="size-4 text-muted-foreground" />
      </OrbitingCircles>
    </div>
  )
}

const NOTIFICATIONS = [
  { title: "Payment received", body: "acme-dashboard upgraded to Pro", icon: ZapIcon },
  { title: "New user", body: "hello@lorre.studio just signed up", icon: MailIcon },
  { title: "Deploy finished", body: "lorre-blocks.vercel.app is live", icon: CloudIcon },
  { title: "Mention", body: "@you in #design-system", icon: BellIcon },
]

export function AnimatedListDemo() {
  return (
    <AnimatedList className="w-full max-w-sm">
      {NOTIFICATIONS.map((n) => (
        <div key={n.title} className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
          <n.icon className="size-5 text-primary" />
          <div className="text-sm">
            <p className="font-medium">{n.title}</p>
            <p className="text-muted-foreground">{n.body}</p>
          </div>
        </div>
      ))}
    </AnimatedList>
  )
}

export function BentoGridDemo() {
  return (
    <BentoGrid className="max-w-2xl auto-rows-[150px]">
      <BentoCard
        name="Tokens"
        description="One source, three themes."
        href="/docs/theming"
        icon={PaletteIcon}
        className="col-span-2"
        background={<Particles quantity={30} />}
      />
      <BentoCard
        name="CLI"
        description="Agent-first, always --json."
        href="/docs/cli"
        icon={TerminalIcon}
      />
      <BentoCard
        name="Blocks"
        description="Full marketing sections."
        href="/docs/blocks/hero"
        icon={HomeIcon}
      />
      <BentoCard
        name="Motion"
        description="Effects that honor reduced motion."
        href="/docs/motion/marquee"
        icon={ZapIcon}
        className="col-span-2"
      />
    </BentoGrid>
  )
}

export function AvatarCirclesDemo() {
  const avatars = Array.from({ length: 5 }, (_, i) => ({
    imageUrl: `https://avatar.vercel.sh/lorre${i}.svg?text=${String.fromCharCode(65 + i)}`,
    alt: `User ${i + 1}`,
  }))
  return <AvatarCircles avatars={avatars} numPeople={99} />
}

export function DockDemo() {
  return (
    <Dock>
      <DockIcon><HomeIcon /></DockIcon>
      <DockIcon><SearchIcon /></DockIcon>
      <DockIcon><MailIcon /></DockIcon>
      <DockIcon><PaletteIcon /></DockIcon>
      <DockIcon><SettingsIcon /></DockIcon>
    </Dock>
  )
}
