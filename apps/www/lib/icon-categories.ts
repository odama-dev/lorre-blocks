/**
 * The icon libraries ship no category metadata, so we bucket icons by keywords
 * found in their (kebab-case) names. Approximate but works across every set and
 * needs no extra data. First matching group wins; order therefore matters —
 * put the more specific groups first.
 */

export const ICON_CATEGORIES: { label: string; keywords: string[] }[] = [
  {
    label: "Arrows",
    keywords: [
      "arrow", "chevron", "chevrons", "caret", "corner", "move", "undo", "redo",
      "refresh", "rotate", "expand", "collapse", "maximize", "minimize",
      "trending", "swap", "repeat", "shuffle", "import", "export",
    ],
  },
  {
    label: "Files & Folders",
    keywords: [
      "file", "folder", "document", "clipboard", "paperclip", "archive", "book",
      "notebook", "page", "sheet", "note", "sticky",
    ],
  },
  {
    label: "Media",
    keywords: [
      "play", "pause", "stop", "skip", "rewind", "fast-forward", "volume",
      "music", "video", "film", "camera", "image", "photo", "picture", "mic",
      "microphone", "headphone", "speaker", "cast", "podcast", "radio", "disc",
      "airplay",
    ],
  },
  {
    label: "Communication",
    keywords: [
      "mail", "envelope", "message", "chat", "comment", "phone", "call", "send",
      "inbox", "bell", "notification", "at-sign", "at", "voicemail", "rss",
      "reply", "forward-message",
    ],
  },
  {
    label: "Weather & Nature",
    keywords: [
      "sun", "moon", "cloud", "rain", "snow", "wind", "storm", "umbrella",
      "droplet", "flame", "fire", "leaf", "tree", "flower", "mountain",
      "sparkle", "sparkles", "thermometer", "rainbow", "sunrise", "sunset",
    ],
  },
  {
    label: "Devices & Tech",
    keywords: [
      "monitor", "laptop", "smartphone", "mobile", "tablet", "tv", "keyboard",
      "mouse", "cpu", "server", "database", "hard-drive", "printer", "battery",
      "plug", "wifi", "bluetooth", "usb", "chip", "router", "modem", "webcam",
      "gamepad", "joystick", "memory",
    ],
  },
  {
    label: "Commerce",
    keywords: [
      "shopping", "cart", "bag", "credit-card", "wallet", "dollar", "coin",
      "currency", "tag", "gift", "receipt", "banknote", "percent", "store",
      "package", "truck-delivery", "basket",
    ],
  },
  {
    label: "People",
    keywords: [
      "user", "users", "person", "people", "contact", "group", "profile",
      "account", "avatar", "baby", "accessibility", "smile", "frown", "face",
      "id-card", "id-badge",
    ],
  },
  {
    label: "Maps & Travel",
    keywords: [
      "map", "pin", "location", "navigation", "compass", "globe", "flag", "car",
      "bus", "train", "plane", "bike", "truck", "ship", "anchor", "route",
      "road", "fuel", "parking", "traffic", "sailboat", "rocket",
    ],
  },
  {
    label: "Editing & Design",
    keywords: [
      "edit", "pencil", "pen", "brush", "palette", "crop", "scissors", "eraser",
      "ruler", "paint", "layers", "wand", "bold", "italic", "underline",
      "highlighter", "type", "font", "align", "list-ordered", "quote", "case",
    ],
  },
  {
    label: "Layout & UI",
    keywords: [
      "layout", "grid", "columns", "rows", "sidebar", "panel", "menu", "list",
      "table", "dashboard", "window", "kanban", "distribute", "component",
      "frame", "gallery", "app",
    ],
  },
  {
    label: "Security",
    keywords: [
      "lock", "unlock", "key", "shield", "fingerprint", "eye", "scan",
      "verified", "password", "cookie", "incognito",
    ],
  },
  {
    label: "Time",
    keywords: [
      "clock", "calendar", "timer", "alarm", "hourglass", "watch", "history",
      "schedule", "date", "stopwatch",
    ],
  },
  {
    label: "Development",
    keywords: [
      "code", "terminal", "git", "branch", "bug", "command", "binary",
      "function", "brackets", "variable", "webhook", "braces", "regex",
      "square-code", "file-code",
    ],
  },
  {
    label: "Charts & Data",
    keywords: [
      "chart", "graph", "activity", "pulse", "analytics", "pie", "bar-chart",
      "gauge", "trending-up", "trending-down", "waypoints", "network",
    ],
  },
  {
    label: "Health",
    keywords: [
      "heart", "pill", "medical", "health", "stethoscope", "dna", "brain",
      "bandage", "syringe", "cross", "hospital", "tooth", "bone",
    ],
  },
  {
    label: "Tools",
    keywords: [
      "tool", "wrench", "hammer", "screwdriver", "settings", "gear", "cog",
      "sliders", "filter", "magnet", "drill", "axe", "pickaxe", "toolbox",
    ],
  },
  {
    label: "Shapes & Symbols",
    keywords: [
      "circle", "square", "triangle", "hexagon", "octagon", "diamond", "star",
      "check", "plus", "minus", "dot", "shapes", "badge", "asterisk", "hash",
      "infinity", "ban", "slash",
    ],
  },
]

const ALL = "All"
const OTHER = "Other"

/**
 * Only a handful of high-cohesion buckets that designers and developers reach
 * for most get their own pill; everything else collapses into "Other" (and even
 * that hides when it would just swallow most of the set — see OTHER_MAX).
 */
export const FEATURED_CATEGORIES = [
  "Arrows",
  "Files & Folders",
  "Communication",
  "Media",
  "Layout & UI",
  "Development",
]

// A catch-all bigger than this is no more useful than "All", so we drop it.
const OTHER_MAX = 60

/** Bucket a single kebab-case icon name; falls back to "Other". */
export function categorize(name: string): string {
  for (const group of ICON_CATEGORIES) {
    for (const keyword of group.keywords) {
      if (name.includes(keyword)) return group.label
    }
  }
  return OTHER
}

/** Whether an icon belongs to the selected filter (handles All + Other). */
export function matchesCategory(name: string, selected: string): boolean {
  if (selected === ALL) return true
  if (selected === OTHER) return !FEATURED_CATEGORIES.includes(categorize(name))
  return categorize(name) === selected
}

export interface CategoryCount {
  label: string
  count: number
}

/**
 * Filter options for a set: "All", the featured buckets that actually have
 * icons, and "Other" only when it stays small enough to be a real filter.
 */
export function categoryOptions(names: string[]): CategoryCount[] {
  const featuredCounts = new Map<string, number>()
  let inFeatured = 0
  for (const name of names) {
    const c = categorize(name)
    if (FEATURED_CATEGORIES.includes(c)) {
      featuredCounts.set(c, (featuredCounts.get(c) ?? 0) + 1)
      inFeatured++
    }
  }
  const options: CategoryCount[] = [{ label: ALL, count: names.length }]
  for (const label of FEATURED_CATEGORIES) {
    const count = featuredCounts.get(label)
    if (count) options.push({ label, count })
  }
  const otherCount = names.length - inFeatured
  if (otherCount > 0 && otherCount <= OTHER_MAX) {
    options.push({ label: OTHER, count: otherCount })
  }
  return options
}

export const ALL_CATEGORIES = ALL
