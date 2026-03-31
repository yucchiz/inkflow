# InkFlow デザインランゲージ

## デザイン哲学: 「Digital Atelier」

作家のアトリエ。道具は美しいが主張しない。書いた文字が主役。

### 4原則

1. **余白は語る** — 空間が文章に呼吸を与える。詰め込まない
2. **インクの知性** — インディゴ（ink の語源）をアクセントに、知性と創造性を表現する
3. **心地よい手触り** — Spring アニメーションと Glassmorphism で上質なインタラクションを提供する
4. **道具は消える** — UIは書く行為を邪魔しない。意識されないことが最良

---

## カラーパレット

Apple Human Interface Guidelines のカラーシステムをベースに、**クールニュートラル + インディゴアクセント** で構成。温かみと知性のバランスを取る。

| 名称 | 用途 | 値 |
|------|------|-----|
| テキスト | テキスト基調色（ライト） | `#1C1C1E` |
| 背景 | 背景基調色（ライト） | `#FAFAFA` |
| インディゴ | アクセント（ボタン、FAB） | `#5856D6` |

### テーマカラー定義

CSS カスタムプロパティ `var(--inkflow-*)` で参照する。

| プロパティ | ライト | ダーク |
|-----------|--------|--------|
| `--inkflow-bg` | `#FAFAFA` | `#161618` |
| `--inkflow-bg-sub` | `#F2F2F0` | `#1C1C1E` |
| `--inkflow-text` | `#1C1C1E` | `#E5E5E7` |
| `--inkflow-text-sub` | `#8E8E93` | `#8E8E93` |
| `--inkflow-border` | `#E5E5EA` | `#38383A` |
| `--inkflow-accent` | `#5856D6` | `#7B79E8` |
| `--inkflow-accent-hover` | `#4A48C4` | `#9594F0` |
| `--inkflow-danger` | `#FF3B30` | `#FF453A` |
| `--inkflow-danger-bg` | `#FF3B30` | `#FF453A` |

### Elevation System（影の4段階）

| レベル | 用途 | Light |
|--------|------|-------|
| shadow-1 | カード | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)` |
| shadow-2 | メニュー、ホバー | `0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)` |
| shadow-3 | ダイアログ | `0 12px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04)` |

### Glassmorphism

メニューやダイアログに半透明 + ブラーで奥行きを表現。

```css
background: var(--inkflow-glass-bg);        /* rgba(255,255,255,0.78) */
backdrop-filter: blur(20px) saturate(180%);
border: 0.5px solid var(--inkflow-glass-border);
```

> 全テキスト・背景の組み合わせで WCAG AA コントラスト比 4.5:1 以上を保証すること。

### 色に頼らない区別の原則

- **破壊的操作**（削除）: Trash2 アイコンの形状 + 確認ダイアログのテキストで明示
- **FAB**: インディゴ背景 + 白アイコン + 色付きシャドウで浮遊感を表現
- **フォーカスリング**: `2px solid var(--inkflow-accent)` + `outline-offset: 2px`

---

## タイポグラフィ

| 用途 | フォント | ウェイト | 文字間隔 |
|------|---------|---------|----------|
| 本文 | Noto Serif JP | 400 | 0.04em |
| タイトル | system-ui / Hiragino Sans / Noto Sans JP | 700 | 0.02em |
| UI要素 | system-ui / Hiragino Sans / Noto Sans JP | 400-500 | デフォルト |

### フォントスタック

```css
/* 本文（書く場所だけが特別） */
font-family: 'Noto Serif JP', serif;

/* タイトル・UI */
font-family: system-ui, -apple-system, 'Hiragino Sans', 'Noto Sans JP', sans-serif;
```

本文のみセリフ体で「紙の質感」を演出し、UIはシステムフォントで軽快さを保つ。Google Fonts で Noto Serif JP (400, 700) を読み込み。

### サイズ

| 要素 | Mobile | Desktop (768px+) |
|------|--------|------------------|
| 本文 | 17px / line-height 1.9 | 18px / line-height 2.0 |
| タイトル | 1.5rem / weight 700 | 1.5rem / weight 700 |
| カードタイトル | 1.0625rem / weight 600 | 1.0625rem / weight 600 |
| カード本文 | 0.875rem | 0.875rem |
| UI・キャプション | 0.75rem | 0.75rem |

---

## アイコン

**ライブラリ**: lucide-react

### 使用アイコン一覧

| 用途 | アイコン名 |
|------|-----------|
| 新規作成（FAB） | `Plus` |
| 削除 | `Trash2` |
| 戻る | `ChevronLeft` |
| メニュー | `MoreHorizontal` |
| クリップボードコピー | `Copy` |
| 共有 | `Share` |
| ライトテーマ | `Sun` |
| ダークテーマ | `Moon` |
| システムテーマ | `Monitor` |
| 集中モード開始 | `Maximize2` |
| 集中モード解除 | `Minimize2` |
| 空状態 | `PenLine` |

---

## スペーシング

4pt 基準のスケール。

| トークン | 値 | 主な用途 |
|---------|------|----------|
| `1` | 4pt | アイコンとラベルの間隔 |
| `2` | 8pt | 要素内パディング（小）、カード間 gap |
| `3` | 12pt | 要素内パディング（中） |
| `4` | 16pt | カード内パディング、モバイル左右余白 |
| `5` | 20pt | カード内横パディング、エディタ横余白 |
| `6` | 24pt | セクション間の間隔、エディタ横余白（タブレット） |
| `8` | 32pt | ページ上下余白 |
| `12` | 48pt | 大きなセクション間 |
| `16` | 64pt | ページ最大余白 |

---

## 角丸（border-radius）

| 要素 | 値 |
|------|-----|
| カード | 12px |
| メニュー | 14px |
| ダイアログ | 16px |
| FAB | 16px |
| ボタン（汎用） | 8px |
| ボタン（ダイアログ内） | 10px |
| テーマボタン | 8px |
| トースト | 12px |

---

## アニメーション

### イージング関数

| 名称 | 値 | 用途 |
|------|-----|------|
| Spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | FAB タップ、トースト表示 |
| Smooth | `cubic-bezier(0.25, 0.1, 0.25, 1.0)` | カード操作、テーマ切替 |
| Ease-out | `cubic-bezier(0.0, 0.0, 0.2, 1.0)` | ヘッダー/ステータスバー表示切替 |

### タイミング

| 操作 | 時間 | イージング |
|------|------|-----------|
| FAB タップ | 240ms | Spring |
| カードホバー | 180ms | Smooth |
| メニュー表示 | 120ms | ease |
| テーマ切替 | 350ms | Smooth |
| トースト表示 | 280ms | Spring |
| ヘッダー表示/非表示 | 250ms | Ease-out |

### `prefers-reduced-motion`

すべてのアニメーションは `prefers-reduced-motion: reduce` を尊重し、無効化またはフェードのみに簡略化する。

---

## トーン & マナー

- **印象**: 知性・静寂・上質
- **マイクロコピー**: 丁寧語で簡潔に（例: 「保存しました」「削除しますか？」）
