import { render, screen } from '@testing-library/react';

import Header from '@/components/common/Header';

describe('Header', () => {
  it('children が正しくレンダリングされること', () => {
    // Arrange & Act
    render(
      <Header>
        <span>InkFlow</span>
      </Header>
    );

    // Assert
    expect(screen.getByText('InkFlow')).toBeInTheDocument();
  });

  it('<header> 要素としてレンダリングされること', () => {
    // Arrange & Act
    render(
      <Header>
        <span>テスト</span>
      </Header>
    );

    // Assert
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
