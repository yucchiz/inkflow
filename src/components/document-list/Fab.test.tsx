import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DocumentProvider from '@/contexts/DocumentContext';

import Fab from '@/components/document-list/Fab';

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/lib/db', () => ({
  documentRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

function renderFab() {
  return render(
    <DocumentProvider>
      <Fab />
    </DocumentProvider>
  );
}

describe('Fab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('FAB ボタンがレンダリングされること', () => {
    // Arrange & Act
    renderFab();

    // Assert
    expect(screen.getByRole('button', { name: '新規ドキュメント作成' })).toBeInTheDocument();
  });

  it('aria-label が設定されていること', () => {
    // Arrange & Act
    renderFab();

    // Assert
    const button = screen.getByRole('button', { name: '新規ドキュメント作成' });
    expect(button).toHaveAttribute('aria-label', '新規ドキュメント作成');
  });

  it('クリック後にfab-tapアニメーションクラスが適用されること', async () => {
    // Arrange
    const user = userEvent.setup();
    renderFab();

    // Act
    await user.click(screen.getByRole('button', { name: '新規ドキュメント作成' }));

    // Assert
    await waitFor(() => {
      const button = screen.getByRole('button', { name: '新規ドキュメント作成' });
      expect(button.className).toContain('fab-tap');
    });
  });

  it('animationend後にアニメーションクラスが除去されること', async () => {
    // Arrange
    const user = userEvent.setup();
    renderFab();
    const button = screen.getByRole('button', { name: '新規ドキュメント作成' });

    // Act
    await user.click(button);
    await waitFor(() => {
      expect(button.className).toContain('fab-tap');
    });
    act(() => {
      button.dispatchEvent(new Event('animationend', { bubbles: true }));
    });

    // Assert
    expect(button.className).not.toContain('fab-tap');
  });

  it('クリックで navigate が /doc/ で始まるパスで呼ばれること', async () => {
    // Arrange
    const user = userEvent.setup();
    renderFab();

    // Act
    await user.click(screen.getByRole('button', { name: '新規ドキュメント作成' }));

    // Assert
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      const navigatedPath = mockNavigate.mock.calls[0][0] as string;
      expect(navigatedPath).toMatch(/^\/doc\/.+$/);
    });
  });
});
