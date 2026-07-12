# Phase 7 — Theme Studio: custom themes for humans & agents

> Status: **DRAFT — awaiting lock.**
> Companion docs: [`PLAN.md`](./PLAN.md) · [`lorre.md`](../lorre.md) · [`PROGRESS.md`](./PROGRESS.md)

## Vision

Today Lorre ships 3 preset themes (`basic`, `dreamy`, `utilitarian`). Phase 7 makes the
theme system **generative**, like the [Radix Themes playground](https://www.radix-ui.com/themes/playground):
anyone — human or agent — describes a design system (colors, fonts, type scale, radius,
spacing, per-component details) and gets a complete, tailored theme injected into their
project's Tailwind v4 global CSS.

Two front doors, one engine:

- **Humans** use a **Theme Studio** page on the www site: pick primary / secondary /
  accent / neutral colors, fonts, responsive heading scale, radius, spacing, and key
  per-component knobs — with every basic component visible live — then copy the result
  as CSS / Tailwind or a theme JSON.
- **Agents** skip the UI entirely: write the same theme JSON and run one CLI command
  (`lorre-blocks theme create`), which generates the CSS locally and injects it into the
  project's global CSS. No website involved.

**Parity is the acceptance bar for the whole phase**: the Studio's exported CSS and the
CLI's injected CSS must be byte-identical for the same theme JSON.

### Why this is cheap for us

The Phase 1 architecture already treats a theme as *data* (`ThemeDefinition`: seeds +
token values) and generates everything else (12-step OKLCH scales, semantic aliases,
Tailwind `@theme` CSS, DTCG JSON). The engine in `packages/registry/src/tokens/` has
**zero Node dependencies** — pure TS math — so the exact same code can run:

1. at registry build time (already does),
2. inside the CLI (bundled by tsup — no npm scope needed),
3. **in the browser** for the Studio's live preview.

A "custom theme" is just a `ThemeDefinition` with `extends: "basic"` that lives in the
user's project instead of our registry. Nothing about the component source changes.

## Gap analysis (Radix playground → Lorre today)

| Radix playground capability | Lorre today | Phase 7 work |
| --- | --- | --- |
| Accent + gray color choice → generated scales | ✅ seeds → 12-step OKLCH scales | expose to users (Studio + CLI), hex input |
| Secondary/brand color | ❌ only 5 fixed scales | optional `secondary` scale |
| Typography: font family | ✅ token exists, not user-settable | Studio picker + CLI flag, runtime font preview |
| Responsive heading/type scale | ❌ no type-scale tokens | `typeScale` token group → fluid `--text-h1…h6` |
| Radius slider | ✅ tokens, preset-only | user-settable |
| Scaling / spacing density | ❌ (deferred in Phase 1) | `--spacing` base + scaling factor |
| Per-component adjustments (padding, radius…) | ❌ components hardcode Tailwind sizes | component tokens for the important set |
| Every component visible while tweaking | ✅ demos exist for all 126 items | reuse demos as the Studio gallery |
| Copy as CSS | ❌ | Studio export panel |
| Apply into a real project | ✅ but preset themes only | `theme create` (custom JSON → inject) |
| Icon set choice | ❌ lucide hardcoded everywhere | record preference only; remap deferred |

## Naming decision

- Page: **`/themes` — "Theme Studio"** (header link **Themes**). Short route, obvious
  meaning; "playground" stays an informal synonym. `/docs/theming` remains the concept
  doc and links to the Studio.
- Project-side artifact: **`lorre.theme.json`** at the consumer project root — the theme
  definition source of truth, sibling to `components.json` / `lorre.lock`.

## Architecture principle

**One engine, three consumers.**

```
ThemeDefinition JSON  ──►  @lorre-blocks/tokens (pure TS)  ──►  resolved tokens
      ▲                          │                                    │
      │                          ├── themeToCss  → Tailwind v4 @theme CSS
 Studio UI state                 └── themeToDtcg → W3C DTCG JSON
 CLI flags / --from file
 plan.json `theme` object
```

- The **theme JSON is the contract**. Studio edits it, agents write it, the CLI consumes
  it, `plan.json` embeds it. One zod schema validates it everywhere.
- Custom themes always `extends` a registry theme (default `basic`), so users override
  only what they care about and inherit the rest — including future token additions.

---

## 7.1 — Token engine v2 + shared package

Extract and extend the engine; no user-visible feature yet.

- [ ] Move `packages/registry/src/tokens/` → new **private** workspace package
      `packages/tokens` (`@lorre-blocks/tokens`). Registry re-exports from it
      (`./tokens` export unchanged → www imports keep working). CLI adds it as a
      workspace dev dep and **bundles it via tsup** (published CLI stays self-contained;
      the unverified `@lorre-blocks` npm scope is never needed).
- [ ] **Schema extensions** on `ThemeDefinition` (all optional → fully back-compat;
      existing 3 themes rebuild byte-identical — drift guard proves it):
  - `colors.secondary?: ColorSeed` — optional 6th scale. Emitted (scale steps, `@theme`
    color keys, DTCG) only when defined. Semantic mapping: when present, `secondary` /
    `secondary-foreground` default to `secondary-9` / `on-secondary` instead of neutral
    steps.
  - `typography.typeScale?: { base: string; ratio: number; fluid?: boolean }` —
    generates `--text-h1…--text-h6`, `--text-body`, `--text-small` (+ matching
    line-heights). `fluid: true` (default) emits `clamp()` values so headings are
    responsive with zero media queries. Wired as Tailwind v4 `--text-*` theme keys →
    `text-h1` … utilities exist automatically.
  - `spacing?: { scaling?: number }` — Radix-style 90%–110% density. Emits
    `--spacing: calc(0.25rem * <scaling>)`; Tailwind v4 derives **all** spacing
    utilities (`p-4`, `gap-2`, `h-9`…) from `--spacing`, so one token rescales the
    whole system.
  - `components?: Partial<Record<KeyComponent, ComponentTokens>>` — per-component
    overrides for the **important set only** (locked list below). Emitted as
    `--<comp>-<token>` vars that default to global tokens, e.g.
    `--button-radius: var(--radius-md)`.
  - `icons?: "lucide"` — recorded in the definition + `components.json` for future use.
    **Actual icon-set remapping is out of scope** (all 126 items import lucide today).
- [ ] `themeDefinitionSchema` (zod) lives in the tokens package — single validator
      shared by registry build, CLI, plan.json, and the Studio.
- [ ] Helper: `hexToSeed(hex)` → OKLCH `ColorSeed` (hue/chroma/lightness extraction),
      so users can paste brand hexes anywhere a seed is accepted.
- [ ] DTCG output extended for the new groups; deterministic-build guarantee kept;
      engine tests extended (scale math, clamp generation, secondary emission,
      hex→seed round-trip).

**Key component set (locked)**: `button`, `input` (+`textarea`/`select` share its
tokens), `card`, `dialog` (+`popover`/`sheet` share panel tokens), `badge`, `tabs`,
`checkbox`+`radio` (control size), `tooltip`. Tokens per component: radius, padding
x/y, height/size where meaningful. **Not** every one of the 126 items — motion/effects
components stay purely global-token driven.

**Acceptance**: rebuild with no theme changes → zero diff in `/r/*` and `theme.css`;
new groups appear only when a theme defines them.

## 7.2 — Component tokens wired into ui source

- [ ] The key components consume their vars via Tailwind v4 arbitrary-value syntax:
      `rounded-md` → `rounded-(--button-radius)`, `h-9 px-4` →
      `h-(--button-height) px-(--button-px)`, etc. Defaults resolve to today's exact
      values → rendering is pixel-identical before/after (demo smoke tests + the
      registry drift guard enforce this).
- [ ] `/r/<item>.json` checksums change → consumers see updates via `lorre-blocks diff`
      / `update` as usual.
- [ ] Docs: `lorre.md` gains a rule — new ui components in the key set must consume
      component tokens; others must only use global semantic tokens.

**Acceptance**: setting `--button-radius: 9999px` alone pill-shapes every button and
changes nothing else; all 341+ tests green.

## 7.3 — CLI `theme create` + agent surface (the agent front door)

- [ ] **`lorre-blocks theme create`** — two input modes, composable:
  - `--from lorre.theme.json` (agent mode: agent writes the JSON, runs one command);
  - flags for quick tailoring: `--name`, `--extends basic`, `--accent "#5B6CFF"`,
    `--secondary "#FF8A5B"`, `--neutral slate|"#hex"`, `--radius sm|md|lg|xl|<rem>`,
    `--font-sans "Geist"`, `--font-mono …`, `--type-base 1rem --type-ratio 1.25`,
    `--scaling 105`. Flags override `--from` values.
  - Behavior: validate (shared zod) → resolve against registry base themes → run
    `themeToCss` **locally** → `injectThemeBlock` into the global CSS (same idempotent
    markers as `theme apply`) → write/update `lorre.theme.json` → set
    `components.json` `"theme": "custom"` (definition lives in the file). `--json`
    emits `{ theme, cssPath, tokensChanged }` for agents.
- [ ] `theme apply` learns to re-apply from a local `lorre.theme.json` (no name arg +
      file present → regenerate; keeps edit→reapply loop one command).
- [ ] **`theme show [--json]`** — print the resolved token set (scales, semantics,
      type scale, component tokens) so agents can inspect the active design system
      without parsing CSS.
- [ ] **plan.json v2**: `theme` accepts an inline definition object (not just a name).
      `plan check` validates it via the shared schema; `apply` routes it through
      `theme create`. Covers the "bikin project a b c" flow: one plan.json = theme +
      components + overrides, one `apply`.
- [ ] **MCP**: new `create_theme` tool (spawns `theme create --json`), `apply_theme` /
      README updated. `lorre-blocks-mcp` 0.2.0.
- [ ] Changesets: CLI **0.8.0** (minor), MCP 0.2.0. Tests: unit (flag→definition
      merge, hex conversion) + e2e fresh-consumer (init → theme create → add button →
      build → assert vars in output CSS).

**Acceptance (agent flow)**: in a fresh Tailwind v4 app, an agent writes
`lorre.theme.json` (purple accent, Geist, radius xl, scaling 105) and runs
`npx lorre-blocks theme create --from lorre.theme.json` — the app rebuilds fully
re-themed, components untouched, `theme show --json` reports the resolved system.

## 7.4 — Theme Studio page (`/themes` on www)

The human front door — Radix-playground-style.

- [ ] Route `apps/www/app/themes/page.tsx` (client-heavy), header link **Themes**.
      Studio state = a `ThemeDefinition` (starts as `{ extends: "basic" }`).
- [ ] **Controls panel** (left rail, grouped like Radix):
  1. **Color** — primary/accent picker (preset swatch grid + hue/chroma sliders + hex
     input), neutral (curated gray presets), optional secondary, statuses
     (danger/success/warning) under an "advanced" fold. Every pick is a seed; the
     engine generates the 12-step scales live — light **and** dark.
  2. **Typography** — font-sans/mono/display pickers from a curated list (system +
     popular Google fonts, loaded at runtime via `<link>` for preview only; exported
     CSS just references the family and docs how to self-host), type-scale base +
     ratio with live h1–h6 specimen.
  3. **Layout** — radius slider, scaling/density (90–110%), shadow preset.
  4. **Components** — the key-set knobs (button radius/padding/height, input height,
     card padding, panel radius…), each showing its live component inline.
  5. Dark-mode toggle + theme-base picker (`extends`: basic/dreamy/utilitarian) for
     the preview.
- [ ] **Live preview**: full basic-component gallery — alert-dialog through tooltip —
      reusing the existing demo components (they already exist for every item). The
      engine runs client-side; output CSS is rewritten from `:root`/`.dark` to
      `[data-studio]`/`.dark [data-studio]` and injected as a `<style>` tag scoped to
      the preview subtree. Utilities already resolve through CSS vars, so **no Tailwind
      recompile is needed** — same mechanism the existing runtime theme switcher proved.
- [ ] **Export panel** (sticky, always visible):
  - **CSS** tab — full `themeToCss` output ready to paste into `globals.css`;
  - **JSON** tab — the `ThemeDefinition` (`lorre.theme.json` content);
  - **CLI** tab — copyable `npx lorre-blocks theme create --from lorre.theme.json`
    snippet + the JSON, so the website path and the agent path visibly converge;
  - copy buttons throughout (existing `copy-button.tsx`).
- [ ] **Shareable URLs**: state serialized to `?t=<base64url(json)>` (debounced);
      opening a shared link restores the exact Studio state.
- [ ] Tests: vitest render smoke for the Studio; Playwright: change accent → button in
      preview changes color; **parity test**: Studio-exported CSS for a fixture JSON
      strictly equals `themeToCss` output the CLI would inject.

**Acceptance**: a designer opens `/themes`, tailors brand colors + Geist + big radius
while watching every component update live in light/dark, copies the CSS into their
project, and gets exactly what the preview showed.

## 7.5 — Docs, llms, verification

- [ ] `/docs/theming` rewritten around custom themes: the JSON contract (annotated
      example), Studio walkthrough, CLI reference, "for agents" section.
- [ ] `build-llms.ts`: Studio + `theme create`/`show` + `lorre.theme.json` contract in
      `llms.txt` / CLI_MD — an agent reading llms.txt must be able to author a valid
      theme JSON without seeing the TS types.
- [ ] `lorre.md`: component-token rule, key-set list, theme-JSON-as-contract principle.
- [ ] `PLAN.md` Phase 7 section + `PROGRESS.md` entries per session (as always).
- [ ] Full verification sweep per `.claude/skills/verify`: www build + Playwright
      (Studio drive: accent/font/radius/scaling changes, dark toggle, export copy,
      share-URL restore), fresh-consumer CLI e2e, parity check CLI↔Studio.

---

## Sequencing & PRs

| Order | Scope | PR branch | Publishes |
| --- | --- | --- | --- |
| 7.1 | tokens package + schema v2 | `feat/phase7-tokens-v2` | — (private) |
| 7.2 | component tokens in ui | `feat/phase7-component-tokens` | — (registry JSON via www deploy) |
| 7.3 | CLI + plan.json + MCP | `feat/phase7-theme-create` | CLI 0.8.0, MCP 0.2.0 |
| 7.4 | Theme Studio page | `feat/phase7-theme-studio` | www deploy |
| 7.5 | docs + llms + sweep | `feat/phase7-docs` (or folded into 7.4) | www deploy |

7.1→7.2→7.3 are strictly ordered; 7.4 depends on 7.1 only (can start in parallel after
it merges, but lands after 7.3 so the CLI tab points at a published command). All PRs
follow the owner-merge flow.

## Out of scope (explicitly deferred)

- **Icon-set remapping** (swapping lucide across 126 items) — preference is recorded,
  execution is its own phase.
- **Per-instance component props** (Radix's `size`/`variant` per element) — that's
  component API and already exists; Phase 7 only themes the defaults.
- **Self-hosted font pipeline** — Studio previews via Google Fonts; exported CSS
  references families and docs how to install them.
- **Theme registry/marketplace** (publishing user themes to `/r/themes/`) — natural
  Phase 8 candidate.
- **Visual regression infra** — pixel-identity in 7.2 is guarded by drift checks +
  targeted Playwright assertions, not screenshot diffing.

## Risks & gotchas carried in

- Tailwind v4 spacing: everything keys off `--spacing` — scaling works globally, but
  audit ui source for hardcoded px values that would ignore it.
- Runtime Google Fonts in the Studio must not leak into the docs pages' font loading
  (scope the `<link>` injection to the Studio route).
- `@theme inline` blocks in injected CSS are build-time Tailwind constructs — the
  Studio preview must inject only the resolved custom-property rules, never `@theme`
  (the export tab, by contrast, ships the full file).
- Registry JSON checksums change for every key-set component in 7.2 → expect a large
  but mechanical `/r/*` diff; verify with the manifest itemCount + spot checksums.
- www demos import registry src directly — component-token changes show up on www
  immediately; keep 7.2's defaults byte-equivalent to avoid a visual sweep there.
