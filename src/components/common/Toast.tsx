import { useToast } from '@/hooks/useToast';

function Toast() {
  const { state } = useToast();

  if (!state.message) {
    return null;
  }

  const animationClass = state.visible
    ? 'translate-y-0 opacity-100 ease-(--ease-out)'
    : 'translate-y-4 opacity-0 ease-(--ease-in)';

  return (
    <output
      role="status"
      aria-live="polite"
      className={`fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-lg bg-(--color-bg-sub) px-4 py-3 font-(family-name:--font-ui) text-sm text-(--color-text) shadow-lg motion-safe:transition-[transform,opacity] motion-safe:duration-[200ms] ${animationClass}`}
    >
      {state.message}
    </output>
  );
}

export default Toast;
