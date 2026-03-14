---
globs: ['src/lib/**/*.ts', 'src/contexts/**/*.tsx']
---

# データ層・状態管理規約

## IndexedDB 操作

- 全てのIndexedDB操作は必ず try-catch でラップする
- エラー時はコンテキスト情報付きで `console.error` を出力する
- ユーザー向けエラーはトースト通知で表示する
- `DocumentRepository` インターフェースに準拠して実装する

## 状態管理

- グローバル状態: React Context + `useReducer` パターン
- 外部状態管理ライブラリ（Redux, Zustand等）は使用しない
- Context は責務ごとに分離する（DocumentContext, ThemeContext）
- Reducer のアクション型は discriminated union で定義する

## エラーハンドリングのパターン

```typescript
try {
  // IndexedDB操作
} catch (error) {
  console.error('[DocumentRepository] ドキュメント保存に失敗:', { documentId, error });
  // トースト通知でユーザーに通知
}
```
