import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UpdateNotification from '@/components/common/UpdateNotification';

describe('UpdateNotification', () => {
  const defaultProps = {
    show: true,
    onUpdate: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onUpdate = vi.fn();
  });

  it('show=true でバナーが表示されること', () => {
    render(<UpdateNotification {...defaultProps} />);

    expect(screen.getByText('新しいバージョンが利用可能です')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '更新する' })).toBeInTheDocument();
  });

  it('show=false で非表示であること', () => {
    render(<UpdateNotification {...defaultProps} show={false} />);

    expect(screen.queryByText('新しいバージョンが利用可能です')).not.toBeInTheDocument();
  });

  it('「更新する」クリックで onUpdate が呼ばれること', async () => {
    const user = userEvent.setup();
    render(<UpdateNotification {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: '更新する' }));

    expect(defaultProps.onUpdate).toHaveBeenCalledTimes(1);
  });

  it('role="alert" が適用されること', () => {
    render(<UpdateNotification {...defaultProps} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('role="alert" により暗黙的にaria-live="assertive"が適用されること', () => {
    render(<UpdateNotification {...defaultProps} />);

    // role="alert" は暗黙的に aria-live="assertive" を持つため、
    // 明示的な aria-live 属性は不要（過剰な aria を避ける）
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).not.toHaveAttribute('aria-live');
  });
});
