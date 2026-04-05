import React, { useState, useRef, useEffect } from 'react'
import { FiX } from 'react-icons/fi'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  /** Debounce onSearch by this many ms. If 0 or omitted, search runs on every keystroke. */
  debounceMs?: number
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search posts...',
  className = '',
  debounceMs = 0,
}) => {
  const [query, setQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const flushSearch = (value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    onSearch(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    flushSearch(query)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (debounceMs > 0) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => onSearch(value), debounceMs)
    } else {
      onSearch(value)
    }
  }

  const clear = () => {
    setQuery('')
    flushSearch('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && query) {
              e.preventDefault()
              clear()
            }
          }}
          placeholder={placeholder}
          enterKeyHint="search"
          autoComplete="off"
          className="w-full min-h-11 pl-10 py-2 pr-10 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-neutral-400 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {query ? (
          <button
            type="button"
            onClick={clear}
            className="absolute inset-y-0 right-0 flex items-center pr-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            aria-label="Clear search"
          >
            <FiX className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </form>
  )
}
