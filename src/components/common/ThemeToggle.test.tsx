import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ThemeToggle from '@/components/common/ThemeToggle';
import ThemeProvider from '@/contexts/ThemeContext';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
Object.defineProperty(window, 'matchMedia', { value: matchMediaMock });

function renderWithTheme(initialTheme: string | null = 'light') {
  localStorageMock.getItem.mockReturnValue(initialTheme);
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove('dark');
  });

  it('light テーマ時にボタンに「テーマをダークに切替」の aria-label が設定されていること', () => {
    // Arrange & Act
    renderWithTheme('light');

    // Assert
    expect(screen.getByRole('button', { name: 'テーマをダークに切替' })).toBeInTheDocument();
  });

  it('クリックで light から dark に切り替わること', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithTheme('light');

    // Act
    await user.click(screen.getByRole('button', { name: 'テーマをダークに切替' }));

    // Assert
    expect(localStorageMock.setItem).toHaveBeenCalledWith('inkflow:theme', 'dark');
  });

  it('dark テーマ時にボタンに「テーマをシステムに切替」の aria-label が設定されていること', () => {
    // Arrange & Act
    renderWithTheme('dark');

    // Assert
    expect(screen.getByRole('button', { name: 'テーマをシステムに切替' })).toBeInTheDocument();
  });

  it('system テーマ時にボタンに「テーマをライトに切替」の aria-label が設定されていること', () => {
    // Arrange & Act
    renderWithTheme('system');

    // Assert
    expect(screen.getByRole('button', { name: 'テーマをライトに切替' })).toBeInTheDocument();
  });
});
