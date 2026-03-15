# InkFlow

「書く。ただ、それだけを美しく。」

シンプルな執筆専用ネイティブアプリ（iOS / macOS）。プレーンテキストの執筆に特化し、美しいUIと心地よい書き味を提供します。

## 特徴

- 余計な機能のない、執筆に集中できるエディタ
- 500ms デバウンスの自動保存
- ライト / ダーク / システム テーマ切替
- 集中モード（UIを隠して執筆に没頭）
- ネイビー基調「墨と余白」デザイン
- VoiceOver / Dynamic Type 対応

## 要件

- Xcode 16+
- iOS 17.0+ / macOS 14.0+

## テックスタック

- Swift 6 + SwiftUI
- SwiftData（ローカルストレージ）
- NavigationStack（画面遷移）
- SF Symbols（アイコン）
- Swift Testing（テストフレームワーク）

## プロジェクト構成

```
Sources/InkFlowKit/          # SPM ライブラリ（全ロジック + View）
├── Models/                   # SwiftData @Model
├── Data/                     # DocumentRepository protocol + 実装
├── ViewModels/               # @Observable ViewModel
├── Views/                    # SwiftUI View（ContentView, DocumentList, Editor, Common）
├── Theme/                    # カラートークン・タイポグラフィ・ThemeManager
└── Utilities/                # DateFormatter, ExportHelper, Constants

Tests/InkFlowKitTests/        # ユニットテスト（72テスト）

App/                          # Xcode プロジェクト（アプリバンドル）
├── InkFlow/                  # @main エントリーポイント
└── InkFlowUITests/           # UI テスト
```

## 開発

```bash
# ライブラリのビルド
swift build

# ユニットテスト実行
swift test

# テスト絞り込み
swift test --filter InkFlowKitTests

# アプリビルド（要 Xcode）
xcodebuild -scheme InkFlow build

# 全テスト（UI テスト含む）
xcodebuild -scheme InkFlow test
```

## ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [PRD](docs/PRD.md) | 機能要件・画面仕様・データ仕様 |
| [アーキテクチャ](docs/architecture.md) | テックスタック・プロジェクト構造・設計判断 |
| [デザインランゲージ](docs/design-language.md) | 「墨と余白」デザインシステム |

## ライセンス

Private
