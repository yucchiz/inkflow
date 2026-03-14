---
globs: ['src/components/**/*.tsx', 'src/pages/**/*.tsx']
---

# React コンポーネント規約

## コンポーネント定義

- 関数宣言を使用する（`React.FC` は使わない）
- Props型は同ファイル内で `type Props = { ... }` として定義
- 1ファイル1コンポーネントを厳守
- default export を使用

## HTML・アクセシビリティ

- セマンティックHTML必須（`<main>`, `<nav>`, `<section>`, `<button>`, `<article>` 等）
- `<div>` の乱用を避ける — 意味のある要素を選択する
- インタラクティブ要素には適切な `aria-*` 属性を付与
- キーボード操作対応（`Tab`, `Enter`, `Escape` 等）
- フォーカス管理を適切に行う

## スタイリング

- Tailwind CSS v4 のユーティリティクラスを使用
- インラインスタイルは原則不使用

## アニメーション

- CSS アニメーションは `transform` + `opacity` のみ使用（レイアウトシフト回避）
- `prefers-reduced-motion: reduce` メディアクエリに対応する
- `motion-safe:` / `motion-reduce:` Tailwind バリアントを活用
