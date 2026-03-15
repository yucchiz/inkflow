import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import DocumentList from '@/components/document-list/DocumentList';

import type { Document } from '@/types/document';

function createDoc(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc-1',
    title: 'Document 1',
    body: 'Body text',
    createdAt: '2026-03-14T00:00:00.000Z',
    updatedAt: '2026-03-14T00:00:00.000Z',
    ...overrides,
  };
}

function renderWithRouter(documents: Document[], onDelete = vi.fn()) {
  return {
    onDelete,
    ...render(
      <MemoryRouter>
        <DocumentList documents={documents} onDelete={onDelete} />
      </MemoryRouter>
    ),
  };
}

describe('DocumentList', () => {
  it('ドキュメント一覧が表示されること', () => {
    // Arrange
    const docs = [
      createDoc({ id: 'doc-1', title: 'First' }),
      createDoc({ id: 'doc-2', title: 'Second' }),
      createDoc({ id: 'doc-3', title: 'Third' }),
    ];

    // Act
    renderWithRouter(docs);

    // Assert
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('ul 要素でリストがレンダリングされること', () => {
    // Arrange
    const docs = [createDoc({ id: 'doc-1', title: 'First' })];

    // Act
    renderWithRouter(docs);

    // Assert
    expect(screen.getByRole('list', { name: 'ドキュメント一覧' })).toBeInTheDocument();
  });

  it('各カードが article 要素としてレンダリングされること', () => {
    // Arrange
    const docs = [
      createDoc({ id: 'doc-1', title: 'First' }),
      createDoc({ id: 'doc-2', title: 'Second' }),
    ];

    // Act
    renderWithRouter(docs);

    // Assert
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(2);
  });
});
