import { Command, Option } from "commander"

import { runInit } from "./commands/init"
import { runAdd } from "./commands/add"
import { runList } from "./commands/list"
import { runDiff } from "./commands/diff"
import { runSearch } from "./commands/search"
import { runInfo } from "./commands/info"
import { runThemeApply, runThemeList } from "./commands/theme"
import { runPlanCheck } from "./commands/plan"
import { runApply } from "./commands/apply"
import { setJsonMode } from "./utils/output"

const program = new Command()

program
  .name("lorre-blocks")
  .description("Add lorre-blocks components to your project by copying their source in.")
  .version("0.6.0")

/**
 * `--json` is declared per-command (commander has no true global flag) and read
 * before any action runs, so every command can switch to machine-readable output.
 */
function jsonOption() {
  return new Option("--json", "machine-readable output; implies non-interactive").default(false)
}

program.hook("preAction", (_thisCommand, actionCommand) => {
  setJsonMode(Boolean(actionCommand.opts().json))
})

program
  .command("init")
  .description("Create a components.json config in your project.")
  .option("-c, --cwd <path>", "working directory", process.cwd())
  .option("-r, --registry <url>", "registry base URL")
  .option("-t, --theme <name>", "theme to install (e.g. basic, dreamy, utilitarian)")
  .option("-y, --yes", "skip prompts and accept defaults", false)
  .addOption(jsonOption())
  .action(async (opts) => {
    await runInit({
      cwd: opts.cwd,
      registry: opts.registry,
      theme: opts.theme,
      yes: opts.yes,
    })
  })

const theme = program
  .command("theme")
  .description("Manage the Lorre theme applied to your project.")

theme
  .command("list")
  .description("List the themes available in the registry.")
  .option("-c, --cwd <path>", "working directory", process.cwd())
  .option("-r, --registry <url>", "registry base URL")
  .addOption(jsonOption())
  .action(async (opts) => {
    await runThemeList({ cwd: opts.cwd, registry: opts.registry })
  })

theme
  .command("apply")
  .description("Apply a theme: replaces the lorre-blocks theme block in your global CSS.")
  .argument("<name>", "theme name, e.g. dreamy")
  .option("-c, --cwd <path>", "working directory", process.cwd())
  .addOption(jsonOption())
  .action(async (name: string, opts) => {
    await runThemeApply({ cwd: opts.cwd, name })
  })

program
  .command("add")
  .description("Add one or more components to your project.")
  .argument("[components...]", "component names, e.g. button")
  .option("-c, --cwd <path>", "working directory", process.cwd())
  .option("-y, --yes", "skip confirmation prompts", false)
  .option("-o, --overwrite", "overwrite existing files without asking", false)
  .addOption(jsonOption())
  .action(async (components: string[], opts) => {
    await runAdd({
      cwd: opts.cwd,
      components,
      yes: opts.yes,
      overwrite: opts.overwrite,
    })
  })

program
  .command("list")
  .description("List the components available in the registry.")
  .option("-c, --cwd <path>", "working directory", process.cwd())
  .option("-r, --registry <url>", "registry base URL")
  .addOption(jsonOption())
  .action(async (opts) => {
    await runList({ cwd: opts.cwd, registry: opts.registry })
  })

program
  .command("search")
  .description("Search the registry by name, tag, category or description.")
  .argument("[query...]", "free-text query; omit to list everything matching the filters")
  .option("-c, --cwd <path>", "working directory", process.cwd())
  .option("-r, --registry <url>", "registry base URL")
  .option("--category <name>", "filter by category (component, block, token, motion…)")
  .option("--source <name>", "filter by source (shadcn, magicui, radix, lorre)")
  .option("--theme <name>", "only items compatible with this theme")
  .option("--type <name>", "filter by registry type (registry:ui, registry:block…)")
  .option("--limit <n>", "cap the number of results", (v) => parseInt(v, 10))
  .addOption(jsonOption())
  .action(async (query: string[], opts) => {
    await runSearch({
      cwd: opts.cwd,
      query: (query ?? []).join(" "),
      registry: opts.registry,
      category: opts.category,
      source: opts.source,
      theme: opts.theme,
      type: opts.type,
      limit: opts.limit,
    })
  })

program
  .command("info")
  .description("Show a registry item's metadata, dependencies and target paths.")
  .argument("<name>", "component name, e.g. button")
  .option("-c, --cwd <path>", "working directory", process.cwd())
  .option("-r, --registry <url>", "registry base URL")
  .option("--files", "include full file contents in the JSON payload", false)
  .addOption(jsonOption())
  .action(async (name: string, opts) => {
    await runInfo({
      cwd: opts.cwd,
      name,
      registry: opts.registry,
      files: opts.files,
    })
  })

const plan = program
  .command("plan")
  .description("Work with plan.json files (see docs/phase-4.2-design.md).")

plan
  .command("check")
  .description("Validate a plan and resolve it against the registry (read-only).")
  .argument("<file>", "path to plan.json")
  .option("-c, --cwd <path>", "working directory", process.cwd())
  .option("-r, --registry <url>", "registry base URL")
  .addOption(jsonOption())
  .action(async (file: string, opts) => {
    await runPlanCheck({ cwd: opts.cwd, file, registry: opts.registry })
  })

program
  .command("apply")
  .description("Execute a plan: theme + components + deps in one run; records lorre.plan.json.")
  .argument("<file>", "path to plan.json")
  .option("-c, --cwd <path>", "working directory", process.cwd())
  .option("-r, --registry <url>", "registry base URL")
  .option("-o, --overwrite", "overwrite existing files", false)
  .addOption(jsonOption())
  .action(async (file: string, opts) => {
    await runApply({
      cwd: opts.cwd,
      file,
      registry: opts.registry,
      overwrite: opts.overwrite,
    })
  })

program
  .command("diff")
  .description("Show how your local components differ from the registry.")
  .argument("[components...]", "component names; omit to diff all present")
  .option("-c, --cwd <path>", "working directory", process.cwd())
  .addOption(jsonOption())
  .action(async (components: string[], opts) => {
    await runDiff({ cwd: opts.cwd, components })
  })

program.parseAsync(process.argv).catch((err) => {
  console.error(err)
  process.exit(1)
})
