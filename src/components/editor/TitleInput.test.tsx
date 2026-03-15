import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TitleInput from '@/components/editor/TitleInput';

describe('TitleInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onFocusBody: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onChange = vi.fn();
    defaultProps.onFocusBody = vi.fn();
  });

  it('value がテキストボックスに表示されること', () => {
    // Arrange & Act
    render(<TitleInput {...defaultProps} value="テスト記事" />);

    // Assert
    expect(screen.getByRole('textbox', { name: 'タイトル' })).toHaveValue('テスト記事');
  });

  it('入力時に onChange が呼ばれること', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TitleInput {...defaultProps} />);

    // Act
    await user.type(screen.getByRole('textbox', { name: 'タイトル' }), 'a');

    // Assert
    expect(defaultProps.onChange).toHaveBeenCalledWith('a');
  });

  it('Enter キーで onFocusBody が呼ばれること', () => {
    // Arrange
    render(<TitleInput {...defaultProps} />);
    const input = screen.getByRole('textbox', { name: 'タイトル' });

    // Act
    fireEvent.keyDown(input, { key: 'Enter' });

    // Assert
    expect(defaultProps.onFocusBody).toHaveBeenCalledTimes(1);
  });

  it('プレースホルダーが「タイトル」であること', () => {
    // Arrange & Act
    render(<TitleInput {...defaultProps} />);

    // Assert
    expect(screen.getByPlaceholderText('タイトル')).toBeInTheDocument();
  });

  it('200文字制限が設定されていること', () => {
    // Arrange & Act
    render(<TitleInput {...defaultProps} />);

    // Assert
    expect(screen.getByRole('textbox', { name: 'タイトル' })).toHaveAttribute('maxLength', '200');
  });
});
