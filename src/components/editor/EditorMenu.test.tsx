import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditorMenu from '@/components/editor/EditorMenu';
import ThemeProvider from '@/contexts/ThemeContext';
import ToastProvider from '@/contexts/ToastContext';
import Toast from '@/components/common/Toast';

vi.mock('@/lib/exportDocument', () => ({
  copyToClipboard: vi.fn().mockResolvedValue(true),
  downloadAsTxt: vi.fn(),
}));

import { copyToClipboard, downloadAsTxt } from '@/lib/exportDocument';
const mockCopyToClipboard = vi.mocked(copyToClipboard);
const mockDownloadAsTxt = vi.mocked(downloadAsTxt);

const localStorageMock = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

Object.defineProperty(window, 'matchMedia', {
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
});

function renderWithProviders(props: Partial<React.ComponentProps<typeof EditorMenu>> = {}) {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: 'テスト記事',
    body: 'テスト本文です。',
    onDelete: vi.fn(),
    onFocusMode: vi.fn(),
  };

  const mergedProps = { ...defaultProps, ...props };

  return {
    ...render(
      <ThemeProvider>
        <ToastProvider>
          <EditorMenu {...mergedProps} />
          <Toast />
        </ToastProvider>
      </ThemeProvider>
    ),
    props: mergedProps,
  };
}

describe('EditorMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('light');
    document.documentElement.classList.remove('dark');
  });

  it('開いている時 5つのメニュー項目が表示されること', () => {
    // Arrange & Act
    renderWithProviders();

    // Assert
    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(5);
  });

  it('コピー → クリップボードコピー + トースト「コピーしました」', async () => {
    // Arrange
    const user = userEvent.setup();
    const { props } = renderWithProviders();

    // Act
    await user.click(screen.getByRole('menuitem', { name: 'コピー' }));

    // Assert
    expect(mockCopyToClipboard).toHaveBeenCalledWith('テスト本文です。');
    await waitFor(() => {
      expect(screen.getByText('コピーしました')).toBeInTheDocument();
    });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('コピー失敗 → エラートースト「コピーに失敗しました」', async () => {
    // Arrange
    mockCopyToClipboard.mockResolvedValueOnce(false);
    const user = userEvent.setup();
    const { props } = renderWithProviders();

    // Act
    await user.click(screen.getByRole('menuitem', { name: 'コピー' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('コピーに失敗しました')).toBeInTheDocument();
    });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('ダウンロード → downloadAsTxt 呼び出し', async () => {
    // Arrange
    const user = userEvent.setup();
    const { props } = renderWithProviders();

    // Act
    await user.click(screen.getByRole('menuitem', { name: 'ダウンロード' }));

    // Assert
    expect(mockDownloadAsTxt).toHaveBeenCalledWith('テスト記事', 'テスト本文です。');
    expect(props.onClose).toHaveBeenCalled();
  });

  it('テーマ切替 → setTheme が呼ばれること', async () => {
    // Arrange
    localStorageMock.getItem.mockReturnValue('light');
    const user = userEvent.setup();
    renderWithProviders();

    // Act
    await user.click(screen.getByRole('menuitem', { name: 'テーマをダークに切替' }));

    // Assert
    expect(localStorageMock.setItem).toHaveBeenCalledWith('inkflow:theme', 'dark');
  });

  it('集中モード → onFocusMode 呼び出し', async () => {
    // Arrange
    const user = userEvent.setup();
    const { props } = renderWithProviders();

    // Act
    await user.click(screen.getByRole('menuitem', { name: '集中モード' }));

    // Assert
    expect(props.onFocusMode).toHaveBeenCalledTimes(1);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('削除 → onDelete 呼び出し', async () => {
    // Arrange
    const user = userEvent.setup();
    const { props } = renderWithProviders();

    // Act
    await user.click(screen.getByRole('menuitem', { name: 'テスト記事を削除' }));

    // Assert
    expect(props.onDelete).toHaveBeenCalledTimes(1);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('削除の aria-label にタイトルが含まれること', () => {
    // Arrange & Act
    renderWithProviders({ title: '私の日記' });

    // Assert
    expect(screen.getByRole('menuitem', { name: '私の日記を削除' })).toBeInTheDocument();
  });

  it('タイトル空 →「無題のドキュメントを削除」', () => {
    // Arrange & Act
    renderWithProviders({ title: '' });

    // Assert
    expect(screen.getByRole('menuitem', { name: '無題のドキュメントを削除' })).toBeInTheDocument();
  });
});
