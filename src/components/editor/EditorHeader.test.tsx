import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditorHeader from '@/components/editor/EditorHeader';

describe('EditorHeader', () => {
  const defaultProps = {
    saveStatus: 'idle' as const,
    onBack: vi.fn(),
    onMenuToggle: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onBack = vi.fn();
    defaultProps.onMenuToggle = vi.fn();
  });

  it('戻るボタンが表示されること', () => {
    // Arrange & Act
    render(<EditorHeader {...defaultProps} />);

    // Assert
    expect(screen.getByRole('button', { name: '一覧に戻る' })).toBeInTheDocument();
  });

  it('戻るボタンクリックで onBack が呼ばれること', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<EditorHeader {...defaultProps} />);

    // Act
    await user.click(screen.getByRole('button', { name: '一覧に戻る' }));

    // Assert
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('メニューボタンが表示されること', () => {
    // Arrange & Act
    render(<EditorHeader {...defaultProps} />);

    // Assert
    expect(screen.getByRole('button', { name: 'メニュー' })).toBeInTheDocument();
  });

  it('メニューボタンクリックで onMenuToggle が呼ばれること', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<EditorHeader {...defaultProps} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'メニュー' }));

    // Assert
    expect(defaultProps.onMenuToggle).toHaveBeenCalledTimes(1);
  });

  it('saveStatus が saved のとき「保存済み」が表示されること', () => {
    // Arrange & Act
    render(<EditorHeader {...defaultProps} saveStatus="saved" />);

    // Assert
    expect(screen.getByText('保存済み')).toBeInTheDocument();
  });

  it('saveStatus が idle のとき保存ステータスが表示されないこと', () => {
    // Arrange & Act
    render(<EditorHeader {...defaultProps} saveStatus="idle" />);

    // Assert
    expect(screen.queryByText('保存済み')).not.toBeInTheDocument();
    expect(screen.queryByText('保存中...')).not.toBeInTheDocument();
  });

  it('saveStatus が saving のとき「保存中...」が表示されること', () => {
    // Arrange & Act
    render(<EditorHeader {...defaultProps} saveStatus="saving" />);

    // Assert
    expect(screen.getByText('保存中...')).toBeInTheDocument();
  });

  it('children がメニューボタン付近にレンダリングされること', () => {
    // Arrange & Act
    render(
      <EditorHeader {...defaultProps}>
        <div data-testid="dropdown-menu">メニュー内容</div>
      </EditorHeader>
    );

    // Assert
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByText('メニュー内容')).toBeInTheDocument();
  });

  it('menuOpen が true のときメニューボタンに aria-expanded="true" が設定されること', () => {
    // Arrange & Act
    render(<EditorHeader {...defaultProps} menuOpen={true} />);

    // Assert
    expect(screen.getByRole('button', { name: 'メニュー' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('menuOpen が false のときメニューボタンに aria-expanded="false" が設定されること', () => {
    // Arrange & Act
    render(<EditorHeader {...defaultProps} menuOpen={false} />);

    // Assert
    expect(screen.getByRole('button', { name: 'メニュー' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('header 要素を使用していること', () => {
    // Arrange & Act
    render(<EditorHeader {...defaultProps} />);

    // Assert
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('visible=false のとき -translate-y-full クラスが適用されること', () => {
    // Arrange & Act
    render(<EditorHeader {...defaultProps} visible={false} />);

    // Assert
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('-translate-y-full');
  });

  it('visible=true のとき translate-y-0 クラスが適用されること', () => {
    // Arrange & Act
    render(<EditorHeader {...defaultProps} visible={true} />);

    // Assert
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('translate-y-0');
  });
});
