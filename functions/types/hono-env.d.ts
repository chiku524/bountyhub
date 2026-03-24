import 'hono'

declare module 'hono' {
  interface ContextVariableMap {
    sessionId: string | undefined
  }
}
