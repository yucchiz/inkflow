import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

const EXIT_DURATION = 150;

/**
 * Hook to delay navigation until a page exit animation completes.
 *
 * Applies a fade-out CSS class for 150ms before calling `navigate()`.
 * Guards against double-invocation and cleans up the timer on unmount.
 *
 * @returns `isExiting` - whether the exit animation is currently playing
 * @returns `navigateWithTransition` - triggers fade-out then navigates
 */
export function usePageTransition() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const navigateWithTransition = useCallback(
    (to: string) => {
      if (isExiting) return;
      setIsExiting(true);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        navigate(to);
      }, EXIT_DURATION);
    },
    [isExiting, navigate]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { isExiting, navigateWithTransition };
}
