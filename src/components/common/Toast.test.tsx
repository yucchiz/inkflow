import { act, fireEvent, render, screen } from '@testing-library/react';

import Toast from '@/components/common/Toast';
import ToastProvider from '@/contexts/ToastContext';
import { useToast } from '@/hooks/useToast';

function ToastTrigger({ message = 'テスト通知' }: { message?: string }) {
  const { showToast } = useToast();
  return <button onClick={() => showToast(message)}>show</button>;
}

function renderWithProvider(message?: string) {
  return render(
    <ToastProvider>
      <ToastTrigger message={message} />
      <Toast />
    </ToastProvider>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('表示', () => {
    it('初期状態ではトーストが表示されないこと', () => {
      // Arrange & Act
      renderWithProvider();

      // Assert
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('showToast後にメッセージが表示されること', () => {
      // Arrange
      renderWithProvider('コピーしました');

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'show' }));

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('コピーしました')).toBeInTheDocument();
    });

    it('3秒+200ms後にトーストが非表示になること', () => {
      // Arrange
      renderWithProvider();

      fireEvent.click(screen.getByRole('button', { name: 'show' }));
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Act
      act(() => {
        vi.advanceTimersByTime(3200);
      });

      // Assert
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('role="status"とaria-live="polite"を持つこと', () => {
      // Arrange
      renderWithProvider();

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'show' }));

      // Assert
      const toast = screen.getByRole('status');
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('アニメーション', () => {
    it('visible=trueのとき表示アニメーション用のクラスが適用されること', () => {
      // Arrange
      renderWithProvider();

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'show' }));

      // Assert
      const toast = screen.getByRole('status');
      expect(toast).toHaveClass('translate-y-0', 'opacity-100');
    });

    it('visible=falseのとき消滅アニメーション用のクラスが適用されること', () => {
      // Arrange
      renderWithProvider();

      fireEvent.click(screen.getByRole('button', { name: 'show' }));

      // Act
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Assert
      const toast = screen.getByRole('status');
      expect(toast).toHaveClass('translate-y-4', 'opacity-0');
    });
  });
});
