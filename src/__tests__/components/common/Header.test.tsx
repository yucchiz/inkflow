/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/common/Header'
import { ThemeProvider } from '@/contexts/ThemeContext'

function renderHeader() {
  return render(
    <ThemeProvider>
      <Header />
    </ThemeProvider>,
  )
}

describe('Header', () => {
  beforeEach(() => {
    const store: Record<string, string> = {}
    delete document.documentElement.dataset.theme

    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: {
        getItem: vi.fn((key: string): string | null => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        get length() { return 0 },
        key: vi.fn((): string | null => null),
      },
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('「InkFlow」タイトルが表示されること', () => {
    renderHeader()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('InkFlow')
  })

  it('banner ロールの header 要素であること', () => {
    renderHeader()

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('テーマ切替ボタンが含まれていること', () => {
    renderHeader()

    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
