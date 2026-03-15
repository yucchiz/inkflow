import {
  ArrowDownTrayIcon,
  ArrowsPointingInIcon,
  ClipboardDocumentIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import DropdownMenu from '@/components/common/DropdownMenu';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { copyToClipboard, downloadAsTxt } from '@/lib/exportDocument';

import type { Theme } from '@/types/theme';

const THEME_CYCLE: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

const NEXT_THEME_LABEL: Record<Theme, string> = {
  light: 'テーマをダークに切替',
  dark: 'テーマをシステムに切替',
  system: 'テーマをライトに切替',
};

const MENU_ITEM_CLASS =
  'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-(--color-text) hover:bg-(--color-bg) focus-visible:bg-(--color-bg) focus-visible:outline-none';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  onDelete: () => void;
  onFocusMode: () => void;
};

export default function EditorMenu({ open, onClose, title, body, onDelete, onFocusMode }: Props) {
  const { state, setTheme } = useTheme();
  const { showToast } = useToast();

  const { theme, resolvedTheme } = state;
  const ThemeIcon = resolvedTheme === 'dark' ? MoonIcon : SunIcon;

  const deleteLabel = `${title || '無題のドキュメント'}を削除`;

  async function handleCopy() {
    const success = await copyToClipboard(body);
    showToast(success ? 'コピーしました' : 'コピーに失敗しました');
    onClose();
  }

  function handleDownload() {
    downloadAsTxt(title, body);
    onClose();
  }

  function handleThemeToggle() {
    setTheme(THEME_CYCLE[theme]);
  }

  function handleFocusMode() {
    onFocusMode();
    onClose();
  }

  function handleDelete() {
    onDelete();
    onClose();
  }

  return (
    <DropdownMenu open={open} onClose={onClose} aria-label="エディタメニュー">
      <button
        type="button"
        role="menuitem"
        tabIndex={-1}
        onClick={handleCopy}
        className={MENU_ITEM_CLASS}
      >
        <ClipboardDocumentIcon className="h-5 w-5 shrink-0" />
        <span>コピー</span>
      </button>

      <button
        type="button"
        role="menuitem"
        tabIndex={-1}
        onClick={handleDownload}
        className={MENU_ITEM_CLASS}
      >
        <ArrowDownTrayIcon className="h-5 w-5 shrink-0" />
        <span>ダウンロード</span>
      </button>

      <button
        type="button"
        role="menuitem"
        tabIndex={-1}
        onClick={handleThemeToggle}
        aria-label={NEXT_THEME_LABEL[theme]}
        className={MENU_ITEM_CLASS}
      >
        <ThemeIcon className="h-5 w-5 shrink-0" />
        <span>{NEXT_THEME_LABEL[theme]}</span>
      </button>

      <button
        type="button"
        role="menuitem"
        tabIndex={-1}
        onClick={handleFocusMode}
        className={MENU_ITEM_CLASS}
      >
        <ArrowsPointingInIcon className="h-5 w-5 shrink-0" />
        <span>集中モード</span>
      </button>

      <button
        type="button"
        role="menuitem"
        tabIndex={-1}
        onClick={handleDelete}
        aria-label={deleteLabel}
        className={`${MENU_ITEM_CLASS} text-(--color-danger)`}
      >
        <TrashIcon className="h-5 w-5 shrink-0" />
        <span>削除</span>
      </button>
    </DropdownMenu>
  );
}
