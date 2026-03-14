import { createContext, useEffect, useReducer } from 'react';

import type { ResolvedTheme, Theme, ThemeAction, ThemeState } from '@/types/theme';

const STORAGE_KEY = 'inkflow:theme';

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeToDOM(resolvedTheme: ResolvedTheme): void {
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
}

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME':
      return {
        theme: action.payload,
        resolvedTheme: resolveTheme(action.payload),
      };
  }
}

export interface ThemeContextValue {
  state: ThemeState;
  setTheme: (theme: Theme) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextValue | null>(null);

type Props = { children: React.ReactNode };

function ThemeProvider({ children }: Props) {
  const [state, dispatch] = useReducer(themeReducer, undefined, () => {
    const theme = getStoredTheme();
    return {
      theme,
      resolvedTheme: resolveTheme(theme),
    };
  });

  function setTheme(theme: Theme): void {
    localStorage.setItem(STORAGE_KEY, theme);
    dispatch({ type: 'SET_THEME', payload: theme });
  }

  useEffect(() => {
    applyThemeToDOM(state.resolvedTheme);
  }, [state.resolvedTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function handleChange(): void {
      if (state.theme === 'system') {
        dispatch({ type: 'SET_THEME', payload: 'system' });
      }
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [state.theme]);

  return <ThemeContext.Provider value={{ state, setTheme }}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;
