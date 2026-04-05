/** Minimal GIPHY REST types for search + preview URL selection. */

export type GiphyImageSet = {
  fixed_height?: { url?: string }
  fixed_height_downsampled?: { url?: string }
  downsized?: { url?: string }
  fixed_width?: { url?: string }
  original?: { url?: string }
}

export type GiphyGif = {
  id: string
  title?: string
  images?: GiphyImageSet
}

export function pickGiphyPreviewUrl(gif: GiphyGif): string | null {
  const im = gif.images
  if (!im) return null
  return (
    im.fixed_height?.url ||
    im.fixed_height_downsampled?.url ||
    im.downsized?.url ||
    im.fixed_width?.url ||
    im.original?.url ||
    null
  )
}

/** Avoid breaking `[GIF: title](url)` when title contains brackets. */
export function safeGifCaption(title: string | undefined): string {
  const t = (title?.trim() || 'GIF').replace(/\[/g, ' ').replace(/\]/g, ' ').replace(/\s+/g, ' ').trim()
  return t.slice(0, 120) || 'GIF'
}
