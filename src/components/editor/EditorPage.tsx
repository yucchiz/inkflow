import { useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEditor } from '@/hooks/useEditor'
import { useReduceMotion } from '@/hooks/useReduceMotion'
import { copyToClipboard, exportText } from '@/utils/exportHelper'
import { EditorHeader } from './EditorHeader'
import { TitleInput } from './TitleInput'
import { BodyTextArea } from './BodyTextArea'
import { StatusBar } from './StatusBar'
import './EditorPage.css'

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const reduceMotion = useReduceMotion()
  const bodyRef = useRef<HTMLTextAreaElement | null>(null)

  if (!id) {
    throw new Error('Document ID is required')
  }

  const {
    title,
    body,
    saveStatus,
    isFocusMode,
    showControls,
    isLoading,
    error,
    characterCount,
    updateTitle,
    updateBody,
    toggleFocusMode,
    exitFocusMode,
    deleteDocument,
    save,
  } = useEditor(id)

  // Focus body textarea after title Enter
  const handleTitleSubmit = useCallback(() => {
    bodyRef.current?.focus()
  }, [])

  // Copy handler
  const handleCopy = useCallback(() => {
    void copyToClipboard(exportText(title, body))
  }, [title, body])

  // Delete handler
  const handleDelete = useCallback(() => {
    void deleteDocument().then(() => {
      navigate(-1)
    })
  }, [deleteDocument, navigate])

  // Escape key exits focus mode
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isFocusMode) {
        exitFocusMode()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFocusMode, exitFocusMode])

  // Save on beforeunload
  useEffect(() => {
    function handleBeforeUnload() {
      void save()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [save])

  if (isLoading) {
    return (
      <div className="editor-page" aria-busy="true">
        <div className="editor-page__loading" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="editor-page">
        <p className="editor-page__error">
          ドキュメントの読み込みに失敗しました
        </p>
      </div>
    )
  }

  const transitionClass = reduceMotion ? 'editor-page--no-motion' : ''

  return (
    <div className={`editor-page ${transitionClass}`}>
      {/* Top tap area to restore controls in focus mode */}
      {isFocusMode && !showControls && (
        <button
          className="editor-page__top-tap-area"
          onClick={toggleFocusMode}
          aria-label="コントロールを表示"
        />
      )}

      <div className={`editor-page__header ${showControls ? 'editor-page__header--visible' : 'editor-page__header--hidden'}`}>
        <EditorHeader
          title={title}
          body={body}
          isFocusMode={isFocusMode}
          onCopy={handleCopy}
          onToggleFocusMode={toggleFocusMode}
          onDelete={handleDelete}
        />
      </div>

      <main className="editor-page__content">
        <div className="editor-page__content-inner">
          <TitleInput
            value={title}
            onChange={updateTitle}
            onSubmit={handleTitleSubmit}
          />
          <BodyTextArea
            value={body}
            onChange={updateBody}
            textareaRef={bodyRef}
          />
        </div>
      </main>

      <div className={`editor-page__status ${showControls ? 'editor-page__status--visible' : 'editor-page__status--hidden'}`}>
        <StatusBar characterCount={characterCount} saveStatus={saveStatus} />
      </div>
    </div>
  )
}
