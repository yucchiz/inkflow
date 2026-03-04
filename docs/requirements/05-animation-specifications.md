# 05 - アニメーション仕様

## 概要

全アニメーションは **CSS Transitions / CSS Animations** で実装する。
複雑なアニメーションが必要な場合のみ `framer-motion` を検討するが、MVP では CSS で十分。

### 基本方針

| 方針 | 詳細 |
|------|------|
| パフォーマンス | `transform` と `opacity` のみアニメーション（レイアウトシフトを避ける） |
| アクセシビリティ | `prefers-reduced-motion: reduce` を尊重し、アニメーションを無効化 |
| 一貫性 | 全体で統一したイージングとデュレーションを使用 |

### 共通トークン

```css
:root {
  /* Duration */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;

  /* Easing */
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);    /* 減速 */
  --ease-in: cubic-bezier(0.4, 0.0, 1, 1);        /* 加速 */
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);  /* 両方 */
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 1. 画面遷移アニメーション

| 遷移 | 種別 | 詳細 |
|------|------|------|
| 一覧 → エディタ | フェードイン | opacity: 0 → 1（200ms, ease-out） |
| エディタ → 一覧 | フェードアウト | opacity: 1 → 0（150ms, ease-in） |

実装: React Router の遷移に合わせて、ページコンポーネントのマウント/アンマウント時に CSS クラスを適用。

---

## 2. ドキュメントカードリスト

### 初回表示（スタガーアニメーション）

ドキュメント一覧の初回描画時、カードが上から順番に登場する。

| パラメータ | 値 |
|-----------|------|
| 種別 | フェードイン + 下方向からスライド |
| 各アイテムの遅延 | 50ms × index（最大10件分まで） |
| duration | 300ms |
| イージング | ease-out |
| 初期状態 | `opacity: 0; transform: translateY(12px)` |
| 最終状態 | `opacity: 1; transform: translateY(0)` |

### カードのホバー（デスクトップ）

| パラメータ | 値 |
|-----------|------|
| 背景色変化 | 200ms ease-in-out |
| 削除ボタン表示 | opacity: 0 → 1（150ms） |

---

## 3. FABアニメーション

| 状態 | アニメーション |
|------|--------------|
| 初回表示 | スケールイン（`scale: 0 → 1`, 300ms, ease-out） |
| ホバー（デスクトップ） | 微かなスケールアップ（`scale: 1 → 1.05`, 150ms） |
| タップ/クリック | スケールダウン → 戻り（`scale: 1 → 0.92 → 1`, 150ms） |

---

## 4. テーマ切替アニメーション

| パラメータ | 値 |
|-----------|------|
| 背景色 | 現テーマ → 新テーマの背景色へ補間（300ms, ease-in-out） |
| テキスト色 | 同上 |
| 実装 | CSS 変数に `transition` を適用。`<body>` に `theme-transitioning` クラスを一時付与 |

```css
body.theme-transitioning,
body.theme-transitioning * {
  transition: background-color var(--duration-slow) var(--ease-in-out),
              color var(--duration-slow) var(--ease-in-out),
              border-color var(--duration-slow) var(--ease-in-out);
}
```

---

## 5. エディタ画面のアニメーション

### 保存ステータス表示

| パラメータ | 値 |
|-----------|------|
| 表示 | フェードイン（opacity: 0 → 1, 150ms） |
| 消滅 | 2秒後にフェードアウト（opacity: 1 → 0, 300ms） |

### 集中モード

| パラメータ | 値 |
|-----------|------|
| ヘッダー非表示 | スライドアップ（`translateY: 0 → -100%`, 200ms, ease-in） |
| ヘッダー復帰 | スライドダウン（`translateY: -100% → 0`, 200ms, ease-out） |
| ステータスバー | フェードアウト/イン（200ms） |

---

## 6. トースト通知アニメーション

| パラメータ | 値 |
|-----------|------|
| 表示 | 下からスライドイン + フェードイン（`translateY: 16px → 0`, opacity: 0 → 1, 200ms, ease-out） |
| 消滅 | フェードアウト（opacity: 1 → 0, 200ms, ease-in）。3秒後に自動開始 |

---

## 7. 確認ダイアログアニメーション

| パラメータ | 値 |
|-----------|------|
| オーバーレイ | フェードイン（opacity: 0 → 1, 200ms） |
| ダイアログ本体 | スケールイン（`scale: 0.95 → 1` + opacity: 0 → 1, 200ms, ease-out） |
| 閉じる | フェードアウト（150ms, ease-in） |

---

## 8. ドロップダウンメニューアニメーション

| パラメータ | 値 |
|-----------|------|
| 表示 | スケールイン（`scale: 0.95 → 1, opacity: 0 → 1`, 150ms, ease-out）。右上を起点 |
| 閉じる | フェードアウト（100ms, ease-in） |
