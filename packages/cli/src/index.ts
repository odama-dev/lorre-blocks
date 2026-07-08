import { Command } from "commander"

import { runInit } from "./commands/init"
import { runAdd } from "./commands/add"
import { runList } from "./commands/list"
import { runDiff } from "./commands/diff"

const program = new Command()

program
  .name("lorre-blocks")
  .description("Add lorre-blocks components to your project by copying their source in.")
  .version("0.2.0")

program
  .command("init")
  .description("Create a components.json config in your project.")
  .option("-c, --cwd <path>", "working directory", process.cwd())
  .option("-r, --registry <url>", "registry base URL")
  .option("-y, --yes", "skip prompts and accept defaults", false)
  .action(async (opts) => {
    await runInit({
      cwd: opts.cwd,
      registry: opts.registry,
      yes: opts.yes,
    })
  })

program
  .command("add")
  .description("Add one or more components to your project.")
  .argument("[components...]", "component names, e.g. button")
  .option("-c, --cwd <path>", "working directory", process.cwd())
  .option("-y, --yes", "skip confirmation prompts", false)
  .option("-o, --overwrite", "overwrite existing files without asking", false)
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
  .action(async (opts) => {
    await runList({ cwd: opts.cwd, registry: opts.registry })
  })

program
  .command("diff")
  .description("Show how your local components differ from the registry.")
  .argument("[components...]", "component names; omit to diff all present")
  .option("-c, --cwd <path>", "working directory", process.cwd())
  .action(async (components: string[], opts) => {
    await runDiff({ cwd: opts.cwd, components })
  })

program.parseAsync(process.argv).catch((err) => {
  console.error(err)
  process.exit(1)
})
