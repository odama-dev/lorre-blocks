import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

import {
  buildAddArgs,
  buildInfoArgs,
  buildSearchArgs,
  buildThemeApplyArgs,
  buildThemeListArgs,
  runCli,
  type CliResult,
} from "./cli.js"

const server = new McpServer({
  name: "lorre-blocks-mcp",
  version: "0.1.0",
})

/** Wrap a CLI run as a tool result; {ok:false} becomes an MCP tool error. */
async function toolResult(args: string[]) {
  let result: CliResult
  try {
    result = await runCli(args)
  } catch (err) {
    return {
      isError: true as const,
      content: [{ type: "text" as const, text: (err as Error).message }],
    }
  }
  if (!result.ok) {
    return {
      isError: true as const,
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    }
  }
  return {
    content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
  }
}

const registryParam = z
  .string()
  .url()
  .optional()
  .describe(
    "Registry base URL. Omit for the default (https://lorre-blocks.vercel.app)."
  )

server.registerTool(
  "search_registry",
  {
    title: "Search the Lorre Blocks registry",
    description:
      "Search registry items (ui components, blocks, motion, lib) by free-text query " +
      "and/or facets. Returns ranked matches with type, category, source, tags, " +
      "description and registry dependencies. Use before add_component to find the " +
      "right item names.",
    inputSchema: {
      query: z.string().optional().describe("Free-text query, e.g. 'text field'"),
      category: z
        .string()
        .optional()
        .describe("Facet: component | block | motion | lib | token"),
      source: z.string().optional().describe("Facet: shadcn | lorre"),
      type: z
        .string()
        .optional()
        .describe("Facet: registry item type, e.g. registry:ui, registry:block"),
      limit: z.number().int().positive().optional().describe("Max results"),
      registry: registryParam,
    },
  },
  async (input) => toolResult(buildSearchArgs(input))
)

server.registerTool(
  "get_component",
  {
    title: "Get one registry item",
    description:
      "Full metadata for one registry item plus its install order, resolved target " +
      "paths and complete file contents. Use it to inspect source before installing, " +
      "or to answer questions about how an item works.",
    inputSchema: {
      name: z.string().describe("Item name, e.g. 'button', 'navbar', 'fade-in'"),
      registry: registryParam,
    },
  },
  async ({ name, registry }) => toolResult(buildInfoArgs(name, registry))
)

server.registerTool(
  "add_component",
  {
    title: "Add components to a project",
    description:
      "Copy one or more registry items (and their registry dependencies) into a " +
      "project: writes source files, installs npm deps, records lorre.lock. The " +
      "project must already have a components.json (run `lorre-blocks init` once). " +
      "Existing files are skipped unless overwrite is true.",
    inputSchema: {
      names: z.array(z.string()).nonempty().describe("Item names to add"),
      projectDir: z.string().describe("Absolute path to the consumer project root"),
      overwrite: z.boolean().optional().describe("Overwrite existing files"),
    },
  },
  async ({ names, projectDir, overwrite }) =>
    toolResult(buildAddArgs(names, projectDir, overwrite))
)

server.registerTool(
  "apply_theme",
  {
    title: "Apply a theme to a project",
    description:
      "Swap the lorre-blocks theme block in the project's global CSS to another " +
      "theme (basic, dreamy, utilitarian). Component files are untouched — themes " +
      "are token data. The project must have a components.json.",
    inputSchema: {
      theme: z.string().describe("Theme name, e.g. 'dreamy'"),
      projectDir: z.string().describe("Absolute path to the consumer project root"),
    },
  },
  async ({ theme, projectDir }) => toolResult(buildThemeApplyArgs(theme, projectDir))
)

server.registerTool(
  "list_themes",
  {
    title: "List available themes",
    description:
      "List the themes the registry ships (name, description, extends). Use before " +
      "apply_theme.",
    inputSchema: {
      registry: registryParam,
    },
  },
  async ({ registry }) => toolResult(buildThemeListArgs(registry))
)

const transport = new StdioServerTransport()
await server.connect(transport)
