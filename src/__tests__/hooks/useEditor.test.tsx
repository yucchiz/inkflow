/// <reference types="vitest/globals" />
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useEditor } from '@/hooks/useEditor'
import { MockDocumentRepository } from '@/data/MockDocumentRepository'
import { RepositoryProvider } from '@/contexts/RepositoryContext'
import type { InkDocument } from '@/models/InkDocument'

const TEST_DOC: InkDocument = {
  id: 'test-id-1',
  title: 'テストタイトル',
  body: 'テスト本文です',
  createdAt: 1000000,
  updatedAt: 2000000,
}

function createWrapper(repo: MockDocumentRepository) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <RepositoryProvider repository={repo}>{children}</RepositoryProvider>
  }
}

describe('useEditor', () => {
  let repo: MockDocumentRepository

  beforeEach(() => {
    vi.useFakeTimers()
    repo = new MockDocumentRepository()
    repo.documents = [{ ...TEST_DOC }]
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('loadDocument でタイトルと本文が設定され、isLoading が false になること', async () => {
    const { result } = renderHook(() => useEditor('test-id-1'), {
      wrapper: createWrapper(repo),
    })

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait for async loadDocument
    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.title).toBe('テストタイトル')
    expect(result.current.body).toBe('テスト本文です')
  })

  it('save() で saveStatus が idle → saving → saved → idle と遷移すること', async () => {
    const { result } = renderHook(() => useEditor('test-id-1'), {
      wrapper: createWrapper(repo),
    })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.saveStatus).toBe('idle')

    // Call save
    await act(async () => {
      await result.current.save()
    })

    expect(result.current.saveStatus).toBe('saved')

    // After SAVED_STATUS_DURATION_MS (2000ms), status goes back to idle
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.saveStatus).toBe('idle')
  })

  it('タイトル変更後 500ms で自動保存されること', async () => {
    const { result } = renderHook(() => useEditor('test-id-1'), {
      wrapper: createWrapper(repo),
    })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Reset count after load (unmount cleanup might have triggered)
    repo.saveCallCount = 0

    // Update title
    act(() => {
      result.current.updateTitle('新しいタイトル')
    })

    // Before debounce fires
    expect(repo.saveCallCount).toBe(0)

    // Advance past debounce
    await act(async () => {
      vi.advanceTimersByTime(500)
      await vi.runAllTimersAsync()
    })

    expect(repo.saveCallCount).toBe(1)
  })

  it('連続変更でデバウンスされ、保存が1回だけ呼ばれること', async () => {
    const { result } = renderHook(() => useEditor('test-id-1'), {
      wrapper: createWrapper(repo),
    })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    repo.saveCallCount = 0

    // Rapid changes
    act(() => {
      result.current.updateTitle('変更1')
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    act(() => {
      result.current.updateTitle('変更2')
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    act(() => {
      result.current.updateTitle('変更3')
    })

    // Advance past debounce from last change
    await act(async () => {
      vi.advanceTimersByTime(500)
      await vi.runAllTimersAsync()
    })

    expect(repo.saveCallCount).toBe(1)
  })

  it('loadDocument 中は自動保存が発火しないこと', async () => {
    const { result } = renderHook(() => useEditor('test-id-1'), {
      wrapper: createWrapper(repo),
    })

    // During loading, saveCallCount should remain 0
    expect(result.current.isLoading).toBe(true)
    expect(repo.saveCallCount).toBe(0)

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // After load completes, no save should have been triggered by load itself
    expect(repo.saveCallCount).toBe(0)
  })

  it('アンマウント時に空ドキュメントが削除されること', async () => {
    const emptyDoc: InkDocument = {
      id: 'empty-id',
      title: '',
      body: '',
      createdAt: 1000000,
      updatedAt: 2000000,
    }
    repo.documents = [emptyDoc]

    const { unmount } = renderHook(() => useEditor('empty-id'), {
      wrapper: createWrapper(repo),
    })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Unmount the hook
    unmount()

    expect(repo.removeCallCount).toBe(1)
    expect(repo.lastRemovedId).toBe('empty-id')
  })

  it('アンマウント時に内容のあるドキュメントがフラッシュ保存されること', async () => {
    const { result, unmount } = renderHook(() => useEditor('test-id-1'), {
      wrapper: createWrapper(repo),
    })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    repo.saveCallCount = 0

    // Change content without waiting for debounce
    act(() => {
      result.current.updateBody('変更された本文')
    })

    // Unmount before debounce fires
    unmount()

    // Should flush save
    expect(repo.saveCallCount).toBeGreaterThanOrEqual(1)
  })

  it('toggleFocusMode で isFocusMode と showControls が切り替わること', async () => {
    const { result } = renderHook(() => useEditor('test-id-1'), {
      wrapper: createWrapper(repo),
    })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.isFocusMode).toBe(false)
    expect(result.current.showControls).toBe(true)

    act(() => {
      result.current.toggleFocusMode()
    })

    expect(result.current.isFocusMode).toBe(true)
    expect(result.current.showControls).toBe(false)

    act(() => {
      result.current.toggleFocusMode()
    })

    expect(result.current.isFocusMode).toBe(false)
    expect(result.current.showControls).toBe(true)
  })

  it('exitFocusMode で isFocusMode=false, showControls=true になること', async () => {
    const { result } = renderHook(() => useEditor('test-id-1'), {
      wrapper: createWrapper(repo),
    })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // Enter focus mode first
    act(() => {
      result.current.toggleFocusMode()
    })

    expect(result.current.isFocusMode).toBe(true)
    expect(result.current.showControls).toBe(false)

    act(() => {
      result.current.exitFocusMode()
    })

    expect(result.current.isFocusMode).toBe(false)
    expect(result.current.showControls).toBe(true)
  })

  it('characterCount が body.length と一致すること', async () => {
    const { result } = renderHook(() => useEditor('test-id-1'), {
      wrapper: createWrapper(repo),
    })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.characterCount).toBe('テスト本文です'.length)

    act(() => {
      result.current.updateBody('新しい本文')
    })

    expect(result.current.characterCount).toBe('新しい本文'.length)
  })

  it('deleteDocument で repository.remove が呼ばれること', async () => {
    const { result } = renderHook(() => useEditor('test-id-1'), {
      wrapper: createWrapper(repo),
    })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    await act(async () => {
      await result.current.deleteDocument()
    })

    expect(repo.removeCallCount).toBeGreaterThanOrEqual(1)
    expect(repo.lastRemovedId).toBe('test-id-1')
  })
})
