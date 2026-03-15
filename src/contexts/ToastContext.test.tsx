import { act, fireEvent, render, screen } from '@testing-library/react';

import ToastProvider from '@/contexts/ToastContext';
import { useToast } from '@/hooks/useToast';

import type { ToastContextValue } from '@/contexts/ToastContext';

function TestComponent({ onRender }: { onRender?: (ctx: ToastContextValue) => void }) {
  const ctx = useToast();
  onRender?.(ctx);
  return <button onClick={() => ctx.showToast('テストメッセージ')}>show</button>;
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('初期状態', () => {
    it('初期状態ではmessageがnullでvisibleがfalseであること', () => {
      // Arrange
      let state: ToastContextValue['state'] | undefined;

      // Act
      render(
        <ToastProvider>
          <TestComponent
            onRender={(ctx) => {
              state = ctx.state;
            }}
          />
        </ToastProvider>
      );

      // Assert
      expect(state?.message).toBeNull();
      expect(state?.visible).toBe(false);
    });
  });

  describe('showToast', () => {
    it('showToastを呼ぶとメッセージがセットされvisibleがtrueになること', () => {
      // Arrange
      let state: ToastContextValue['state'] | undefined;

      render(
        <ToastProvider>
          <TestComponent
            onRender={(ctx) => {
              state = ctx.state;
            }}
          />
        </ToastProvider>
      );

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'show' }));

      // Assert
      expect(state?.message).toBe('テストメッセージ');
      expect(state?.visible).toBe(true);
    });

    it('3秒後にvisibleがfalseになること', () => {
      // Arrange
      let state: ToastContextValue['state'] | undefined;

      render(
        <ToastProvider>
          <TestComponent
            onRender={(ctx) => {
              state = ctx.state;
            }}
          />
        </ToastProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'show' }));
      expect(state?.visible).toBe(true);

      // Act
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Assert
      expect(state?.visible).toBe(false);
      expect(state?.message).toBe('テストメッセージ');
    });

    it('フェードアウト完了後（3秒+200ms）にmessageがnullになること', () => {
      // Arrange
      let state: ToastContextValue['state'] | undefined;

      render(
        <ToastProvider>
          <TestComponent
            onRender={(ctx) => {
              state = ctx.state;
            }}
          />
        </ToastProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'show' }));

      // Act
      act(() => {
        vi.advanceTimersByTime(3200);
      });

      // Assert
      expect(state?.message).toBeNull();
      expect(state?.visible).toBe(false);
    });

    it('連続呼び出し時は前のタイマーをクリアして新しいメッセージで上書きすること', () => {
      // Arrange
      let ctx: ToastContextValue | undefined;

      render(
        <ToastProvider>
          <TestComponent
            onRender={(c) => {
              ctx = c;
            }}
          />
        </ToastProvider>
      );

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'show' }));

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // 2回目の呼び出しをアクション関数経由で実行
      act(() => {
        ctx!.showToast('メッセージ2');
      });

      // Assert
      expect(ctx?.state.message).toBe('メッセージ2');
      expect(ctx?.state.visible).toBe(true);

      // 最初のshowToastから3秒経過しても、2回目のタイマーはまだ残っている
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(ctx?.state.visible).toBe(true);

      // 2回目のshowToastから3秒経過でvisibleがfalseになる
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(ctx?.state.visible).toBe(false);
    });
  });
});

describe('useToast', () => {
  it('Provider外で使用するとエラーになること', () => {
    // Arrange
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function Bare() {
      useToast();
      return null;
    }

    // Act & Assert
    expect(() => render(<Bare />)).toThrow('useToast must be used within a ToastProvider');

    spy.mockRestore();
  });
});
