/** Strips Markdown syntax for one-line excerpts in cards and lists (the full post renders Markdown). */
export function markdownToPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?(```|$)/g, ' ') // fenced code blocks
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images → alt text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links → label
    .replace(/`([^`]*)`/g, '$1') // inline code
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '') // headings, quotes, list markers
    .replace(/(\*\*|__|~~)(.+?)\1/g, '$2') // bold / strike
    .replace(/(^|[^\w*])[*_]([^*_\n]+)[*_](?=[^\w*]|$)/g, '$1$2') // italics
    .replace(/\s+/g, ' ')
    .trim()
}
