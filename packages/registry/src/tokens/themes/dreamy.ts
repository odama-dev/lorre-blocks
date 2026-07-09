import type { ThemeDefinition } from "../types"

/**
 * Soft, atmospheric, creative-site energy: violet accent on warm lavender
 * neutrals, generous radii, big soft tinted shadows, slower easing.
 */
export const dreamy: ThemeDefinition = {
  name: "dreamy",
  description:
    "Soft and atmospheric — violet accent, lavender-tinted neutrals, large radii, plush shadows. For creative and marketing sites.",
  extends: "basic",
  colors: {
    neutral: { hue: 300, chroma: 0.015, lightness: 0.55 },
    accent: { hue: 292, chroma: 0.2, lightness: 0.62 },
    danger: { hue: 12, chroma: 0.17, lightness: 0.64 },
    success: { hue: 172, chroma: 0.11, lightness: 0.64 },
    warning: { hue: 65, chroma: 0.14, lightness: 0.8 },
  },
  semantics: {
    // Tinted interaction surfaces instead of plain gray hovers.
    accent: "accent-3",
    "accent-foreground": "accent-11",
    secondary: "accent-2",
    "secondary-foreground": "accent-11",
  },
  typography: {
    fontSans: ["Nunito", "ui-rounded", "system-ui", "sans-serif"],
    fontDisplay: ["Fraunces", "Georgia", "serif"],
  },
  radius: {
    base: "1rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
  },
  shadows: {
    xs: "0 2px 8px -2px oklch(0.45 0.12 292 / 0.12)",
    sm: "0 4px 16px -4px oklch(0.45 0.12 292 / 0.14)",
    md: "0 8px 24px -6px oklch(0.45 0.12 292 / 0.16)",
    lg: "0 16px 40px -8px oklch(0.45 0.12 292 / 0.18)",
    xl: "0 24px 56px -12px oklch(0.45 0.12 292 / 0.22)",
  },
  motion: {
    durationFast: "180ms",
    durationNormal: "280ms",
    durationSlow: "440ms",
    easeSmooth: [0.33, 1, 0.68, 1],
    easeSnappy: [0.34, 1.3, 0.64, 1],
  },
}
