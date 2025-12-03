import { useTheme } from '../contexts/ThemeProvider'
import { FiSun, FiMoon } from 'react-icons/fi'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-neutral-700 dark:bg-neutral-800 hover:bg-neutral-600 dark:hover:bg-neutral-700 text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white transition-all duration-200"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <FiMoon className="w-5 h-5" />
      ) : (
        <FiSun className="w-5 h-5" />
      )}
    </button>
  )
}

