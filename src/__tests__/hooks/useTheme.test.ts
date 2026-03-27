/// <reference types="vitest/globals" />
import { renderHook, act } from '@testing-library/react'
import { useThemeManager } from '@/hooks/useTheme'
import type { ThemeMode } from '@/hooks/useTheme'

describe('useThemeManager', () => {
  let matchMediaListeners: Map<string, (e: MediaQueryListEvent) => void>
  let store: Record<string, string>

  beforeEach(() => {
    store = {}
    delete document.documentElement.dataset.theme
    matchMediaListeners = new Map()

    // Mock localStorage
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
        addEventListener: vi.fn((_event: string, handler: (e: MediaQueryListEvent) => void) => {
          matchMediaListeners.set(query, handler)
        }),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('localStorage が空のとき、デフォルトテーマは system であること', () => {
    const { result } = renderHook(() => useThemeManager())
    expect(result.current.themeMode).toBe('system')
  })

  it('cycle() で light → dark → system → light と切り替わること', () => {
    store['inkflow:theme'] = 'light'
    const { result } = renderHook(() => useThemeManager())

    expect(result.current.themeMode).toBe('light')

    act(() => result.current.cycle())
    expect(result.current.themeMode).toBe('dark')

    act(() => result.current.cycle())
    expect(result.current.themeMode).toBe('system')

    act(() => result.current.cycle())
    expect(result.current.themeMode).toBe('light')
  })

  it('cycle() のたびに localStorage が更新されること', () => {
    const { result } = renderHook(() => useThemeManager())

    act(() => result.current.cycle())
    expect(store['inkflow:theme']).toBe('light')

    act(() => result.current.cycle())
    expect(store['inkflow:theme']).toBe('dark')

    act(() => result.current.cycle())
    expect(store['inkflow:theme']).toBe('system')
  })

  it('各モードに対応する currentIcon が返されること', () => {
    store['inkflow:theme'] = 'light'
    const { result } = renderHook(() => useThemeManager())

    expect(result.current.currentIcon).toBe('sun')

    act(() => result.current.cycle())
    expect(result.current.currentIcon).toBe('moon')

    act(() => result.current.cycle())
    expect(result.current.currentIcon).toBe('monitor')
  })

  it('resolvedTheme が light または dark を返すこと', () => {
    const { result } = renderHook(() => useThemeManager())

    // system mode with matchMedia returning false (light)
    expect(result.current.resolvedTheme).toBe('light')

    // Switch to dark
    act(() => result.current.cycle()) // system -> light
    act(() => result.current.cycle()) // light -> dark
    expect(result.current.resolvedTheme).toBe('dark')
  })

  it('document.documentElement.dataset.theme が正しく設定されること', () => {
    store['inkflow:theme'] = 'light'
    renderHook(() => useThemeManager())

    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('localStorage に保存されたテーマが初期値として使われること', () => {
    store['inkflow:theme'] = 'dark'
    const { result } = renderHook(() => useThemeManager())

    expect(result.current.themeMode).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('system モードで OS のダークモード変更に追従すること', () => {
    const { result } = renderHook(() => useThemeManager())
    expect(result.current.themeMode).toBe('system')
    expect(result.current.resolvedTheme).toBe('light')

    // Simulate OS switching to dark mode
    const darkListener = matchMediaListeners.get('(prefers-color-scheme: dark)')
    if (darkListener) {
      act(() => {
        darkListener({ matches: true } as MediaQueryListEvent)
      })
    }

    expect(result.current.resolvedTheme).toBe('dark')
  })

  it('不正な localStorage の値は system にフォールバックすること', () => {
    store['inkflow:theme'] = 'invalid-value'
    const { result } = renderHook(() => useThemeManager())

    expect(result.current.themeMode).toBe('system')
  })

  it('各 ThemeMode の型が正しいこと', () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    expect(modes).toHaveLength(3)
  })
})
