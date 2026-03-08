---
name: new-component
description: プロジェクト規約に沿ったReactコンポーネントとテストファイルを生成する
arguments:
  - name: component_name
    description: 生成するコンポーネント名（PascalCase）
    required: true
---

# 新規コンポーネント生成

以下の手順で新規コンポーネントを生成する:

## 手順

1. **仕様確認**: `docs/PRD.md` のセクション3（画面仕様）を読み込み、`$ARGUMENTS` に関連する仕様を確認する

2. **配置先決定**: コンポーネント名から適切なディレクトリを判断する:
   - エディタ関連 → `src/components/editor/`
   - 一覧画面関連 → `src/components/document-list/`
   - 共通UI → `src/components/common/`
   - ページ → `src/pages/`

3. **コンポーネントファイル生成**: 以下の規約に従う:
   - 関数宣言（`React.FC` 不使用）
   - Props型は `type Props = { ... }` で同ファイル内定義
   - セマンティックHTML使用
   - aria属性・キーボード操作対応
   - Tailwind CSS v4 でスタイリング
   - default export

4. **テストファイル生成**: コンポーネントと同じディレクトリに `ComponentName.test.tsx` を生成:
   - Testing Library 使用
   - `getByRole` 優先のクエリ
   - ユーザー操作ベースのテスト
   - 基本的なレンダリングテスト + 主要なインタラクションテスト

5. **品質チェック（オプション）**: コンポーネントの品質を高めるため、以下のエージェントの実行をユーザーに提案する:
   - `test-writer` — より網羅的なテストケースの追加
   - `a11y-auditor` — アクセシビリティの深掘り監査

## 出力

生成したファイルのパスと、仕様書から読み取った要件のサマリーを報告する。
品質チェックのためのエージェント実行提案も含める。
