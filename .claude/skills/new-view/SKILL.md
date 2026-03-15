---
name: new-view
description: プロジェクト規約に沿ったSwiftUI ViewとテストファイルをSources/InkFlowKit/Views/配下に生成する
arguments:
  - name: view_name
    description: 生成するView名（PascalCase、Viewサフィックス付き推奨）
    required: true
---

# 新規 SwiftUI View 生成

以下の手順で新規 View を生成する:

## 手順

1. **仕様確認**: `docs/PRD.md` のセクション3（画面仕様）を読み込み、`$ARGUMENTS` に関連する仕様を確認する

2. **配置先決定**: View 名から適切なディレクトリを判断する:
   - エディタ関連 → `Sources/InkFlowKit/Views/Editor/`
   - 一覧画面関連 → `Sources/InkFlowKit/Views/DocumentList/`
   - 共通UI → `Sources/InkFlowKit/Views/Common/`

3. **View ファイル生成**: 以下の規約に従う:
   - `struct` で `View` protocol に準拠
   - プロパティは stored property として定義
   - `.accessibilityLabel()` 等のアクセシビリティ修飾子を付与
   - SwiftUI modifier でスタイリング
   - `Color.InkFlow` トークンを使用
   - `#Preview` マクロを含める

4. **テストファイル生成**: `Tests/InkFlowKitTests/` 配下に `ViewNameTests.swift` を生成:
   - Swift Testing フレームワーク使用
   - `@Test` でテスト関数を定義
   - `@Suite` でテストスイートをグループ化
   - `#expect` でアサーション

5. **品質チェック（オプション）**: View の品質を高めるため、以下のエージェントの実行をユーザーに提案する:
   - `test-writer` — より網羅的なテストケースの追加
   - `a11y-auditor` — アクセシビリティの深掘り監査

## 出力

生成したファイルのパスと、仕様書から読み取った要件のサマリーを報告する。
品質チェックのためのエージェント実行提案も含める。
