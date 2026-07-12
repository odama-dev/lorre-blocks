import type { ThemeDefinition } from "../types"

/**
 * Dense, high-contrast, dashboard/enterprise energy: monochrome accent
 * (charcoal solids that flip to light in dark mode), sharp radii, crisp
 * minimal shadows, fast motion.
 */
export const utilitarian: ThemeDefinition = {
  name: "utilitarian",
  description:
    "High-contrast and dense — monochrome accent, cold grays, sharp radii, minimal shadows, fast motion. For dashboards and enterprise UI.",
  extends: "basic",
  colors: {
    neutral: { hue: 240, chroma: 0.006, lightness: 0.5 },
    accent: {
      hue: 240,
      chroma: 0.015,
      lightness: 0.27,
      dark: { lightness: 0.92, chroma: 0.006 },
    },
    danger: { hue: 25, chroma: 0.24, lightness: 0.55 },
    success: { hue: 152, chroma: 0.14, lightness: 0.56 },
    warning: { hue: 70, chroma: 0.17, lightness: 0.74 },
  },
  typography: {
    fontSans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    fontMono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
  },
  radius: {
    base: "0.25rem",
    sm: "0.125rem",
    md: "0.25rem",
    lg: "0.375rem",
    xl: "0.5rem",
    "2xl": "0.75rem",
  },
  shadows: {
    xs: "0 1px 2px 0 oklch(0 0 0 / 0.06)",
    sm: "0 1px 2px 0 oklch(0 0 0 / 0.1)",
    md: "0 2px 4px -1px oklch(0 0 0 / 0.12)",
    lg: "0 4px 8px -2px oklch(0 0 0 / 0.12)",
    xl: "0 8px 16px -4px oklch(0 0 0 / 0.14)",
  },
  motion: {
    durationFast: "80ms",
    durationNormal: "140ms",
    durationSlow: "220ms",
    easeSmooth: [0.3, 0, 0.2, 1],
    easeSnappy: [0.2, 0, 0, 1],
  },
}
