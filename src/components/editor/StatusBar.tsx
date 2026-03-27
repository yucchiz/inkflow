import type { SaveStatus } from '@/hooks/useEditor'
import './StatusBar.css'

interface StatusBarProps {
  characterCount: number
  saveStatus: SaveStatus
}

function saveStatusText(status: SaveStatus): string {
  switch (status) {
    case 'saving':
      return '保存中...'
    case 'saved':
      return '保存しました'
    case 'idle':
      return ''
  }
}

export function StatusBar({ characterCount, saveStatus }: StatusBarProps) {
  const countText = `${characterCount}文字`
  const statusText = saveStatusText(saveStatus)
  const ariaLabel = statusText ? `${countText}、${statusText}` : countText

  return (
    <div
      className="status-bar"
      role="status"
      aria-label={ariaLabel}
    >
      <span>{countText}</span>
      <span>{statusText}</span>
    </div>
  )
}
