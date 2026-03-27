import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import type { ThemeIcon } from '@/hooks/useTheme'
import './ThemeToggleButton.css'

const ICON_COMPONENTS = {
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
} as const

const ARIA_LABELS: Record<ThemeIcon, string> = {
  sun: 'ライトテーマ。タップでダークテーマに切替',
  moon: 'ダークテーマ。タップでシステムテーマに切替',
  monitor: 'システムテーマ。タップでライトテーマに切替',
}

export function ThemeToggleButton() {
  const { currentIcon, cycle } = useTheme()
  const IconComponent = ICON_COMPONENTS[currentIcon]

  return (
    <button
      onClick={cycle}
      aria-label={ARIA_LABELS[currentIcon]}
      className="theme-toggle-button"
    >
      <IconComponent size={18} aria-hidden="true" />
    </button>
  )
}
