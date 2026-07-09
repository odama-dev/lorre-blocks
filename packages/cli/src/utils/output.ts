import * as p from "@clack/prompts"

/**
 * Output layer. In JSON mode every human-facing message is suppressed and the
 * command instead emits exactly one JSON document on stdout, so an agent can
 * parse stdout without stripping spinners or ANSI codes. Warnings are collected
 * and returned in that document rather than printed.
 */

let jsonMode = false
let warnings: string[] = []

export function setJsonMode(value: boolean): void {
  jsonMode = value
  warnings = []
}

export function isJsonMode(): boolean {
  return jsonMode
}

export function intro(message: string): void {
  if (!jsonMode) p.intro(message)
}

export function outro(message: string): void {
  if (!jsonMode) p.outro(message)
}

export function success(message: string): void {
  if (!jsonMode) p.log.success(message)
}

export function message(text: string): void {
  if (!jsonMode) p.log.message(text)
}

export function warn(text: string): void {
  if (jsonMode) warnings.push(text)
  else p.log.warn(text)
}

export function takeWarnings(): string[] {
  const collected = warnings
  warnings = []
  return collected
}

export interface Spinner {
  start(message?: string): void
  stop(message?: string): void
}

const noopSpinner: Spinner = { start() {}, stop() {} }

export function spinner(): Spinner {
  return jsonMode ? noopSpinner : p.spinner()
}

/** Emit the successful result. No-op outside JSON mode. */
export function emit(data: Record<string, unknown>): void {
  if (!jsonMode) return
  const payload = { ok: true, ...data }
  const w = takeWarnings()
  if (w.length > 0) (payload as Record<string, unknown>).warnings = w
  process.stdout.write(JSON.stringify(payload, null, 2) + "\n")
}

/** Report a fatal error and exit non-zero. */
export function fail(message: string, extra?: Record<string, unknown>): never {
  if (jsonMode) {
    process.stdout.write(
      JSON.stringify({ ok: false, error: message, ...extra }, null, 2) + "\n"
    )
  } else {
    p.cancel(message)
  }
  process.exit(1)
}

/**
 * Guard for prompts: JSON mode must never block on stdin. Callers pass the
 * value they would have prompted for; when it is missing we fail loudly instead
 * of hanging an agent's subprocess.
 */
export function requireNonInteractive<T>(value: T | undefined, what: string): T {
  if (value === undefined) {
    fail(`--json requires ${what} to be provided explicitly (it cannot prompt).`)
  }
  return value
}
