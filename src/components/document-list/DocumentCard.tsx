import { useRef, useState, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { inkFlowFormatted } from '@/utils/dateFormatter'
import type { InkDocument } from '@/models/InkDocument'
import './DocumentCard.css'

interface DocumentCardProps {
  document: InkDocument
  onClick: () => void
  onDelete: () => void
}

const SWIPE_THRESHOLD = 80

export function DocumentCard({ document, onClick, onDelete }: DocumentCardProps) {
  const touchStartXRef = useRef<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwiped, setIsSwiped] = useState(false)

  const displayTitle = document.title.trim() || '無題のドキュメント'
  const displayBody = document.body.trim()
  const formattedDate = inkFlowFormatted(document.updatedAt)
  const ariaLabel = `${displayTitle}, ${formattedDate}`

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (touch) {
      touchStartXRef.current = touch.clientX
    }
    setIsSwiped(false)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    const touch = e.touches[0]
    if (!touch) return
    const diff = touchStartXRef.current - touch.clientX
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, 120))
    } else {
      setSwipeOffset(0)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (swipeOffset >= SWIPE_THRESHOLD) {
      setIsSwiped(true)
      setSwipeOffset(SWIPE_THRESHOLD)
    } else {
      setSwipeOffset(0)
      setIsSwiped(false)
    }
    touchStartXRef.current = null
  }, [swipeOffset])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }, [onClick])

  const handleDeleteKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      onDelete()
    }
  }, [onDelete])

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }, [onDelete])

  const resetSwipe = useCallback(() => {
    setSwipeOffset(0)
    setIsSwiped(false)
  }, [])

  return (
    <div className="document-card-wrapper">
      <div className="document-card-delete-bg">
        <button
          className="document-card-delete-button"
          onClick={handleDeleteClick}
          onKeyDown={handleDeleteKeyDown}
          aria-label={`${displayTitle}を削除`}
          tabIndex={isSwiped ? 0 : -1}
        >
          <Trash2 size={20} aria-hidden="true" />
        </button>
      </div>
      <div
        className="document-card"
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onClick={isSwiped ? resetSwipe : onClick}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: swipeOffset > 0 ? `translateX(-${swipeOffset}px)` : undefined,
        }}
      >
        <p className="document-card__title">{displayTitle}</p>
        {displayBody && (
          <p className="document-card__body">{displayBody}</p>
        )}
        <time className="document-card__date" dateTime={new Date(document.updatedAt).toISOString()}>
          {formattedDate}
        </time>
      </div>
    </div>
  )
}
