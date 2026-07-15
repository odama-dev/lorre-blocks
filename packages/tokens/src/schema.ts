import { z } from "zod"

import { getIconSet, ICON_SETS } from "./icons"
import { KEY_COMPONENTS } from "./types"

/**
 * The `lorre.theme.json` contract (Phase 7.1) — one validator shared by the
 * CLI (`theme create`), `plan.json`'s inline theme, the registry build, and
 * the www Theme Studio, so every surface accepts exactly the same input.
 *
 * Everything except name/description is optional: custom themes extend a
 * registry theme (default `basic`) and override only what they care about.
 */

const SEMANTIC_NAMES = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "border",
  "input",
  "ring",
] as const

const seedFields = {
  hue: z.number().min(0).max(360),
  chroma: z.number().min(0).max(0.5),
  lightness: z.number().min(0).max(1),
  onSolid: z.enum(["light", "dark"]).optional(),
}

const colorSeedSchema = z
  .object({
    ...seedFields,
    dark: z
      .object(seedFields)
      .partial()
      .strict()
      .optional(),
  })
  .strict()

/** Steps 1–12, hex only — the ramp is pinned, so there is nothing to compute. */
const rampStepsSchema = z
  .array(z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "must be a hex color"))
  .length(12, "a ramp must pin all 12 steps")

const colorRampSchema = z
  .object({
    steps: rampStepsSchema,
    // Required, unlike a seed's: there is no curve to fall back on, and a
    // hand-tuned dark mode cannot be derived from its light mode.
    dark: z.object({ steps: rampStepsSchema }).strict(),
    onSolid: z.enum(["light", "dark"]).optional(),
  })
  .strict()

const colorSpecSchema = z.union([colorRampSchema, colorSeedSchema])

const dimensionSchema = z
  .string()
  .regex(
    /^-?\d*\.?\d+(rem|em|px|%)$/,
    "expected a CSS length like \"0.5rem\""
  )

const cssValueSchema = z.string().min(1)

const bezierSchema = z.tuple([z.number(), z.number(), z.number(), z.number()])

const durationSchema = z
  .string()
  .regex(/^\d*\.?\d+m?s$/, "expected a CSS duration like \"200ms\"")

const typeScaleSchema = z
  .object({
    base: z
      .string()
      .regex(/^\d*\.?\d+rem$/, "typeScale.base must be a rem value like \"1rem\""),
    ratio: z.number().min(1.02).max(2),
    fluid: z.boolean().optional(),
  })
  .strict()

const componentsSchema = z
  .object(
    Object.fromEntries(
      Object.entries(KEY_COMPONENTS).map(([component, keys]) => [
        component,
        z
          .object(Object.fromEntries(keys.map((key) => [key, cssValueSchema])))
          .partial()
          .strict()
          .optional(),
      ])
    )
  )
  .strict()

const iconsSchema = z
  .object({
    set: z.enum(ICON_SETS.map((s) => s.name) as [string, ...string[]]),
    style: z.string().optional(),
  })
  .strict()
  .superRefine((choice, ctx) => {
    const set = getIconSet(choice.set)
    if (!set) return
    if (choice.style && !set.styles.includes(choice.style)) {
      ctx.addIssue({
        code: "custom",
        path: ["style"],
        message:
          set.styles.length === 0
            ? `icon set "${set.name}" has a single style; omit "style"`
            : `icon set "${set.name}" styles are: ${set.styles.join(", ")}`,
      })
    }
  })

export const themeDefinitionSchema = z
  .object({
    name: z
      .string()
      .regex(/^[a-z][a-z0-9-]*$/, "name must be kebab-case"),
    description: z.string().min(1),
    extends: z.string().optional(),
    colors: z
      .object({
        neutral: colorSpecSchema.optional(),
        accent: colorSpecSchema.optional(),
        secondary: colorSpecSchema.optional(),
        danger: colorSpecSchema.optional(),
        success: colorSpecSchema.optional(),
        warning: colorSpecSchema.optional(),
      })
      .strict()
      .optional(),
    semantics: z
      .object(
        Object.fromEntries(
          SEMANTIC_NAMES.map((name) => [name, z.string().min(1)])
        )
      )
      .partial()
      .strict()
      .optional(),
    typography: z
      .object({
        fontSans: z.array(z.string().min(1)).min(1).optional(),
        fontMono: z.array(z.string().min(1)).min(1).optional(),
        fontDisplay: z.array(z.string().min(1)).min(1).optional(),
        typeScale: typeScaleSchema.optional(),
      })
      .strict()
      .optional(),
    radius: z
      .object({
        base: dimensionSchema,
        sm: dimensionSchema,
        md: dimensionSchema,
        lg: dimensionSchema,
        xl: dimensionSchema,
        "2xl": dimensionSchema,
      })
      .partial()
      .strict()
      .optional(),
    shadows: z
      .object({
        xs: cssValueSchema,
        sm: cssValueSchema,
        md: cssValueSchema,
        lg: cssValueSchema,
        xl: cssValueSchema,
      })
      .partial()
      .strict()
      .optional(),
    motion: z
      .object({
        durationFast: durationSchema,
        durationNormal: durationSchema,
        durationSlow: durationSchema,
        easeSmooth: bezierSchema,
        easeSnappy: bezierSchema,
      })
      .partial()
      .strict()
      .optional(),
    spacing: z
      .object({ scaling: z.number().min(0.75).max(1.5) })
      .strict()
      .optional(),
    components: componentsSchema.optional(),
    icons: iconsSchema.optional(),
  })
  .strict()

export type ThemeDefinitionInput = z.infer<typeof themeDefinitionSchema>
