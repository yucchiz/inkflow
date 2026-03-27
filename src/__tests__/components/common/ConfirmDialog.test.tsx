/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

// jsdom does not implement showModal/close natively
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  })
})

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: '削除の確認',
    message: 'このドキュメントを削除しますか？',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  it('isOpen=true のときダイアログが開くこと', () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
  })

  it('タイトルとメッセージが表示されること', () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText('削除の確認')).toBeInTheDocument()
    expect(screen.getByText('このドキュメントを削除しますか？')).toBeInTheDocument()
  })

  it('デフォルトの確認ボタンラベルが「削除」であること', () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText('削除')).toBeInTheDocument()
  })

  it('confirmLabel でカスタムラベルを指定できること', () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="実行" />)

    expect(screen.getByText('実行')).toBeInTheDocument()
  })

  it('キャンセルボタンが「キャンセル」であること', () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText('キャンセル')).toBeInTheDocument()
  })

  it('確認ボタンをクリックすると onConfirm が呼ばれること', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)

    await user.click(screen.getByText('削除'))

    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('キャンセルボタンをクリックすると onCancel が呼ばれること', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)

    await user.click(screen.getByText('キャンセル'))

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('aria-labelledby と aria-describedby が設定されていること', () => {
    render(<ConfirmDialog {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title')
    expect(dialog).toHaveAttribute('aria-describedby', 'confirm-dialog-message')
  })
})
