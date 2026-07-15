import {
  siAngular,
  siAnthropic,
  siApple,
  siAstro,
  siBun,
  siCloudflare,
  siDeno,
  siDiscord,
  siDjango,
  siDocker,
  siEslint,
  siFigma,
  siFirebase,
  siGit,
  siGithub,
  siGitlab,
  siGo,
  siGooglechrome,
  siGraphql,
  siJavascript,
  siJest,
  siKubernetes,
  siLaravel,
  siLinux,
  siMongodb,
  siMysql,
  siNetlify,
  siNextdotjs,
  siNodedotjs,
  siNotion,
  siNpm,
  siPhp,
  siPnpm,
  siPostgresql,
  siPrettier,
  siPrisma,
  siPython,
  siReact,
  siRedis,
  siRemix,
  siRust,
  siSass,
  siStorybook,
  siStripe,
  siSupabase,
  siSvelte,
  siTailwindcss,
  siTypescript,
  siVercel,
  siVite,
  siVuedotjs,
  siWebpack,
} from "simple-icons"

export interface LogoDef {
  slug: string
  title: string
  /** Brand hex, with leading #. */
  hex: string
  /** SVG path data on a 24×24 viewBox. */
  path: string
}

const RAW = [
  siReact, siNextdotjs, siTypescript, siJavascript, siNodedotjs, siVuedotjs,
  siSvelte, siAngular, siAstro, siRemix, siTailwindcss, siSass, siVite,
  siWebpack, siEslint, siPrettier, siStorybook, siJest, siGraphql, siPrisma,
  siPostgresql, siMysql, siMongodb, siRedis, siSupabase, siFirebase, siPython,
  siRust, siGo, siPhp, siLaravel, siDjango, siDocker, siKubernetes, siGit,
  siGithub, siGitlab, siVercel, siNetlify, siCloudflare, siNpm, siPnpm, siBun,
  siDeno, siLinux, siApple, siGooglechrome, siStripe, siNotion, siDiscord,
  siFigma, siAnthropic,
]

export const LOGOS: LogoDef[] = RAW.map((i) => ({
  slug: i.slug,
  title: i.title,
  hex: `#${i.hex}`,
  path: i.path,
}))
