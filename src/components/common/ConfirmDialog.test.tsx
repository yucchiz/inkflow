import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmDialog from '@/components/common/ConfirmDialog';

// jsdom does not fully support HTMLDialogElement.showModal() / close().
// We must set the `open` attribute manually so that role="dialog" is visible
// in the accessibility tree.
const showModalMock = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute('open', '');
});
const closeMock = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute('open');
});

beforeEach(() => {
  showModalMock.mockClear();
  closeMock.mockClear();
  HTMLDialogElement.prototype.showModal = showModalMock;
  HTMLDialogElement.prototype.close = closeMock;
});

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    title: 'ドキュメントの削除',
    message: 'このドキュメントを削除しますか？',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onConfirm = vi.fn();
    defaultProps.onCancel = vi.fn();
  });

  it('open=true でダイアログが表示されること', () => {
    // Arrange & Act
    render(<ConfirmDialog {...defaultProps} />);

    // Assert
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(showModalMock).toHaveBeenCalled();
  });

  it('open=false でダイアログが非表示であること', () => {
    // Arrange & Act
    render(<ConfirmDialog {...defaultProps} open={false} />);

    // Assert
    expect(showModalMock).not.toHaveBeenCalled();
    // dialog.open is already false on initial render, so close() is not called
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('title と message が正しく表示されること', () => {
    // Arrange & Act
    render(<ConfirmDialog {...defaultProps} />);

    // Assert
    expect(screen.getByRole('heading', { name: 'ドキュメントの削除' })).toBeInTheDocument();
    expect(screen.getByText('このドキュメントを削除しますか？')).toBeInTheDocument();
  });

  it('「キャンセル」クリックで onCancel が呼ばれること', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    // Assert
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('「削除」クリックで onConfirm が呼ばれること', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);

    // Act
    await user.click(screen.getByRole('button', { name: '削除' }));

    // Assert
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('confirmLabel を指定すると確認ボタンのラベルが変わること', () => {
    // Arrange & Act
    render(<ConfirmDialog {...defaultProps} confirmLabel="実行" />);

    // Assert
    expect(screen.getByRole('button', { name: '実行' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument();
  });

  it('Escape キーで onCancel が呼ばれること', () => {
    // Arrange
    render(<ConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole('dialog');

    // Act — dispatch native cancel event (fired when Escape is pressed on <dialog>)
    dialog.dispatchEvent(new Event('cancel', { bubbles: true }));

    // Assert
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('open が true から false に切り替わると close() が呼ばれること', () => {
    // Arrange
    vi.useFakeTimers();
    const { rerender } = render(<ConfirmDialog {...defaultProps} open={true} />);

    // Act
    rerender(<ConfirmDialog {...defaultProps} open={false} />);
    vi.advanceTimersByTime(150);

    // Assert
    expect(closeMock).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
