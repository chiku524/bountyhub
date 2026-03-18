import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiDownload, FiMonitor } from 'react-icons/fi'
import { SiWindows, SiApple, SiLinux } from 'react-icons/si'
import { PageMetadata } from '../components/PageMetadata'

const GITHUB_RELEASES_URL = import.meta.env.VITE_GITHUB_RELEASES_URL || ''

type Platform = 'windows' | 'macos' | 'linux' | null

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('win')) return 'windows'
  if (ua.includes('mac') || ua.includes('iphone') || ua.includes('ipad')) return 'macos'
  if (ua.includes('linux') || ua.includes('android')) return 'linux'
  return null
}

const platformLabels: Record<NonNullable<Platform>, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
}

const platformIcons = {
  windows: SiWindows,
  macos: SiApple,
  linux: SiLinux,
}

/** Parse repo owner/name from GitHub releases URL (e.g. https://github.com/owner/repo/releases/latest -> owner/repo). */
function getRepoFromReleasesUrl(url: string): string | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/releases/)
  return match ? `${match[1]}/${match[2]}` : null
}

/** Pick the best direct-download URL for each platform from GitHub release assets. */
function getDownloadUrls(assets: { name: string; browser_download_url: string }[]): Record<NonNullable<Platform>, string | null> {
  const lower = (name: string) => name.toLowerCase()
  const windows =
    assets.find((a) => lower(a.name).endsWith('.msi')) ??
    assets.find((a) => lower(a.name).endsWith('.exe') && !lower(a.name).includes('portable'))
  const macos = assets.find((a) => lower(a.name).endsWith('.dmg'))
  const linux = assets.find((a) => lower(a.name).endsWith('.appimage') || lower(a.name).endsWith('.deb'))
  return {
    windows: windows?.browser_download_url ?? null,
    macos: macos?.browser_download_url ?? null,
    linux: linux?.browser_download_url ?? null,
  }
}

export default function Download() {
  const hasReleases = Boolean(GITHUB_RELEASES_URL)
  const [platform, setPlatform] = useState<Platform>(null)
  const [downloadUrls, setDownloadUrls] = useState<Record<NonNullable<Platform>, string | null>>({
    windows: null,
    macos: null,
    linux: null,
  })
  const [releasesFetched, setReleasesFetched] = useState(false)

  useEffect(() => {
    setPlatform(detectPlatform())
  }, [])

  useEffect(() => {
    if (!GITHUB_RELEASES_URL) {
      setReleasesFetched(true)
      return
    }
    const repo = getRepoFromReleasesUrl(GITHUB_RELEASES_URL)
    if (!repo) {
      setReleasesFetched(true)
      return
    }
    const controller = new AbortController()
    fetch(`https://api.github.com/repos/${repo}/releases/latest`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data?.assets && Array.isArray(data.assets)) {
          setDownloadUrls(getDownloadUrls(data.assets))
        }
      })
      .catch(() => {})
      .finally(() => setReleasesFetched(true))
    return () => controller.abort()
  }, [])

  return (
    <div className="min-h-screen">
      <PageMetadata
        title="Download Desktop App - bountyhub"
        description="Download BountyHub for Windows, macOS, or Linux. Native desktop app built with Tauri — lightweight and always connected to bountyhub.tech."
        keywords="download, desktop app, Windows, macOS, Linux, Tauri, bountyhub"
      />
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-6">
            <FiMonitor className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            BountyHub Desktop
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10">
            The same BountyHub experience in a native app. Lightweight, fast, and always connected to bountyhub.tech.
          </p>

          {hasReleases ? (
            <>
              {!releasesFetched && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3" aria-live="polite">
                  Loading latest version…
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
                {(['windows', 'macos', 'linux'] as const).map((p) => {
                  const Icon = platformIcons[p]
                  const isPrimary = platform === p
                  const directUrl = downloadUrls[p]
                  const href = directUrl || GITHUB_RELEASES_URL
                  const isDirectDownload = Boolean(directUrl)
                  const ariaLabel = isDirectDownload
                    ? `Download BountyHub for ${platformLabels[p]}`
                    : `Open GitHub release page for ${platformLabels[p]}`
                  return (
                    <a
                      key={p}
                      href={href}
                      target={isDirectDownload ? undefined : '_blank'}
                      rel={isDirectDownload ? undefined : 'noopener noreferrer'}
                      download={isDirectDownload ? true : undefined}
                      aria-label={ariaLabel}
                      className={`inline-flex flex-col items-center gap-2 px-6 py-4 rounded-xl font-semibold shadow-lg transition-all min-w-[140px] ${
                        isPrimary
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                      }`}
                    >
                      <Icon className="w-7 h-7" />
                      <span>{platformLabels[p]}</span>
                      {isPrimary && (
                        <span className="text-xs opacity-90 font-normal">Recommended for you</span>
                      )}
                      <FiDownload className={`w-5 h-5 ${isPrimary ? 'opacity-90' : 'opacity-70'}`} />
                    </a>
                  )
                })}
              </div>
              {releasesFetched && (downloadUrls.windows || downloadUrls.macos || downloadUrls.linux) && (
                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                  Click a button to download the installer; it will start automatically.
                </p>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 p-8 text-left">
              <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                Official installers will appear here once we publish a release. Until then, you can build the desktop app from source:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400 text-sm mb-6">
                <li>Install <a href="https://rustup.rs" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Rust</a> and platform prerequisites (see docs).</li>
                <li>Run <code className="bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded">npm run desktop:icons</code> to generate app icons.</li>
                <li>Run <code className="bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded">npm run desktop</code> for development or <code className="bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded">npm run desktop:build</code> for installers.</li>
              </ol>
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
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

      <section className="border-t border-neutral-200 dark:border-neutral-700 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Prefer the web?</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Use BountyHub in your browser — no install required.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors font-medium"
          >
            Open bountyhub.tech
          </Link>
        </div>
      </section>
    </div>
  )
}
