---
name: verify
description: Build, run, and drive lorre-blocks (www docs site + CLI) to verify a change end-to-end.
---

# Verifying lorre-blocks changes

## Build + serve the docs site (also serves the registry JSON)

```bash
pnpm build:registry              # regenerates apps/www/public-adjacent r/ JSON + theme.css
pnpm --filter www build          # Next 16 prod build; prebuild runs build-llms.ts
PORT=3100 pnpm --filter www start   # port 3000 is often taken; `-- -p` does NOT pass through pnpm, use PORT
```

`next start` serves both the docs pages and `/r/*.json` — that's the local registry
for CLI e2e. `/docs/{components,blocks,motion}/<name>` pages, llms twins under
`public/docs/**` (gitignored, regenerated at prebuild).

## Drive the UI (Playwright)

Playwright isn't a repo dep — `npm install playwright` in the session scratchpad
(browsers already at `$LOCALAPPDATA/ms-playwright`). Theme switching must go through
the real switcher UI (`getByRole button /basic|dreamy|utilitarian/` → menuitemradio):
it fetches `/r/themes/<name>.json` and installs a `#lorre-theme-override` style tag;
setting localStorage alone does NOT restyle non-basic themes. Dark mode: the
"Toggle dark mode" button toggles `.dark` on `<html>`. Assert
`--primary` (dreamy: `oklch(0.62 0.2 292)`, utilitarian light: `oklch(0.27 0.015 240)`)
and collect console/page errors.

## CLI e2e against the local registry

```bash
pnpm --filter lorre-blocks build
# fresh consumer: package.json (react 19 + typescript), strict tsconfig with
# "paths": {"@/*": ["./*"]}, app/globals.css with @import "tailwindcss"
node <repo>/packages/cli/dist/index.js init --registry http://localhost:3100 --theme basic --yes --json
node <repo>/packages/cli/dist/index.js add <items> --json     # no --yes → existing files are skipped
npx tsc --noEmit                                              # strict pass required
```

## Gotchas

- Run CLI `init`/`add` in the **foreground** — the npm-install step hangs as a nested
  background process on Windows.
- `--yes` on `add` implies overwrite; idempotency is only visible without it.
- `pnpm --filter www start -- -p 3100` fails ("Invalid project directory `-p`"); use `PORT=`.
