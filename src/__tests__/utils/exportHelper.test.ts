import { describe, it, expect, vi, beforeEach } from 'vitest'
import { copyToClipboard, exportText, shareText } from '@/utils/exportHelper'

describe('exportText', () => {
  it('タイトルと本文を結合すること', () => {
    expect(exportText('タイトル', '本文')).toBe('タイトル\n\n本文')
  })

  it('タイトルが空の場合は本文のみ返すこと', () => {
    expect(exportText('', '本文のみ')).toBe('本文のみ')
  })

  it('本文が空の場合はタイトル + 改行を返すこと', () => {
    expect(exportText('タイトル', '')).toBe('タイトル\n\n')
  })

  it('両方空の場合は空文字を返すこと', () => {
    expect(exportText('', '')).toBe('')
  })

  it('複数行の本文が正しく保持されること', () => {
    const body = '1行目\n2行目\n3行目'
    expect(exportText('見出し', body)).toBe('見出し\n\n1行目\n2行目\n3行目')
  })
})

describe('copyToClipboard', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('navigator.clipboard.writeText を呼び出すこと', async () => {
    await copyToClipboard('テスト文字列')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('テスト文字列')
  })
})

describe('shareText', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('navigator.share が利用可能な場合に share を呼び出すこと', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { share: shareMock })

    const result = await shareText('タイトル', '本文')

    expect(shareMock).toHaveBeenCalledWith({
      title: 'タイトル',
      text: 'タイトル\n\n本文',
    })
    expect(result).toBe(true)

    // Clean up
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
  })

  it('navigator.share が未定義の場合はクリップボードにフォールバックすること', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })

    const result = await shareText('タイトル', '本文')

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('タイトル\n\n本文')
    expect(result).toBe(true)
  })

  it('share が失敗した場合に false を返すこと', async () => {
    const shareMock = vi.fn().mockRejectedValue(new Error('User cancelled'))
    Object.assign(navigator, { share: shareMock })

    const result = await shareText('タイトル', '本文')
    expect(result).toBe(false)

    // Clean up
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
  })
})
