"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"
import {
  isExplicitTypeScale,
  isRamp,
  PUBLIC_ICON_SETS,
  type ColorSeed,
  type ColorSpec,
  type ComponentTokens,
  type ThemeDefinition,
} from "@lorre-blocks/tokens"

import { cn } from "@lorre-blocks/registry/lib/utils"
import { Button } from "@lorre-blocks/registry/ui/button"
import { Input } from "@lorre-blocks/registry/ui/input"
import { Label } from "@lorre-blocks/registry/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lorre-blocks/registry/ui/select"
import { Slider } from "@lorre-blocks/registry/ui/slider"
import { Switch } from "@lorre-blocks/registry/ui/switch"
import {
  ACCENT_PRESETS,
  MONO_FONTS,
  monoStack,
  NEUTRAL_PRESETS,
  RADIUS_PRESETS,
  radiusScaleFromBase,
  SANS_FONTS,
  sansStack,
  SCALING_PRESETS,
  seedFromHex,
  seedToHex,
  type ColorPreset,
} from "@www/lib/studio"

interface ControlsProps {
  def: ThemeDefinition
  patch: (update: Partial<ThemeDefinition>) => void
  reset: () => void
}

export function StudioControls({ def, patch, reset }: ControlsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Theme</h2>
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-xs">
          <RotateCcw className="h-3 w-3" /> Reset
        </Button>
      </div>

      <Section title="Base">
        <div className="grid gap-2">
          <Label htmlFor="studio-name" className="text-xs">
            Name
          </Label>
          <Input
            id="studio-name"
            value={def.name}
            onChange={(e) =>
              patch({ name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-xs">Extends</Label>
          <Select
            value={def.extends ?? "basic"}
            onValueChange={(v) => patch({ extends: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">basic</SelectItem>
              <SelectItem value="dreamy">dreamy</SelectItem>
              <SelectItem value="utilitarian">utilitarian</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="Accent">
        <ColorControl
          presets={ACCENT_PRESETS}
          spec={def.colors?.accent}
          onSeed={(seed) => patchColor(def, patch, "accent", seed)}
        />
      </Section>

      <Section title="Neutral">
        <ColorControl
          presets={NEUTRAL_PRESETS}
          spec={def.colors?.neutral}
          onSeed={(seed) => patchColor(def, patch, "neutral", seed)}
        />
      </Section>

      <Section title="Secondary">
        <div className="flex items-center justify-between">
          <Label htmlFor="studio-secondary" className="text-xs text-muted-foreground">
            Second brand scale
          </Label>
          <Switch
            id="studio-secondary"
            checked={Boolean(def.colors?.secondary)}
            onCheckedChange={(on) =>
              patchColor(
                def,
                patch,
                "secondary",
                on ? { hue: 50, chroma: 0.17, lightness: 0.65 } : undefined
              )
            }
          />
        </div>
        {def.colors?.secondary ? (
          <ColorControl
            presets={ACCENT_PRESETS}
            spec={def.colors?.secondary}
            onSeed={(seed) => patchColor(def, patch, "secondary", seed)}
          />
        ) : null}
      </Section>

      <Section title="Typography">
        <FontSelect
          label="Sans"
          options={SANS_FONTS.map((f) => f.family)}
          value={def.typography?.fontSans?.[0] ?? "Inter"}
          onChange={(family) =>
            patch({ typography: { ...def.typography, fontSans: sansStack(family) } })
          }
        />
        <FontSelect
          label="Mono"
          options={MONO_FONTS.map((f) => f.family)}
          value={def.typography?.fontMono?.[0] ?? "ui-monospace"}
          onChange={(family) =>
            patch({ typography: { ...def.typography, fontMono: monoStack(family) } })
          }
        />
        <TypeRatioControl def={def} patch={patch} />
      </Section>

      <Section title="Radius">
        <div className="flex flex-wrap gap-1.5">
          {RADIUS_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              variant={def.radius?.base === `${preset.base}rem` ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => patch({ radius: radiusScaleFromBase(preset.base) })}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </Section>

      <Section title="Scaling">
        <div className="flex flex-wrap gap-1.5">
          {SCALING_PRESETS.map((factor) => (
            <Button
              key={factor}
              variant={
                (def.spacing?.scaling ?? 1) === factor ? "default" : "outline"
              }
              size="sm"
              className="text-xs tabular-nums"
              onClick={() => patch({ spacing: { scaling: factor } })}
            >
              {Math.round(factor * 100)}%
            </Button>
          ))}
        </div>
      </Section>

      <Section title="Components">
        <ComponentTokenSelect
          label="Button radius"
          value={def.components?.button?.radius}
          options={[
            { label: "theme default", value: undefined },
            { label: "sharp", value: "var(--radius-sm)" },
            { label: "round", value: "var(--radius-lg)" },
            { label: "pill", value: "9999px" },
          ]}
          onChange={(value) => patchComponent(def, patch, "button", "radius", value)}
        />
        <ComponentTokenSelect
          label="Control size"
          value={def.components?.control?.size}
          options={[
            { label: "theme default", value: undefined },
            { label: "compact", value: "calc(var(--spacing) * 3.5)" },
            { label: "large", value: "calc(var(--spacing) * 5)" },
          ]}
          onChange={(value) => patchComponent(def, patch, "control", "size", value)}
        />
        <ComponentTokenSelect
          label="Card padding"
          value={def.components?.card?.padding}
          options={[
            { label: "theme default", value: undefined },
            { label: "compact", value: "calc(var(--spacing) * 4)" },
            { label: "spacious", value: "calc(var(--spacing) * 8)" },
          ]}
          onChange={(value) => patchComponent(def, patch, "card", "padding", value)}
        />
        <ComponentTokenSelect
          label="Panel radius"
          value={def.components?.panel?.radius}
          options={[
            { label: "theme default", value: undefined },
            { label: "sharp", value: "var(--radius-sm)" },
            { label: "round", value: "var(--radius-xl)" },
          ]}
          onChange={(value) => patchComponent(def, patch, "panel", "radius", value)}
        />
      </Section>

      <Section title="Icons">
        <div className="grid gap-2">
          <Label className="text-xs">Set</Label>
          <Select
            value={def.icons?.set ?? "lucide"}
            onValueChange={(set) => {
              patch({ icons: { set: set as NonNullable<ThemeDefinition["icons"]>["set"] } })
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PUBLIC_ICON_SETS.map((s) => (
                <SelectItem key={s.name} value={s.name}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {styleOptionsFor(def.icons?.set)?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {styleOptionsFor(def.icons?.set)!.map((style) => (
              <Button
                key={style}
                variant={def.icons?.style === style ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => patch({ icons: { set: def.icons!.set, style } })}
              >
                {style}
              </Button>
            ))}
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Recorded in the theme; agents install and use the chosen set.
        </p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t pt-4 first:border-t-0 first:pt-0">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

/**
 * The ratio slider only means something for a modular scale. A measured scale
 * names every step, so there is no single multiplier to drag.
 */
function TypeRatioControl({
  def,
  patch,
}: {
  def: ThemeDefinition
  patch: (update: Partial<ThemeDefinition>) => void
}) {
  const scale = def.typography?.typeScale

  if (scale && isExplicitTypeScale(scale)) {
    return (
      <p className="text-xs text-muted-foreground">
        {Object.keys(scale.steps).length} measured steps — edit them in the
        theme&apos;s <code className="font-mono">lorre.theme.json</code>.
      </p>
    )
  }

  const ratio = scale?.ratio ?? 1.25
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Type ratio</Label>
        <span className="text-xs tabular-nums text-muted-foreground">{ratio}</span>
      </div>
      <Slider
        min={1.1}
        max={1.4}
        step={0.05}
        value={[ratio]}
        onValueChange={([next]) =>
          patch({
            typography: {
              ...def.typography,
              typeScale: { base: scale?.base ?? "1rem", ratio: next },
            },
          })
        }
      />
    </div>
  )
}

function ColorControl({
  presets,
  spec,
  onSeed,
}: {
  presets: ColorPreset[]
  spec: ColorSpec | undefined
  onSeed: (seed: ColorSeed) => void
}) {
  // The Studio drives a scale from three numbers. A pinned ramp has no hue,
  // chroma or lightness to drive them with — which is the whole reason the
  // ramp form exists. Say so rather than showing sliders that mean nothing.
  if (spec && isRamp(spec)) {
    return (
      <p className="text-xs text-muted-foreground">
        Pinned step by step — edit this scale in its{" "}
        <code className="font-mono">lorre.theme.json</code>.
      </p>
    )
  }

  const seed = spec
  const activeHex = seed ? seedToHex(seed) : null
  const [hexDraft, setHexDraft] = React.useState("")

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => {
          const hex = seedToHex(preset.seed)
          const active =
            seed !== undefined &&
            preset.seed.hue === seed.hue &&
            preset.seed.chroma === seed.chroma &&
            preset.seed.lightness === seed.lightness
          return (
            <button
              key={preset.name}
              type="button"
              title={preset.name}
              aria-label={preset.name}
              aria-pressed={active}
              onClick={() => onSeed(preset.seed)}
              className={cn(
                "h-6 w-6 rounded-full border transition-transform hover:scale-110",
                active && "ring-2 ring-ring ring-offset-2 ring-offset-background"
              )}
              style={{ backgroundColor: hex }}
            />
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={hexDraft}
          placeholder={activeHex ?? "#5B6CFF"}
          className="h-8 font-mono text-xs"
          onChange={(e) => {
            setHexDraft(e.target.value)
            const parsed = seedFromHex(e.target.value)
            if (parsed) onSeed(parsed)
          }}
        />
        <span
          className="h-8 w-8 shrink-0 rounded-md border"
          style={{ backgroundColor: activeHex ?? "transparent" }}
        />
      </div>
    </div>
  )
}

function FontSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (family: string) => void
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((family) => (
            <SelectItem key={family} value={family}>
              <span style={{ fontFamily: family }}>{family}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function ComponentTokenSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string | undefined
  options: Array<{ label: string; value: string | undefined }>
  onChange: (value: string | undefined) => void
}) {
  const current = options.find((o) => o.value === value) ?? options[0]
  return (
    <div className="grid gap-2">
      <Label className="text-xs">{label}</Label>
      <Select
        value={current.label}
        onValueChange={(picked) =>
          onChange(options.find((o) => o.label === picked)?.value)
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.label} value={o.label}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function patchColor(
  def: ThemeDefinition,
  patch: (update: Partial<ThemeDefinition>) => void,
  scale: "accent" | "neutral" | "secondary",
  seed: ColorSeed | undefined
) {
  const colors = { ...def.colors }
  if (seed === undefined) {
    delete colors[scale]
  } else {
    colors[scale] = seed
  }
  patch({ colors: Object.keys(colors).length > 0 ? colors : undefined })
}

function patchComponent(
  def: ThemeDefinition,
  patch: (update: Partial<ThemeDefinition>) => void,
  component: keyof ComponentTokens,
  key: string,
  value: string | undefined
) {
  const components: Record<string, Record<string, string>> = {
    ...(def.components as Record<string, Record<string, string>>),
  }
  const tokens = { ...components[component] }
  if (value === undefined) {
    delete tokens[key]
  } else {
    tokens[key] = value
  }
  if (Object.keys(tokens).length > 0) {
    components[component] = tokens
  } else {
    delete components[component]
  }
  patch({
    components:
      Object.keys(components).length > 0 ? (components as ComponentTokens) : undefined,
  })
}

function styleOptionsFor(setName: string | undefined): readonly string[] | null {
  if (!setName) return null
  return PUBLIC_ICON_SETS.find((s) => s.name === setName)?.styles ?? null
}
