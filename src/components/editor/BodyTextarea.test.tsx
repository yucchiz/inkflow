import { createRef } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BodyTextarea from '@/components/editor/BodyTextarea';

describe('BodyTextarea', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onChange = vi.fn();
  });

  it('value がテキストエリアに表示されること', () => {
    // Arrange & Act
    render(<BodyTextarea {...defaultProps} value="本文テスト" />);

    // Assert
    expect(screen.getByRole('textbox', { name: '本文' })).toHaveValue('本文テスト');
  });

  it('入力時に onChange が呼ばれること', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BodyTextarea {...defaultProps} />);

    // Act
    await user.type(screen.getByRole('textbox', { name: '本文' }), 'a');

    // Assert
    expect(defaultProps.onChange).toHaveBeenCalledWith('a');
  });

  it('プレースホルダーが「書き始める...」であること', () => {
    // Arrange & Act
    render(<BodyTextarea {...defaultProps} />);

    // Assert
    expect(screen.getByPlaceholderText('書き始める...')).toBeInTheDocument();
  });

  it('外部の textareaRef が textarea 要素を参照できること', () => {
    // Arrange
    const ref = createRef<HTMLTextAreaElement>();

    // Act
    render(<BodyTextarea {...defaultProps} textareaRef={ref} />);

    // Assert
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(ref.current).toBe(screen.getByRole('textbox', { name: '本文' }));
  });
});
