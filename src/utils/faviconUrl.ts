/**
 * Cache-busted favicon URL. Vite injects VITE_FAVICON_VERSION from public/favicon.svg content hash.
 */
const version = import.meta.env.VITE_FAVICON_VERSION as string | undefined

export const faviconUrl = version ? `/favicon.svg?v=${version}` : '/favicon.svg'
