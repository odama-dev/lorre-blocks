"use client"

import * as React from "react"

import { BlurText } from "@lorre-blocks/registry/motion/blur-text"
import { CircularText } from "@lorre-blocks/registry/motion/circular-text"
import { CurvedLoop } from "@lorre-blocks/registry/motion/curved-loop"
import { DecryptedText } from "@lorre-blocks/registry/motion/decrypted-text"
import { GlitchText } from "@lorre-blocks/registry/motion/glitch-text"
import { ScrambleText } from "@lorre-blocks/registry/motion/scramble-text"
import { SplitText } from "@lorre-blocks/registry/motion/split-text"
import { VariableProximity } from "@lorre-blocks/registry/motion/variable-proximity"

export function SplitTextDemo() {
  return <SplitText className="text-3xl font-bold" text="Hello, Lorre!" />
}

export function BlurTextDemo() {
  return (
    <BlurText
      className="text-2xl font-semibold"
      text="Words sharpen into place"
    />
  )
}

export function DecryptedTextDemo() {
  return (
    <DecryptedText
      className="text-xl font-semibold"
      text="ACCESS GRANTED: lorre-blocks"
    />
  )
}

export function ScrambleTextDemo() {
  return (
    <div className="space-y-2 text-center">
      <ScrambleText className="text-2xl font-semibold" text="Run your pointer over me" />
      <p className="text-sm text-muted-foreground">Hover the letters.</p>
    </div>
  )
}

export function CircularTextDemo() {
  return <CircularText text="LORRE·BLOCKS·DESIGN·TOKENS·" radius={64} />
}

export function CurvedLoopDemo() {
  return <CurvedLoop text="Lorre Blocks" className="text-primary" />
}

export function VariableProximityDemo() {
  return (
    <div className="space-y-2 text-center">
      <VariableProximity className="text-3xl" text="Weight follows your pointer" />
      <p className="text-sm text-muted-foreground">
        Move the pointer across the words (variable font required).
      </p>
    </div>
  )
}

export function GlitchTextDemo() {
  return <GlitchText className="text-4xl" text="GLITCH" />
}
