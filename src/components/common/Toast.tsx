import { useEffect, useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { useReduceMotion } from '@/hooks/useReduceMotion'
import './Toast.css'

interface ToastProps {
  id: string
  text: string
}

function Toast({ text }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const reduceMotion = useReduceMotion()

  useEffect(() => {
    // Trigger enter animation on next frame
    const frame = requestAnimationFrame(() => {
      setVisible(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      className={`toast ${visible ? 'toast--visible' : ''} ${reduceMotion ? 'toast--reduce-motion' : ''}`}
      role="status"
      aria-live="polite"
    >
      {text}
    </div>
  )
}

export function ToastOverlay() {
  const { currentToast } = useToast()

  if (!currentToast) {
    return null
  }

  return (
    <div className="toast-overlay">
      <Toast key={currentToast.id} id={currentToast.id} text={currentToast.text} />
    </div>
  )
}
