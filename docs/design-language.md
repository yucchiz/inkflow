# InkFlow デザインランゲージ

## デザイン哲学: 「墨と余白」

引き算の美学。装飾を削ぎ落とし、文章そのものが主役となる空間をつくる。

### 4原則

1. **余白は語る** — 空間が文章に呼吸を与える。詰め込まない
2. **墨はネイビー** — ネイビー基調の落ち着いたトーンで、テキストの存在感を際立たせる
3. **静けさ** — アニメーションは最小限。動きで気を散らさない
4. **道具は消える** — UIは書く行為を邪魔しない。意識されないことが最良

---

## カラーパレット

「墨はネイビー」原則に基づき、**ネイビー基調**で構成する。グレースケールではなくネイビー系の濃淡で奥行きと静けさを表現する。

| 名称 | 用途 | 値 |
|------|------|-----|
| 深藍 | テキスト基調色（ライト） | `#1A2340` |
| 淡藍 | 背景基調色（ライト） | `#E8EDF5` |
| 紺青 | アクセント（ボタン、リンク） | `#1E40AF` |

### テーマカラー定義

| プロパティ | ライト | ダーク |
|-----------|--------|--------|
| `Color.InkFlow.bg` | `#E8EDF5` | `#0C1525` |
| `Color.InkFlow.bgSub` | `#F0F3F9` | `#162038` |
| `Color.InkFlow.text` | `#1A2340` | `#E2E8F4` |
| `Color.InkFlow.textSub` | `#5C6785` | `#8A95B0` |
| `Color.InkFlow.border` | `#C8D0E0` | `#253050` |
| `Color.InkFlow.accent` | `#1E40AF` | `#2D6CD6` |
| `Color.InkFlow.accentHover` | `#1E3A8A` | `#3570D4` |
| `Color.InkFlow.danger` | `#B91C1C` | `#F45252` |
| `Color.InkFlow.dangerBg` | `#B91C1C` | `#DC2626` |

> 全テキスト・背景の組み合わせで WCAG AA コントラスト比 4.5:1 以上を保証すること。

### 色に頼らない区別の原則

- **破壊的操作**（削除）: trash (SF Symbol) の形状 + 確認ダイアログのテキストで明示。色での警告は行わない
- **FAB**: `Color.InkFlow.text` 背景 + `Color.InkFlow.bg` アイコン色（反転コントラスト）で視認性を確保
- **フォーカスリング**: SwiftUI 標準のフォーカスリング（`.focusable()` + `@FocusState`）を使用。アクセシビリティ設定に自動追従

---

## タイポグラフィ

| 用途 | フォント | ウェイト | 文字間隔 (tracking) |
|------|---------|---------|---------------------|
| 本文 | Noto Serif JP | 400 | 0.32pt |
| タイトル | Noto Sans JP | 700 | 0.64pt |
| UI要素 | システムフォント (San Francisco) | 400 | 0.32pt |

### フォントスタック

```swift
// 本文
Font.custom("NotoSerifJP-Regular", size: 16)
// UI
Font.system(.body)  // San Francisco
```

Noto Serif JP 400 をアプリにバンドル。UI はシステムフォント（San Francisco）を使用。使用ウェイトのみ（400, 700）をバンドルする。

---

## アイコン

**ライブラリ**: SF Symbols / Regular

### 使用アイコン一覧

| 用途 | SF Symbol |
|------|-----------|
| FAB（新規作成） | `plus` |
| 削除ボタン | `trash` |
| 戻るボタン | `chevron.left` |
| メニューボタン | `ellipsis.circle` |
| クリップボードコピー | `doc.on.doc` |
| 共有 | `square.and.arrow.up` |
| ライトテーマ | `sun.max` |
| ダークテーマ | `moon` |
| システムテーマ | `desktopcomputer` |
| 集中モード開始 | `arrow.down.right.and.arrow.up.left` |
| 集中モード解除 | `arrow.up.left.and.arrow.down.right` |
| 空状態 | `pencil` |

---

## スペーシング

4px 基準のスケール。

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

| 環境 | 条件 | レイアウト方針 |
|------|------|--------------|
| iPhone | `.compact` horizontal | 単一カラム。セーフエリアに適応 |
| iPad | `.regular` horizontal | 余白を広めに。将来的に NavigationSplitView 対応 |
| macOS | ウィンドウサイズ | コンテンツ最大幅制限、中央配置 |

---

## トーン & マナー

- **印象**: 落ち着き・静寂・気品
- **角丸**: `.cornerRadius(8)`（8pt）
- **影**: 最小限。カード等に `.shadow(radius: 2)` 程度
- **マイクロコピー**: 丁寧語で簡潔に（例: 「保存しました」「削除しますか？」）

---

## 実装ガイドライン

### FAB タップアニメーション

```swift
Button { action() } label: {
    Image(systemName: "plus")
}
.scaleEffect(isPressed ? 0.92 : 1.0)
.animation(.easeInOut(duration: 0.15), value: isPressed)
```

### TextEditor 高さ自動拡張

SwiftUI の `TextEditor` はコンテンツに合わせて自動拡張される（明示的な高さ調整は不要）。
