import { useState } from 'react';
import { parseGifMarkdown } from '../utils/chatGif';

function ChatGifImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs underline break-all opacity-90 hover:opacity-100"
      >
        Open GIF
      </a>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="max-w-full rounded-sm"
      style={{ maxHeight: '200px' }}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

/** Renders `[GIF: …](url)` as an image, otherwise plain text (optionally wrapped). */
export function ChatMessageBody({
  content,
  className,
}: {
  content: string;
  /** Applied to non-GIF text wrapper */
  className?: string;
}) {
  const gif = parseGifMarkdown(content);
  if (gif) {
    return (
      <div>
        <ChatGifImage src={gif.url} alt={gif.title} />
      </div>
    );
  }
  if (className) {
    return <div className={className}>{content}</div>;
  }
  return <>{content}</>;
}
