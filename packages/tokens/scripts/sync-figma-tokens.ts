/**
 * Figma → kode: menulis ulang blok `semantics` dan `components.button` di
 * `src/themes/odama.ts` dari `figma/odama.figma.json`.
 *
 *   pnpm --filter @lorre-blocks/tokens sync:figma          # tulis
 *   pnpm --filter @lorre-blocks/tokens sync:figma --check  # hanya periksa
 *
 * KENAPA DUA LANGKAH, BUKAN LANGSUNG BACA FIGMA
 * Figma MCP butuh koneksi ke Figma desktop yang hidup, jadi mustahil dijalankan
 * di CI. Maka rantainya dipecah:
 *
 *   Figma  --(agen, lokal, manual)-->  odama.figma.json  --(script ini)-->  odama.ts
 *
 * Hanya mata rantai PERTAMA yang manual. Sisanya deterministik dan dijaga CI
 * lewat `--check`, sehingga tidak ada yang bisa mengedit nilai token di
 * `odama.ts` dengan tangan tanpa ketahuan.
 */
import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SNAPSHOT = path.join(HERE, "..", "figma", "odama.figma.json")
const THEME = path.join(HERE, "..", "src", "themes", "odama.ts")

type Entry = { figma: string; alias: string | null; light: string; dark: string }
type Snapshot = {
  source: { fileKey: string; capturedAt: string }
  tokens: Record<string, Entry>
  componentTokens: Record<string, Record<string, Entry>>
}

/** Urutan emit — sama dengan SEMANTIC_ORDER di build-css.ts supaya diff stabil. */
const ORDER = [
  "background", "foreground",
  "card", "card-foreground",
  "popover", "popover-foreground",
  "primary", "primary-foreground",
  "secondary", "secondary-foreground",
  "muted", "muted-foreground",
  "accent", "accent-foreground",
  "destructive", "destructive-foreground",
  "success", "success-foreground",
  "warning", "warning-foreground",
  "border", "input", "ring", "border-active",
]

/**
 * Pasangan permukaan/teks yang WAJIB lolos kontras AA 4.5.
 *
 * Tema `basic` menghitung sebagian foreground secara otomatis (`on-<scale>`)
 * justru supaya kontras terjamin. Menyalin hex dari Figma menghilangkan
 * jaminan itu — jadi setiap pasangan diperiksa sebelum ditulis, dan yang
 * gagal TIDAK ditulis. Perbaikannya di Figma, bukan dengan melonggarkan ini.
 */
const CONTRAST_PAIRS: [string, string][] = [
  ["background", "foreground"],
  ["card", "card-foreground"],
  ["popover", "popover-foreground"],
  ["primary", "primary-foreground"],
  ["secondary", "secondary-foreground"],
  ["accent", "accent-foreground"],
  ["destructive", "destructive-foreground"],
  ["success", "success-foreground"],
  ["warning", "warning-foreground"],
]
const AA = 4.5

