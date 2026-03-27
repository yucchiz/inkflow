/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggleButton } from '@/components/common/ThemeToggleButton'
import { ThemeProvider } from '@/contexts/ThemeContext'

function renderButton() {
  return render(
    <ThemeProvider>
      <ThemeToggleButton />
    </ThemeProvider>,
  )
}

describe('ThemeToggleButton', () => {
  let store: Record<string, string>

  beforeEach(() => {
    store = {}
    delete document.documentElement.dataset.theme

    const mockLocalStorage = {
      getItem: vi.fn((key: string): string | null => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value }),
      removeItem: vi.fn((key: string) => { delete store[key] }),
      clear: vi.fn(() => { store = {} }),
      get length() { return Object.keys(store).length },
      key: vi.fn((index: number): string | null => Object.keys(store)[index] ?? null),
    }
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: mockLocalStorage,
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

  it('初期状態で system テーマの aria-label が設定されていること', () => {
    renderButton()

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'システムテーマ。タップでライトテーマに切替')
  })

  it('クリックでテーマが切り替わり aria-label が更新されること', async () => {
    const user = userEvent.setup()
    renderButton()

    const button = screen.getByRole('button')

    await user.click(button)
    expect(button).toHaveAttribute('aria-label', 'ライトテーマ。タップでダークテーマに切替')

    await user.click(button)
    expect(button).toHaveAttribute('aria-label', 'ダークテーマ。タップでシステムテーマに切替')

    await user.click(button)
    expect(button).toHaveAttribute('aria-label', 'システムテーマ。タップでライトテーマに切替')
  })
})
