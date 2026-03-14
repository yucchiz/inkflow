import { render, waitFor } from '@testing-library/react';

import DocumentProvider from '@/contexts/DocumentContext';
import { useDocuments } from '@/hooks/useDocuments';
import { createDocument } from '@/lib/document';

import type { DocumentContextValue } from '@/contexts/DocumentContext';

vi.mock('@/lib/db', () => ({
  documentRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
  },
}));

import { documentRepository } from '@/lib/db';
const mockRepo = vi.mocked(documentRepository);

function TestComponent({ onRender }: { onRender: (ctx: DocumentContextValue) => void }) {
  const ctx = useDocuments();
  onRender(ctx);
  return null;
}

describe('DocumentContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.getAll.mockResolvedValue([]);
    mockRepo.save.mockResolvedValue(undefined);
    mockRepo.remove.mockResolvedValue(undefined);
  });

  describe('初期化', () => {
    it('マウント時にドキュメントを読み込むこと', async () => {
      // Arrange
      const docs = [createDocument({ title: 'テスト' })];
      mockRepo.getAll.mockResolvedValue(docs);

      let state: DocumentContextValue['state'] | undefined;

      // Act
      render(
        <DocumentProvider>
          <TestComponent
            onRender={(ctx) => {
              state = ctx.state;
            }}
          />
        </DocumentProvider>
      );

      // Assert
      await waitFor(() => {
        expect(state?.isLoading).toBe(false);
        expect(state?.documents).toHaveLength(1);
      });
      expect(mockRepo.getAll).toHaveBeenCalledOnce();
    });

    it('読み込み中はisLoadingがtrueであること', () => {
      // Arrange
      mockRepo.getAll.mockReturnValue(new Promise(() => {})); // never resolves

      let state: DocumentContextValue['state'] | undefined;

      // Act
      render(
        <DocumentProvider>
          <TestComponent
            onRender={(ctx) => {
              state = ctx.state;
            }}
          />
        </DocumentProvider>
      );

      // Assert
      expect(state?.isLoading).toBe(true);
      expect(state?.documents).toHaveLength(0);
    });
  });

  describe('addDocument', () => {
    it('ドキュメントを追加できること', async () => {
      // Arrange
      const newDoc = createDocument({ title: '新しいドキュメント', body: '本文' });
      let ctx: DocumentContextValue | undefined;

      render(
        <DocumentProvider>
          <TestComponent
            onRender={(c) => {
              ctx = c;
            }}
          />
        </DocumentProvider>
      );

      await waitFor(() => {
        expect(ctx?.state.isLoading).toBe(false);
      });

      // Act
      await ctx!.addDocument(newDoc);

      // Assert
      expect(mockRepo.save).toHaveBeenCalledWith(newDoc);
      await waitFor(() => {
        expect(ctx?.state.documents).toHaveLength(1);
        expect(ctx?.state.documents[0].title).toBe('新しいドキュメント');
      });
    });
  });

  describe('updateDocument', () => {
    it('ドキュメントを更新できること', async () => {
      // Arrange
      const doc = createDocument({ title: '初期タイトル', body: '初期本文' });
      mockRepo.getAll.mockResolvedValue([doc]);

      let ctx: DocumentContextValue | undefined;

      render(
        <DocumentProvider>
          <TestComponent
            onRender={(c) => {
              ctx = c;
            }}
          />
        </DocumentProvider>
      );

      await waitFor(() => {
        expect(ctx?.state.isLoading).toBe(false);
        expect(ctx?.state.documents).toHaveLength(1);
      });

      // Act
      const updated = { ...doc, title: '更新タイトル', body: '更新本文' };
      await ctx!.updateDocument(updated);

      // Assert
      expect(mockRepo.save).toHaveBeenCalledWith(updated);
      await waitFor(() => {
        expect(ctx?.state.documents[0].title).toBe('更新タイトル');
        expect(ctx?.state.documents[0].body).toBe('更新本文');
      });
    });
  });

  describe('deleteDocument', () => {
    it('ドキュメントを削除できること', async () => {
      // Arrange
      const doc = createDocument({ title: '削除対象' });
      mockRepo.getAll.mockResolvedValue([doc]);

      let ctx: DocumentContextValue | undefined;

      render(
        <DocumentProvider>
          <TestComponent
            onRender={(c) => {
              ctx = c;
            }}
          />
        </DocumentProvider>
      );

      await waitFor(() => {
        expect(ctx?.state.isLoading).toBe(false);
        expect(ctx?.state.documents).toHaveLength(1);
      });

      // Act
      await ctx!.deleteDocument(doc.id);

      // Assert
      expect(mockRepo.remove).toHaveBeenCalledWith(doc.id);
      await waitFor(() => {
        expect(ctx?.state.documents).toHaveLength(0);
      });
    });
  });
});

describe('useDocuments', () => {
  it('Provider外で使用するとエラーになること', () => {
    // Arrange
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function Bare() {
      useDocuments();
      return null;
    }

    // Act & Assert
    expect(() => render(<Bare />)).toThrow('useDocuments must be used within a DocumentProvider');

    spy.mockRestore();
  });
});
