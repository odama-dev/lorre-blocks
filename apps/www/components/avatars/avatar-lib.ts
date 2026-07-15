/**
 * Procedural avatar generator. Untitled UI's avatar images are proprietary and
 * only a UX reference — so these are our own deterministic SVG avatars (seeded
 * from a name), plus an upload path that frames any image. Every avatar is a
 * self-contained SVG string, so copy-SVG, copy-PNG and download share one path.
 */

export type AvatarStyle =
  | "photo"
  | "person"
  | "gradient"
  | "geometric"
  | "rings"
  | "initials"
export type AvatarBg = "neutral" | "transparent"
export type AvatarShape = "circle" | "rounded" | "square"

export interface AvatarOptions {
  style: AvatarStyle
  bg: AvatarBg
  shape: AvatarShape
  size: number
}

const PALETTE = [
  "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#ec4899",
  "#f43f5e", "#f59e0b", "#10b981", "#14b8a6", "#0ea5e9",
]
const NEUTRAL = "#e4e7ec"
const NEUTRAL_INK = "#475467"

// Palettes for the illustrated "person" portrait. Untitled UI's avatars are
// photographs (proprietary); this is our own seeded cartoon face instead.
const SKIN = ["#f8d9bd", "#f0c39b", "#e0a878", "#c98b53", "#a56b3c", "#7d4f2b"]
const HAIR = [
  "#2b1d18", "#4a2f1b", "#7a4a26", "#a9713e",
  "#c8a25a", "#d8c39a", "#8a8a8a", "#e8e4de",
]
const CLOTH = [
  "#4f5d75", "#5b6b8c", "#6d7a8c", "#7b6d8c",
  "#8c6d7b", "#5f7161", "#6d8c7b", "#8c7b6d",
]
const FACE_BG = ["#eef2f7", "#e9eef5", "#f2eef7", "#f7eef2", "#eef7f3", "#f7f3ee"]

export const SAMPLE_SEEDS = [
  "Ava Stone", "Liam Cruz", "Noah Patel", "Emma Reyes", "Olivia Kim",
  "Sophia Lane", "Mason Ford", "Lucas Vale", "Mia Chen", "Ethan Wolf",
  "Amelia Rios", "Harper Cole", "Ella Novak", "Leo Marsh", "Nora Diaz",
  "Aria Blum", "Kai Mercer", "Zoe Hart", "Ivy Sun", "Max Doyle",
  "Luna Park", "Owen Frost", "Ruby Shaw", "Finn Adair",
]

function hashSeed(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a: number): () => number {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickColors(rand: () => number, n: number): string[] {
  const pool = [...PALETTE]
  const out: string[] = []
  for (let i = 0; i < n && pool.length; i++) {
    out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0])
  }
  return out
}

export function initials(seed: string): string {
  const parts = seed.trim().split(/[\s\-_]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (parts[0]?.slice(0, 2) || "?").toUpperCase()
}

/**
 * Deterministic illustrated portrait — a head + shoulders "person" drawn from
 * seeded parts (skin tone, hairstyle, optional beard/glasses, clothing). The
 * hair is a slightly larger ellipse behind the head, so the head ellipse leaves
 * only a rim showing as a hairline. Everything lives in the 0 0 80 80 viewBox.
 */
function faceContent(rand: () => number, bg: AvatarBg): string {
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]
  const skin = pick(SKIN)
  const hair = pick(HAIR)
  const cloth = pick(CLOTH)
  const faceBg = pick(FACE_BG)

  // Hair silhouette: [crown y, width, height, drapes past shoulders]
  const styles = [
    { cy: 30, rx: 16, ry: 13, long: false }, // short
    { cy: 33, rx: 17, ry: 17, long: false }, // medium
    { cy: 35, rx: 18, ry: 19, long: true }, //  long
    { cy: 27, rx: 15, ry: 15, long: false }, // crown / quiff
  ]
  const hs = styles[Math.floor(rand() * styles.length)]
  const beard = rand() < 0.28
  const glasses = rand() < 0.25

  let c = ""
  if (bg !== "transparent") c += `<rect width="80" height="80" fill="${faceBg}"/>`
  c += `<rect x="35.5" y="47" width="9" height="10" fill="${skin}"/>` // neck
  c += `<path d="M13 80 C13 63 26 56 40 56 C54 56 67 63 67 80 Z" fill="${cloth}"/>` // shoulders
  if (hs.long)
    c +=
      `<path d="M23 36 Q19 56 27 64 L33 62 Q27 48 30 38 Z" fill="${hair}"/>` +
      `<path d="M57 36 Q61 56 53 64 L47 62 Q53 48 50 38 Z" fill="${hair}"/>`
  c += `<ellipse cx="40" cy="${hs.cy}" rx="${hs.rx}" ry="${hs.ry}" fill="${hair}"/>` // hair
  c += `<circle cx="25" cy="38" r="3.2" fill="${skin}"/><circle cx="55" cy="38" r="3.2" fill="${skin}"/>` // ears
  c += `<ellipse cx="40" cy="37" rx="15" ry="17" fill="${skin}"/>` // head
  if (beard)
    c += `<path d="M26 38 Q27 53 40 54 Q53 53 54 38 Q49 49 40 50 Q31 49 26 38 Z" fill="${hair}" opacity="0.92"/>`
  c +=
    `<path d="M31 32 q3.5 -2 7 0" fill="none" stroke="${hair}" stroke-width="1.5" stroke-linecap="round"/>` +
    `<path d="M42 32 q3.5 -2 7 0" fill="none" stroke="${hair}" stroke-width="1.5" stroke-linecap="round"/>` // brows
  c += `<ellipse cx="34.5" cy="37" rx="1.7" ry="2.1" fill="#3a2f2a"/><ellipse cx="45.5" cy="37" rx="1.7" ry="2.1" fill="#3a2f2a"/>` // eyes
  c += `<path d="M40 38 l-1.6 4 q1.6 1.2 3.2 0" fill="none" stroke="#00000022" stroke-width="1.2" stroke-linecap="round"/>` // nose
  c += `<path d="M35.5 45.5 q4.5 4 9 0" fill="none" stroke="#b56b5b" stroke-width="1.7" stroke-linecap="round"/>` // mouth
  if (glasses)
    c += `<g fill="none" stroke="#33333a" stroke-width="1.4"><circle cx="34.5" cy="37" r="4.4"/><circle cx="45.5" cy="37" r="4.4"/><path d="M38.9 37 h2.2"/><path d="M30.1 36 l-4 -1"/><path d="M49.9 36 l4 -1"/></g>`
  return c
}

