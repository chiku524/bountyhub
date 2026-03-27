import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiDownload, FiExternalLink, FiMonitor } from 'react-icons/fi'
import { FaWindows } from 'react-icons/fa'
import { SiApple, SiLinux } from 'react-icons/si'
import { PageMetadata } from '../components/PageMetadata'
import { config } from '../utils/config'

const GITHUB_RELEASES_URL = import.meta.env.VITE_GITHUB_RELEASES_URL || ''
const RELEASES_API_URL = `${config.api.baseUrl}/api/releases/latest`

type InstallerPlatform = 'windows' | 'macos' | 'linux'

type OsBanner =
  | { kind: 'desktop'; platform: InstallerPlatform; label: string }
  | { kind: 'android'; label: string }
  | { kind: 'ios'; label: string }
  | { kind: 'unknown'; label: string }

function isSignatureAsset(name: string): boolean {
  return name.toLowerCase().endsWith('.sig')
}

/** Best-effort client OS for banner + which installer to highlight. */
function detectOsBanner(): OsBanner {
  if (typeof navigator === 'undefined') {
    return { kind: 'unknown', label: 'Unknown' }
  }
  const ua = navigator.userAgent
  const uaLower = ua.toLowerCase()

  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string; mobile?: boolean; brands?: { brand: string }[] }
  }
  const plat = nav.userAgentData?.platform ?? navigator.platform ?? ''

  if (/android/i.test(ua)) {
    return { kind: 'android', label: 'Android' }
  }
  if (/iphone|ipad|ipod/i.test(ua)) {
    return { kind: 'ios', label: 'iOS' }
  }

  const pLower = plat.toLowerCase()
  if (pLower.includes('win') || uaLower.includes('windows')) {
    return { kind: 'desktop', platform: 'windows', label: 'Windows' }
  }
  if (pLower.includes('mac') || uaLower.includes('mac os')) {
    return { kind: 'desktop', platform: 'macos', label: 'macOS' }
  }
  if (pLower.includes('linux') || uaLower.includes('linux')) {
    return { kind: 'desktop', platform: 'linux', label: 'Linux' }
  }

  if (uaLower.includes('win')) {
    return { kind: 'desktop', platform: 'windows', label: 'Windows' }
  }
  return { kind: 'unknown', label: 'Unknown' }
}

const platformLabels: Record<InstallerPlatform, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
}

const platformIcons = {
  windows: FaWindows,
  macos: SiApple,
  linux: SiLinux,
}

type Asset = { name: string; browser_download_url: string }

