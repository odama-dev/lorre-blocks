import { hexToSeed } from "../oklch"
import type { ThemeDefinition } from "../types"

/**
 * Odama — Lorre wearing AlignUI's visual language.
 *
 * Values come from AlignUI v1.1's Color Palette and Typography pages, read via
 * Figma MCP and cross-checked against the team's reference doc (123/123
 * primitives agreed). Nothing here is a guess; where AlignUI has no answer, the
 * token is left to the generator rather than invented — see "Not mapped" below.
 *
 * ## Why the colors are not pinned ramps
 *
 * `ColorRamp` (R1) looks like the obvious fit and is the wrong tool here.
 * AlignUI's hue scales carry 11 shades (50–950) where a Lorre ramp takes 12, so
 * every hue would need one made-up step. Worse, AlignUI only defines dark mode
 * for its *semantic* tokens, not for each primitive shade — pinning a 12-step
 * ramp would leave four of its dark steps with nothing to fill them.
 *
 * So the scales stay seeded, anchored on each hue's 500 shade. They feed the
 * Tailwind utilities (`bg-neutral-3`) and the two components that still read raw
 * steps. The exact AlignUI values land on the *semantic* layer via R2, which is
 * where they matter: 73 of 75 components read semantics and nothing else.
 *
 * ## Not mapped — deliberately, not overlooked
 *
 * AlignUI publishes dark values for its bg/text/stroke/icon groups only. Its
 * {primary} and {state} groups have no dark counterpart on the reference, so
 * `primary`, `destructive`, `success`, `warning` and `ring` stay scale refs:
 * their light step lands exactly on AlignUI's base colour (a seed's step 9 *is*
 * its seed), and dark comes from the generator instead of from a guess.
 *
 * These have no home in the 23-name vocabulary at all, and are dropped by the
 * compression decision rather than approximated: `text-soft-400`,
 * `text-disabled-300`, `bg-sub-300`, `bg-surface-800`, `bg-strong-950`,
 * `stroke-strong-950`, and the {state} families beyond the four above
 * (faded, away, feature, verified, highlighted, stable).
 */
