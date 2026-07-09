# lorre-blocks

CLI for [lorre-blocks](https://github.com/odama-dev/lorre-blocks) — a shadcn-style
component library. Instead of installing a package and importing from `node_modules`,
this CLI **copies component source directly into your project**, so you own and can
edit every line.

## Usage

In your React + Tailwind project:

```bash
# 1. One-time setup — writes components.json
npx lorre-blocks init

# 2. Add components — copies their source in and installs their dependencies
npx lorre-blocks add button
npx lorre-blocks add input
```

## Commands

Every command accepts `-c, --cwd <path>` and `--json` (see [Agent usage](#agent-usage)).

### `init`
Creates a `components.json`, installs the base dependencies, writes `lib/utils.ts`,
and injects the theme's CSS variables into your global stylesheet.

| Option | Description |
| --- | --- |
| `-r, --registry <url>` | Registry base URL to pull components from |
| `-t, --theme <name>` | Theme to install (`basic`, `dreamy`, `utilitarian`) |
| `-y, --yes` | Accept defaults, skip prompts |

### `add [components...]`
Fetches each component from the registry, installs its npm dependencies with your
project's package manager, resolves any component dependencies, rewrites import
aliases to match your `components.json`, and writes the files into your project.

| Option | Description |
| --- | --- |
| `-o, --overwrite` | Overwrite existing files without asking |
| `-y, --yes` | Skip confirmation prompts |

### `list`
Lists every component in the registry.

### `search [query...]`
Ranks registry items by name, tags, category and description.

| Option | Description |
| --- | --- |
| `--category <name>` | `component`, `block`, `token`, `motion`, … |
| `--source <name>` | `shadcn`, `magicui`, `radix`, `lorre` |
| `--theme <name>` | Only items compatible with this theme |
| `--type <name>` | `registry:ui`, `registry:block`, … |
| `--limit <n>` | Cap the number of results |

An empty query with filters acts as a faceted listing.

### `info <name>`
Shows an item's metadata, its transitive install order, npm dependencies, and the
exact paths its files would be written to in *your* project.

| Option | Description |
| --- | --- |
| `--files` | Include full file contents in the JSON payload |

### `theme list` · `theme apply <name>`
Lists available themes (marking the active one), or swaps the theme block in your
global CSS. Applying a theme touches **no component files** — components reference
semantic tokens, so they pick the new theme up automatically.

### `diff [components...]`
Shows how your local copies differ from the registry. Omit the names to diff
everything present.

## Agent usage

Pass `--json` to any command. It prints exactly one JSON document on stdout and
never prompts:

```bash
lorre-blocks search "text field" --category component --json
lorre-blocks info input --json
lorre-blocks init --theme dreamy --json
lorre-blocks add input --json
```

- Success: `{ "ok": true, ... }` (plus `warnings: [...]` when something non-fatal happened)
- Failure: `{ "ok": false, "error": "..." }` and exit code `1`

Spinners, prose, and the package manager's own output are suppressed, so stdout is
always parseable. `--json` implies non-interactive: `init` takes defaults rather than
prompting, and `add` skips existing files instead of asking (pass `--overwrite` to
replace them).

## How it works

Components are described in a JSON **registry** served as static files. The CLI reads
`components.json`, fetches `<registry>/r/<name>.json`, resolves dependencies, and writes
the source into the directories your aliases point at (detected from your `tsconfig.json`
`paths`).

## License

MIT
