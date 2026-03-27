---
globs: ['src/data/**/*.ts', 'src/hooks/**/*.ts', 'src/hooks/**/*.tsx', 'src/models/**/*.ts', 'src/contexts/**/*.tsx']
---

# データ層・状態管理規約

## IndexedDB 操作
- `idb` ライブラリ経由で操作する
- CRUD 操作は `DocumentRepository` インターフェース経由で行う
- エラー時は try-catch + console.error でコンテキスト付きログ出力
- ユーザー向けエラーはトースト通知で表示する

## 状態管理
- カスタム hooks で状態を管理する（useState + useEffect）
- 外部状態管理ライブラリ（Redux, Zustand 等）は使用しない
- グローバル状態は React Context で提供する（ThemeContext, ToastContext, RepositoryContext）
- コンポーネントから IndexedDB を直接操作しない — 必ず hooks 経由

## 永続化
- ドキュメントデータ: IndexedDB (`inkflow-db`)
- テーマ設定: `localStorage("inkflow:theme")`
