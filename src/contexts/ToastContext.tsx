import { createContext, useCallback, useEffect, useRef, useState } from 'react';

const TOAST_DISPLAY_DURATION = 3000;
const TOAST_FADE_OUT_DURATION = 200;

interface ToastState {
  message: string | null;
  visible: boolean;
}

export interface ToastContextValue {
  state: ToastState;
  showToast: (message: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextValue | null>(null);

type Props = { children: React.ReactNode };

function ToastProvider({ children }: Props) {
  const [state, setState] = useState<ToastState>({
    message: null,
    visible: false,
  });

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (clearTimerRef.current !== null) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string) => {
      clearTimers();

      setState({ message, visible: true });

      hideTimerRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, visible: false }));

        clearTimerRef.current = setTimeout(() => {
          setState({ message: null, visible: false });
        }, TOAST_FADE_OUT_DURATION);
      }, TOAST_DISPLAY_DURATION);
    },
    [clearTimers]
  );

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return <ToastContext.Provider value={{ state, showToast }}>{children}</ToastContext.Provider>;
}

export default ToastProvider;
