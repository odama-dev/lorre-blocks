# lorre-blocks-mcp

## 0.2.2

### Patch Changes

- Updated dependencies [ab264d8]
  - lorre-blocks@0.10.0

## 0.2.1

### Patch Changes

- Updated dependencies [2ce87fd]
  - lorre-blocks@0.9.0

## 0.2.0

### Minor Changes

- e320e9b: New `create_theme` tool (custom design system from a theme definition object — spawns
  `theme create --from`) and `show_theme` (resolved token inspection); `apply_theme` can
  omit the theme name to re-apply the project's `lorre.theme.json`.

### Patch Changes

- Updated dependencies [e320e9b]
  - lorre-blocks@0.8.0

## 0.1.0

### Minor Changes

- f20de2e: First release of the Lorre Blocks MCP server: `search_registry`, `get_component`,
  `add_component`, `apply_theme` and `list_themes`, all thin adapters over the
  `lorre-blocks` CLI's `--json` contract (stdio transport). Run with
  `npx -y lorre-blocks-mcp`.
