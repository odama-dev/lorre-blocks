# lorre-blocks

## 0.9.0

### Minor Changes

- 2ce87fd: Private icon sets: the catalog can now carry a Lorre-only set whose artwork lives on an
  authenticated npm registry rather than in this repo. `theme create --private` acknowledges
  the choice — without it a private set is refused, so nobody wires a package into a project
  that CI cannot install — and it writes only the scoped `<scope>:registry=` line into the
  project `.npmrc`, never a token. Public surfaces (the `/icons` browser, the Theme Studio's
  set picker, `/r/icons/index.json`) list the permissive sets only.

## 0.8.0

### Minor Changes

- e320e9b: Custom themes (Phase 7.3): `theme create` generates a tailored design system from a
  `lorre.theme.json` definition and/or flags (`--accent "#5B6CFF"`, `--neutral`,
  `--secondary`, `--radius xl|0.75rem`, `--font-sans Geist`, `--type-base/--type-ratio`,
  `--scaling 105`, `--icons phosphor:duotone`) — the token engine is bundled, so CSS is
  generated locally and injected into the global stylesheet. `theme apply` without a name
  re-applies the local `lorre.theme.json`; new `theme show [--json]` prints the resolved
  design system. `plan.json` accepts an inline theme definition object, validated against
  the same contract.

## 0.7.0

### Minor Changes

- a34fa9d: New `update [names...]` command: pulls registry updates for installed items using
  `lorre.lock` to stay safe — it only rewrites files whose content still hashes to what
  an install wrote. Local edits are kept when the registry is unchanged; diverged,
  untracked or locally deleted files are skipped with a warning unless `--force`. New
  registry dependencies an update introduces are added automatically, and missing or
  stale lock hashes are refreshed for files that match the registry.

## 0.6.0

### Minor Changes

- da421fc: `lorre.lock`: `init`, `add` and `apply` now record what they install — per file, the
  sha256 of the content as written, plus the registry item checksum. `diff` uses it to
  tell you _who_ changed a modified file (`local edits`, `registry updated`, or
  `diverged`; `cause` in `--json`), and no-arg `diff` now covers every installed item
  from the lock — blocks, motion and lib included — instead of only scanning the ui
  directory. Projects without a lock keep the old behavior.

## 0.5.0

### Minor Changes

- a7f3f1a: Phase 4.2: `plan check` and `apply`. An agent (or human) authors a `plan.json`
  (name, theme, add-list, optional pages/tokenOverrides/gaps — see
  docs/phase-4.2-design.md); `lorre-blocks plan check plan.json` validates it and
  resolves it against the registry read-only (all problems collected in one pass),
  and `lorre-blocks apply plan.json` executes it: components.json + theme block +
  semantic token overrides + all items + one package-manager pass, recording
  `lorre.plan.json`. Apply is idempotent; `--overwrite` replaces existing files.

## 0.4.0

### Minor Changes

- 5e7a579: Reproducible dependency installs: registry items now publish npm deps with version ranges (resolved from the registry workspace's own package.json, so consumers install exactly the majors the registry is tested against — tailwind-merge 3, sonner 2, lucide-react 1, react-day-picker 10). `init` installs its base deps (clsx, tailwind-merge, class-variance-authority, tw-animate-css) with matching ranges, and install args are quoted on Windows so `^` ranges survive cmd.exe.

### Patch Changes

- 004055d: Internal dependency upgrades: commander 13→15, @clack/prompts 0.9→1.7 (zod 3→4 in the registry build tooling). No user-facing behavior changes, but the CLI now declares `engines.node >=22.12.0` (required by commander 15; Node 20 is EOL).

## 0.3.0

### Minor Changes

- 82eb53e: Agent-readable CLI baseline. Every command accepts `--json`, which emits exactly one JSON document on stdout (`{ ok: true, ... }`, or `{ ok: false, error }` with exit code 1) and never prompts — spinners, prose and package-manager output are all suppressed, so an agent can parse stdout directly. Adds `search <query>` with `--category` / `--source` / `--theme` / `--type` / `--limit` facets, and `info <name>` which reports an item's metadata, transitive install order, npm dependencies and the exact paths its files would be written to.
- 71545b3: Theme system: `init --theme <name>` (with interactive theme picker), new `theme list` and `theme apply <name>` commands, and the active theme recorded in components.json. The registry now serves three OKLCH-scale-based themes (basic, dreamy, utilitarian) at /r/themes/, with W3C DTCG token documents at /r/tokens/. Backwards compatible with registries that only expose the legacy /r/theme.json.

## 0.2.0

### Minor Changes

- `init` now scaffolds the Tailwind v4 theme automatically: it installs the base
  dependencies, writes `lib/utils.ts`, and injects the theme CSS variables into your
  global stylesheet (idempotently). Components render styled with no manual setup.

  Also adds `list` (browse available components) and `diff` (compare your local
  components against the registry) commands.

## 0.1.1

### Patch Changes

- Point the default registry at the hosted site (https://lorre-blocks.vercel.app) so `add` works out of the box without a local server.
