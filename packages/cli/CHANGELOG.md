# lorre-blocks

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
