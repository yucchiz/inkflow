import type { ChangeEvent, KeyboardEvent } from 'react'
import { MAX_TITLE_LENGTH } from '@/utils/constants'
import './TitleInput.css'

interface TitleInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export function TitleInput({ value, onChange, onSubmit }: TitleInputProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value.slice(0, MAX_TITLE_LENGTH)
    onChange(newValue)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="タイトル"
      maxLength={MAX_TITLE_LENGTH}
      aria-label="タイトル"
      aria-describedby="title-input-desc"
      className="title-input"
    />
  )
}
