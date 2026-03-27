import { Pencil } from 'lucide-react'
import './EmptyState.css'

export function EmptyState() {
  return (
    <div
      className="empty-state"
      role="status"
      aria-label="ドキュメントがありません。プラスボタンで書き始めましょう"
    >
      <Pencil size={48} className="empty-state__icon" aria-hidden="true" />
      <p className="empty-state__text">まだドキュメントがありません</p>
      <p className="empty-state__hint">+ボタンで書き始めましょう</p>
    </div>
  )
}
