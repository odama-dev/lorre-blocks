import type { Metadata } from "next"

import { HOUSE_THEME, typeSpecimens } from "@www/lib/core-elements"

export const metadata: Metadata = { title: "Typography" }

const steps = typeSpecimens()
const measured = steps.some((step) => step.measured)

export default function TypographyPage() {
  return (
    <article className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Core elements
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Typography</h1>
      <p className="mt-4 text-muted-foreground">
        {steps.length} text styles from the{" "}
        <code className="font-mono text-sm">{HOUSE_THEME}</code> theme. Each one
        is a Tailwind utility:{" "}
        <code className="font-mono text-sm">text-{steps[0]?.name}</code> carries
        the size, line-height, letter-spacing, weight and family together.
      </p>
      {measured && (
        <p className="mt-4 text-sm text-muted-foreground">
          These steps are measured, not derived. No single ratio reaches them —
          and size alone stops identifying a style: <em>label-sm</em> and{" "}
          <em>paragraph-sm</em> are both 14/20 and differ only in weight, while{" "}
          <em>subheading-sm</em> is also 14/20 at the same weight and differs
          only in letter-spacing.
        </p>
      )}

      <div className="mt-10 space-y-8">
        {steps.map((step) => (
          <section key={step.name} className="border-b border-dashed pb-8">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <code className="font-mono text-sm font-medium">
                text-{step.name}
              </code>
              <span className="font-mono text-xs text-muted-foreground">
                {step.size} / {step.lineHeight}
                {step.weight !== undefined && ` · ${step.weight}`}
                {step.letterSpacing !== undefined && ` · ${step.letterSpacing}`}
                {step.family !== undefined && ` · ${step.family}`}
              </span>
            </div>
            <p
              className="mt-3 truncate"
              style={{
                fontSize: step.size,
                lineHeight: step.lineHeight,
                letterSpacing: step.letterSpacing,
                fontWeight: step.weight,
                fontFamily: step.fontFamily,
              }}
            >
              The quick brown fox
            </p>
          </section>
        ))}
      </div>
    </article>
  )
}
