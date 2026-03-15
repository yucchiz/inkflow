import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

import { useTheme } from '@/hooks/useTheme';

const THEME_CYCLE = { light: 'dark', dark: 'system', system: 'light' } as const;

const NEXT_THEME_LABEL = {
  light: 'テーマをダークに切替',
  dark: 'テーマをシステムに切替',
  system: 'テーマをライトに切替',
} as const;

export default function ThemeToggle() {
  const { state, setTheme } = useTheme();
  const { theme, resolvedTheme } = state;

  const displayTheme = theme === 'system' ? resolvedTheme : theme;
  const Icon = displayTheme === 'dark' ? MoonIcon : SunIcon;

  function handleClick() {
    setTheme(THEME_CYCLE[theme]);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={NEXT_THEME_LABEL[theme]}
      className="cursor-pointer rounded-lg p-2 hover:bg-(--color-bg-sub) focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:outline-none"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