/** `https://github.com/owner/repo/releases/latest` → `owner/repo` */
function parseGithubRepoFromReleasesPage(url: string): string | null {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`
  } catch {
    return null
  }
  return null
}

function mergeDownloadUrls(
  a: Record<InstallerPlatform, string | null>,
  b: Record<InstallerPlatform, string | null>
): Record<InstallerPlatform, string | null> {
  return {
    windows: a.windows ?? b.windows,
    macos: a.macos ?? b.macos,
    linux: a.linux ?? b.linux,
  }
}

/** Pick direct-download URLs from GitHub release assets (matches Tauri CI output). */
function getDownloadUrls(assets: Asset[]): Record<InstallerPlatform, string | null> {
  const list = assets.filter((a) => a.browser_download_url && !isSignatureAsset(a.name))
  const lower = (name: string) => name.toLowerCase()

  const windowsCandidates = list.filter((a) => {
    const n = lower(a.name)
    if (n.endsWith('.sig')) return false
    if (n.endsWith('.msi')) return true
    if (n.endsWith('.exe') && !n.includes('portable')) return true
    if (n.endsWith('.nsis.zip')) return true
    return false
  })
  const windows =
    windowsCandidates.find((a) => lower(a.name).endsWith('.msi')) ??
    windowsCandidates.find((a) => {
      const n = lower(a.name)
      return n.endsWith('.exe') && (n.includes('setup') || n.includes('nsis') || n.includes('_x64') || n.includes('x64'))
    }) ??
    windowsCandidates.find((a) => lower(a.name).endsWith('.exe')) ??
    windowsCandidates.find((a) => lower(a.name).endsWith('.nsis.zip')) ??
    null

  const dmgAssets = list.filter((a) => lower(a.name).endsWith('.dmg'))
  const prefersAppleSilicon =
    typeof navigator !== 'undefined' &&
    (/arm64|aarch64/i.test(navigator.userAgent) ||
      (navigator as Navigator & { userAgentData?: { architecture?: string } }).userAgentData?.architecture === 'arm')
  const macos =
    (prefersAppleSilicon
      ? dmgAssets.find((a) => {
          const n = lower(a.name)
          return n.includes('aarch64') || n.includes('arm64')
        })
      : null) ??
    dmgAssets.find((a) => {
      const n = lower(a.name)
      return n.includes('x64') || n.includes('x86_64') || n.includes('intel')
    }) ??
    dmgAssets[0] ??
    list.find((a) => {
      const n = lower(a.name)
      return n.endsWith('.app.tar.gz') && !n.includes('appimage')
    }) ??
    null

  const linux =
    list.find((a) => {
      const n = lower(a.name)
      return n.endsWith('.appimage') && !n.endsWith('.tar.gz')
    }) ??
    list.find((a) => lower(a.name).endsWith('.deb')) ??
    list.find((a) => {
      const n = lower(a.name)
      return n.includes('appimage') && n.endsWith('.tar.gz')
    }) ??
    list.find((a) => lower(a.name).endsWith('.rpm')) ??
    null

  return {
    windows: windows?.browser_download_url ?? null,
    macos: macos?.browser_download_url ?? null,
    linux: linux?.browser_download_url ?? null,
  }
}

function bannerText(os: OsBanner): string {
  switch (os.kind) {
    case 'desktop':
      return `Detected: ${os.label}. The ${platformLabels[os.platform]} download is highlighted below.`
    case 'android':
      return `Detected: ${os.label}. Installers below are for desktop; use BountyHub in your browser on this device.`
    case 'ios':
      return `Detected: ${os.label}. Installers below are for desktop; use BountyHub in Safari on this device.`
    default:
      return "We couldn't detect your OS. Pick the installer for your computer below, or open GitHub Releases."
  }
}

export default function Download() {
  const hasReleases = Boolean(GITHUB_RELEASES_URL)
  const [osBanner] = useState<OsBanner>(() => detectOsBanner())
  const recommendedDesktop: InstallerPlatform | null =
    osBanner.kind === 'desktop' ? osBanner.platform : null

  const [downloadUrls, setDownloadUrls] = useState<Record<InstallerPlatform, string | null>>({
    windows: null,
    macos: null,
    linux: null,
  })
  const skipReleaseFetch = !GITHUB_RELEASES_URL
  const [releasesFetched, setReleasesFetched] = useState(skipReleaseFetch)

  useEffect(() => {
    if (skipReleaseFetch) {
      return
    }
    const controller = new AbortController()
    const { signal } = controller

    async function load() {
      let merged: Record<InstallerPlatform, string | null> = {
        windows: null,
        macos: null,
        linux: null,
      }
      try {
        const r = await fetch(RELEASES_API_URL, { signal })
        if (r.ok) {
          const data = await r.json()
          if (data?.assets && Array.isArray(data.assets)) {
            merged = getDownloadUrls(data.assets as Asset[])
          }
        }
      } catch {
        /* network / abort */
      }

      const slug = parseGithubRepoFromReleasesPage(GITHUB_RELEASES_URL)
      const incomplete = !merged.windows || !merged.macos || !merged.linux
      if (slug && incomplete) {
        try {
          const pub = await fetch(`https://api.github.com/repos/${slug}/releases/latest`, { signal })
          if (pub.ok) {
            const data = await pub.json()
            if (data?.assets && Array.isArray(data.assets)) {
              merged = mergeDownloadUrls(merged, getDownloadUrls(data.assets as Asset[]))
            }
          }
        } catch {
          /* ignore */
        }
      }

      setDownloadUrls(merged)
      setReleasesFetched(true)
    }

    void load()
    return () => controller.abort()
  }, [skipReleaseFetch])

  const fallbackHref = GITHUB_RELEASES_URL
  const allDirectDownloads = Boolean(
    downloadUrls.windows && downloadUrls.macos && downloadUrls.linux
  )

  return (
    <div className="min-h-screen">
      <PageMetadata
        title="Download Desktop App - bountyhub"
        description="Download BountyHub for Windows, macOS, or Linux. Native desktop app built with Tauri — lightweight and always connected to bountyhub.tech."
        keywords="download, desktop app, Windows, macOS, Linux, Tauri, bountyhub"
      />
      <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
            <FiMonitor className="h-8 w-8" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">
            BountyHub Desktop
          </h1>
          <p className="mb-6 text-lg text-neutral-600 dark:text-neutral-400">
            The same BountyHub experience in a native app. Lightweight, fast, and always connected to bountyhub.tech.
          </p>

          {hasReleases && (
            <div
              className="mb-8 rounded-xl border border-indigo-200/80 bg-indigo-50/90 px-4 py-3 text-left text-sm text-indigo-950 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-100"
              role="status"
            >
              <p className="font-medium text-indigo-800 dark:text-indigo-200">Your device</p>
              <p className="mt-1 text-indigo-900/90 dark:text-indigo-100/95">{bannerText(osBanner)}</p>
            </div>
          )}

          {hasReleases ? (
            <>
              {!releasesFetched && (
                <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400" aria-live="polite">
                  Loading latest version…
                </p>
              )}
              <div className="flex flex-col flex-wrap items-center justify-center gap-4 sm:flex-row">
                {(['windows', 'macos', 'linux'] as const).map((p) => {
                  const Icon = platformIcons[p]
                  const directUrl = downloadUrls[p]
                  const href = directUrl || fallbackHref
                  const isDirect = Boolean(directUrl)
                  const isPrimary = recommendedDesktop === p
                  const ariaLabel = isDirect
                    ? `Download BountyHub for ${platformLabels[p]}`
                    : `Open GitHub releases for ${platformLabels[p]} installer`
                  const buttonClass = `inline-flex min-w-[160px] flex-col items-center gap-2 rounded-xl px-6 py-4 font-semibold shadow-lg transition-all ${
                    isPrimary
                      ? 'bg-indigo-600 text-white shadow-indigo-500/25 ring-2 ring-indigo-400 ring-offset-2 ring-offset-white hover:bg-indigo-700 dark:ring-offset-neutral-900'
                      : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600'
                  }`
                  return (
                    <a
                      key={p}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={ariaLabel}
                      className={buttonClass}
                    >
                      <Icon className="h-7 w-7" />
                      <span>{platformLabels[p]}</span>
                      {isPrimary && (
                        <span className="text-xs font-normal opacity-90">Recommended for you</span>
                      )}
                      {!isDirect && releasesFetched && (
                        <span className="flex items-center gap-1 text-xs font-normal opacity-90">
                          <FiExternalLink className="h-3.5 w-3.5" />
                          View on GitHub
                        </span>
                      )}
                      {isDirect && (
                        <FiDownload className={`h-5 w-5 ${isPrimary ? 'opacity-90' : 'opacity-70'}`} />
                      )}
                    </a>
                  )
                })}
              </div>
              {releasesFetched && !(downloadUrls.windows || downloadUrls.macos || downloadUrls.linux) && (
                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                  Release info couldn’t be loaded (repo may be private or the API may be unavailable).{' '}
                  <a
                    href={GITHUB_RELEASES_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Open GitHub Releases
                  </a>
                </p>
              )}
              {releasesFetched && (downloadUrls.windows || downloadUrls.macos || downloadUrls.linux) && (
                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                  {allDirectDownloads
                    ? 'Each button downloads the latest installer for that OS in a new tab.'
                    : 'When a direct file is listed, the button downloads it in a new tab. If you see “View on GitHub”, choose the installer on the releases page (or wait for the next tagged release if a platform build is still publishing).'}
                </p>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-left dark:border-neutral-700 dark:bg-neutral-800/50">
              <p className="mb-4 text-neutral-700 dark:text-neutral-300">
                Official installers will appear here once we publish a release. Until then, you can build the desktop app
                from source:
              </p>
              <ol className="mb-6 list-inside list-decimal space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li>
                  Install{' '}
                  <a
                    href="https://rustup.rs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Rust
                  </a>{' '}
                  and platform prerequisites (see docs).
                </li>
                <li>
                  Run{' '}
                  <code className="rounded bg-neutral-200 px-1.5 py-0.5 dark:bg-neutral-700">npm run desktop:icons</code>{' '}
                  to generate app icons.
                </li>
                <li>
                  Run{' '}
                  <code className="rounded bg-neutral-200 px-1.5 py-0.5 dark:bg-neutral-700">npm run desktop</code> for
                  development or{' '}
                  <code className="rounded bg-neutral-200 px-1.5 py-0.5 dark:bg-neutral-700">npm run desktop:build</code>{' '}
                  for installers.
                </li>
              </ol>
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Full desktop setup guide
              </Link>
            </div>
          )}

          <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-500">
            Built with Tauri — small install size, low memory use. Connects to api.bountyhub.tech.
          </p>
        </div>
      </section>

      <section className="border-t border-neutral-200 py-12 px-4 dark:border-neutral-700">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">Prefer the web?</h2>
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            Use BountyHub in your browser — no install required.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-200 px-5 py-2.5 font-medium text-neutral-800 transition-colors hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
          >
            Open bountyhub.tech
          </Link>
        </div>
      </section>
    </div>
  )
}
