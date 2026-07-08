# lorre-blocks

A shadcn-style component library. Instead of installing a package into `node_modules` and
importing from it, you use a CLI that **copies component source code directly into your project**,
so you fully own and can edit every component.

## Two ways to use it

1. **CLI (recommended)** — run the CLI in your project to copy components in:
   ```bash
   npx lorre-blocks init          # one-time setup, writes components.json
   npx lorre-blocks add button    # copies button.tsx into your project + installs its deps
   ```

2. **Browse & copy** — visit the docs site, find a component, copy its source manually.

## How it works

- **`packages/registry`** — the source of truth. Every component lives here as real `.tsx`
  source, plus metadata (`registry.ts`). A build script serializes each component into JSON.
- **`apps/www`** — the docs/demo site (Next.js). It renders live component demos and also
  hosts the generated registry JSON as static files at `/r/<name>.json`.
- **`packages/cli`** — the published npm package (`lorre-blocks`). It fetches component JSON
  from the registry URL, resolves npm + component dependencies, rewrites import aliases to
  match your project, and writes the source files into your project.

## Repo layout

```
apps/
  www/            # Next.js docs site; also serves registry JSON at /r/*
packages/
  registry/       # component source of truth + registry metadata + build script
  cli/            # the published CLI (bin: lorre-blocks)
```

## Development

```bash
pnpm install
pnpm build:registry     # generate apps/www/public/r/*.json
pnpm dev:www            # run docs site at http://localhost:3000
pnpm build:cli          # build the CLI to packages/cli/dist
```

## Adding a new component

1. Add the source under `packages/registry/src/ui/<name>.tsx` (use `@/lib/utils`,
   `@/components/ui/*` import conventions).
2. Register it in `packages/registry/registry.ts` (deps, `registryDependencies`).
3. (Optional) add a live demo page under `apps/www/app/docs/components/<name>/` and
   an entry in `packages/registry`'s `exports`.
4. Run `pnpm build:registry` to regenerate the JSON payloads.

## Publishing the CLI

Only `packages/cli` (`lorre-blocks`) is published; `www` and `@lorre-blocks/registry`
are private. Versioning is managed with [changesets](https://github.com/changesets/changesets).

```bash
pnpm changeset            # describe your change + pick a semver bump
pnpm changeset version    # apply the bump to packages/cli
pnpm build:cli            # build dist/
cd packages/cli
npm login                 # once, if not already logged in
npm publish               # publishConfig.access is already "public"
```

Sanity-check the tarball first with `npm publish --dry-run` from `packages/cli`.
