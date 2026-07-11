# lorre-blocks-mcp

MCP (Model Context Protocol) server for the [Lorre Blocks](https://lorre-blocks.vercel.app)
registry. A thin, deterministic adapter over the `lorre-blocks` CLI's `--json` contract —
every tool is one CLI invocation, so MCP-driven agents and CLI-driven agents behave
identically.

## Tools

| Tool | What it does |
| --- | --- |
| `search_registry` | Faceted search over registry items (query, category, source, type, limit) |
| `get_component` | One item's metadata, install order, target paths and full file contents |
| `add_component` | Copy items + registry deps into a project, install npm deps, record `lorre.lock` |
| `apply_theme` | Swap the project's theme block (basic / dreamy / utilitarian) — token data only |
| `list_themes` | List the themes the registry ships |

`add_component` and `apply_theme` need a project that has run `lorre-blocks init` once
(they take an absolute `projectDir`). Read tools default to the public registry; pass
`registry` to target another host.

## Setup

Claude Code:

```bash
claude mcp add lorre-blocks -- npx -y lorre-blocks-mcp
```

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "lorre-blocks": {
      "command": "npx",
      "args": ["-y", "lorre-blocks-mcp"]
    }
  }
}
```

Requires Node >= 22.12.
