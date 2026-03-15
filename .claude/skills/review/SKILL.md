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
   - CLAUDE.md の Swift コーディング規約に準拠しているか
   - 命名規則（PascalCase for types/protocols, camelCase for properties/functions）
   - View 設計（struct View 準拠、1ファイル1View）
   - ファイル構成とモジュール分割

   ### アクセシビリティ
   - `.accessibilityLabel()` の適切な付与
   - VoiceOver 対応（ナビゲーション順序、操作説明）
   - Dynamic Type 対応
   - `@Environment(\.accessibilityReduceMotion)` によるモーション軽減対応

   ### パフォーマンス
   - View 再計算の効率（不要な body 再評価の回避）
   - `@Observable` のプロパティ粒度（過剰な監視による無駄な再描画の防止）
   - 重い計算の適切なキャッシュ・遅延実行

   ### セキュリティ
   - force unwrap（`!`）の不適切な使用
   - シークレットのハードコード
   - 安全でない `Any` キャスト（`as!` の濫用）

3. **結果報告**:
   - 問題点を重要度（Critical / Warning / Info）で分類
   - 各問題に対する改善提案を提示
   - 良い実装があれば肯定的なコメントも含める

4. **深掘り分析の提案**: レビューで重要な問題を検出した場合、専門エージェントの実行を提案する:
   - アクセシビリティ問題が多い場合 → `a11y-auditor` エージェント
   - パフォーマンス懸念がある場合 → `perf-optimizer` エージェント
   - テスト不足が見つかった場合 → `test-writer` エージェント
