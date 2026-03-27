import { createContext, useContext, useCallback, useRef, useState, type ReactNode } from 'react'
import { TOAST_DURATION_MS } from '@/utils/constants'

interface ToastMessage {
  id: string
  text: string
}

interface ToastContextValue {
  currentToast: ToastMessage | null
  show: (text: string) => void
  dismiss: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = useCallback(() => {
    setCurrentToast(null)
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const show = useCallback(
    (text: string) => {
      // Cancel previous timer
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }

      const id = crypto.randomUUID()
      setCurrentToast({ id, text })

      timerRef.current = setTimeout(() => {
        setCurrentToast(null)
        timerRef.current = null
      }, TOAST_DURATION_MS)
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ currentToast, show, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}
