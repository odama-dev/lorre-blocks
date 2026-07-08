# lorre-blocks

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
