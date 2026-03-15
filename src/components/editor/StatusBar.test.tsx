import { render, screen } from '@testing-library/react';

import StatusBar from '@/components/editor/StatusBar';

describe('StatusBar', () => {
  it('文字数が「0 文字」と表示されること', () => {
    // Arrange & Act
    render(<StatusBar charCount={0} />);

    // Assert
    expect(screen.getByText('0 文字')).toBeInTheDocument();
  });

  it('文字数が「1,234 文字」と表示されること', () => {
    // Arrange & Act
    render(<StatusBar charCount={1234} />);

    // Assert
    expect(screen.getByText('1,234 文字')).toBeInTheDocument();
  });

  it('visible が false のとき opacity-0 クラスが適用されること', () => {
    // Arrange & Act
    render(<StatusBar charCount={100} visible={false} />);

    // Assert
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('opacity-0');
  });

  it('visible がデフォルト（未指定）のとき opacity-100 が適用されること', () => {
    // Arrange & Act
    render(<StatusBar charCount={100} />);

    // Assert
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('opacity-100');
  });

  it('footer 要素を使用していること', () => {
    // Arrange & Act
    render(<StatusBar charCount={0} />);

    // Assert
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('motion-safe:transition-opacity クラスが適用されること', () => {
    // Arrange & Act
    render(<StatusBar charCount={100} />);

    // Assert
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('motion-safe:transition-opacity');
    expect(footer).toHaveClass('motion-safe:duration-[200ms]');
  });
});
