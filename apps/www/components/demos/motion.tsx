import { Blocks, Palette, Terminal, Wrench, Zap, Layers } from "lucide-react"

import { CountUp } from "@lorre-blocks/registry/motion/count-up"
import { FadeIn } from "@lorre-blocks/registry/motion/fade-in"
import { Marquee } from "@lorre-blocks/registry/motion/marquee"

const LOGOS = [
  { icon: Palette, name: "Tokenly" },
  { icon: Blocks, name: "Blockade" },
  { icon: Terminal, name: "AgentOps" },
  { icon: Wrench, name: "Sculptor" },
  { icon: Zap, name: "Fastlane" },
  { icon: Layers, name: "Stackly" },
]

export function MarqueeDemo() {
  return (
    <Marquee pauseOnHover>
      {LOGOS.map(({ icon: Icon, name }) => (
        <span
          key={name}
          className="flex items-center gap-2 text-lg font-semibold text-muted-foreground"
        >
          <Icon className="h-5 w-5" />
          {name}
        </span>
      ))}
    </Marquee>
  )
}

export function CountUpDemo() {
  return (
    <div className="flex flex-wrap items-baseline justify-center gap-10 text-center">
      <div>
        <div className="text-4xl font-bold">
          <CountUp value={52} />
        </div>
        <div className="text-sm text-muted-foreground">registry items</div>
      </div>
      <div>
        <div className="text-4xl font-bold">
          <CountUp value={99.9} decimals={1} suffix="%" />
        </div>
        <div className="text-sm text-muted-foreground">uptime</div>
      </div>
      <div>
        <div className="text-4xl font-bold">
          <CountUp value={1284} prefix="+" />
        </div>
        <div className="text-sm text-muted-foreground">installs</div>
      </div>
    </div>
  )
}

export function FadeInDemo() {
  return (
    <div className="flex flex-col gap-4">
      {["First", "Second", "Third"].map((label, index) => (
        <FadeIn key={label} delay={index * 150}>
          <div className="rounded-lg border bg-card p-4 text-sm text-card-foreground shadow-sm">
            {label} card — staggered {index * 150}ms
          </div>
        </FadeIn>
      ))}
    </div>
  )
}
