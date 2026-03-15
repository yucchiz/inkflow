type Props = {
  show: boolean;
  onUpdate: () => void;
};

export default function UpdateNotification({ show, onUpdate }: Props) {
  if (!show) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 rounded-lg bg-(--color-bg-sub) px-4 py-3 shadow-lg motion-safe:animate-[toast-in_200ms_var(--ease-out)]"
    >
      <div className="flex items-center gap-3 font-(family-name:--font-ui) text-sm text-(--color-text)">
        <span>新しいバージョンが利用可能です</span>
        <button
          type="button"
          onClick={onUpdate}
          className="cursor-pointer rounded-md bg-(--color-accent) px-3 py-1 text-sm text-white hover:bg-(--color-accent-hover) focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:outline-none motion-safe:transition-colors"
        >
          更新する
        </button>
      </div>
    </div>
  );
}
