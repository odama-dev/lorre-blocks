import type * as React from "react"
import {
  Bouncy,
  BouncyArc,
  Cardio,
  ChaoticOrbit,
  DotPulse,
  DotSpinner,
  DotStream,
  DotWave,
  Grid,
  Hatch,
  Helix,
  Hourglass,
  Infinity,
  Jelly,
  JellyTriangle,
  Leapfrog,
  LineSpinner,
  LineWobble,
  Metronome,
  Mirage,
  Miyagi,
  Momentum,
  NewtonsCradle,
  Orbit,
  Ping,
  Pinwheel,
  Pulsar,
  Quantum,
  Reuleaux,
  Ring,
  Ring2,
  Ripples,
  Spiral,
  Square,
  Squircle,
  Superballs,
  TailChase,
  Tailspin,
  Treadmill,
  Trefoil,
  Trio,
  Waveform,
  Wobble,
  Zoomies,
} from "ldrs/react"

import "ldrs/react/Bouncy.css"
import "ldrs/react/BouncyArc.css"
import "ldrs/react/Cardio.css"
import "ldrs/react/ChaoticOrbit.css"
import "ldrs/react/DotPulse.css"
import "ldrs/react/DotSpinner.css"
import "ldrs/react/DotStream.css"
import "ldrs/react/DotWave.css"
import "ldrs/react/Grid.css"
import "ldrs/react/Hatch.css"
import "ldrs/react/Helix.css"
import "ldrs/react/Hourglass.css"
import "ldrs/react/Infinity.css"
import "ldrs/react/Jelly.css"
import "ldrs/react/JellyTriangle.css"
import "ldrs/react/Leapfrog.css"
import "ldrs/react/LineSpinner.css"
import "ldrs/react/LineWobble.css"
import "ldrs/react/Metronome.css"
import "ldrs/react/Mirage.css"
import "ldrs/react/Miyagi.css"
import "ldrs/react/Momentum.css"
import "ldrs/react/NewtonsCradle.css"
import "ldrs/react/Orbit.css"
import "ldrs/react/Ping.css"
import "ldrs/react/Pinwheel.css"
import "ldrs/react/Pulsar.css"
import "ldrs/react/Quantum.css"
import "ldrs/react/Reuleaux.css"
import "ldrs/react/Ring.css"
import "ldrs/react/Ring2.css"
import "ldrs/react/Ripples.css"
import "ldrs/react/Spiral.css"
import "ldrs/react/Square.css"
import "ldrs/react/Squircle.css"
import "ldrs/react/Superballs.css"
import "ldrs/react/TailChase.css"
import "ldrs/react/Tailspin.css"
import "ldrs/react/Treadmill.css"
import "ldrs/react/Trefoil.css"
import "ldrs/react/Trio.css"
import "ldrs/react/Waveform.css"
import "ldrs/react/Wobble.css"
import "ldrs/react/Zoomies.css"

import { kebab } from "@www/lib/icon-sets"

export interface LoaderProps {
  size?: number | string
  color?: string
  speed?: number | string
  stroke?: number | string
  bgOpacity?: number | string
}

export interface LoaderDef {
  /** kebab display name, e.g. "line-spinner". */
  name: string
  /** React component export, e.g. "LineSpinner". */
  pascal: string
  /** Auto-register subpath, e.g. "lineSpinner". */
  register: string
  /** Custom-element tag, e.g. "l-line-spinner". */
  tag: string
  /** Whether the loader honors a `stroke` width. */
  hasStroke: boolean
  Component: React.ComponentType<LoaderProps>
}

// Loaders whose SVG is stroke-drawn and respond to a `stroke` width.
const STROKE = new Set([
  "Cardio", "DotStream", "Helix", "Hourglass", "Infinity", "LineSpinner",
  "LineWobble", "Metronome", "Momentum", "Quantum", "Ring", "Ring2", "Spiral",
  "Square", "Superballs", "Tailspin", "Trefoil", "Waveform", "Zoomies",
])

const RAW: [string, React.ComponentType<LoaderProps>][] = [
  ["Bouncy", Bouncy],
  ["BouncyArc", BouncyArc],
  ["Cardio", Cardio],
  ["ChaoticOrbit", ChaoticOrbit],
  ["DotPulse", DotPulse],
  ["DotSpinner", DotSpinner],
  ["DotStream", DotStream],
  ["DotWave", DotWave],
  ["Grid", Grid],
  ["Hatch", Hatch],
  ["Helix", Helix],
  ["Hourglass", Hourglass],
  ["Infinity", Infinity],
  ["Jelly", Jelly],
  ["JellyTriangle", JellyTriangle],
  ["Leapfrog", Leapfrog],
  ["LineSpinner", LineSpinner],
  ["LineWobble", LineWobble],
  ["Metronome", Metronome],
  ["Mirage", Mirage],
  ["Miyagi", Miyagi],
  ["Momentum", Momentum],
  ["NewtonsCradle", NewtonsCradle],
  ["Orbit", Orbit],
  ["Ping", Ping],
  ["Pinwheel", Pinwheel],
  ["Pulsar", Pulsar],
  ["Quantum", Quantum],
  ["Reuleaux", Reuleaux],
  ["Ring", Ring],
  ["Ring2", Ring2],
  ["Ripples", Ripples],
  ["Spiral", Spiral],
  ["Square", Square],
  ["Squircle", Squircle],
  ["Superballs", Superballs],
  ["TailChase", TailChase],
  ["Tailspin", Tailspin],
  ["Treadmill", Treadmill],
  ["Trefoil", Trefoil],
  ["Trio", Trio],
  ["Waveform", Waveform],
  ["Wobble", Wobble],
  ["Zoomies", Zoomies],
]

export const LOADERS: LoaderDef[] = RAW.map(([pascal, Component]) => {
  const name = kebab(pascal)
  return {
    name,
    pascal,
    register: pascal.charAt(0).toLowerCase() + pascal.slice(1),
    tag: `l-${name}`,
    hasStroke: STROKE.has(pascal),
    Component,
  }
})
