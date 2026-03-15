import { useCallback, useEffect, useRef, useState } from 'react';

const HEADER_ZONE_HEIGHT = 60;

type UseFocusModeReturn = {
  isFocusMode: boolean;
  showControls: boolean;
  toggleFocusMode: () => void;
};

export function useFocusMode(): UseFocusModeReturn {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const rafPendingRef = useRef(false);
  const rafIdRef = useRef(0);

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => {
      // Entering focus mode hides controls; leaving restores them
      setShowControls(prev);
      return !prev;
    });
  }, []);

  // Event listeners are only registered when isFocusMode is true
  useEffect(() => {
    if (!isFocusMode) return;

    function handleMouseMove(e: MouseEvent) {
      if (rafPendingRef.current) return;

      rafPendingRef.current = true;
      rafIdRef.current = requestAnimationFrame(() => {
        rafPendingRef.current = false;
        setShowControls(e.clientY <= HEADER_ZONE_HEIGHT);
      });
    }

    function handleTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      if (touch && touch.clientY <= HEADER_ZONE_HEIGHT) {
        setShowControls((prev) => !prev);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsFocusMode(false);
        setShowControls(true);
      }
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('keydown', handleKeyDown);

      if (rafPendingRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafPendingRef.current = false;
      }
    };
  }, [isFocusMode]);

  return { isFocusMode, showControls, toggleFocusMode };
}
