import { render, waitFor } from '@testing-library/react';

import ThemeProvider from '@/contexts/ThemeContext';
import { useTheme } from '@/hooks/useTheme';

import type { ThemeContextValue } from '@/contexts/ThemeContext';

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

function TestComponent({ onRender }: { onRender: (ctx: ThemeContextValue) => void }) {
  const ctx = useTheme();
  onRender(ctx);
  return null;
}

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    document.documentElement.classList.remove('dark');
  });

  describe('初期化', () => {
    it('localStorageに保存がない場合systemがデフォルトになること', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue(null);

      let state: ThemeContextValue['state'] | undefined;

      // Act
      render(
        <ThemeProvider>
          <TestComponent
            onRender={(ctx) => {
              state = ctx.state;
            }}
          />
        </ThemeProvider>
      );

      // Assert
      expect(state?.theme).toBe('system');
    });

    it('localStorageからテーマを復元すること', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue('dark');

      let state: ThemeContextValue['state'] | undefined;

      // Act
      render(
        <ThemeProvider>
          <TestComponent
            onRender={(ctx) => {
              state = ctx.state;
            }}
          />
        </ThemeProvider>
      );

      // Assert
      expect(state?.theme).toBe('dark');
      expect(state?.resolvedTheme).toBe('dark');
    });
  });

  describe('setTheme', () => {
    it('テーマをdarkに変更するとDOMに.darkクラスが付与されること', async () => {
      // Arrange
      let ctx: ThemeContextValue | undefined;

      render(
        <ThemeProvider>
          <TestComponent
            onRender={(c) => {
              ctx = c;
            }}
          />
        </ThemeProvider>
      );

      // Act
      ctx!.setTheme('dark');

      // Assert
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(ctx?.state.resolvedTheme).toBe('dark');
      });
    });

    it('テーマをlightに変更すると.darkクラスが除去されること', async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue('dark');

      let ctx: ThemeContextValue | undefined;

      render(
        <ThemeProvider>
          <TestComponent
            onRender={(c) => {
              ctx = c;
            }}
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      // Act
      ctx!.setTheme('light');

      // Assert
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(ctx?.state.resolvedTheme).toBe('light');
      });
    });

    it('テーマ変更がlocalStorageに保存されること', () => {
      // Arrange
      let ctx: ThemeContextValue | undefined;

      render(
        <ThemeProvider>
          <TestComponent
            onRender={(c) => {
              ctx = c;
            }}
          />
        </ThemeProvider>
      );

      // Act
      ctx!.setTheme('dark');

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalledWith('inkflow:theme', 'dark');
    });
  });

  describe('system テーマ', () => {
    it('systemモードでOSがdarkの場合resolvedThemeがdarkになること', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue('system');
      matchMediaMock.mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      let state: ThemeContextValue['state'] | undefined;

      // Act
      render(
        <ThemeProvider>
          <TestComponent
            onRender={(ctx) => {
              state = ctx.state;
            }}
          />
        </ThemeProvider>
      );

      // Assert
      expect(state?.theme).toBe('system');
      expect(state?.resolvedTheme).toBe('dark');
    });
  });
});

describe('useTheme', () => {
  it('Provider外で使用するとエラーになること', () => {
    // Arrange
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function Bare() {
      useTheme();
      return null;
    }

    // Act & Assert
    expect(() => render(<Bare />)).toThrow('useTheme must be used within a ThemeProvider');

    spy.mockRestore();
  });
});
