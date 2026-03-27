import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { RepositoryProvider } from '@/contexts/RepositoryContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { MockDocumentRepository } from '@/data/MockDocumentRepository'
import { DocumentListPage } from '@/components/document-list/DocumentListPage'
import type { InkDocument } from '@/models/InkDocument'

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

function createTestDocument(overrides: Partial<InkDocument> = {}): InkDocument {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title: 'テストドキュメント',
    body: 'テスト本文テキスト',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function createWrapper(repository: MockDocumentRepository) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter>
        <ThemeProvider>
          <RepositoryProvider repository={repository}>
            {children}
          </RepositoryProvider>
        </ThemeProvider>
      </MemoryRouter>
    )
  }
}

describe('DocumentListPage', () => {
  let repository: MockDocumentRepository

  beforeEach(() => {
    repository = new MockDocumentRepository()
  })

  it('読み込み中の状態が表示されること', () => {
    render(<DocumentListPage />, { wrapper: createWrapper(repository) })
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('ドキュメントがない場合に空状態が表示されること', async () => {
    render(<DocumentListPage />, { wrapper: createWrapper(repository) })

    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('まだドキュメントがありません')).toBeInTheDocument()
    expect(screen.getByText('+ボタンで書き始めましょう')).toBeInTheDocument()
  })

  it('ドキュメントカードが表示されること', async () => {
    const doc = createTestDocument({ title: '私のドキュメント', body: '本文の内容' })
    repository.documents = [doc]

    render(<DocumentListPage />, { wrapper: createWrapper(repository) })

    await waitFor(() => {
      expect(screen.getByText('私のドキュメント')).toBeInTheDocument()
    })

    expect(screen.getByText('本文の内容')).toBeInTheDocument()
  })

  it('タイトルが空の場合に「無題のドキュメント」と表示されること', async () => {
    const doc = createTestDocument({ title: '', body: 'some body' })
    repository.documents = [doc]

    render(<DocumentListPage />, { wrapper: createWrapper(repository) })

    await waitFor(() => {
      expect(screen.getByText('無題のドキュメント')).toBeInTheDocument()
    })
  })

  it('エラー時にエラーメッセージと再試行ボタンが表示されること', async () => {
    repository.shouldThrowOnGetAll = true

    render(<DocumentListPage />, { wrapper: createWrapper(repository) })

    await waitFor(() => {
      expect(screen.getByText('データの読み込みに失敗しました')).toBeInTheDocument()
    })

    expect(screen.getByText('再試行')).toBeInTheDocument()
  })

  it('再試行ボタンクリックでリロードされること', async () => {
    const user = userEvent.setup()
    repository.shouldThrowOnGetAll = true

    render(<DocumentListPage />, { wrapper: createWrapper(repository) })

    await waitFor(() => {
      expect(screen.getByText('再試行')).toBeInTheDocument()
    })

    // Fix the error and retry
    repository.shouldThrowOnGetAll = false
    const doc = createTestDocument({ title: 'リカバリ' })
    repository.documents = [doc]

    await user.click(screen.getByText('再試行'))

    await waitFor(() => {
      expect(screen.getByText('リカバリ')).toBeInTheDocument()
    })
  })

  it('FABボタンが表示され aria-label が正しいこと', async () => {
    render(<DocumentListPage />, { wrapper: createWrapper(repository) })

    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
    })

    const fab = screen.getByLabelText('新規ドキュメントを作成')
    expect(fab).toBeInTheDocument()
  })

  it('ヘッダーに InkFlow のタイトルが表示されること', () => {
    render(<DocumentListPage />, { wrapper: createWrapper(repository) })
    expect(screen.getByText('InkFlow')).toBeInTheDocument()
  })
})