function luminance(hex: string): number {
  const h = hex.replace("#", "")
  const ch = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Token yang nilainya dari Figma gagal AA — tidak ditulis, hanya dilaporkan. */
function failingTokens(snap: Snapshot): { token: string; detail: string }[] {
  const bad: { token: string; detail: string }[] = []
  for (const [surface, text] of CONTRAST_PAIRS) {
    const s = snap.tokens[surface]
    const t = snap.tokens[text]
    if (!s || !t) continue
    for (const mode of ["light", "dark"] as const) {
      const r = contrast(s[mode], t[mode])
      if (r < AA) {
        bad.push({
          token: text,
          detail: `${text} ${mode}: ${t[mode]} di atas ${surface} ${s[mode]} = ${r.toFixed(2)} (butuh ${AA})`,
        })
      }
    }
  }
  return bad
}

/** Kunci yang butuh kutip di literal objek TS. */
const q = (k: string) => (/^[a-z][a-zA-Z0-9]*$/.test(k) ? k : `"${k}"`)

function renderSemantics(snap: Snapshot, skip: Set<string>): string {
  const lines: string[] = []
  const seen = new Set<string>()
  for (const key of ORDER) {
    const t = snap.tokens[key]
    if (!t) continue
    if (skip.has(key)) {
      seen.add(key)
      lines.push(`    // ⚠️ ${key} TIDAK disinkron — nilai Figma gagal kontras AA.`)
      lines.push(`    //    Dibiarkan diwarisi tema induk (yang menghitungnya otomatis).`)
      lines.push(`    //    Perbaiki di Figma, lalu snapshot ulang.`)
      continue
    }
    seen.add(key)
    const note = t.alias ? `  // ${t.figma} → ${t.alias}` : `  // ${t.figma}`
    lines.push(`    ${q(key)}: { light: "${t.light}", dark: "${t.dark}" },${note}`)
  }
  // Token di Figma yang belum masuk ORDER — jangan dibuang diam-diam.
  const extra = Object.keys(snap.tokens).filter((k) => !seen.has(k))
  if (extra.length) {
    lines.push("")
    lines.push(`    // ⚠️ Ada di Figma tapi belum terdaftar di SEMANTIC_ORDER`)
    lines.push(`    //    (build-css.ts) — tidak akan ter-emit ke CSS sampai didaftarkan:`)
    for (const k of extra) lines.push(`    //      ${k}`)
  }
  return lines.join("\n")
}

/**
 * Component token bertipe NILAI CSS tunggal, bukan pasangan light/dark — jadi
 * yang di-emit adalah alias `var(--ramp)`, bukan hex. Itu memang yang benar:
 * alias ke ramp membuat mode dark ikut sendiri, sementara hex akan mengunci
 * satu warna untuk kedua mode (lihat DL-DS-009).
 */
function renderButton(snap: Snapshot): string {
  const b = snap.componentTokens?.button
  if (!b) return ""
  return Object.entries(b)
    .map(([k, t]) => {
      if (!t.alias) {
        // Tanpa alias tidak ada cara aman ikut mode dark — pakai hex + tandai.
        return `      ${q(k)}: "${t.light}",  // ⚠️ ${t.figma} tidak beralias di Figma; nilai ini TIDAK ikut mode dark`
      }
      const cssVar = "--" + t.alias.replace(/^color\//, "").replace(/\//g, "-")
      return `      ${q(k)}: "var(${cssVar})",  // ${t.figma} → ${t.alias} (light ${t.light} / dark ${t.dark})`
    })
    .join("\n")
}

/** Ganti isi sebuah blok bertanda, sisanya tidak disentuh. */
function replaceBlock(src: string, marker: string, body: string): string {
  const start = `// <figma-sync:${marker}>`
  const end = `// </figma-sync:${marker}>`
  const i = src.indexOf(start)
  const j = src.indexOf(end)
  if (i === -1 || j === -1) {
    throw new Error(
      `Penanda "${start}" / "${end}" tidak ditemukan di odama.ts. ` +
        `Tambahkan penanda itu mengelilingi blok yang boleh ditulis ulang script ini.`
    )
  }
  const head = src.slice(0, i + start.length)
  const tail = src.slice(j)
  return `${head}\n${body}\n    ${tail}`
}

async function main() {
  const check = process.argv.includes("--check")
  const snap: Snapshot = JSON.parse(await fs.readFile(SNAPSHOT, "utf8"))
  const before = await fs.readFile(THEME, "utf8")

  const bad = failingTokens(snap)
  const skip = new Set(bad.map((b) => b.token))
  if (bad.length) {
    console.warn(`⚠️  ${bad.length} nilai Figma gagal kontras AA — TIDAK disinkron:\n`)
    for (const b of bad) console.warn(`    ${b.detail}`)
    console.warn(
      "\n    Token itu dibiarkan diwarisi tema induk, yang menghitung foreground\n" +
        "    secara otomatis demi kontras. Perbaiki nilainya di Figma lalu snapshot\n" +
        "    ulang — jangan melonggarkan ambang ini.\n"
    )
  }

  let after = replaceBlock(before, "semantics", renderSemantics(snap, skip))
  const btn = renderButton(snap)
  if (btn) after = replaceBlock(after, "button", btn)

  if (after === before) {
    console.log(`✓ odama.ts sinkron dengan snapshot Figma (${snap.source.capturedAt})`)
    return
  }

  if (check) {
    console.error("✗ odama.ts TIDAK sinkron dengan figma/odama.figma.json.\n")
    // Tunjukkan baris mana yang beda — bukan sekadar "tidak sinkron".
    const a = before.split("\n")
    const b = after.split("\n")
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) {
        if (a[i] !== undefined) console.error(`  kode   ${i + 1}: ${a[i].trim()}`)
        if (b[i] !== undefined) console.error(`  figma  ${i + 1}: ${b[i].trim()}`)
      }
    }
    console.error(
      "\nJalankan: pnpm --filter @lorre-blocks/tokens sync:figma\n" +
        "Kalau Figma-nya yang berubah, perbarui dulu snapshot-nya — lihat packages/tokens/figma/README.md"
    )
    process.exit(1)
  }

  await fs.writeFile(THEME, after)
  console.log(`✓ odama.ts ditulis ulang dari snapshot Figma (${snap.source.capturedAt})`)
  console.log("  Jangan lupa: pnpm build:registry, lalu commit odama.ts + theme.css")
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
