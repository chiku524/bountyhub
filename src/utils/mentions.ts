/**
 * @mention parsing shared by the API (notifications) and the UI (rendering + autocomplete).
 *
 * A mention is `@` followed by a username made of letters, digits, `_` and `-` (GitHub-style,
 * up to 39 chars, not ending in `-`). The `@` must not follow a word character, `.`, `/` or
 * another `@`, so emails (`me@example.com`) and URLs (`https://x.com/@me`) are not mentions.
 */

const NAME = '[A-Za-z0-9](?:[A-Za-z0-9_-]{0,37}[A-Za-z0-9_])?'
const BEFORE = '(^|[^A-Za-z0-9_@./\\\\-])'

/** Most users one piece of content can notify, to keep a single message from spamming everyone. */
export const MAX_MENTIONS_PER_MESSAGE = 10

function mentionRegex(): RegExp {
  // Lookahead keeps `@bob.` matching `bob` while rejecting `@bob@x` and partial names.
  return new RegExp(`${BEFORE}@(${NAME})(?![A-Za-z0-9_@]|-[A-Za-z0-9_])`, 'g')
}

/** Removes fenced and inline code so `@Override` in a code sample is not a mention. */
export function stripCode(text: string): string {
  return text
    .replace(/(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(\n\2[^\n]*(?=\n|$)|$)/g, '$1')
    .replace(/`[^`\n]*`/g, '')
}

/**
 * Usernames mentioned in `text`, in order of first appearance, de-duplicated case-insensitively,
 * ignoring code. Capped at `limit`.
 */
export function extractMentions(text: string, limit = MAX_MENTIONS_PER_MESSAGE): string[] {
  if (!text || !text.includes('@')) return []
  const seen = new Set<string>()
  const out: string[] = []
  const re = mentionRegex()
  const source = stripCode(text)
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) && out.length < limit) {
    const name = m[2]
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(name)
  }
  return out
}

export type MentionPart = { type: 'text'; value: string } | { type: 'mention'; username: string }

/** Splits plain text into text runs and mentions, for rendering. */
export function splitMentions(text: string): MentionPart[] {
  const parts: MentionPart[] = []
  if (!text) return parts
  const re = mentionRegex()
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const at = m.index + m[1].length
    if (at > last) parts.push({ type: 'text', value: text.slice(last, at) })
    parts.push({ type: 'mention', username: m[2] })
    last = at + 1 + m[2].length
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) })
  return parts
}

/**
 * The partial mention the caret is in, e.g. typing `hi @al|` gives `{ start: 3, query: 'al' }`.
 * Returns null when the caret is not right after `@` + a (possibly empty) partial username.
 */
export function findMentionQuery(value: string, caret: number): { start: number; query: string } | null {
  const before = value.slice(0, caret)
  const m = /(^|[^A-Za-z0-9_@./\\-])@([A-Za-z0-9_-]{0,39})$/.exec(before)
  if (!m) return null
  const start = m.index + m[1].length
  return { start, query: m[2] }
}

/** Replaces the partial mention at `start..caret` with `@username ` and returns the new value + caret. */
export function applyMention(
  value: string,
  start: number,
  caret: number,
  username: string
): { value: string; caret: number } {
  const after = value.slice(caret)
  const insert = `@${username}${after.startsWith(' ') ? '' : ' '}`
  const next = value.slice(0, start) + insert + after
  return { value: next, caret: start + insert.length + (after.startsWith(' ') ? 1 : 0) }
}

/** Short single-line preview of content for a notification message. */
export function mentionSnippet(text: string, max = 120): string {
  const flat = stripCode(text).replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}
