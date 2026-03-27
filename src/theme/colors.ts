export const colors = {
  bg: 'var(--inkflow-bg)',
  bgSub: 'var(--inkflow-bg-sub)',
  text: 'var(--inkflow-text)',
  textSub: 'var(--inkflow-text-sub)',
  border: 'var(--inkflow-border)',
  accent: 'var(--inkflow-accent)',
  accentHover: 'var(--inkflow-accent-hover)',
  danger: 'var(--inkflow-danger)',
  dangerBg: 'var(--inkflow-danger-bg)',
} as const

export type ColorToken = keyof typeof colors
