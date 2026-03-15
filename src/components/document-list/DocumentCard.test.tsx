import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

import DocumentCard from '@/components/document-list/DocumentCard';

import type { Document } from '@/types/document';

const baseDoc: Document = {
  id: 'doc-1',
  title: 'Test Document',
  body: 'This is the body of the document.',
  createdAt: '2026-03-14T03:30:00.000Z',
  updatedAt: '2026-03-14T03:30:00.000Z',
};

function renderWithRouter(doc: Document, onDelete = vi.fn()) {
  return {
    onDelete,
    ...render(
      <MemoryRouter>
        <DocumentCard doc={doc} onDelete={onDelete} />
      </MemoryRouter>
    ),
  };
}

describe('DocumentCard', () => {
  it('タイトルが表示されること', () => {
    // Arrange & Act
    renderWithRouter(baseDoc);

    // Assert
    expect(screen.getByText('Test Document')).toBeInTheDocument();
  });

  it('タイトル空のとき「無題のドキュメント」が表示されること', () => {
    // Arrange
    const doc: Document = { ...baseDoc, title: '' };

    // Act
    renderWithRouter(doc);

    // Assert
    expect(screen.getByText('無題のドキュメント')).toBeInTheDocument();
  });

  it('プレビュー（本文冒頭）が表示されること', () => {
    // Arrange & Act
    renderWithRouter(baseDoc);

    // Assert
    expect(screen.getByText('This is the body of the document.')).toBeInTheDocument();
  });

  it('本文が空の場合プレビューが表示されないこと', () => {
    // Arrange
    const doc: Document = { ...baseDoc, body: '' };

    // Act
    renderWithRouter(doc);

    // Assert
    expect(screen.queryByText('This is the body of the document.')).not.toBeInTheDocument();
  });

  it('更新日時が formatDate の結果で表示されること', () => {
    // Arrange
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-14T06:00:00.000Z'));

    // Act
    renderWithRouter(baseDoc);

    // Assert — JST 2026/3/14 12:30
    expect(screen.getByText('12:30')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('削除ボタンクリックで onDelete が呼ばれること', async () => {
    // Arrange
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderWithRouter(baseDoc, onDelete);

    // Act
    await user.click(screen.getByRole('button', { name: 'Test Documentを削除' }));

    // Assert
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('doc-1');
  });

  it('<article> 要素でレンダリングされること', () => {
    // Arrange & Act
    renderWithRouter(baseDoc);

    // Assert
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
