# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# InkFlow

## プロジェクト概要

「書く。ただ、それだけを美しく。」— シンプルな執筆専用ネイティブアプリ（iOS/macOS）。
プレーンテキストの執筆に特化し、美しいUIと心地よい書き味を提供する。

## 開発コマンド

```bash
swift build                              # ライブラリビルド（型チェック含む）
swift test                               # ユニットテスト実行
swift test --filter InkFlowKitTests      # テスト絞り込み
xcodebuild -scheme InkFlow build         # アプリビルド（要 Xcode）
xcodebuild -scheme InkFlow test          # UI テスト含む全テスト
```

## 自動フック（`.claude/settings.json`）

- **コミット前**: `swift build && swift test` が自動実行される。全て通らないとコミットできない
- **`Sources/**/*.swift` 編集後**: `swift build` が自動実行され、コンパイルエラーがあれば即座にフィードバックされる

## アーキテクチャ

### テックスタック

Swift 6 + SwiftUI + SwiftData + NavigationStack。状態管理は @Observable（外部ライブラリ不使用）。ストレージは SwiftData（ModelContainer）+ @AppStorage（UserDefaults）。アイコンは SF Symbols。SPM（Swift Package Manager）でプロジェクト管理。

### データフロー

```
UI操作 → ViewModel アクション → DocumentRepository (SwiftData) → @Observable 更新 → View 再描画
```

- ViewModel のアクション関数が **Repository を先に呼び、成功後にプロパティを更新** する
- エラー時は `print("[プレフィックス]", context)` で記録

### アプリ構成

```
@main App > ModelContainer > ThemeManager (@Environment) > NavigationStack > Views
```

- ルート: `DocumentListView` → `EditorView`（NavigationStack + navigationDestination）

### 主要モジュール

| レイヤー | 場所 | 役割 |
|----------|------|------|
| データモデル | `Sources/InkFlowKit/Models/` | `@Model InkDocument` — SwiftData モデル（id: UUID, title, body, createdAt, updatedAt） |
| データ層 | `Sources/InkFlowKit/Data/` | `DocumentRepository` protocol + `SwiftDataRepository` 実装 + `DocumentFactory` |
| ViewModel | `Sources/InkFlowKit/ViewModels/` | `@Observable` DocumentListViewModel, EditorViewModel（自動保存500msデバウンス含む） |
| ルートView | `Sources/InkFlowKit/Views/ContentView/` | NavigationStack ルート |
| 一覧画面 | `Sources/InkFlowKit/Views/DocumentList/` | DocumentListView, DocumentCardView（スワイプ削除）, EmptyStateView, FABButton |
| エディタ | `Sources/InkFlowKit/Views/Editor/` | EditorView, TitleInputView, BodyTextEditor, StatusBarView, EditorHeaderView, EditorMenuView |
| 共通UI | `Sources/InkFlowKit/Views/Common/` | ToastView, ConfirmDialog, ThemeToggleButton, HeaderView |
| テーマ | `Sources/InkFlowKit/Theme/` | ColorTokens（ネイビー基調9色 x ライト/ダーク）, Typography, ThemeManager（@Observable + @AppStorage） |
| ユーティリティ | `Sources/InkFlowKit/Utilities/` | DateFormatter+InkFlow（今日→HH:MM / 昨日→「昨日」/ 今年→M月D日）, ExportHelper（UIPasteboard + ShareLink）, Constants |
| テスト | `Tests/InkFlowKitTests/` | Models/, Data/, ViewModels/, Utilities/ のユニットテスト |

### テーマシステム

1. `ThemeManager` が `@AppStorage("inkflow:theme")` でテーマモード（light/dark/system）を永続化
2. `.preferredColorScheme(themeManager.resolvedColorScheme)` でアプリ全体に適用
3. `resolvedColorScheme` が `nil`（system モード）の場合、OS の設定に自動追従
4. カラーパレットはネイビー基調（`Color.InkFlow.bg`, `Color.InkFlow.text` 等すべてネイビー系）
5. `Color.InkFlow.danger` はテキスト用、`Color.InkFlow.dangerBg` はボタン背景用に分離（ダークモードでのコントラスト両立のため）

### カラーパレット（ネイビー基調）

| 名称 | ライト | ダーク |
|------|--------|--------|
| bg | `#E8EDF5` | `#0C1525` |
| bgSub | `#F0F3F9` | `#162038` |
| text | `#1A2340` | `#E2E8F4` |
| textSub | `#5C6785` | `#8A95B0` |
| border | `#C8D0E0` | `#253050` |
| accent | `#1E40AF` | `#2D6CD6` |
| accentHover | `#1E3A8A` | `#3570D4` |
| danger | `#B91C1C` | `#F45252` |
| dangerBg | `#B91C1C` | `#DC2626` |

