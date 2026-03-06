---
globs: ["**/*.test.ts", "**/*.test.tsx"]
---

# テスト規約

## Testing Library ベストプラクティス
- クエリの優先順位: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- `getByTestId` は最終手段 — セマンティックなクエリを優先する
- `screen` オブジェクトを使用してクエリを呼び出す

## テスト設計
- ユーザー操作ベースのテストを書く（実装詳細に依存しない）
- 「ユーザーが何を見て、何をするか」の観点でテストする
- 内部state や DOM構造への直接的なアサーションは避ける
- `userEvent` を `fireEvent` より優先する

## モック
- IndexedDB 操作はモック化する
- モックは最小限に — 本物を使えるなら本物を使う

## 記述スタイル
- `describe` / `it` の記述は日本語も可（仕様書が日本語のため）
- テスト名は「〜すること」「〜が表示されること」のように期待結果を明示する
- AAA パターン（Arrange, Act, Assert）に従う
