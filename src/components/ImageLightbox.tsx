import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import { FocusRestoreBoundary } from './FocusRestoreBoundary'

interface ImageLightboxProps {
  images: { url: string; alt?: string }[]
  index: number | null
  onIndexChange: (index: number | null) => void
}

/** Full-screen image viewer with keyboard navigation (Esc, ←, →). Keeps people on the page instead of opening a new tab. */
export function ImageLightbox({ images, index, onIndexChange }: ImageLightboxProps) {
  const open = index !== null && images.length > 0
  const close = useCallback(() => onIndexChange(null), [onIndexChange])
  const step = useCallback(
    (delta: number) => {
      if (index === null) return
      onIndexChange((index + delta + images.length) % images.length)
    },
    [index, images.length, onIndexChange]
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close, step])

  if (!open || index === null) return null
  const image = images[index]

  return createPortal(
    <FocusRestoreBoundary>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
        className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
      >
        <img src={image.url} alt={image.alt ?? ''} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
        <button
          type="button"
          onClick={close}
          autoFocus
          className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          aria-label="Close image"
        >
          <FiX className="h-6 w-6" />
        </button>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Previous image"
            >
              <FiChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Next image"
            >
              <FiChevronRight className="h-6 w-6" />
            </button>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
              {index + 1} / {images.length}
            </p>
          </>
        )}
        <a
          href={image.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 text-sm text-white/80 underline hover:text-white"
        >
          Open original
        </a>
      </div>
    </FocusRestoreBoundary>,
    document.body
  )
}
