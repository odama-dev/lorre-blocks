# Figma → kode

Folder ini menjawab satu pertanyaan: **bagaimana memastikan kode memakai token dari Figma, bukan angka yang diketik ulang manusia.**

## Kenapa perlu

Sebelum ini tidak ada satu pun jalur dari Figma ke kode. `themes/odama.ts` ditulis tangan, dan `odama.dtcg.json` di repo Scope-Agent justru dihasilkan **dari kode** — jadi dokumen token mengonfirmasi kode, bukan Figma. Drift bukan kecelakaan; ia tak terhindarkan.

Saat sinkronisasi pertama dijalankan (2026-07-31), **11 token** ternyata sudah berbeda nilainya.

## Bentuk rantainya

```
Figma  ──(agen, lokal, manual)──▶  odama.figma.json  ──(script)──▶  odama.ts  ──(build)──▶  theme.css
        ↑ satu-satunya langkah manual              ↑ deterministik, dijaga CI
```

Figma MCP butuh koneksi ke Figma desktop yang hidup, jadi **mustahil dijalankan di CI**. Maka rantainya dipecah: hanya mata rantai pertama yang manual, sisanya otomatis dan terverifikasi.

## Memperbarui snapshot (setelah theming diubah di Figma)

`odama.figma.json` **dihasilkan agen** — jangan diedit tangan. Minta Design System Agent (yang punya Figma MCP) menjalankan Fase 0 sync; ia membaca `lorre/odama`, meresolusi setiap alias per mode, dan menulis ulang file ini.

Lalu:

```bash
pnpm --filter @lorre-blocks/tokens sync:figma   # tulis odama.ts dari snapshot
pnpm build:registry                             # regenerasi theme.css
```

Commit ketiganya bersama: snapshot, `odama.ts`, `theme.css`.

## Dua perkakas, dua masalah berbeda

### `sync:figma` — nilai token

Menulis ulang blok bertanda `<figma-sync:…>` di `odama.ts`. Mode `--check` dipakai CI: mengedit nilai token dengan tangan akan tertangkap.

**Penjaga kontras.** Sync menolak menulis pasangan permukaan/teks yang gagal AA 4.5. Ini bukan kehati-hatian berlebih — tema `basic` sengaja *menghitung* sebagian foreground demi kontras, dan menyalin hex dari Figma menghilangkan jaminan itu. Yang gagal dibiarkan diwarisi induknya dan dilaporkan.

Saat pertama dijalankan, **4 nilai Figma gagal AA**:

| Token | Kontras | Butuh |
|---|---|---|
| `destructive-foreground` light & dark | 3.50 | 4.5 |
| `success-foreground` dark | 2.05 | 4.5 |
| `warning-foreground` dark | 2.26 | 4.5 |

Perbaikannya **di Figma**, bukan dengan melonggarkan ambang. Sampai itu terjadi, keempatnya tidak disinkron.

### `check:bindings` — pilihan token

Sinkronisasi nilai **tidak** menangkap kelas bug yang paling sering terjadi. Contoh nyata yang memicu semua ini:

> `--input` bernilai `#D1D1D1` di Figma **dan** di kode — identik. Tapi Input tetap tampak berbeda, karena komponen Figma mengikat garisnya ke `color/neutral/3` (`#F0F0F0`) sedangkan kode memakai `border-input` (`#D1D1D1`).

Yang berbeda bukan nilainya, tapi **pilihan tokennya**. Itu keputusan desain, jadi tidak di-generate — hanya dilaporkan. Manusia memutuskan sisi mana yang benar.

Laporannya memisahkan dua hal:

- **SELISIH** — kode memilih token lain untuk slot itu. Ini temuan nyata.
- **tidak ditetapkan** — kode diam, kemungkinan mewarisi dari induk. Biasanya bukan bug.

**Batas ketelitian:** script membaca kelas Tailwind lewat regex, bukan mengevaluasi CSS. Ia tidak tahu varian mana dipakai di layar mana, dan melewatkan warna dari komponen anak. "Tidak ada selisih" **bukan** jaminan pixel-perfect.

## Yang tidak dilakukan perkakas ini

Tidak pernah menulis ke Figma. Nilai token dan binding hanya diubah manusia di Figma — agen membaca, melaporkan, dan menyalin ke kode. Kandidat token baru dieskalasi, tidak dikarang.

`unboundPaints` di snapshot mendaftar komponen Figma yang paint-nya tidak terikat variabel sama sekali. Itu pelanggaran house rule yang hanya bisa dibereskan di Figma.
