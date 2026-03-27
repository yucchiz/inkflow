import { Plus } from 'lucide-react'
import { useReduceMotion } from '@/hooks/useReduceMotion'
import './FABButton.css'

interface FABButtonProps {
  onClick: () => void
}

export function FABButton({ onClick }: FABButtonProps) {
  const reduceMotion = useReduceMotion()

  return (
    <button
      className={`fab-button${reduceMotion ? ' fab-button--no-motion' : ''}`}
      onClick={onClick}
      aria-label="新規ドキュメントを作成"
      title="タップして新しいドキュメントを作成します"
    >
      <Plus size={24} aria-hidden="true" />
    </button>
  )
}
