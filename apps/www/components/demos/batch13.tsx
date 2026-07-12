"use client"

import * as React from "react"

import { File, Folder, Tree } from "@/components/ui/file-tree"
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog"
import { AnimatedSpan, Terminal, TypingAnimation } from "@/components/ui/terminal"
import { AuroraText } from "@lorre-blocks/registry/motion/aurora-text"
import { BoxReveal } from "@lorre-blocks/registry/motion/box-reveal"
import { MorphingText } from "@lorre-blocks/registry/motion/morphing-text"
import { ScrollProgress } from "@lorre-blocks/registry/motion/scroll-progress"
import { ScrollVelocity } from "@lorre-blocks/registry/motion/scroll-based-velocity"
import { SparklesText } from "@lorre-blocks/registry/motion/sparkles-text"
import { TextReveal } from "@lorre-blocks/registry/motion/text-reveal"

export function TextRevealDemo() {
  return (
    <div className="w-full rounded-xl border bg-card">
      <TextReveal
        className="h-[150vh]"
        text="Design tokens first. Components second. Every block re-themes itself."
      />
    </div>
  )
}

export function BoxRevealDemo() {
  return (
    <div className="flex flex-col items-start gap-3">
      <BoxReveal>
        <h3 className="text-2xl font-bold">
          Lorre Blocks<span className="text-primary">.</span>
        </h3>
      </BoxReveal>
      <BoxReveal delay={200}>
        <p className="text-muted-foreground">
          Token-driven components for <span className="font-semibold text-primary">agents</span>.
        </p>
      </BoxReveal>
    </div>
  )
}

export function SparklesTextDemo() {
  return <SparklesText className="text-4xl">Magical</SparklesText>
}

export function MorphingTextDemo() {
  return (
    <MorphingText
      className="text-3xl"
      words={["Design", "Develop", "Deploy", "Delight"]}
    />
  )
}

export function AuroraTextDemo() {
  return (
    <h3 className="text-4xl font-bold">
      Ship <AuroraText>beautiful</AuroraText> UI
    </h3>
  )
}

export function ScrollProgressDemo() {
  return (
    <div className="space-y-2 text-center">
      <ScrollProgress />
      <p className="text-sm text-muted-foreground">
        Look at the very top of the viewport, then scroll — the gradient bar
        tracks your reading progress.
      </p>
    </div>
  )
}

export function ScrollBasedVelocityDemo() {
  return (
    <ScrollVelocity className="text-3xl font-bold uppercase">
      Scroll faster · <span className="text-primary">Lorre Blocks</span> ·
    </ScrollVelocity>
  )
}

export function HeroVideoDialogDemo() {
  return (
    <HeroVideoDialog
      className="w-full max-w-md"
      videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ"
      thumbnailSrc="https://avatar.vercel.sh/lorre-video.svg?size=640&text=▶"
      thumbnailAlt="Product tour"
    />
  )
}

export function TerminalDemo() {
  return (
    <Terminal>
      <TypingAnimation>$ npx lorre-blocks add terminal</TypingAnimation>
      <AnimatedSpan delay={1800} className="text-green-500">
        ✔ Resolved 1 item from the registry.
      </AnimatedSpan>
      <AnimatedSpan delay={2300} className="text-green-500">
        ✔ Wrote components/ui/terminal.tsx
      </AnimatedSpan>
      <AnimatedSpan delay={2800} className="text-muted-foreground">
        Done in 1.2s — happy shipping!
      </AnimatedSpan>
    </Terminal>
  )
}

export function FileTreeDemo() {
  return (
    <Tree>
      <Folder element="app" defaultOpen>
        <Folder element="components" defaultOpen>
          <Folder element="ui" defaultOpen>
            <File selected>file-tree.tsx</File>
            <File>terminal.tsx</File>
          </Folder>
          <File>site-header.tsx</File>
        </Folder>
        <File>layout.tsx</File>
        <File>page.tsx</File>
      </Folder>
      <File>package.json</File>
    </Tree>
  )
}
