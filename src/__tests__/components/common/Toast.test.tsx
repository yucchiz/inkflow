/// <reference types="vitest/globals" />
import { render, screen, act } from '@testing-library/react'
import { ToastOverlay } from '@/components/common/Toast'
import { ToastProvider, useToast } from '@/contexts/ToastContext'

// Helper to trigger toast from inside provider
function ToastTrigger({ text }: { text: string }) {
  const { show, dismiss } = useToast()
  return (
    <>
      <button onClick={() => show(text)}>show</button>
      <button onClick={() => dismiss()}>dismiss</button>
    </>
  )
}

function renderWithToast(text = 'テスト通知') {
  return render(
    <ToastProvider>
      <ToastTrigger text={text} />
      <ToastOverlay />
    </ToastProvider>,
  )
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()

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

  afterEach(() => {
    vi.useRealTimers()
  })

  it('show() でトーストが表示されること', () => {
    renderWithToast()

    act(() => {
      screen.getByText('show').click()
    })

    expect(screen.getByRole('status')).toHaveTextContent('テスト通知')
  })

  it('role="status" と aria-live="polite" が設定されていること', () => {
    renderWithToast()

    act(() => {
      screen.getByText('show').click()
    })

    const toast = screen.getByRole('status')
    expect(toast).toHaveAttribute('aria-live', 'polite')
  })

  it('3秒後に自動で消えること', () => {
    renderWithToast()

    act(() => {
      screen.getByText('show').click()
    })

    expect(screen.getByRole('status')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('dismiss() で手動で消せること', () => {
    renderWithToast()

    act(() => {
      screen.getByText('show').click()
    })

    expect(screen.getByRole('status')).toBeInTheDocument()

    act(() => {
      screen.getByText('dismiss').click()
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('新しいトーストが前のトーストを置き換えること', () => {
    function MultiTrigger() {
      const { show } = useToast()
      return (
        <>
          <button onClick={() => show('最初')}>first</button>
          <button onClick={() => show('次')}>second</button>
        </>
      )
    }

    render(
      <ToastProvider>
        <MultiTrigger />
        <ToastOverlay />
      </ToastProvider>,
    )

    act(() => {
      screen.getByText('first').click()
    })

    expect(screen.getByRole('status')).toHaveTextContent('最初')

    act(() => {
      screen.getByText('second').click()
    })

    expect(screen.getByRole('status')).toHaveTextContent('次')
    // Only one toast visible
    expect(screen.getAllByRole('status')).toHaveLength(1)
  })
})
