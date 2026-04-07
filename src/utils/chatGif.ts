/**
 * Parse chat GIF markdown `[GIF: title](url)`.
 * Uses the last `)` as the URL terminator so URLs containing `)` still work.
 */
export function parseGifMarkdown(content: string): { title: string; url: string } | null {
  const prefix = '[GIF: ';
  if (!content.startsWith(prefix)) return null;
  const sep = '](';
  const mid = content.indexOf(sep, prefix.length);
  if (mid === -1) return null;
  const title = content.slice(prefix.length, mid).trim() || 'GIF';
  const urlStart = mid + sep.length;
  const close = content.lastIndexOf(')');
  if (close <= urlStart) return null;
  const url = content.slice(urlStart, close).trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) return null;
  return { title, url };
}
