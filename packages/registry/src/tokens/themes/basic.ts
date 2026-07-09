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
}
