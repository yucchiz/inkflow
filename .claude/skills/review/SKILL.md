---
name: review
description: 変更差分をレビューし、規約・アクセシビリティ・パフォーマンス・セキュリティの観点で問題点を指摘する
context: fork
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff:*)
  - Bash(git diff --cached:*)
  - Bash(git log:*)
  - Bash(git status:*)
---

# コードレビュー

現在の変更差分に対して多角的なレビューを実施する。

## 手順

1. **変更差分の取得**: `git diff` および `git diff --cached` でステージング済み＋未ステージングの全変更を取得する

2. **レビュー観点**:

   ### コーディング規約
   - CLAUDE.md のコーディング規約に準拠しているか
   - 命名規則（PascalCase, camelCase, UPPER_SNAKE_CASE）
   - コンポーネント設計（関数宣言、Props型定義、1ファイル1コンポーネント）
   - インポート順序

   ### アクセシビリティ
   - セマンティックHTML の使用
   - aria属性の適切な付与
   - キーボード操作対応
   - フォーカス管理
   - `prefers-reduced-motion` 対応

   ### パフォーマンス
   - 不要な再レンダリングの原因（インラインオブジェクト/関数の props 渡し等）
   - バンドルサイズへの影響（大きなライブラリの追加等）
   - `transform` + `opacity` 以外のアニメーションプロパティ使用

   ### セキュリティ
   - XSS 脆弱性（`dangerouslySetInnerHTML` 不使用）
   - ユーザー入力のサニタイズ
   - シークレットのハードコード

3. **結果報告**:
   - 問題点を重要度（Critical / Warning / Info）で分類
   - 各問題に対する改善提案を提示
   - 良い実装があれば肯定的なコメントも含める
