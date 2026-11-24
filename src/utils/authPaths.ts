/** Routes that render as standalone auth screens (no TopNav, chat sidebar or app shell). */
export const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'] as const

export function isAuthPath(pathname: string): boolean {
  return (AUTH_PATHS as readonly string[]).includes(pathname)
}
