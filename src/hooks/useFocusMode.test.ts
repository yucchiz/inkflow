import { act, renderHook } from '@testing-library/react';

// Mock requestAnimationFrame to execute callback synchronously
const rafMock = vi.fn((cb: FrameRequestCallback) => {
  cb(0);
  return 0;
});

vi.stubGlobal('requestAnimationFrame', rafMock);
vi.stubGlobal('cancelAnimationFrame', vi.fn());

import { useFocusMode } from '@/hooks/useFocusMode';

describe('useFocusMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期状態: isFocusMode=false, showControls=true であること', () => {
    // Arrange & Act
    const { result } = renderHook(() => useFocusMode());

    // Assert
    expect(result.current.isFocusMode).toBe(false);
    expect(result.current.showControls).toBe(true);
  });

  it('toggleFocusMode() で isFocusMode=true になること', () => {
    // Arrange
    const { result } = renderHook(() => useFocusMode());

    // Act
    act(() => {
      result.current.toggleFocusMode();
    });

    // Assert
    expect(result.current.isFocusMode).toBe(true);
  });

  it('集中モード中に Escape キーで集中モードが解除されること', () => {
    // Arrange
    const { result } = renderHook(() => useFocusMode());

    act(() => {
      result.current.toggleFocusMode();
    });
    expect(result.current.isFocusMode).toBe(true);

    // Act
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    // Assert
    expect(result.current.isFocusMode).toBe(false);
    expect(result.current.showControls).toBe(true);
  });

  it('集中モード中、マウスが上部 60px 以内で showControls=true になること', () => {
    // Arrange
    const { result } = renderHook(() => useFocusMode());

    act(() => {
      result.current.toggleFocusMode();
    });
    // Initially showControls is false in focus mode (after toggle)
    expect(result.current.showControls).toBe(false);

    // Act
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientY: 30 }));
    });

    // Assert
    expect(result.current.showControls).toBe(true);
  });

  it('集中モード中、マウスが 60px より下で showControls=false になること', () => {
    // Arrange
    const { result } = renderHook(() => useFocusMode());

    act(() => {
      result.current.toggleFocusMode();
    });

    // First move mouse to top area to set showControls=true
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientY: 30 }));
    });
    expect(result.current.showControls).toBe(true);

    // Act - move mouse below 60px
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientY: 100 }));
    });

    // Assert
    expect(result.current.showControls).toBe(false);
  });

  it('集中モードでないとき mousemove リスナーが登録されていないこと', () => {
    // Arrange
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    // Act
    renderHook(() => useFocusMode());

    // Assert - mousemove listener should NOT be registered
    const mousemoveCalls = addEventListenerSpy.mock.calls.filter(
      ([event]) => event === 'mousemove'
    );
    expect(mousemoveCalls).toHaveLength(0);

    addEventListenerSpy.mockRestore();
  });

  it('toggleFocusMode() 再呼び出しで集中モードが解除されること', () => {
    // Arrange
    const { result } = renderHook(() => useFocusMode());

    // Act - enable focus mode
    act(() => {
      result.current.toggleFocusMode();
    });
    expect(result.current.isFocusMode).toBe(true);

    // Act - disable focus mode
    act(() => {
      result.current.toggleFocusMode();
    });

    // Assert
    expect(result.current.isFocusMode).toBe(false);
    expect(result.current.showControls).toBe(true);
  });
});
