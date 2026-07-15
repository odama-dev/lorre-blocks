import type { ThemeDefinition } from "../types"

/**
 * The root theme: calm neutral grays with a refined blue accent.
 * Every other theme extends this one — it must define every token group.
 */
export const basic: ThemeDefinition = {
  name: "basic",
  description:
    "Neutral, versatile default theme — cool grays, refined blue accent, moderate radius. A safe base for any product.",
  colors: {
    neutral: { hue: 255, chroma: 0.012, lightness: 0.55 },
    accent: { hue: 262, chroma: 0.21, lightness: 0.55 },
    danger: { hue: 27, chroma: 0.22, lightness: 0.58 },
    success: { hue: 158, chroma: 0.13, lightness: 0.6 },
    warning: { hue: 75, chroma: 0.16, lightness: 0.77 },
  },
  typography: {
    fontSans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    fontMono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
    typeScale: { base: "1rem", ratio: 1.25 },
  },
  radius: {
    base: "0.5rem",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
  },
  shadows: {
    xs: "0 1px 2px 0 oklch(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)",
    md: "0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1)",
  },
  motion: {
    durationFast: "120ms",
    durationNormal: "200ms",
    durationSlow: "320ms",
    easeSmooth: [0.32, 0.72, 0, 1],
    easeSnappy: [0.2, 0, 0, 1],
  },
  spacing: { scaling: 1 },
  // Defaults mirror the ui source exactly (button: rounded-md h-9 px-4, …) so
  // wiring the components onto these vars (Phase 7.2) is pixel-identical.
  components: {
    // Values are what button.tsx spelled out before it was tokenized, so the
    // rendered button is unchanged: h-9/px-4/text-sm, h-8/px-3/text-xs (sm),
    // h-10/px-8 (lg, which inherited text-sm from the base class).
    button: {
      radius: "var(--radius-md)",
      height: "calc(var(--spacing) * 9)",
      px: "calc(var(--spacing) * 4)",
      "font-size": "var(--text-sm)",
      "font-weight": "var(--font-weight-medium)",
      "height-sm": "calc(var(--spacing) * 8)",
      "px-sm": "calc(var(--spacing) * 3)",
      "font-size-sm": "var(--text-xs)",
      "height-lg": "calc(var(--spacing) * 10)",
      "px-lg": "calc(var(--spacing) * 8)",
      "font-size-lg": "var(--text-sm)",
    },
    input: {
      radius: "var(--radius-md)",
      height: "calc(var(--spacing) * 9)",
      px: "calc(var(--spacing) * 3)",
      "font-size": "var(--text-sm)",
    },
    card: {
      radius: "var(--radius-xl)",
      padding: "calc(var(--spacing) * 6)",
    },
    panel: {
      radius: "var(--radius-lg)",
      padding: "calc(var(--spacing) * 6)",
    },
    badge: {
      radius: "var(--radius-md)",
      px: "calc(var(--spacing) * 2.5)",
      py: "calc(var(--spacing) * 0.5)",
    },
    tabs: {
      radius: "var(--radius-lg)",
      "trigger-radius": "var(--radius-md)",
    },
    control: {
      radius: "var(--radius-sm)",
      size: "calc(var(--spacing) * 4)",
    },
    tooltip: {
      radius: "var(--radius-md)",
      px: "calc(var(--spacing) * 3)",
      py: "calc(var(--spacing) * 1.5)",
    },
  },
  icons: { set: "lucide" },
}
