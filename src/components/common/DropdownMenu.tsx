import { useCallback, useEffect, useRef } from 'react';

import { useDelayedClose } from '@/hooks/useDelayedClose';

import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  'aria-label'?: string;
  children: ReactNode;
};

export default function DropdownMenu({
  open,
  onClose,
  'aria-label': ariaLabel = 'メニュー',
  children,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { visible, closing } = useDelayedClose(open, 100);

  const focusMenuItem = useCallback((direction: 'first' | 'last' | 'next' | 'prev') => {
    const menu = menuRef.current;
    if (!menu) return;

    const items = Array.from(
      menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])')
    );
    if (items.length === 0) return;

    const currentIndex = items.findIndex((item) => item === document.activeElement);

    let targetIndex: number;
    switch (direction) {
      case 'first':
        targetIndex = 0;
        break;
      case 'last':
        targetIndex = items.length - 1;
        break;
      case 'next':
        targetIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'prev':
        targetIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
    }

    items[targetIndex].focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    // Focus the first menu item when opened
    requestAnimationFrame(() => {
      focusMenuItem('first');
    });
  }, [open, focusMenuItem]);

  useEffect(() => {
    if (!visible) return;

    function handleMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          focusMenuItem('next');
          break;
        case 'ArrowUp':
          e.preventDefault();
          focusMenuItem('prev');
          break;
        case 'Home':
          e.preventDefault();
          focusMenuItem('first');
          break;
        case 'End':
          e.preventDefault();
          focusMenuItem('last');
          break;
        case 'Tab':
          // Trap focus within menu -- close on Tab
          e.preventDefault();
          onClose();
          break;
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose, focusMenuItem]);

  if (!visible) return null;

  const animationClass = closing
    ? 'opacity-0 scale-95' // closing
    : 'motion-safe:animate-[dropdown-in_150ms_var(--ease-out)]'; // opening

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={ariaLabel}
      className={`absolute top-full right-0 mt-1 min-w-[160px] origin-top-right rounded-lg border border-(--color-border) bg-(--color-bg-sub) py-1 shadow-lg motion-safe:transition-[opacity,transform] motion-safe:duration-[100ms] motion-safe:ease-(--ease-in) ${animationClass}`}
    >
      {children}
    </div>
  );
}
