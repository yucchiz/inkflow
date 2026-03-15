import { useEffect, useRef, useState } from 'react';

/**
 * Hook to delay unmounting until a closing animation completes.
 *
 * When `open` transitions from true to false, the hook keeps `visible` as true
 * for the specified `duration` (in ms), allowing a CSS exit animation to play
 * before the element is removed from the DOM.
 *
 * @returns `visible` - whether the element should be in the DOM
 * @returns `closing` - whether the exit animation is currently playing
 */
export function useDelayedClose(
  open: boolean,
  duration: number
): { visible: boolean; closing: boolean } {
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (open) {
      // If we were in a closing animation, cancel it
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronizing with animation lifecycle: reset closing state when re-opened
      setClosing(false);
    }
  }, [open]);

  // Start closing animation when open transitions from true to false
  const prevOpenRef = useRef(open);
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;

    if (wasOpen && !open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronizing with animation lifecycle: trigger exit animation
      setClosing(true);
      timerRef.current = setTimeout(() => {
        setClosing(false);
        timerRef.current = null;
      }, duration);
    }
  }, [open, duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { visible: open || closing, closing };
}
