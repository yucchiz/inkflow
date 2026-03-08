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

「墨は一色」原則に基づき、**完全モノクローム**で構成する。アクセント色・危険色は使用せず、グレースケールの濃淡 + アイコン形状・テキストラベルで意味を伝える。

| 名称 | 用途 | 値 |
|------|------|-----|
| 墨黒 | テキスト基調色 | `#1F2937` (gray-800) |
| 薄墨 | 背景基調色（ライト） | `#F3F4F6` (gray-100) |
| 濃墨 | インタラクティブ要素（FAB、ボタン） | `#374151` (gray-700) |

### テーマ CSS変数

| 変数名 | ライト | ダーク |
|--------|--------|--------|
| `--color-bg` | `#F3F4F6` (gray-100) | `#111827` (gray-900) |
| `--color-bg-sub` | `#FFFFFF` (white) | `#1F2937` (gray-800) |
| `--color-text` | `#1F2937` (gray-800) | `#F3F4F6` (gray-100) |
| `--color-text-sub` | `#6B7280` (gray-500) | `#9CA3AF` (gray-400) |
| `--color-border` | `#E5E7EB` (gray-200) | `#374151` (gray-700) |
| `--color-interactive` | `#374151` (gray-700) | `#D1D5DB` (gray-300) |
| `--color-interactive-hover` | `#111827` (gray-900) | `#F3F4F6` (gray-100) |

> 全テキスト・背景の組み合わせで WCAG AA コントラスト比 4.5:1 以上を保証すること。

### 色に頼らない区別の原則

- **破壊的操作**（削除）: TrashIcon の形状 + 確認ダイアログのテキストで明示。色での警告は行わない
- **FAB**: `--color-text` 背景 + `--color-bg` アイコン色（反転コントラスト）で視認性を確保
- **フォーカスリング**: `2px solid var(--color-text)` + `2px offset`

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
| `ComputerDesktopIcon` | システムテーマ |
| `ArrowsPointingInIcon` | 集中モード開始 |
| `ArrowsPointingOutIcon` | 集中モード解除 |
| `PencilIcon` | 空状態（EmptyState） |

---

## スペーシング

4px 基準のスケール。Tailwind CSS のデフォルトスペーシングに準拠する。

| トークン | 値 | 主な用途 |
|---------|------|----------|
| `1` | 4px | アイコンとラベルの間隔 |
| `2` | 8px | 要素内パディング（小） |
| `3` | 12px | 要素内パディング（中） |
| `4` | 16px | カード内パディング、モバイル左右余白 |
| `6` | 24px | セクション間の間隔 |
| `8` | 32px | ページ上下余白 |
| `12` | 48px | 大きなセクション間 |
| `16` | 64px | ページ最大余白 |

---

## ブレークポイント

| 名称 | 幅 | レイアウト方針 |
|------|------|---------------|
| モバイル | 〜767px | 単一カラム。左右 padding: 16px |
| タブレット | 768px〜1023px | 単一カラム。余白を広めに |
| デスクトップ | 1024px〜 | 単一カラム。コンテンツ最大幅制限、中央配置 |

> PRD 2.2 のレスポンシブデザイン仕様と一致すること。

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
