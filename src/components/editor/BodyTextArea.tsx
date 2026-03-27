import type { ChangeEvent, RefObject } from 'react'
import { useEffect } from 'react'
import './BodyTextArea.css'

interface BodyTextAreaProps {
  value: string
  onChange: (value: string) => void
  textareaRef: RefObject<HTMLTextAreaElement | null>
}

export function BodyTextArea({ value, onChange, textareaRef }: BodyTextAreaProps) {
  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value)
  }

  // Auto-grow fallback for browsers without field-sizing support
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    if (CSS.supports('field-sizing', 'content')) return

    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [value, textareaRef])

  return (
    <textarea
      ref={textareaRef}
      className="body-textarea"
      value={value}
      onChange={handleChange}
      aria-label="本文"
      aria-describedby="body-textarea-desc"
    />
  )
}
