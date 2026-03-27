import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { RepositoryProvider } from '@/contexts/RepositoryContext'
import { MockDocumentRepository } from '@/data/MockDocumentRepository'
import { useDocumentList } from '@/hooks/useDocumentList'
import type { InkDocument } from '@/models/InkDocument'

function createTestDocument(overrides: Partial<InkDocument> = {}): InkDocument {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title: 'テスト',
    body: 'テスト本文',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function createWrapper(repository: MockDocumentRepository) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <RepositoryProvider repository={repository}>
        {children}
      </RepositoryProvider>
    )
  }
}

describe('useDocumentList', () => {
  let repository: MockDocumentRepository

  beforeEach(() => {
    repository = new MockDocumentRepository()
  })

  it('初期状態で isLoading が true、documents が空であること', () => {
    const { result } = renderHook(() => useDocumentList(), {
      wrapper: createWrapper(repository),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.documents).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('loadDocuments でドキュメント一覧を取得し isLoading が false になること', async () => {
    const doc1 = createTestDocument({ title: 'Doc 1', updatedAt: 2000 })
    const doc2 = createTestDocument({ title: 'Doc 2', updatedAt: 1000 })
    repository.documents = [doc1, doc2]

    const { result } = renderHook(() => useDocumentList(), {
      wrapper: createWrapper(repository),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.documents).toHaveLength(2)
    // MockDocumentRepository sorts by updatedAt descending
    expect(result.current.documents[0]?.title).toBe('Doc 1')
    expect(result.current.documents[1]?.title).toBe('Doc 2')
    expect(result.current.error).toBeNull()
  })

  it('createNewDocument でドキュメントが追加され ID が返ること', async () => {
    const { result } = renderHook(() => useDocumentList(), {
      wrapper: createWrapper(repository),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let newId: string | undefined
    await act(async () => {
      newId = await result.current.createNewDocument()
    })

    expect(newId).toBeDefined()
    expect(result.current.documents).toHaveLength(1)
    expect(result.current.documents[0]?.id).toBe(newId)
    expect(repository.saveCallCount).toBe(1)
  })

  it('deleteDocument でドキュメントが一覧から削除されること', async () => {
    const doc = createTestDocument({ title: 'To Delete' })
    repository.documents = [doc]

    const { result } = renderHook(() => useDocumentList(), {
      wrapper: createWrapper(repository),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.documents).toHaveLength(1)

    await act(async () => {
      await result.current.deleteDocument(doc.id)
    })

    expect(result.current.documents).toHaveLength(0)
    expect(repository.removeCallCount).toBe(1)
    expect(repository.lastRemovedId).toBe(doc.id)
  })

  it('getAll でエラーが発生した場合 error が設定されること', async () => {
    repository.shouldThrowOnGetAll = true

    const { result } = renderHook(() => useDocumentList(), {
      wrapper: createWrapper(repository),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('getAll failed')
    expect(result.current.documents).toEqual([])
  })

  it('エラー後に loadDocuments を再実行するとリカバリできること', async () => {
    repository.shouldThrowOnGetAll = true

    const { result } = renderHook(() => useDocumentList(), {
      wrapper: createWrapper(repository),
    })

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })

    // Recover
    repository.shouldThrowOnGetAll = false
    const doc = createTestDocument({ title: 'Recovered' })
    repository.documents = [doc]

    await act(async () => {
      await result.current.loadDocuments()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.documents).toHaveLength(1)
    expect(result.current.documents[0]?.title).toBe('Recovered')
  })
})
