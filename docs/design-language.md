# InkFlow デザインランゲージ

## デザイン哲学: 「墨と余白」

引き算の美学。装飾を削ぎ落とし、文章そのものが主役となる空間をつくる。

### 4原則

1. **余白は語る** — 空間が文章に呼吸を与える。詰め込まない
2. **墨は一色** — 色数を極限まで絞り、テキストの存在感を際立たせる
3. **静けさ** — アニメーションは最小限。動きで気を散らさない
4. **道具は消える** — UIは書く行為を邪魔しない。意識されないことが最良

---

## カラーパレット

| 名称 | 用途 | 値 |
|------|------|-----|
| 墨黒 | テキスト基調色 | `#1F2937` (gray-800) |
| 薄墨 | 背景基調色（ライト） | `#F3F4F6` (gray-100) |
| 紺青 | アクセント（FAB、リンク） | `#1E40AF` (blue-800) |
| 赤 | 破壊的操作（削除ボタン） | `#DC2626` (red-600) |

### テーマ CSS変数

| 変数名 | ライト | ダーク |
|--------|--------|--------|
| `--color-bg` | `#F3F4F6` (gray-100) | `#111827` (gray-900) |
| `--color-bg-sub` | `#FFFFFF` (white) | `#1F2937` (gray-800) |
| `--color-text` | `#1F2937` (gray-800) | `#F3F4F6` (gray-100) |
| `--color-text-sub` | `#6B7280` (gray-500) | `#9CA3AF` (gray-400) |
| `--color-border` | `#E5E7EB` (gray-200) | `#374151` (gray-700) |
| `--color-accent` | `#1E40AF` (blue-800) | `#3B82F6` (blue-500) |
| `--color-accent-hover` | `#1E3A8A` (blue-900) | `#60A5FA` (blue-400) |
| `--color-danger` | `#DC2626` (red-600) | `#EF4444` (red-500) |

> 全テキスト・背景の組み合わせで WCAG AA コントラスト比 4.5:1 以上を保証すること。

---

## タイポグラフィ

| 用途 | フォント | ウェイト | letter-spacing |
|------|---------|---------|----------------|
| 本文 | Noto Serif JP | 400 | 0.02em |
| タイトル | Noto Sans JP | 700 | 0.04em |
| UI要素 | Noto Sans JP | 400 | 0.02em |

### フォントスタック

```css
--font-body: "Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif;
--font-heading: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
--font-ui: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
```

Google Fonts CDN で読み込み。`display=swap` 指定。使用ウェイトのみ（400, 700）をロードする。

---

## アイコン

**ライブラリ**: Heroicons v2 / Outline / 20px / `currentColor`

### MVP使用アイコン一覧

| アイコン名 | 用途 |
|-----------|------|
| `PlusIcon` | FAB（新規作成） |
| `TrashIcon` | 削除ボタン |
| `ArrowLeftIcon` | 戻るボタン |
| `EllipsisVerticalIcon` | メニューボタン |
| `ClipboardDocumentIcon` | クリップボードコピー |
| `ArrowDownTrayIcon` | ダウンロード |
| `SunIcon` | ライトテーマ |
| `MoonIcon` | ダークテーマ |
| `ArrowsPointingInIcon` | 集中モード開始 |
| `ArrowsPointingOutIcon` | 集中モード解除 |

---

## トーン & マナー

- **印象**: 落ち着き・静寂・気品
- **角丸**: `8px`（`rounded-lg`）
- **影**: 最小限。カード等に `shadow-sm` 程度
- **マイクロコピー**: 丁寧語で簡潔に（例: 「保存しました」「削除しますか？」）

---

## 実装ガイドライン

### FABタップアニメーション

```css
@keyframes fab-tap {
  0%   { transform: scale(1); }
  50%  { transform: scale(0.92); }
  100% { transform: scale(1); }
}
/* duration: 150ms, easing: ease-in-out */
```

### textarea 高さ自動拡張

```typescript
function adjustHeight(textarea: HTMLTextAreaElement) {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}
```
