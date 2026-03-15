---
globs: ['Sources/**/Models/**/*.swift', 'Sources/**/Data/**/*.swift', 'Sources/**/ViewModels/**/*.swift']
---

# データ層・状態管理規約

## SwiftData 操作

- モデルは `@Model` マクロで定義する
- CRUD 操作は `ModelContext` 経由で行う（`insert`, `delete`, `fetch`, `save`）
- 全ての SwiftData 操作は必ず do-catch でラップする
- エラー時は `print("[プレフィックス]", context)` でコンテキスト情報付きのログを出力する
- ユーザー向けエラーはトースト通知で表示する

## 状態管理

- ViewModel は `@Observable` マクロで定義する
- 外部状態管理ライブラリ（TCA, ReSwift 等）は使用しない
- ViewModel は責務ごとに分離する（DocumentListViewModel, EditorViewModel）
- View から `ModelContext` を直接操作しない — 必ず ViewModel 経由にする
- テーマ等の軽量な設定値は `@AppStorage` を使用する

## エラーハンドリングのパターン

```swift
func saveDocument(_ document: InkDocument) async {
    do {
        modelContext.insert(document)
        try modelContext.save()
    } catch {
        print("[SwiftDataRepository] ドキュメント保存に失敗:", document.id, error)
        // トースト通知でユーザーに通知
    }
}
```
