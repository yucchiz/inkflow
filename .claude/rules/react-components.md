---
globs: ['src/components/**/*.tsx', 'src/App.tsx']
---

# React コンポーネント規約

## コンポーネント定義
- 関数コンポーネントのみ使用する（クラスコンポーネント禁止）
- 1ファイル1コンポーネントを基本とする
- Props は interface で定義し、コンポーネントと同ファイルに置く
- default export を使用する

## アクセシビリティ
- インタラクティブ要素には `aria-label` を付与する
- 操作の補足が必要な要素には `aria-description` を付与する
- 状態を伝える要素には `aria-live` を使用する
- セマンティック HTML を優先する（`<button>`, `<dialog>`, `<nav>` 等）
- `prefers-reduced-motion` でアニメーションを制御する

## スタイリング
- CSS カスタムプロパティ `var(--inkflow-*)` でカラーを指定する
- システム標準の `color` を直接使用しない
- lucide-react をアイコンとして使用する
- CSS Modules ではなく、コンポーネント名.css ファイルを使用する

## アニメーション
- CSS `transition` / `@keyframes` を使用する
- `prefers-reduced-motion: reduce` を確認し、有効時はアニメーションを無効化またはシンプルにする
- `opacity` と `transform` を優先する（レイアウトシフトを避ける）
