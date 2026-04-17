'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = (localStorage.getItem('theme') as Theme) || 'system'
    setTheme(stored)
    apply(stored)
  }, [])

  const apply = (t: Theme) => {
    const root = document.documentElement
    if (t === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', t)
    }
  }

  const next = () => {
    const order: Theme[] = ['light', 'dark', 'system']
    const n = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(n)
    localStorage.setItem('theme', n)
    apply(n)
  }

  if (!mounted) return <span className="w-8" />

  const icon = theme === 'light' ? '☀' : theme === 'dark' ? '☾' : '◐'
  return (
    <button
      onClick={next}
      title={`Theme: ${theme} (click to cycle)`}
      className="text-[var(--text-muted)] hover:text-[var(--text)] bg-transparent border-none cursor-pointer text-base leading-none px-1"
      aria-label="Toggle theme"
    >
      {icon}
    </button>
  )
}
