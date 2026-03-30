import { env } from '../config/env'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

const colors: Record<LogLevel, string> = {
  info:  '\x1b[36m',  // cyan
  warn:  '\x1b[33m',  // yellow
  error: '\x1b[31m',  // red
  debug: '\x1b[35m',  // magenta
}
const reset = '\x1b[0m'

const log = (level: LogLevel, message: string, meta?: unknown): void => {
  if (env.NODE_ENV === 'test') return

  const timestamp = new Date().toISOString()
  const color = colors[level]
  const prefix = `${color}[${level.toUpperCase()}]${reset} ${timestamp}`

  if (meta) {
    console.log(`${prefix} — ${message}`, meta)
  } else {
    console.log(`${prefix} — ${message}`)
  }
}

export const logger = {
  info:  (message: string, meta?: unknown) => log('info', message, meta),
  warn:  (message: string, meta?: unknown) => log('warn', message, meta),
  error: (message: string, meta?: unknown) => log('error', message, meta),
  debug: (message: string, meta?: unknown) => {
    if (env.NODE_ENV === 'development') log('debug', message, meta)
  },
}