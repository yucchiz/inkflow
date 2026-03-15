import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { PlusIcon } from '@heroicons/react/24/solid';

import { useDocuments } from '@/hooks/useDocuments';
import { createDocument } from '@/lib/document';

export default function Fab() {
  const { addDocument } = useDocuments();
  const navigate = useNavigate();
  const [tapping, setTapping] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button || !tapping) return;

    function handleAnimationEnd() {
      setTapping(false);
    }

    button.addEventListener('animationend', handleAnimationEnd);
    return () => button.removeEventListener('animationend', handleAnimationEnd);
  }, [tapping]);

  async function handleClick() {
    setTapping(true);
    const doc = createDocument();
    await addDocument(doc);
    navigate(`/doc/${doc.id}`);
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="新規ドキュメント作成"
      onClick={handleClick}
      className={[
        'fixed right-[calc(1.5rem+env(safe-area-inset-right))] bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-20 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-(--color-accent) text-white shadow-lg duration-[var(--duration-fast)] hover:scale-105 hover:bg-(--color-accent-hover) focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:outline-none motion-safe:animate-[fab-in_var(--duration-slow)_var(--ease-out)] motion-safe:transition-transform',
        tapping && 'motion-safe:animate-[fab-tap_var(--duration-fast)_var(--ease-in-out)]',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <PlusIcon className="h-7 w-7" />
    </button>
  );
}
