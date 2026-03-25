/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string
  readonly VITE_GITHUB_RELEASES_URL?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_LOGO_VERSION?: string
  readonly VITE_FAVICON_VERSION?: string
  readonly DEV: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    __TAURI__?: Record<string, unknown>
  }
} 