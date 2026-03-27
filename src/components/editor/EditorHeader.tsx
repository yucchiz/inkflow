import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { EditorMenu } from './EditorMenu'
import './EditorHeader.css'

interface EditorHeaderProps {
  title: string
  body: string
  isFocusMode: boolean
  onCopy: () => void
  onToggleFocusMode: () => void
  onDelete: () => void
}

export function EditorHeader({
  title,
  body,
  isFocusMode,
  onCopy,
  onToggleFocusMode,
  onDelete,
}: EditorHeaderProps) {
  const navigate = useNavigate()

  function handleBack() {
    navigate(-1)
  }

  return (
    <header className="editor-header">
      <button
        onClick={handleBack}
        aria-label="戻る"
        className="editor-header__back-button"
      >
        <ChevronLeft size={18} />
      </button>
      <EditorMenu
        title={title}
        body={body}
        isFocusMode={isFocusMode}
        onCopy={onCopy}
        onToggleFocusMode={onToggleFocusMode}
        onDelete={onDelete}
      />
    </header>
  )
}
