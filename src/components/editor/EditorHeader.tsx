import { ArrowLeftIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';

import type { ReactNode } from 'react';

type Props = {
  saveStatus: 'idle' | 'saving' | 'saved';
  onBack: () => void;
  onMenuToggle: () => void;
  menuOpen?: boolean;
  visible?: boolean;
  children?: ReactNode;
};

const ICON_BUTTON_CLASS =
  'cursor-pointer rounded-lg p-2 text-(--color-text) transition-colors hover:bg-(--color-bg-sub) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent)';

const SAVE_STATUS_TEXT: Record<Props['saveStatus'], string> = {
  idle: '',
  saving: '保存中...',
  saved: '保存済み',
};

export default function EditorHeader({
  saveStatus,
  onBack,
  onMenuToggle,
  menuOpen,
  visible = true,
  children,
}: Props) {
  return (
    <header
      className={`sticky top-0 z-10 flex items-center justify-between bg-(--color-bg)/95 px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2 backdrop-blur-sm motion-safe:duration-[200ms] ${
        visible
          ? 'translate-y-0 motion-safe:transition-transform motion-safe:ease-(--ease-out)'
          : '-translate-y-full motion-safe:transition-transform motion-safe:ease-(--ease-in)'
      }`}
    >
      <button type="button" aria-label="一覧に戻る" onClick={onBack} className={ICON_BUTTON_CLASS}>
        <ArrowLeftIcon className="h-5 w-5" />
      </button>

      <span
        role="status"
        aria-live="polite"
        className={`font-(family-name:--font-ui) text-xs text-(--color-text-sub) motion-safe:transition-opacity ${
          saveStatus === 'idle'
            ? 'opacity-0 motion-safe:duration-[300ms]'
            : 'opacity-100 motion-safe:duration-[150ms]'
        }`}
      >
        {SAVE_STATUS_TEXT[saveStatus]}
      </span>

      <div className="relative">
        <button
          type="button"
          aria-label="メニュー"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={onMenuToggle}
          className={ICON_BUTTON_CLASS}
        >
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>
        {children}
      </div>
    </header>
  );
}
