import { useState, useEffect, useCallback } from 'react'
import type { InkDocument } from '../models/InkDocument'
import { createDocument } from '../data/DocumentFactory'
import { useRepository } from '../contexts/RepositoryContext'

export function useDocumentList() {
  const repository = useRepository()
  const [documents, setDocuments] = useState<InkDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadDocuments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const docs = await repository.getAll()
      setDocuments(docs)
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Unknown error')
      console.error('[useDocumentList] ドキュメント一覧の取得に失敗:', err)
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [repository])

  const createNewDocument = useCallback(async (): Promise<string> => {
    const doc = createDocument()
    await repository.save(doc)
    setDocuments(prev => [doc, ...prev])
    return doc.id
  }, [repository])

  const deleteDocument = useCallback(async (id: string) => {
    try {
      await repository.remove(id)
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch (e) {
      console.error('[useDocumentList] ドキュメントの削除に失敗:', id, e)
      throw e
    }
  }, [repository])

  useEffect(() => {
    void loadDocuments()
  }, [loadDocuments])

  return { documents, isLoading, error, loadDocuments, createNewDocument, deleteDocument }
}
