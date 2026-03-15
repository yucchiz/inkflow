import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DropdownMenu from '@/components/common/DropdownMenu';

describe('DropdownMenu', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onClose = vi.fn();
  });

  it('open=true でメニューが表示されること', () => {
    // Arrange & Act
    render(
      <DropdownMenu {...defaultProps}>
        <button>メニュー項目</button>
      </DropdownMenu>
    );

    // Assert
    expect(screen.getByLabelText('メニュー')).toBeInTheDocument();
  });

  it('open=false でメニューが非表示であること', () => {
    // Arrange & Act
    render(
      <DropdownMenu {...defaultProps} open={false}>
        <button>メニュー項目</button>
      </DropdownMenu>
    );

    // Assert
    expect(screen.queryByLabelText('メニュー')).not.toBeInTheDocument();
  });

  it('children が表示されること', () => {
    // Arrange & Act
    render(
      <DropdownMenu {...defaultProps}>
        <button>コピー</button>
        <button>ダウンロード</button>
      </DropdownMenu>
    );

    // Assert
    expect(screen.getByRole('button', { name: 'コピー' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ダウンロード' })).toBeInTheDocument();
  });

  it('外側クリックで onClose が呼ばれること', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <div>
        <p>外側の要素</p>
        <DropdownMenu {...defaultProps}>
          <button>メニュー項目</button>
        </DropdownMenu>
      </div>
    );

    // Act
    await user.click(screen.getByText('外側の要素'));

    // Assert
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape キーで onClose が呼ばれること', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <DropdownMenu {...defaultProps}>
        <button>メニュー項目</button>
      </DropdownMenu>
    );

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('メニュー内クリックでは onClose が呼ばれないこと', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <DropdownMenu {...defaultProps}>
        <button>メニュー項目</button>
      </DropdownMenu>
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'メニュー項目' }));

    // Assert
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});
