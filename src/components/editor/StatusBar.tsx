type Props = {
  charCount: number;
  visible?: boolean;
};

export default function StatusBar({ charCount, visible = true }: Props) {
  return (
    <footer
      aria-label="ステータスバー"
      className={`sticky bottom-0 bg-(--color-bg)/95 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] font-(family-name:--font-ui) text-xs text-(--color-text-sub) backdrop-blur-sm motion-safe:transition-opacity motion-safe:duration-[200ms] ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <span aria-live="polite" aria-atomic="true">
        {charCount.toLocaleString('ja-JP')} 文字
      </span>
    </footer>
  );
}
