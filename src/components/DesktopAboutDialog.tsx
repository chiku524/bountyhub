import { useState, useEffect } from 'react'
import { useRestoreFocusWhenOpen } from '../hooks/useRestoreFocus'
import { FiX } from 'react-icons/fi'
import { isDesktopApp } from '../utils/desktop'
import { logoUrl } from '../utils/logoUrl'

const REPO_URL = 'https://github.com/chiku524/bountyhub'
const DOCS_URL = 'https://bountyhub.tech/docs'

interface DesktopAboutDialogProps {
  open: boolean
  onClose: () => void
}

export function DesktopAboutDialog({ open, onClose }: DesktopAboutDialogProps) {
  const [version, setVersion] = useState<string>('')

  useRestoreFocusWhenOpen(open)

  useEffect(() => {
    if (!open || !isDesktopApp()) return
    import('@tauri-apps/api/core')
      .then(({ invoke }) => invoke<string>('get_app_version'))
      .then(setVersion)
      .catch(() => setVersion(''))
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-cyan-500/20 bg-neutral-900 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between border-b border-neutral-700/80 px-5 py-4">
          <h2 id="about-title" className="text-lg font-semibold text-white">
            About BountyHub
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-700/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-4 px-5 py-6">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-neutral-800 shadow-lg ring-1 ring-white/10">
            <img src={logoUrl} alt="" className="h-full w-full object-contain p-1" width={56} height={56} aria-hidden />
          </div>
          <p className="text-center text-sm text-neutral-300">
            Decentralized bounty platform. Ask questions, offer bounties, earn rewards on Solana.
          </p>
          {version && (
            <p className="text-xs text-neutral-500">
              Version {version}
            </p>
          )}
          <div className="flex gap-3">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
            >
              GitHub
            </a>
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
            >
              Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
