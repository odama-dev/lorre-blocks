# lorre-blocks

CLI for [lorre-blocks](https://github.com/zukazine/lorre-blocks) — a shadcn-style
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

### `init`
Creates a `components.json` in your project describing the registry URL and your
import aliases.

| Option | Description |
| --- | --- |
| `-r, --registry <url>` | Registry base URL to pull components from |
| `-y, --yes` | Accept defaults, skip prompts |
| `-c, --cwd <path>` | Run in a different directory |

### `add [components...]`
Fetches each component from the registry, installs its npm dependencies with your
project's package manager, resolves any component dependencies, rewrites import
aliases to match your `components.json`, and writes the files into your project.

| Option | Description |
| --- | --- |
| `-o, --overwrite` | Overwrite existing files without asking |
| `-y, --yes` | Skip confirmation prompts |
| `-c, --cwd <path>` | Run in a different directory |

## How it works

Components are described in a JSON **registry** served as static files. The CLI reads
`components.json`, fetches `<registry>/r/<name>.json`, resolves dependencies, and writes
the source into the directories your aliases point at (detected from your `tsconfig.json`
`paths`).

## License

MIT
