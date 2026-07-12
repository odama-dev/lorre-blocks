import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

import {
  buildAddArgs,
  buildInfoArgs,
  buildSearchArgs,
  buildThemeApplyArgs,
  buildThemeCreateArgs,
  buildThemeListArgs,
  buildThemeShowArgs,
  runCli,
  type CliResult,
} from "./cli.js"

const server = new McpServer({
  name: "lorre-blocks-mcp",
  version: "0.2.0",
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
      "theme (basic, dreamy, utilitarian). Omit the theme name to re-apply the " +
      "project's lorre.theme.json (after editing a custom theme). Component files " +
      "are untouched — themes are token data. The project must have a components.json.",
    inputSchema: {
      theme: z
        .string()
        .optional()
        .describe("Theme name, e.g. 'dreamy'; omit to re-apply lorre.theme.json"),
      projectDir: z.string().describe("Absolute path to the consumer project root"),
    },
  },
  async ({ theme, projectDir }) => toolResult(buildThemeApplyArgs(theme, projectDir))
)

server.registerTool(
  "create_theme",
  {
    title: "Create a custom theme",
    description:
      "Generate a tailored design system from a theme definition (lorre.theme.json " +
      "contract): color seeds (accent/neutral/secondary as OKLCH hue-chroma-lightness), " +
      "typography + fluid type scale, radius, shadows, spacing scaling (0.9–1.1), " +
      "per-component tokens (button/input/card/panel/badge/tabs/control/tooltip) and " +
      "an icon set (lucide, radix, phosphor, heroicons — phosphor/heroicons have style " +
      "variants). The CLI validates the definition, generates the Tailwind v4 CSS " +
      "locally, injects it into the project's global stylesheet, records " +
      "lorre.theme.json, and installs the icon-set npm package. The project must have " +
      "a components.json. Edit lorre.theme.json later and use apply_theme without a " +
      "name to re-apply.",
    inputSchema: {
      definition: z
        .record(z.string(), z.unknown())
        .describe(
          'Theme definition object, e.g. {"name":"acme","description":"…",' +
            '"extends":"basic","colors":{"accent":{"hue":262,"chroma":0.21,' +
            '"lightness":0.55}},"spacing":{"scaling":1.05},"icons":{"set":"phosphor",' +
            '"style":"duotone"}}. Unknown keys are rejected; problems come back as a ' +
            "flat list."
        ),
      projectDir: z.string().describe("Absolute path to the consumer project root"),
      install: z
        .boolean()
        .optional()
        .describe("Install the icon-set npm package (default true)"),
    },
  },
  async ({ definition, projectDir, install }) => {
    const tmp = path.join(
      os.tmpdir(),
      `lorre-theme-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
    )
    await fs.writeFile(tmp, JSON.stringify(definition, null, 2), "utf8")
    try {
      return await toolResult(buildThemeCreateArgs(tmp, projectDir, install))
    } finally {
      await fs.rm(tmp, { force: true })
    }
  }
)

server.registerTool(
  "show_theme",
  {
    title: "Show the active theme's resolved tokens",
    description:
      "Print the project's resolved design system (color scale seeds, semantics, " +
      "radius, type scale, spacing scaling, component tokens, icon set) from " +
      "lorre.theme.json or the built-in theme in components.json. Use it to inspect " +
      "the design system without parsing CSS.",
    inputSchema: {
      projectDir: z.string().describe("Absolute path to the consumer project root"),
    },
  },
  async ({ projectDir }) => toolResult(buildThemeShowArgs(projectDir))
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
