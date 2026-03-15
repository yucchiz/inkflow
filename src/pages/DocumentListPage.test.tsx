import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

import DocumentProvider from '@/contexts/DocumentContext';
import ThemeProvider from '@/contexts/ThemeContext';
import ToastProvider from '@/contexts/ToastContext';
import DocumentListPage from '@/pages/DocumentListPage';

import type { Location } from 'react-router';

vi.mock('@/lib/db', () => ({
  documentRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

import { documentRepository } from '@/lib/db';

const showModalMock = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute('open', '');
});
const closeMock = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute('open');
});

beforeEach(() => {
  vi.clearAllMocks();
  showModalMock.mockClear();
  closeMock.mockClear();
  HTMLDialogElement.prototype.showModal = showModalMock;
  HTMLDialogElement.prototype.close = closeMock;

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn().mockReturnValue('light'),
      setItem: vi.fn(),
    },
    writable: true,
  });
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
    writable: true,
  });
});

function renderPage(locationKey?: string) {
  const initialEntries: Partial<Location>[] = [{ pathname: '/', key: locationKey ?? 'default' }];

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <DocumentProvider>
        <ThemeProvider>
          <ToastProvider>
            <DocumentListPage />
          </ToastProvider>
        </ThemeProvider>
      </DocumentProvider>
    </MemoryRouter>
  );
}

const testDoc = {
  id: 'test-1',
  title: 'テストドキュメント',
  body: 'テスト本文',
  createdAt: '2026-03-15T10:00:00.000Z',
  updatedAt: '2026-03-15T10:00:00.000Z',
};

function mockGetAllWith(docs: (typeof testDoc)[]) {
  vi.mocked(documentRepository.getAll).mockResolvedValue(docs);
}

describe('DocumentListPage', () => {
  it('ヘッダーに「InkFlow」が表示されること', async () => {
    // Arrange & Act
    renderPage();

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'InkFlow' })).toBeInTheDocument();
    });
  });

  it('ドキュメント0件のとき空状態が表示されること', async () => {
    // Arrange
    mockGetAllWith([]);

    // Act
    renderPage();

    // Assert
    await waitFor(() => {
      expect(screen.getByText('まだドキュメントがありません')).toBeInTheDocument();
    });
  });

  it('ドキュメントがあるときカードが表示されること', async () => {
    // Arrange
    mockGetAllWith([testDoc]);

    // Act
    renderPage();

    // Assert
    await waitFor(() => {
      expect(screen.getByText('テストドキュメント')).toBeInTheDocument();
    });
  });

  it('FABが表示されること', async () => {
    // Arrange & Act
    renderPage();

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '新規ドキュメント作成' })).toBeInTheDocument();
    });
  });

  it('main要素にpage-inアニメーションクラスが含まれること', async () => {
    // Arrange & Act
    renderPage();

    // Assert
    const main = await screen.findByRole('main');
    expect(main.className).toContain('page-in');
  });

  it('エディタから戻った場合にmainにフォーカスが当たること', async () => {
    // Arrange & Act
    renderPage('from-editor');

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('main')).toHaveFocus();
    });
  });

  it('初回ロード時にmainにフォーカスが当たらないこと', async () => {
    // Arrange & Act
    renderPage();

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('main')).not.toHaveFocus();
    });
  });

  describe('削除フロー', () => {
    const deleteDoc = { ...testDoc, title: '削除対象ドキュメント', body: '本文' };

    it('削除ボタンクリックで確認ダイアログが表示されること', async () => {
      // Arrange
      mockGetAllWith([deleteDoc]);
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('削除対象ドキュメント')).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /を削除$/ }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('このドキュメントを削除しますか？')).toBeInTheDocument();
      });
    });

    it('確認ダイアログでキャンセルするとダイアログが閉じること', async () => {
      // Arrange
      vi.useFakeTimers({ shouldAdvanceTime: true });
      mockGetAllWith([deleteDoc]);
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('削除対象ドキュメント')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /を削除$/ }));

      await waitFor(() => {
        expect(screen.getByText('このドキュメントを削除しますか？')).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: 'キャンセル' }));
      vi.advanceTimersByTime(150);

      // Assert
      expect(closeMock).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('確認ダイアログで削除を確定するとドキュメントが削除されること', async () => {
      // Arrange
      mockGetAllWith([deleteDoc]);
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('削除対象ドキュメント')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /を削除$/ }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      const dialog = screen.getByRole('dialog');
      const confirmButton = within(dialog).getByRole('button', { name: '削除' });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(documentRepository.remove).toHaveBeenCalledWith('test-1');
      });
      await waitFor(() => {
        expect(screen.queryByText('削除対象ドキュメント')).not.toBeInTheDocument();
      });
    });
  });
});
