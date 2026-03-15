import { useCallback, useEffect, useRef } from 'react';

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '削除',
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      // Fade-out animation before closing
      dialog.classList.add('closing');
      const timer = setTimeout(() => {
        dialog.classList.remove('closing');
        dialog.close();
      }, 150); // --duration-fast
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onCancel();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onCancel]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      // <dialog> backdrop clicks target the dialog element itself
      if (e.target === dialogRef.current) {
        onCancel();
      }
    },
    [onCancel]
  );

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onClick={handleBackdropClick}
      className="w-full max-w-sm rounded-lg bg-(--color-bg-sub) p-0 shadow-lg backdrop:bg-black/50 motion-safe:backdrop:transition-opacity motion-safe:backdrop:duration-[var(--duration-normal)] motion-safe:open:animate-[dialog-in_var(--duration-normal)_var(--ease-out)]"
    >
      <div className="p-6">
        <h2
          id="confirm-dialog-title"
          className="font-(family-name:--font-heading) text-lg font-bold tracking-[0.04em] text-(--color-text)"
        >
          {title}
        </h2>
        <p id="confirm-dialog-description" className="mt-2 text-sm text-(--color-text-sub)">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-(--color-border) px-4 py-2 text-sm text-(--color-text) hover:bg-(--color-bg) focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:outline-none motion-safe:transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-lg bg-(--color-danger-bg) px-4 py-2 text-sm text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:outline-none motion-safe:transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
