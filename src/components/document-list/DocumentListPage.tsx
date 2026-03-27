import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../common/Header'
import { DocumentCard } from './DocumentCard'
import { EmptyState } from './EmptyState'
import { FABButton } from './FABButton'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { useDocumentList } from '@/hooks/useDocumentList'
import './DocumentListPage.css'

export function DocumentListPage() {
  const navigate = useNavigate()
  const { documents, isLoading, error, loadDocuments, createNewDocument, deleteDocument } = useDocumentList()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)

  const handleCreate = useCallback(async () => {
    try {
      const id = await createNewDocument()
      navigate(`/edit/${id}`)
    } catch (e) {
      console.error('[DocumentListPage] ドキュメント作成に失敗:', e)
    }
  }, [createNewDocument, navigate])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteDocument(deleteTarget.id)
    } catch (e) {
      console.error('[DocumentListPage] ドキュメント削除に失敗:', e)
    } finally {
      setDeleteTarget(null)
    }
  }, [deleteTarget, deleteDocument])

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  // Keyboard shortcut: Cmd+N / Ctrl+N
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        void handleCreate()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCreate])

  return (
    <div className="document-list-page">
      <Header />
      <main className="document-list-page__content">
        {isLoading && (
          <div className="document-list-page__loading" role="status" aria-live="polite">
            <p>読み込み中...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="document-list-page__error" role="alert">
            <p>データの読み込みに失敗しました</p>
            <button
              className="document-list-page__retry-button"
              onClick={() => void loadDocuments()}
            >
              再試行
            </button>
          </div>
        )}
        {!isLoading && !error && documents.length === 0 && (
          <EmptyState />
        )}
        {!isLoading && !error && documents.length > 0 && (
          <ul className="document-list-page__list" role="list">
            {documents.map(doc => (
              <li key={doc.id} role="listitem">
                <DocumentCard
                  document={doc}
                  onClick={() => navigate(`/edit/${doc.id}`)}
                  onDelete={() => setDeleteTarget({ id: doc.id, title: doc.title || '無題のドキュメント' })}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
      <FABButton onClick={() => void handleCreate()} />
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="ドキュメントを削除"
        message={`「${deleteTarget?.title ?? ''}」を削除しますか？この操作は取り消せません。`}
        confirmLabel="削除"
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}
