import { render, screen } from '@testing-library/react';

import EmptyState from '@/components/document-list/EmptyState';

describe('EmptyState', () => {
  it('「まだドキュメントがありません」が表示されること', () => {
    // Arrange & Act
    render(<EmptyState />);

    // Assert
    expect(screen.getByText('まだドキュメントがありません')).toBeInTheDocument();
  });

  it('「＋ボタンで書き始めましょう」が表示されること', () => {
    // Arrange & Act
    render(<EmptyState />);

    // Assert
    expect(screen.getByText('＋ボタンで書き始めましょう')).toBeInTheDocument();
  });
});