> 全テキスト・背景の組み合わせで WCAG AA コントラスト比 4.5:1 以上を保証すること。

### 集中モード

- `EditorViewModel` の `isFocusMode` / `showControls` で EditorHeaderView・StatusBarView の表示を制御
- `.toolbar(.hidden)` + `.statusBarHidden()` でシステムUI非表示
- 上端タップでコントロール復帰
- `Escape` キー（macOS）で集中モード解除

### 自動保存システム

- title/body 変更のたびに 500ms の `Task.sleep` デバウンス
- タイマー発火で `repository.save()` → saveStatus: idle → saving → saved（2秒後に idle）
- `saveTask?.cancel()` で前のタスクをキャンセル
- 画面離脱時に pending があれば即座にフラッシュ保存

### SF Symbols マッピング

| 用途 | SF Symbols 名 |
|------|---------------|
| 新規作成（FAB） | `plus` |
| 削除 | `trash` |
| 戻る | `chevron.left`（ナビ標準） |
| メニュー | `ellipsis.circle` |
| クリップボードコピー | `doc.on.doc` |
| 共有 | `square.and.arrow.up` |
| ライトテーマ | `sun.max` |
| ダークテーマ | `moon` |
| システムテーマ | `desktopcomputer` |
| 集中モード開始 | `arrow.up.left.and.arrow.down.right` |
| 集中モード解除 | `arrow.down.right.and.arrow.up.left` |
| 空状態 | `pencil` |

## 仕様書

| ドキュメント | 内容 |
|------------|------|
| `docs/PRD.md` | 機能要件・画面仕様・データ仕様・アニメーション仕様 |
| `docs/architecture.md` | テックスタック・プロジェクト構造・設計判断・データモデル・パフォーマンス基準 |
| `docs/design-language.md` | デザイン哲学「墨と余白」・ネイビー基調カラーパレット・タイポグラフィ・アイコン・トーン＆マナー |

## 自動適用ルール（`.claude/rules/`）

ファイル種別に応じて以下のルールが自動適用される:

- `swiftui-views.md` — SwiftUI View 定義・アクセシビリティ・アニメーション規約
- `testing.md` — Swift Testing のテスト設計・モック方針
- `data-layer.md` — SwiftData 操作・@Observable 状態管理・エラーハンドリングパターン

## 命名規則

- **View**: PascalCase（`DocumentCardView.swift`）
- **ViewModel**: PascalCase + `ViewModel` サフィックス（`EditorViewModel.swift`）
- **ユーティリティ**: extension の場合 `TypeName+Extension.swift`（`DateFormatter+InkFlow.swift`）
- **型定義**: PascalCase、`struct` / `enum` 優先。`@Model class` は SwiftData モデルのみ
- **プロパティ/メソッド**: camelCase
- **定数**: camelCase（Swift 慣習に従う）。グローバル定数は `enum Constants` 内で `static let` として定義

## import 順序

1. Apple フレームワーク（`SwiftUI`, `SwiftData`, `Foundation` 等）
2. 外部パッケージ（原則不使用）
3. 内部モジュール

## テストパターン

- **SwiftData テスト**: in-memory `ModelConfiguration(isStoredInMemoryOnly: true)` で `ModelContainer` を生成し、テスト間の独立性を保証
- **ViewModel テスト**: `DocumentRepository` protocol に対する Mock 実装を注入（依存性注入）
- **日時フォーマットテスト**: 固定 `Date` を生成してフォーマット結果をアサート
- **非同期テスト**: `async` テスト関数 + `Task.sleep` でデバウンスを待機
- **Swift Testing フレームワーク**: `@Suite`, `@Test`, `#expect()` を使用（XCTest ではなく Swift Testing を優先）

## デプロイ

- **配信**: App Store + TestFlight
- **CI/CD**: Xcode Cloud or GitHub Actions
- **対象**: iOS 17.0+ / macOS 14.0+
- **バンドルID**: `com.inkflow.app`（仮）

## 設計上の禁止事項

- UIKit を直接使用しない — 特別な理由がない限り SwiftUI で完結する
- force unwrap (`!`) を使わない — `guard let` / `if let` / nil coalescing (`??`) を使用する
- `Any` / `AnyObject` 型を濫用しない — 具体的な型 or protocol を使用する
- `width`/`height`/`top`/`left` 等のレイアウトプロパティを直接アニメーションしない — SwiftUI の `.animation()` + `.transition()` を使用する
- 外部状態管理ライブラリ（TCA, Redux 等）を使わない
- `@ObservedObject` / `@StateObject` は使わない — iOS 17+ の `@Observable` マクロを使用する
- 外部パッケージは原則不使用 — Apple 標準フレームワークのみで構築する
- `prefers-reduced-motion` に相当する `@Environment(\.accessibilityReduceMotion)` を無視しない — アニメーションは必ずアクセシビリティ設定を尊重する
