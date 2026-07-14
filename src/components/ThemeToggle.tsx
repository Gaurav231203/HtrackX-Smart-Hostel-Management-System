"use client"

import { useTheme } from './ThemeProvider'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="p-2 rounded-xl bg-secondary w-10 h-10" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl bg-secondary hover:bg-accent transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <Sun className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
          theme === 'light' ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
        }`} />
        <Moon className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
          theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
        }`} />
      </div>
    </button>
  )
}