export const THEME_START = "/* lorre-blocks theme start */"
export const THEME_END = "/* lorre-blocks theme end */"

const TAILWIND_IMPORT = '@import "tailwindcss";'

export function hasTheme(cssContent: string): boolean {
  return cssContent.includes(THEME_START)
}

export function injectThemeBlock(cssContent: string, themeCss: string): string {
  const block = `${THEME_START}\n${themeCss.trim()}\n${THEME_END}`

  if (hasTheme(cssContent)) {
    return cssContent.replace(
      new RegExp(
        `${escapeRegExp(THEME_START)}[\\s\\S]*?${escapeRegExp(THEME_END)}`
      ),
      block
    )
  }

  const trimmed = cssContent.trimEnd()

  if (trimmed.includes(TAILWIND_IMPORT)) {
    const lines = trimmed.split("\n")
    const idx = lines.findIndex((l) => l.trim() === TAILWIND_IMPORT)
    lines.splice(idx + 1, 0, "", block)
    return lines.join("\n") + "\n"
  }

  const prefix = trimmed.length > 0 ? `${trimmed}\n\n` : ""
  return `${TAILWIND_IMPORT}\n\n${prefix}${block}\n`
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
