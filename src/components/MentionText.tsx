import { Link } from 'react-router-dom'
import { splitMentions } from '../utils/mentions'

/** Plain text with @mentions rendered as profile links. */
export function MentionText({ text, linkClassName = '' }: { text: string; linkClassName?: string }) {
  const parts = splitMentions(text)
  if (!parts.some((p) => p.type === 'mention')) return <>{text}</>
  return (
    <>
      {parts.map((p, i) =>
        p.type === 'text' ? (
          <span key={i}>{p.value}</span>
        ) : (
          <Link
            key={i}
            to={`/users/${encodeURIComponent(p.username)}`}
            className={`font-semibold hover:underline ${linkClassName}`}
          >
            @{p.username}
          </Link>
        )
      )}
    </>
  )
}
