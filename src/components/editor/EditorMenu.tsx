import { useState, useEffect, useRef, useCallback } from 'react'
import {
  EllipsisVertical,
  Copy,
  Share2,
  Sun,
  Moon,
  Monitor,
  Maximize2,
  Minimize2,
  Trash2,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { shareText } from '@/utils/exportHelper'
import './EditorMenu.css'

interface EditorMenuProps {
  title: string
  body: string
  isFocusMode: boolean
  onCopy: () => void
  onToggleFocusMode: () => void
  onDelete: () => void
}

export function EditorMenu({
  title,
  body,
  isFocusMode,
  onCopy,
  onToggleFocusMode,
  onDelete,
}: EditorMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { themeMode, cycle } = useTheme()

  const close = useCallback(() => setIsOpen(false), [])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('click', handleClickOutside, true)
    return () => document.removeEventListener('click', handleClickOutside, true)
  }, [isOpen, close])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  function handleToggle() {
    setIsOpen((prev) => !prev)
  }

  function handleCopy() {
    onCopy()
    close()
  }

  function handleShare() {
    void shareText(title, body)
    close()
  }

  function handleThemeCycle() {
    cycle()
  }

  function handleFocusToggle() {
    onToggleFocusMode()
    close()
  }

  function handleDelete() {
    onDelete()
    close()
  }

  return (
    <div className="editor-menu" ref={menuRef}>
      <button
        onClick={handleToggle}
        aria-label="メニュー"
        aria-expanded={isOpen}
        className="editor-menu__trigger"
      >
        <EllipsisVertical size={18} />
      </button>

      {isOpen && (
        <div className="editor-menu__dropdown" role="menu">
          <button className="editor-menu__item" role="menuitem" onClick={handleCopy}>
            <Copy size={16} />
            <span>コピー</span>
          </button>
          <button className="editor-menu__item" role="menuitem" onClick={handleShare}>
            <Share2 size={16} />
            <span>共有</span>
          </button>

          <div className="editor-menu__divider" role="separator" />

          <div className="editor-menu__theme-section">
            <button
              className={`editor-menu__theme-btn ${themeMode === 'light' ? 'editor-menu__theme-btn--active' : ''}`}
              onClick={handleThemeCycle}
              aria-label="ライト"
              title="ライト"
            >
              <Sun size={16} />
            </button>
            <button
              className={`editor-menu__theme-btn ${themeMode === 'dark' ? 'editor-menu__theme-btn--active' : ''}`}
              onClick={handleThemeCycle}
              aria-label="ダーク"
              title="ダーク"
            >
              <Moon size={16} />
            </button>
            <button
              className={`editor-menu__theme-btn ${themeMode === 'system' ? 'editor-menu__theme-btn--active' : ''}`}
              onClick={handleThemeCycle}
              aria-label="システム"
              title="システム"
            >
              <Monitor size={16} />
            </button>
          </div>

          <button className="editor-menu__item" role="menuitem" onClick={handleFocusToggle}>
            {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span>{isFocusMode ? '集中モード解除' : '集中モード'}</span>
          </button>

          <div className="editor-menu__divider" role="separator" />

          <button
            className="editor-menu__item editor-menu__item--danger"
            role="menuitem"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            <span>削除</span>
          </button>
        </div>
      )}
    </div>
  )
}
