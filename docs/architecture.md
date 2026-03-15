# InkFlow アーキテクチャ

## テックスタック

| カテゴリ | 技術 | 備考 |
|---------|------|------|
| 言語 | Swift 6 | strict concurrency |
| UI フレームワーク | SwiftUI | 宣言的 UI |
| データ永続化 | SwiftData | @Model, ModelContainer, ModelContext |
| 設定保存 | @AppStorage | UserDefaults ラッパー |
| ナビゲーション | NavigationStack | 値ベースの遷移 |
| 状態管理 | @Observable | Observation framework (iOS 17+) |
| アイコン | SF Symbols | システム標準 |
| テスト | Swift Testing | @Suite, @Test, #expect |
| パッケージ管理 | SPM | Package.swift |

## プロジェクト構造

```
InkFlow/
├── Package.swift                      # SPM (iOS 17+ / macOS 14+)
├── Sources/InkFlowKit/
│   ├── Models/                        # @Model SwiftData
│   ├── Data/                          # DocumentRepository protocol + SwiftData 実装
│   ├── ViewModels/                    # @Observable
│   ├── Views/
│   │   ├── ContentView/
│   │   ├── DocumentList/
│   │   ├── Editor/
│   │   └── Common/
│   ├── Theme/                         # ColorTokens, Typography, ThemeManager
│   └── Utilities/
├── Tests/InkFlowKitTests/
├── App/                               # Xcode プロジェクト（アプリバンドル）
└── docs/
```

## 設計判断

| 判断 | 選択 | 理由 |
|------|------|------|
| テキスト入力 | SwiftUI `TextEditor` | ネイティブ、キーボード統合 |
| 自動保存 | `Task.sleep` 500ms デバウンス | Swift Concurrency で自然に実装 |
| 集中モード | `.toolbar(.hidden)` + `.statusBarHidden()` | SwiftUI 標準 API |
| テーマ管理 | `@Observable ThemeManager` + `@AppStorage` + `.preferredColorScheme()` | iOS/macOS 自動対応 |
| アニメーション | SwiftUI `.animation()` + `.transition()` | 60fps、GPU 最適化 |
| 空ドキュメント削除 | 画面離脱時に title+body が空なら自動削除 | Web 版と同一ロジック |

## 並行性モデル

全レイヤーが `@MainActor` で統一:
- `DocumentRepository` protocol — `@MainActor`
- `SwiftDataRepository` — `@MainActor final class`（`ModelContext` を使用）
- ViewModels — `@MainActor @Observable final class`
- Views — SwiftUI View（暗黙的に MainActor）

テストの `MockDocumentRepository` も `@MainActor final class` で定義する。`actor` ではない点に注意。

## データモデル

> 注: データモデルは `docs/PRD.md` 4.1 にも記載あり（意図的な重複）。変更時は両方を更新すること。

```swift
@Model
final class InkDocument {
    @Attribute(.unique) var id: UUID
    var title: String
    var body: String
    var createdAt: Date
    var updatedAt: Date
}
```

### テーマ設定

```swift
enum ThemeMode: String, CaseIterable {
    case light, dark, system
}
```

## パフォーマンス基準

| 指標 | 目標 |
|------|------|
| コールドスタート | < 1秒 |
| View 再描画 | 60fps 維持 |
| メモリ使用量 | < 50MB（通常使用時） |
| アプリサイズ | < 15MB（フォントバンドル込み） |
| 自動保存レイテンシ | < 100ms（SwiftData 書き込み） |
