/**
 * Binding-diff: token mana yang DIIKAT komponen Figma vs token mana yang
 * DIPAKAI komponen kode.
 *
 *   pnpm --filter @lorre-blocks/tokens check:bindings
 *   pnpm --filter @lorre-blocks/tokens check:bindings --strict   # exit 1 kalau ada selisih
 *
 * KENAPA INI ADA — DAN KENAPA TIDAK BISA DIGANTI SYNC TOKEN
 * Sinkronisasi nilai token tidak menangkap kelas bug ini. Contoh nyata
 * (2026-07-31): `--input` bernilai #D1D1D1 di Figma DAN di kode — identik —
 * tapi Input tetap tampak berbeda, karena komponen Figma mengikat garisnya ke
 * `color/neutral/3` (#F0F0F0) sedangkan kode memakai `border-input`
 * (#D1D1D1). Yang berbeda bukan NILAI-nya, tapi PILIHAN token-nya.
 *
 * Pilihan token adalah keputusan desain, jadi TIDAK di-generate — hanya
 * dilaporkan. Manusia yang memutuskan sisi mana yang benar.
 *
 * BATAS KETELITIAN — baca sebelum percaya hasilnya
 * Script ini membaca kelas Tailwind lewat regex, bukan mengevaluasi CSS. Ia:
 *   • hanya melihat kelas statis di file komponen (bukan hasil runtime)
 *   • tidak tahu varian mana yang dipakai di layar mana
 *   • melewatkan warna yang datang dari komponen anak
 * Jadi "tidak ada selisih" BUKAN jaminan pixel-perfect. Ia menangkap
 * ketidakcocokan token yang eksplisit — itu saja, dan itu sudah banyak.
 */
import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SNAPSHOT = path.join(HERE, "..", "figma", "odama.figma.json")
const UI_ROOT = path.join(HERE, "..", "..", "registry", "src")

type Slot = "fills" | "strokes" | "text"
type Binding = Partial<Record<Slot, string | null>>
type Entry = { light: string; dark: string }
type Snapshot = {
  tokens: Record<string, Entry>
  componentTokens: Record<string, Record<string, Entry>>
  ramps: Record<string, Record<string, Entry>>
  bindings: Record<string, { node: string; code: string; variants: Record<string, Binding> }>
}

/**
 * Nilai (light) yang dirender sebuah CSS custom property di tema odama.
 *
 * Ini yang membedakan selisih NYATA dari selisih NAMA. Contoh: Figma mengikat
 * Popover ke `semantic/card` sementara kode memakai `--popover` — dua nama
 * berbeda, tapi keduanya #FFFFFF, jadi rendernya identik dan tidak ada yang
 * perlu diubah. Tanpa perbandingan nilai, laporan penuh temuan palsu.
 */
function makeResolver(snap: Snapshot) {
  const map = new Map<string, string>()
  for (const [k, v] of Object.entries(snap.tokens)) map.set(`--${k}`, v.light.toUpperCase())
  for (const [comp, toks] of Object.entries(snap.componentTokens ?? {}))
    for (const [k, v] of Object.entries(toks)) map.set(`--${comp}-${k}`, v.light.toUpperCase())
  for (const [scale, steps] of Object.entries(snap.ramps ?? {}))
    for (const [i, v] of Object.entries(steps)) map.set(`--${scale}-${i}`, v.light.toUpperCase())
  return (cssVar: string) => map.get(cssVar) ?? null
}

/** Nama variabel Figma → nama CSS custom property di tema. */
function figmaToCssVar(name: string): string | null {
  if (!name || name === "HARDCODE") return null
  const m = name.match(/^(semantic|button|color|surface)\/(.+)$/)
  if (!m) return null
  const [, group, rest] = m
  if (group === "semantic") return `--${rest}`
  if (group === "button") return `--button-${rest}`
  if (group === "color") return `--${rest.replace(/\//g, "-")}` // color/neutral/3 → --neutral-3
  if (group === "surface") return `--surface-${rest}`
  return null
}