export const odama: ThemeDefinition = {
  name: "odama",
  description:
    "AlignUI's visual language on Lorre tokens — neutral grays, blue primary, tight radii, Inter Display headings. The house theme.",
  extends: "basic",

  // Anchored on each hue's 500 shade: a seed's step 9 is the seed itself, so
  // `accent-9` resolves to exactly #335CFF.
  colors: {
    neutral: hexToSeed("#7B7B7B"), // neutral/gray/500
    accent: hexToSeed("#335CFF"), // blue/500 — primary-base
    danger: hexToSeed("#FB3748"), // red/500 — error-base
    success: hexToSeed("#1FC16B"), // green/500 — success-base
    warning: hexToSeed("#FA7319"), // orange/500 — warning-base
  },

  /**
   * Exact AlignUI values, per mode. Dark is not a transform of light here —
   * AlignUI compresses the range rather than mirroring it (bg-weak-50 goes
   * 50 → 800, where an inversion would say 950), so both sides are stated.
   */
  semantics: {
    // bg-white-0
    background: { light: "#FFFFFF", dark: "#171717" },
    card: { light: "#FFFFFF", dark: "#171717" },
    popover: { light: "#FFFFFF", dark: "#171717" },

    // text-strong-950
    foreground: { light: "#171717", dark: "#FFFFFF" },
    "card-foreground": { light: "#171717", dark: "#FFFFFF" },
    "popover-foreground": { light: "#171717", dark: "#FFFFFF" },

    // bg-weak-50
    muted: { light: "#F7F7F7", dark: "#262626" },
    secondary: { light: "#F7F7F7", dark: "#262626" },
    "secondary-foreground": { light: "#171717", dark: "#FFFFFF" },

    // text-sub-600
    "muted-foreground": { light: "#5C5C5C", dark: "#A3A3A3" },

    // bg-soft-200 — the interaction surface sits one step above muted.
    accent: { light: "#EBEBEB", dark: "#333333" },
    "accent-foreground": { light: "#171717", dark: "#FFFFFF" },

    // stroke-soft-200 / stroke-sub-300
    border: { light: "#EBEBEB", dark: "#333333" },
    input: { light: "#D1D1D1", dark: "#5C5C5C" },
  },

  /**
   * All 22 AlignUI text styles, measured. Letter-spacing is in percent, as
   * AlignUI states it. Titles are the only styles on Inter Display.
   */
  typography: {
    fontSans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    fontDisplay: ["Inter Display", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    typeScale: {
      steps: {
        "title-h1": { size: "3.5rem", lineHeight: "4rem", letterSpacing: "-1%", weight: 500, family: "display" },
        "title-h2": { size: "3rem", lineHeight: "3.5rem", letterSpacing: "-1%", weight: 500, family: "display" },
        "title-h3": { size: "2.5rem", lineHeight: "3rem", letterSpacing: "-1%", weight: 500, family: "display" },
        "title-h4": { size: "2rem", lineHeight: "2.5rem", letterSpacing: "-0.5%", weight: 500, family: "display" },
        "title-h5": { size: "1.5rem", lineHeight: "2rem", letterSpacing: "0%", weight: 500, family: "display" },
        "title-h6": { size: "1.25rem", lineHeight: "1.75rem", letterSpacing: "0%", weight: 500, family: "display" },

        "label-xl": { size: "1.5rem", lineHeight: "2rem", letterSpacing: "-1.5%", weight: 500 },
        "label-lg": { size: "1.125rem", lineHeight: "1.5rem", letterSpacing: "-1.5%", weight: 500 },
        "label-md": { size: "1rem", lineHeight: "1.5rem", letterSpacing: "-1.1%", weight: 500 },
        "label-sm": { size: "0.875rem", lineHeight: "1.25rem", letterSpacing: "-0.6%", weight: 500 },
        "label-xs": { size: "0.75rem", lineHeight: "1rem", letterSpacing: "0%", weight: 500 },

        "paragraph-xl": { size: "1.5rem", lineHeight: "2rem", letterSpacing: "-1.5%", weight: 400 },
        "paragraph-lg": { size: "1.125rem", lineHeight: "1.5rem", letterSpacing: "-1.5%", weight: 400 },
        "paragraph-md": { size: "1rem", lineHeight: "1.5rem", letterSpacing: "-1.1%", weight: 400 },
        "paragraph-sm": { size: "0.875rem", lineHeight: "1.25rem", letterSpacing: "-0.6%", weight: 400 },
        "paragraph-xs": { size: "0.75rem", lineHeight: "1rem", letterSpacing: "0%", weight: 400 },

        // Subheadings are set in caps by AlignUI; text-transform is not a type
        // token in Tailwind, so the components carry it, not the theme.
        "subheading-md": { size: "1rem", lineHeight: "1.5rem", letterSpacing: "6%", weight: 500 },
        "subheading-sm": { size: "0.875rem", lineHeight: "1.25rem", letterSpacing: "6%", weight: 500 },
        "subheading-xs": { size: "0.75rem", lineHeight: "1rem", letterSpacing: "4%", weight: 500 },
        "subheading-2xs": { size: "0.6875rem", lineHeight: "0.75rem", letterSpacing: "2%", weight: 500 },

        "docs-label": { size: "1.125rem", lineHeight: "2rem", letterSpacing: "-1.5%", weight: 500 },
        "docs-paragraph": { size: "1.125rem", lineHeight: "2rem", letterSpacing: "-1.5%", weight: 400 },
      },
    },
  },

  /**
   * AlignUI ships 12 radii named by their pixel value (radius-0 … radius-28,
   * radius-full); Lorre carries six named by t-shirt size. The scales do not
   * correspond, so this picks the six AlignUI steps that read closest to each
   * role — a judgement call, and the one place in this file worth arguing over.
   */
  radius: {
    base: "0.625rem", // radius-10
    sm: "0.25rem", // radius-4
    md: "0.5rem", // radius-8
    lg: "0.625rem", // radius-10
    xl: "1rem", // radius-16
    "2xl": "1.25rem", // radius-20
  },

  // AlignUI has five durations; we carry three. Extra Fast (100ms) and Extra
  // Slow (500ms) have no home and are dropped.
  motion: {
    durationFast: "200ms",
    durationNormal: "300ms",
    durationSlow: "400ms",
  },
}
