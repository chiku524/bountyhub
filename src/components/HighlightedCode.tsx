import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark'
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java'
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp'
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp'
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php'
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby'
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go'
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust'
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift'
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin'
import scala from 'react-syntax-highlighter/dist/esm/languages/prism/scala'
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup'
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import powershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml'
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown'
import { useTheme } from '../contexts/ThemeProvider'

const LANGS: Record<string, unknown> = {
  javascript, typescript, python, java, cpp, csharp, php, ruby, go, rust, swift, kotlin, scala,
  markup, css, sql, bash, powershell, json, yaml, markdown,
}
for (const [name, def] of Object.entries(LANGS)) SyntaxHighlighter.registerLanguage(name, def)

/** Maps CodeBlockEditor language values onto registered Prism grammars. */
function prismLanguage(language: string | undefined): string {
  const l = (language || '').toLowerCase()
  const aliases: Record<string, string> = {
    html: 'markup', xml: 'markup', svg: 'markup', shell: 'bash', sh: 'bash', zsh: 'bash',
    js: 'javascript', jsx: 'javascript', mjs: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', rb: 'ruby', rs: 'rust', yml: 'yaml', md: 'markdown', cs: 'csharp', 'c++': 'cpp', kt: 'kotlin', ps1: 'powershell',
  }
  if (aliases[l]) return aliases[l]
  if (l in LANGS) return l
  return 'text'
}

/** Syntax-highlighted code body; loaded lazily by CodeBlockView so the grammars stay out of the main bundle. */
export default function HighlightedCode({ code, language }: { code: string; language?: string }) {
  const { theme } = useTheme()
  return (
    <SyntaxHighlighter
      language={prismLanguage(language)}
      style={theme === 'dark' ? oneDark : oneLight}
      customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '0.8125rem', maxHeight: '24rem' }}
      wrapLongLines={false}
    >
      {code}
    </SyntaxHighlighter>
  )
}
