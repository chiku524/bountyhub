import React, { useState } from 'react'
import type { CodeBlock } from '../types'

interface CodeBlockEditorProps {
  onAdd: (codeBlock: CodeBlock) => void
  onCancel: () => void
}

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'scala', label: 'Scala' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: 'Plain Text' }
]

export const CodeBlockEditor: React.FC<CodeBlockEditorProps> = ({ onAdd, onCancel }) => {
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCancel = () => {
    setCode('')
    setDescription('')
    setLanguage('javascript')
    setIsExpanded(false)
    onCancel()
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-gray-300 hover:text-white rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        Add Code Block
      </button>
    )
  }

  return (
    <div className="bg-neutral-800 border border-neutral-600 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-medium">Add Code Block</h4>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form className="space-y-4">
        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Code Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Code
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your code here..."
            className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-none"
            rows={8}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of what this code does..."
            className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={2}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-gray-300 hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!code.trim()}
            onClick={() => {
              if (!code.trim()) return
              const codeBlock: CodeBlock = {
                language,
                code: code.trim(),
                description: description.trim() || undefined
              }
              onAdd(codeBlock)
              setCode('')
              setDescription('')
              setLanguage('javascript')
              setIsExpanded(false)
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Code Block
          </button>
        </div>
      </form>
    </div>
  )
} 