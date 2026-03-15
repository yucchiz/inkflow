import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';

import DocumentProvider from '@/contexts/DocumentContext';
import ThemeProvider from '@/contexts/ThemeContext';
import ToastProvider from '@/contexts/ToastContext';
import EditorPage from '@/pages/EditorPage';

import type { Document } from '@/types/document';

const testDoc: Document = {
  id: 'test-id-123',
  title: 'テストタイトル',
  body: 'テスト本文',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const emptyDoc: Document = {
  id: 'empty-id-456',
  title: '',
  body: '',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/lib/exportDocument', () => ({
  copyToClipboard: vi.fn().mockResolvedValue(true),
  downloadAsTxt: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  documentRepository: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

import { documentRepository } from '@/lib/db';
const mockRepo = vi.mocked(documentRepository);

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

function renderEditorPage(doc: Document) {
  mockRepo.getAll.mockResolvedValue([doc]);

  return render(
    <MemoryRouter initialEntries={[`/doc/${doc.id}`]}>
      <DocumentProvider>
        <ThemeProvider>
          <ToastProvider>
            <Routes>
              <Route path="/doc/:id" element={<EditorPage />} />
            </Routes>
          </ToastProvider>
        </ThemeProvider>
      </DocumentProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.clearAllMocks();
  mockRepo.getAll.mockResolvedValue([]);
  mockRepo.save.mockResolvedValue(undefined);
  mockRepo.remove.mockResolvedValue(undefined);

  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('EditorPage', () => {
  it('ドキュメントが読み込まれるとエディタUIが表示されること', async () => {
    renderEditorPage(testDoc);

    expect(await screen.findByRole('textbox', { name: 'タイトル' })).toHaveValue('テストタイトル');
    expect(screen.getByRole('textbox', { name: '本文' })).toHaveValue('テスト本文');
    expect(screen.getByText('5 文字')).toBeInTheDocument();
  });

  it('main要素にpage-inアニメーションクラスが含まれること', async () => {
    renderEditorPage(testDoc);

    const main = await screen.findByRole('main');
    expect(main.className).toContain('page-in');
  });

  it('戻るボタンが表示されること', async () => {
    renderEditorPage(testDoc);

    expect(await screen.findByRole('button', { name: '一覧に戻る' })).toBeInTheDocument();
  });

  it('メニューボタンが表示されること', async () => {
    renderEditorPage(testDoc);

    expect(await screen.findByRole('button', { name: 'メニュー' })).toBeInTheDocument();
  });

  it('戻るボタンクリックでフェードアウト後に一覧に遷移すること', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderEditorPage(testDoc);

    const backButton = await screen.findByRole('button', { name: '一覧に戻る' });
    await user.click(backButton);

    // 150ms のフェードアウト後に navigate が呼ばれること
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('空ドキュメントで戻ると自動削除されること', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderEditorPage(emptyDoc);

    const backButton = await screen.findByRole('button', { name: '一覧に戻る' });
    await user.click(backButton);

    expect(mockRepo.remove).toHaveBeenCalledWith('empty-id-456');

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('タイトル入力が動作すること', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderEditorPage(testDoc);

    const titleInput = await screen.findByRole('textbox', { name: 'タイトル' });
    await user.clear(titleInput);
    await user.type(titleInput, '新しいタイトル');

    expect(titleInput).toHaveValue('新しいタイトル');
  });

  it('本文入力が動作すること', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderEditorPage(testDoc);

    const bodyTextarea = await screen.findByRole('textbox', { name: '本文' });
    await user.clear(bodyTextarea);
    await user.type(bodyTextarea, '新しい本文');

    expect(bodyTextarea).toHaveValue('新しい本文');
  });

  it('文字数カウントが本文の長さを反映すること', async () => {
    renderEditorPage(testDoc);

    await screen.findByRole('textbox', { name: '本文' });
    expect(screen.getByText('5 文字')).toBeInTheDocument();
  });

  it('ドキュメントが存在しない場合に一覧へリダイレクトすること', async () => {
    mockRepo.getAll.mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/doc/nonexistent-id']}>
        <DocumentProvider>
          <ThemeProvider>
            <ToastProvider>
              <Routes>
                <Route path="/doc/:id" element={<EditorPage />} />
              </Routes>
            </ToastProvider>
          </ThemeProvider>
        </DocumentProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('メニューボタンクリックでメニューが表示されること', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderEditorPage(testDoc);

    const menuButton = await screen.findByRole('button', { name: 'メニュー' });
    await user.click(menuButton);

    expect(screen.getByRole('menu', { name: 'エディタメニュー' })).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(5);
  });

  it('削除メニュー → 確認ダイアログ → 削除 → 一覧遷移', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderEditorPage(testDoc);

    // Open menu
    const menuButton = await screen.findByRole('button', { name: 'メニュー' });
    await user.click(menuButton);

    // Click delete in menu
    await user.click(screen.getByRole('menuitem', { name: 'テストタイトルを削除' }));

    // Confirm dialog should appear
    expect(
      screen.getByText('このドキュメントを削除しますか？この操作は取り消せません。')
    ).toBeInTheDocument();

    // Click confirm
    await user.click(screen.getByRole('button', { name: '削除' }));

    // Should delete
    expect(mockRepo.remove).toHaveBeenCalledWith('test-id-123');

    // 150ms 後に navigate が呼ばれること
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('削除確認ダイアログのキャンセルで閉じること', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderEditorPage(testDoc);

    // Open menu
    const menuButton = await screen.findByRole('button', { name: 'メニュー' });
    await user.click(menuButton);

    // Click delete in menu
    await user.click(screen.getByRole('menuitem', { name: 'テストタイトルを削除' }));

    // Cancel the dialog
    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    // Should NOT navigate or delete
    expect(mockRepo.remove).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith('/');
  });
});
