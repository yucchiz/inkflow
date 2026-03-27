import { useState, useEffect, useCallback, useMemo } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'
export type ThemeIcon = 'sun' | 'moon' | 'monitor'

const STORAGE_KEY = 'inkflow:theme'
const THEME_ORDER: ThemeMode[] = ['light', 'dark', 'system']

function getStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  return 'system'
}

function getSystemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const ICON_MAP: Record<ThemeMode, ThemeIcon> = {
  light: 'sun',
  dark: 'moon',
  system: 'monitor',
}

export function useThemeManager() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredTheme)
  const [systemDark, setSystemDark] = useState<boolean>(getSystemPrefersDark)

  // Listen for OS color scheme changes
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  // Apply data-theme attribute and persist
  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    try {
      localStorage.setItem(STORAGE_KEY, themeMode)
    } catch {
      // localStorage unavailable
    }
  }, [themeMode])

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemDark ? 'dark' : 'light'
    }
    return themeMode
  }, [themeMode, systemDark])

  const currentIcon: ThemeIcon = ICON_MAP[themeMode]

  const cycle = useCallback(() => {
    setThemeMode((current) => {
      const idx = THEME_ORDER.indexOf(current)
      const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length]!
      return next
    })
  }, [])

  return { themeMode, resolvedTheme, currentIcon, cycle }
}
