---
name: check-specs
description: 現在の変更差分が仕様書に合致しているか検証する
context: fork
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff:*)
---

# 仕様適合チェック

現在の変更差分を仕様書と照合し、差異を指摘する。

## 手順

1. **変更差分の取得**: `git diff` でステージング済み＋未ステージングの変更を取得する

2. **関連仕様書の特定**: 変更されたファイルの内容に基づき、`docs/requirements/` から関連する仕様書を読み込む:
   - `01-functional-requirements.md` — 機能要件
   - `02-non-functional-requirements.md` — 非機能要件
   - `03-screen-specifications.md` — 画面仕様
   - `04-data-specifications.md` — データ仕様
   - `05-animation-specifications.md` — アニメーション仕様

3. **検証**: 以下の観点でチェックする:
   - 機能が仕様通りに実装されているか
   - データモデルが仕様に合致しているか
   - 画面レイアウト・操作フローが仕様と一致しているか
   - アニメーション仕様が守られているか
   - 非機能要件（パフォーマンス基準等）への影響

4. **結果報告**:
   - 仕様に合致している点
   - 仕様との差異・未実装の項目
   - 改善提案（あれば）
