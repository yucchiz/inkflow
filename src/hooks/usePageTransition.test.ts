import { act, renderHook } from '@testing-library/react';

const mockNavigate = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

import { usePageTransition } from '@/hooks/usePageTransition';

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('usePageTransition', () => {
  it('初期状態で isExiting が false であること', () => {
    const { result } = renderHook(() => usePageTransition());
    expect(result.current.isExiting).toBe(false);
  });

  it('navigateWithTransition 呼び出しで isExiting が true になること', () => {
    const { result } = renderHook(() => usePageTransition());

    act(() => {
      result.current.navigateWithTransition('/');
    });

    expect(result.current.isExiting).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('150ms 後に navigate が呼ばれること', () => {
    const { result } = renderHook(() => usePageTransition());

    act(() => {
      result.current.navigateWithTransition('/');
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('二重呼び出しを防止すること', () => {
    const { result } = renderHook(() => usePageTransition());

    act(() => {
      result.current.navigateWithTransition('/');
    });

    act(() => {
      result.current.navigateWithTransition('/other');
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('アンマウント時にタイマーがクリーンアップされること', () => {
    const { result, unmount } = renderHook(() => usePageTransition());

    act(() => {
      result.current.navigateWithTransition('/');
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('遷移先パスが正しく渡されること', () => {
    const { result } = renderHook(() => usePageTransition());

    act(() => {
      result.current.navigateWithTransition('/some/path');
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/some/path');
  });
});
