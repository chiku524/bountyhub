/**
 * Cache-busted logo URL. Vite injects VITE_LOGO_VERSION at build from public/logo.svg content hash.
 * When the logo file changes, the version changes so browsers fetch the new file.
 */
const version = typeof import.meta.env.VITE_LOGO_VERSION === 'string' ? import.meta.env.VITE_LOGO_VERSION : ''
export const logoUrl = version ? `/logo.svg?v=${version}` : '/logo.svg'