/**
 * Utilitas Tailwind → CSS custom property yang dirujuknya.
 *
 * Prefiks varian dibuang lebih dulu: `data-[state=checked]:bg-primary`,
 * `hover:bg-accent`, dan `dark:border-input` semuanya merujuk token yang sama
 * seperti versi telanjangnya. Tanpa ini hampir semua komponen ber-state
 * terlaporkan sebagai selisih padahal tidak.
 */
function classToCssVar(raw: string, slot: Slot): string | null {
  // buang semua varian sebelum ':' terakhir, tapi jaga isi kurung siku
  let cls = raw
  let depth = 0
  let cut = -1
  for (let i = 0; i < cls.length; i++) {
    const c = cls[i]
    if (c === "[") depth++
    else if (c === "]") depth--
    else if (c === ":" && depth === 0) cut = i
  }
  if (cut >= 0) cls = cls.slice(cut + 1)
  cls = cls.replace(/^!/, "")

  const prefix = slot === "fills" ? "bg-" : slot === "strokes" ? "border-" : "text-"
  if (!cls.startsWith(prefix)) return null
  let token = cls.slice(prefix.length)
  // Sintaks Tailwind v4 `bg-(--var)` / `rounded-(--var)` menyebut var langsung.
  const paren = token.match(/^\((--[\w-]+)\)$/)
  if (paren) return paren[1]
  if (token.startsWith("(")) return null
  token = token.replace(/\/\d+$/, "") // buang opacity: bg-primary/90
  if (!token || /^\[/.test(token)) return null
  // border-2, text-sm dll bukan warna
  if (/^(\d|\[|t$|b$|l$|r$|x-|y-)/.test(token)) return null
  if (slot === "text" && /^(xs|sm|base|lg|xl|\dxl|left|center|right|balance)$/.test(token)) return null
  return `--${token}`
}

/** Ambil semua kelas statis dari file komponen, dikelompokkan kasar per varian. */
async function readCodeVars(codePath: string): Promise<{ bySlot: Record<Slot, Set<string>>; raw: string } | null> {
  const abs = path.join(UI_ROOT, codePath)
  let src: string
  try {
    src = await fs.readFile(abs, "utf8")
  } catch {
    return null
  }
  const bySlot: Record<Slot, Set<string>> = { fills: new Set(), strokes: new Set(), text: new Set() }
  // Literal string satu baris saja. Regex yang membolehkan newline akan
  // memasangkan kutip penutup satu string dengan kutip pembuka string
  // BERIKUTNYA, sehingga komentar di antaranya ikut terbaca sebagai kelas —
  // itu pernah memunculkan token hantu `--active)` dari sebuah komentar.
  for (const m of src.matchAll(/(["'`])([^"'`\n]{2,4000})\1/g)) {
    for (const cls of m[2].split(/\s+/)) {
      for (const slot of ["fills", "strokes", "text"] as Slot[]) {
        const v = classToCssVar(cls, slot)
        if (v) bySlot[slot].add(v)
      }
    }
  }
  return { bySlot, raw: src }
}

async function main() {
  const strict = process.argv.includes("--strict")
  const snap: Snapshot = JSON.parse(await fs.readFile(SNAPSHOT, "utf8"))

  const resolveValue = makeResolver(snap)
  const missingFile: string[] = []
  type Row = {
    comp: string; variant: string; slot: Slot; figma: string; expect: string
    codeUses: string[]; figmaHex: string | null; sameColour: boolean
  }
  /** Kode menetapkan token LAIN untuk slot itu — selisih nyata. */
  const conflicts: Row[] = []
  /** Kode tidak menetapkan apa pun untuk slot itu — biasanya warisan, bukan bug. */
  const unset: Row[] = []
  /** Nama token beda tapi warnanya identik — render sudah benar. */
  const sameName: Row[] = []
  let checked = 0

  for (const [comp, def] of Object.entries(snap.bindings)) {
    const code = await readCodeVars(def.code)
    if (!code) {
      missingFile.push(`${comp} → ${def.code}`)
      continue
    }
    for (const [variant, binding] of Object.entries(def.variants)) {
      for (const slot of ["fills", "strokes", "text"] as Slot[]) {
        const figmaToken = binding[slot]
        if (!figmaToken) continue
        const want = figmaToCssVar(figmaToken)
        if (!want) continue
        checked++
        const codeSlot = code.bySlot[slot]
        if (codeSlot.has(want)) continue
        // Nama token beda BELUM tentu warna beda. Kalau ada satu saja token di
        // slot itu yang meresolusi ke warna yang sama, rendernya sudah benar.
        const figmaHex = resolveValue(want)
        const sameColour =
          figmaHex !== null && [...codeSlot].some((v) => resolveValue(v) === figmaHex)
        const row: Row = {
          comp, variant, slot, figma: figmaToken, expect: want,
          codeUses: [...codeSlot], figmaHex, sameColour,
        }
        if (sameColour) { sameName.push(row); continue }
        // Kode memilih token lain untuk slot ini → benar-benar beda.
        // Kode diam sama sekali → kemungkinan besar mewarisi dari induk.
        ;(codeSlot.size > 0 ? conflicts : unset).push(row)
      }
    }
  }

  const label: Record<Slot, string> = { fills: "latar", strokes: "garis", text: "teks" }
  console.log(`Binding-diff Figma ↔ kode — ${checked} ikatan diperiksa\n`)

  if (conflicts.length === 0) {
    console.log("✓ Tidak ada komponen yang warnanya berbeda dari Figma.")
  } else {
    console.log(`✗ ${conflicts.length} SELISIH WARNA — yang benar-benar terlihat beda:\n`)
    let last = ""
    for (const m of conflicts) {
      if (m.comp !== last) {
        console.log(`  ${m.comp}  (${snap.bindings[m.comp].code})`)
        last = m.comp
      }
      const hex = m.figmaHex ? ` ${m.figmaHex}` : ""
      const codeHex = m.codeUses
        .map((v) => `${v}${resolveValue(v) ? ` ${resolveValue(v)}` : ""}`)
        .join(", ")
      console.log(
        `    ${m.variant.padEnd(11)} ${label[m.slot].padEnd(5)} Figma ${m.figma}${hex}\n` +
          `                      kode  ${codeHex}`
      )
    }
    console.log(
      "\nIni kelas bug yang tidak tertangkap sinkronisasi nilai token: nilainya bisa\n" +
        "sama persis, tapi komponennya menunjuk token yang berbeda. Putuskan sisi mana\n" +
        "yang benar — ubah komponen kode, ATAU ubah binding di Figma."
    )
  }

  if (sameName.length) {
    console.log(
      `\nℹ ${sameName.length} slot memakai NAMA token berbeda tapi warnanya identik —` +
        ` render sudah benar, tidak perlu diubah.`
    )
  }

  if (unset.length) {
    console.log(
      `\nℹ ${unset.length} slot tidak ditetapkan kode (kemungkinan mewarisi dari induk —` +
        ` periksa hanya bila tampilannya memang salah):`
    )
    const byComp = new Map<string, number>()
    for (const u of unset) byComp.set(u.comp, (byComp.get(u.comp) ?? 0) + 1)
    for (const [c, n] of byComp) console.log(`    ${c}: ${n}`)
  }

  if (missingFile.length) {
    console.log(`\nTidak ada file kodenya (${missingFile.length}) — komponen Figma tanpa padanan:`)
    for (const m of missingFile) console.log(`  ${m}`)
  }

  if (strict && conflicts.length) process.exit(1)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
