import { act, renderHook } from '@testing-library/react';

import { createDocument } from '@/lib/document';

import type { Document } from '@/types/document';

const mockShowToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ state: { message: null, visible: false }, showToast: mockShowToast }),
}));

// Import after mock setup
const { useAutoSave } = await import('@/hooks/useAutoSave');

describe('useAutoSave', () => {
  let mockUpdateDocument: ReturnType<typeof vi.fn>;
  let testDoc: Document;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockUpdateDocument = vi.fn().mockResolvedValue(undefined);
    testDoc = createDocument({ title: '初期タイトル', body: '初期本文' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初期値としてドキュメントの title と body がセットされること', () => {
    // Arrange & Act
    const { result } = renderHook(() => useAutoSave(testDoc, mockUpdateDocument));

    // Assert
    expect(result.current.title).toBe('初期タイトル');
    expect(result.current.body).toBe('初期本文');
    expect(result.current.saveStatus).toBe('idle');
  });

  it('document が null の場合は空文字が初期値になること', () => {
    // Arrange & Act
    const { result } = renderHook(() => useAutoSave(null, mockUpdateDocument));

    // Assert
    expect(result.current.title).toBe('');
    expect(result.current.body).toBe('');
    expect(result.current.saveStatus).toBe('idle');
  });

  it('setTitle 呼び出しから 500ms 後に updateDocument が呼ばれること', async () => {
    // Arrange
    const { result } = renderHook(() => useAutoSave(testDoc, mockUpdateDocument));

    // Act
    act(() => {
      result.current.setTitle('新しいタイトル');
    });

    // 500ms 経過前は呼ばれない
    expect(mockUpdateDocument).not.toHaveBeenCalled();

    // 500ms 経過
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Assert
    expect(mockUpdateDocument).toHaveBeenCalledOnce();
    expect(mockUpdateDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        id: testDoc.id,
        title: '新しいタイトル',
        body: '初期本文',
      })
    );
  });

  it('setBody 呼び出しから 500ms 後に updateDocument が呼ばれること', async () => {
    // Arrange
    const { result } = renderHook(() => useAutoSave(testDoc, mockUpdateDocument));

    // Act
    act(() => {
      result.current.setBody('新しい本文');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Assert
    expect(mockUpdateDocument).toHaveBeenCalledOnce();
    expect(mockUpdateDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        id: testDoc.id,
        title: '初期タイトル',
        body: '新しい本文',
      })
    );
  });

  it('連続入力時はデバウンスされ最後の値で1回だけ保存されること', async () => {
    // Arrange
    const { result } = renderHook(() => useAutoSave(testDoc, mockUpdateDocument));

    // Act - 連続入力
    act(() => {
      result.current.setTitle('あ');
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    act(() => {
      result.current.setTitle('あい');
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    act(() => {
      result.current.setTitle('あいう');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Assert
    expect(mockUpdateDocument).toHaveBeenCalledOnce();
    expect(mockUpdateDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'あいう',
      })
    );
  });

  it('保存中は saveStatus が saving になること', async () => {
    // Arrange
    let resolveUpdate: () => void;
    mockUpdateDocument.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      })
    );

    const { result } = renderHook(() => useAutoSave(testDoc, mockUpdateDocument));

    // Act
    act(() => {
      result.current.setTitle('更新中');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Assert - saving 状態
    expect(result.current.saveStatus).toBe('saving');

    // Cleanup - resolve して完了
    await act(async () => {
      resolveUpdate!();
    });
  });

  it('保存完了後に saveStatus が saved になり 2秒後に idle に戻ること', async () => {
    // Arrange
    const { result } = renderHook(() => useAutoSave(testDoc, mockUpdateDocument));

    // Act
    act(() => {
      result.current.setTitle('保存完了テスト');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Assert - saved 状態
    expect(result.current.saveStatus).toBe('saved');

    // 2秒後に idle に戻る
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.saveStatus).toBe('idle');
  });

  it('保存失敗時に showToast が呼ばれ saveStatus が idle に戻ること', async () => {
    // Arrange
    mockUpdateDocument.mockRejectedValue(new Error('DB error'));
    const { result } = renderHook(() => useAutoSave(testDoc, mockUpdateDocument));

    // Act
    act(() => {
      result.current.setTitle('失敗テスト');
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Assert
    expect(mockShowToast).toHaveBeenCalledWith('保存に失敗しました');
    expect(result.current.saveStatus).toBe('idle');
  });

  it('アンマウント時に pending の変更がフラッシュ保存されること', async () => {
    // Arrange
    const { result, unmount } = renderHook(() => useAutoSave(testDoc, mockUpdateDocument));

    // Act - タイマー発火前にアンマウント
    act(() => {
      result.current.setTitle('未保存の変更');
    });

    expect(mockUpdateDocument).not.toHaveBeenCalled();

    // アンマウント
    unmount();

    // Assert - フラッシュ保存される
    expect(mockUpdateDocument).toHaveBeenCalledOnce();
    expect(mockUpdateDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        id: testDoc.id,
        title: '未保存の変更',
      })
    );
  });

  it('document の id が変わったら title/body がリセットされること', () => {
    // Arrange
    const { result, rerender } = renderHook(({ doc }) => useAutoSave(doc, mockUpdateDocument), {
      initialProps: { doc: testDoc as Document | null },
    });

    // Act - title を変更
    act(() => {
      result.current.setTitle('変更されたタイトル');
    });

    expect(result.current.title).toBe('変更されたタイトル');

    // 別のドキュメントに切り替え
    const newDoc = createDocument({ title: '別のドキュメント', body: '別の本文' });
    rerender({ doc: newDoc });

    // Assert - 新しいドキュメントの値にリセット
    expect(result.current.title).toBe('別のドキュメント');
    expect(result.current.body).toBe('別の本文');
  });
});
