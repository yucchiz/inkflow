---
globs: ['src/__tests__/**/*.ts', 'src/__tests__/**/*.tsx']
---

# テスト規約

## Vitest + Testing Library

- `describe` / `it` でテストをグループ化する
- アサーションは `expect()` を使用する
- React コンポーネントのテストは `@testing-library/react` の `render` / `renderHook` を使用する
- ユーザー操作は `@testing-library/user-event` を使用する

## テスト設計
- ユーザー操作ベースのテストを書く（実装詳細に依存しない）
- 「ユーザーが何を見て、何をするか」の観点でテストする
- 内部 state への直接的なアサーションは避ける — 公開 API 経由で検証する
- 依存関係は Mock 注入パターンを基本とする

## モック
- IndexedDB は `fake-indexeddb` でテストする
- `MockDocumentRepository` クラスを使用する（spy パターン: callCount, lastRemovedId 等）
- タイマーのテストは `vi.useFakeTimers()` / `vi.advanceTimersByTime()` を使用する

## 記述スタイル
- テスト名は日本語で記述可（「〜すること」「〜が表示されること」）
- AAA パターン（Arrange, Act, Assert）に従う
