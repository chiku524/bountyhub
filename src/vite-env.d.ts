/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string
  readonly VITE_GITHUB_RELEASES_URL?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_LOGO_VERSION?: string
  readonly VITE_FAVICON_VERSION?: string
  /** Gravity pixel UUID from dashboard Settings → Platform Settings */
  readonly VITE_GRAVITY_PIXEL_ID?: string
  readonly DEV: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    __TAURI__?: Record<string, unknown>
    /** Set by Gravity Pixel (`gr-pix.js`) after init */
    gravityPixel?: unknown
    gravity?: (...args: unknown[]) => void
  }
} 