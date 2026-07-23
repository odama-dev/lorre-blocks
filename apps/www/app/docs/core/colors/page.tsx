import type { Metadata } from "next"
import Link from "next/link"

import {
  HOUSE_THEME,
  colorSpecimens,
  semanticSpecimens,
  type Swatch,
} from "@www/lib/core-elements"

export const metadata: Metadata = { title: "Colors" }

const scales = colorSpecimens()
const semantics = semanticSpecimens()

function Ramp({ steps }: { steps: Swatch[] }) {
  return (
    <div className="flex overflow-hidden border border-dashed">
      {steps.map((swatch) => (
        <div key={swatch.step} className="group relative flex-1">
          <div className="h-12" style={{ backgroundColor: swatch.hex }} />
          <div className="px-1 py-1 text-center font-mono text-[10px] text-muted-foreground">
            {swatch.step}
          </div>
          <span className="pointer-events-none absolute inset-x-0 -top-6 hidden justify-center font-mono text-[10px] group-hover:flex">
            {swatch.hex}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ColorsPage() {
  return (
    <article className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Core elements
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Colors</h1>
      <p className="mt-4 text-muted-foreground">
        The <code className="font-mono text-sm">{HOUSE_THEME}</code> theme carries
        AlignUI&rsquo;s palette. Every value below is resolved from the theme at
        build time through the same generator that writes the stylesheet, so this
        page cannot drift from what your components actually render.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Semantic colors</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The contract components code against — 73 of 75 read nothing else. These
        are where AlignUI&rsquo;s exact values land, stated per mode rather than
        derived, because a hand-tuned dark mode is not a transform of its light
        mode.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-dashed text-left">
              <th className="py-2 pr-4 font-medium">Token</th>
              <th className="py-2 pr-4 font-medium">Light</th>
              <th className="py-2 font-medium">Dark</th>
            </tr>
          </thead>
          <tbody>
            {semantics.map((entry) => (
              <tr key={entry.name} className="border-b border-dashed/50">
                <td className="py-2 pr-4 font-mono text-xs">--{entry.name}</td>
                {[entry.light, entry.dark].map((hex, i) => (
                  <td key={i} className="py-2 pr-4">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-4 shrink-0 border border-dashed"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {hex}
                      </span>
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Scales</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Twelve steps per hue, following Radix semantics: 1&ndash;2 app
        backgrounds, 3&ndash;5 component backgrounds, 6&ndash;8 borders,
        9&ndash;10 solid, 11&ndash;12 text. Reach them as{" "}
        <code className="font-mono text-xs">bg-neutral-3</code> and friends.
      </p>
      <div className="mt-6 space-y-8">
        {scales.map((scale) => (
          <section key={scale.name}>
            <h3 className="font-mono text-sm font-medium">{scale.name}</h3>
            <div className="mt-3 space-y-2">
              {(["light", "dark"] as const).map((mode) => (
                <div key={mode}>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {mode}
                  </p>
                  <Ramp steps={scale[mode]} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        To change any of this, edit the theme rather than the components — see{" "}
        <Link href="/docs/theming" className="underline underline-offset-4">
          Theming
        </Link>
        .
      </p>
    </article>
  )
}