function clipPath(id: string, shape: AvatarShape): string {
  const inner =
    shape === "circle"
      ? `<circle cx="40" cy="40" r="40"/>`
      : shape === "rounded"
        ? `<rect width="80" height="80" rx="18"/>`
        : `<rect width="80" height="80"/>`
  return `<clipPath id="${id}">${inner}</clipPath>`
}

/** Build a complete, portable SVG string for a seeded (or uploaded) avatar. */
export function buildAvatarSvg(
  opts: AvatarOptions & { seed?: string; imageHref?: string }
): string {
  const { style, bg, shape, size, seed = "", imageHref } = opts
  const h = hashSeed(seed || (imageHref ? "upload" : ""))
  const rand = mulberry32(h)
  const uid = h.toString(36)
  const clipId = `cl${uid}`
  const gradId = `gr${uid}`
  let defs = clipPath(clipId, shape)
  const neutralBase =
    bg === "neutral" && !imageHref ? `<rect width="80" height="80" fill="${NEUTRAL}"/>` : ""
  let content = ""

  if (imageHref) {
    content = `<image href="${imageHref}" x="0" y="0" width="80" height="80" preserveAspectRatio="xMidYMid slice"/>`
  } else if (style === "person") {
    content = faceContent(rand, bg)
  } else if (style === "gradient") {
    const [a, b] = pickColors(rand, 2)
    const angle = Math.floor(rand() * 360)
    defs += `<linearGradient id="${gradId}" gradientTransform="rotate(${angle} 0.5 0.5)"><stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/></linearGradient>`
    content = `<rect width="80" height="80" fill="url(#${gradId})"/>`
  } else if (style === "geometric") {
    const [a, b, c] = pickColors(rand, 3)
    content =
      `<rect width="80" height="80" fill="${a}"/>` +
      `<circle cx="${Math.floor(rand() * 80)}" cy="${Math.floor(rand() * 80)}" r="${22 + Math.floor(rand() * 28)}" fill="${b}"/>` +
      `<rect x="${Math.floor(rand() * 36)}" y="${Math.floor(rand() * 36)}" width="${34 + Math.floor(rand() * 34)}" height="${34 + Math.floor(rand() * 34)}" fill="${c}" opacity="0.85" transform="rotate(${Math.floor(rand() * 90)} 40 40)"/>`
  } else if (style === "rings") {
    const [a, b, c] = pickColors(rand, 3)
    content =
      `<rect width="80" height="80" fill="${a}"/>` +
      `<circle cx="40" cy="40" r="28" fill="${b}"/>` +
      `<circle cx="40" cy="40" r="14" fill="${c}"/>`
  } else {
    // initials
    const label = initials(seed)
    const ink = bg === "neutral" ? NEUTRAL_INK : pickColors(rand, 1)[0]
    content = `<text x="40" y="42" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="32" font-weight="600" fill="${ink}" text-anchor="middle" dominant-baseline="middle">${label}</text>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 80 80"><defs>${defs}</defs><g clip-path="url(#${clipId})">${neutralBase}${content}</g></svg>`
}

/** Rasterize an SVG string to a PNG blob at 2× for crisp downloads/clipboard. */
export async function svgToPngBlob(svg: string, size = 256): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))
  try {
    const img = new Image()
    img.decoding = "async"
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("no 2d context")
    ctx.drawImage(img, 0, 0, size, size)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
        "image/png"
      )
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Deterministic randomuser.me portrait for a seed. There are 100 photos per
 * gender (0–99); the hash picks a gender and index so the same name always maps
 * to the same face. Served through our own {@link /api/avatar-photo} proxy so
 * the browser can fetch and rasterize it (randomuser.me sends no CORS headers).
 */
export function photoRef(seed: string): { g: "men" | "women"; i: number } {
  const h = hashSeed("photo:" + seed)
  return { g: (h & 1) === 0 ? "women" : "men", i: (h >>> 1) % 100 }
}

export function photoUrl(seed: string): string {
  const { g, i } = photoRef(seed)
  return `/api/avatar-photo?g=${g}&i=${i}`
}

const photoCache = new Map<string, Promise<string>>()

/** Fetch a seed's portrait through the proxy and cache it as a data URI. */
export function photoDataUri(seed: string): Promise<string> {
  const url = photoUrl(seed)
  let pending = photoCache.get(url)
  if (!pending) {
    pending = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`photo ${r.status}`)
        return r.blob()
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
      )
      .catch((err) => {
        photoCache.delete(url) // let a later attempt retry
        throw err
      })
    photoCache.set(url, pending)
  }
  return pending
}
