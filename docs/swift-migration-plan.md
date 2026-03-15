# InkFlow Swift/SwiftUI 移行計画

## 概要

InkFlow を React + TypeScript の PWA から、**Swift + SwiftUI** のネイティブ iOS/macOS アプリへ移行する。
アプリの設計哲学（「書く。ただ、それだけを美しく。」）、デザイン言語（「墨と余白」）、機能仕様はそのまま維持し、技術基盤のみを刷新する。

---

## Phase 0: プロジェクトセットアップ

### 0.1 Xcode プロジェクト作成

| 項目 | 設定 |
|------|------|
| プロジェクト名 | `InkFlow` |
| テンプレート | Multiplatform App (SwiftUI) |
| 対象プラットフォーム | iOS 17.0+ / macOS 14.0+ |
| 言語 | Swift |
| UI フレームワーク | SwiftUI |
| ライフサイクル | SwiftUI App |
| バンドルID | `com.inkflow.app`（仮） |

### 0.2 ディレクトリ構造

```
InkFlow/
├── InkFlowApp.swift              # @main エントリーポイント
├── Models/
│   ├── Document.swift             # Documentデータモデル
│   └── AppSettings.swift          # テーマ設定
├── Data/
│   ├── DocumentRepository.swift   # プロトコル定義
│   ├── SwiftDataRepository.swift  # SwiftData実装
│   └── DocumentFactory.swift      # Document生成ファクトリ
├── ViewModels/
│   ├── DocumentListViewModel.swift
│   └── EditorViewModel.swift
├── Views/
│   ├── DocumentList/
│   │   ├── DocumentListView.swift
│   │   ├── DocumentCardView.swift
│   │   ├── EmptyStateView.swift
│   │   └── FABButton.swift
│   ├── Editor/
│   │   ├── EditorView.swift
│   │   ├── TitleInputView.swift
│   │   ├── BodyTextEditor.swift
│   │   ├── StatusBarView.swift
│   │   ├── EditorHeaderView.swift
│   │   └── EditorMenuView.swift
│   ├── Common/
│   │   ├── ToastView.swift
│   │   ├── ConfirmDialog.swift
│   │   ├── ThemeToggleButton.swift
│   │   └── HeaderView.swift
│   └── ContentView.swift          # ルートナビゲーション
├── Utilities/
│   ├── DateFormatter+InkFlow.swift
│   ├── ExportHelper.swift
│   └── Constants.swift
├── Theme/
│   ├── ColorTokens.swift          # ネイビー基調のカラーパレット
│   ├── Typography.swift           # Noto Serif/Sans JP フォント定義
│   └── ThemeManager.swift         # ライト/ダーク/システム管理
├── Extensions/
│   └── View+Extensions.swift
├── Resources/
│   ├── Assets.xcassets            # アプリアイコン・カラーセット
│   └── Fonts/                     # Noto Serif JP / Noto Sans JP（バンドル）
└── Tests/
    ├── InkFlowTests/
    │   ├── DocumentRepositoryTests.swift
    │   ├── DocumentFactoryTests.swift
    │   ├── DateFormatterTests.swift
    │   ├── EditorViewModelTests.swift
    │   └── DocumentListViewModelTests.swift
    └── InkFlowUITests/
        ├── DocumentListUITests.swift
        └── EditorUITests.swift
```

### 0.3 依存関係

| 用途 | Web版 | Swift版 |
|------|-------|---------|
| UI フレームワーク | React 19 | SwiftUI |
| データ永続化 | IndexedDB (`idb`) | **SwiftData** (Core Data後継) |
| 設定保存 | localStorage | **@AppStorage** (UserDefaults) |
| ルーティング | React Router v7 | **NavigationStack** |
| 状態管理 | Context + useReducer | **@Observable + @Environment** |
| アイコン | Heroicons v2 | **SF Symbols** |
| テスト | Vitest + Testing Library | **XCTest + Swift Testing** |

> 外部パッケージは原則不使用。Apple 標準フレームワークのみで構築する。

---

## Phase 1: データ層

### 1.1 データモデル（SwiftData）

```swift
import SwiftData

@Model
final class InkDocument {
    @Attribute(.unique) var id: UUID
    var title: String
    var body: String
    var createdAt: Date
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        title: String = "",
        body: String = "",
        createdAt: Date = .now,
        updatedAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.body = body
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
```

**Web版との対応**:

| Web版 (TypeScript) | Swift版 | 備考 |
|---|---|---|
| `id: string` (UUID v4) | `id: UUID` | ネイティブUUID型 |
| `title: string` | `title: String` | 最大200文字はView側で制限 |
| `body: string` | `body: String` | 制限なし |
| `createdAt: string` (ISO 8601) | `createdAt: Date` | ネイティブDate型 |
| `updatedAt: string` (ISO 8601) | `updatedAt: Date` | ネイティブDate型 |

### 1.2 リポジトリ（プロトコル + SwiftData実装）

```swift
protocol DocumentRepository {
    func getAll() async throws -> [InkDocument]        // updatedAt降順
    func getById(_ id: UUID) async throws -> InkDocument?
    func save(_ document: InkDocument) async throws
    func remove(_ id: UUID) async throws
}
```

Web版の `DocumentRepository` インターフェースと同一設計。SwiftData の `ModelContext` で実装する。

### 1.3 テーマ設定

```swift
enum ThemeMode: String, CaseIterable {
    case light, dark, system
}

@Observable
class ThemeManager {
    @AppStorage("inkflow:theme") var themeMode: ThemeMode = .system

    var resolvedColorScheme: ColorScheme? {
        switch themeMode {
        case .light: return .light
        case .dark: return .dark
        case .system: return nil  // システムに追従
        }
    }
}
```

Web版の `localStorage("inkflow:theme")` → `@AppStorage("inkflow:theme")` へマッピング。

---

## Phase 2: ViewModel 層

### 2.1 DocumentListViewModel

```swift
@Observable
class DocumentListViewModel {
    private let repository: DocumentRepository
    var documents: [InkDocument] = []
    var isLoading = true
    var error: Error?

    func loadDocuments() async { ... }
    func createDocument() async -> InkDocument? { ... }
    func deleteDocument(_ id: UUID) async { ... }
}
```

Web版の `DocumentContext` の責務を ViewModel に移行。

### 2.2 EditorViewModel

```swift
@Observable
class EditorViewModel {
    private let repository: DocumentRepository
    var document: InkDocument
    var saveStatus: SaveStatus = .idle  // idle | saving | saved
    var isFocusMode = false
    var showControls = true

    // 自動保存（500msデバウンス）
    private var saveTask: Task<Void, Never>?

    func updateTitle(_ title: String) { ... }
    func updateBody(_ body: String) { ... }
    func save() async { ... }
    func deleteDocument() async { ... }
    func cleanupEmptyDocument() async { ... }  // 空ドキュメント自動削除
}
```

Web版の `useAutoSave` + `useFocusMode` の責務を統合。

---

## Phase 3: View 層（画面実装）

### 3.1 ドキュメント一覧画面

| Web版コンポーネント | Swift版 View | 備考 |
|---|---|---|
| `DocumentListPage` | `DocumentListView` | `NavigationStack` でラップ |
| `DocumentCard` | `DocumentCardView` | スワイプで削除（iOS慣習） |
| `EmptyState` | `EmptyStateView` | SF Symbols `pencil` 使用 |
| `Fab` | `FABButton` | `.overlay` で右下に配置 |
| `Header` | `NavigationStack` の `.toolbar` | ネイティブナビバー |
| `ThemeToggle` | `ThemeToggleButton` | SF Symbols `sun.max` / `moon` / `desktopcomputer` |

**iOS 固有の変更点**:
- カード削除: ホバー時のゴミ箱アイコン → **スワイプ削除** に変更（iOS標準操作）
- ドキュメントカードの長押しでコンテキストメニュー表示も追加

### 3.2 エディタ画面

| Web版コンポーネント | Swift版 View | 備考 |
|---|---|---|
| `EditorPage` | `EditorView` | `NavigationStack` の遷移先 |
| `TitleInput` | `TitleInputView` | `TextField` 使用、200文字制限 |
| `BodyTextarea` | `BodyTextEditor` | `TextEditor` 使用 |
| `StatusBar` | `StatusBarView` | 文字数カウント表示 |
| `EditorHeader` | `EditorHeaderView` | ナビゲーションバー活用 |
| `EditorMenu` | `EditorMenuView` | `.confirmationDialog` or `.menu` |

**iOS 固有の変更点**:
- `<textarea>` → SwiftUI `TextEditor`
- ドロップダウンメニュー → iOS ネイティブの `.menu` or `ContextMenu`
- 集中モードのマウスホバー → iOS では上端タップのみ

### 3.3 共通コンポーネント

| Web版 | Swift版 | 実装方針 |
|---|---|---|
| Toast | `ToastView` | `.overlay` + `withAnimation` |
| ConfirmDialog | `ConfirmDialog` | `.confirmationDialog` or `.alert` |
| DropdownMenu | ネイティブ `.menu` | SwiftUI 標準 |

### 3.4 ナビゲーション

```swift
NavigationStack {
    DocumentListView()
        .navigationDestination(for: UUID.self) { id in
            EditorView(documentId: id)
        }
}
```

Web版の React Router (`/` → `/doc/:id`) → SwiftUI `NavigationStack` + `navigationDestination`。

---

## Phase 4: デザインシステム移植

### 4.1 カラートークン

```swift
extension Color {
    enum InkFlow {
        // ライトテーマ
        static let bgLight = Color(hex: "#E8EDF5")
        static let textLight = Color(hex: "#1A2340")
        // ダークテーマ
        static let bgDark = Color(hex: "#0C1525")
        static let textDark = Color(hex: "#E2E8F4")
        // ... 全変数をマッピング
    }
}
```

Web版の CSS 変数（`--color-bg`, `--color-text` 等）→ Swift の `Color` extension に移植。
`Assets.xcassets` に Color Set として登録し、Light/Dark Appearance で自動切替。

### 4.2 タイポグラフィ

| 用途 | Web版 | Swift版 |
|---|---|---|
| 本文 | Noto Serif JP 400 | バンドルフォント or `.serif` デザイン |
| 見出し | Noto Sans JP 700 | バンドルフォント or `.rounded` デザイン |
| UI | Noto Sans JP 400 | システムフォント（San Francisco） |

**フォント戦略の選択肢**:
1. **Noto フォントをバンドル**: Web版と完全一致。ただしアプリサイズ増（約2-4MB）
2. **システムフォント使用**: iOS らしい体験。ヒラギノが標準で利用可能
3. **ハイブリッド**: 本文は Noto Serif JP バンドル、UI はシステムフォント

→ 推奨: **選択肢3（ハイブリッド）** — 執筆体験の一貫性を保ちつつ、UI はプラットフォームネイティブ

### 4.3 アイコンマッピング

| Web版 (Heroicons) | Swift版 (SF Symbols) |
|---|---|
| `PlusIcon` | `plus` |
| `TrashIcon` | `trash` |
| `ArrowLeftIcon` | `chevron.left` (ナビ標準) |
| `EllipsisVerticalIcon` | `ellipsis.circle` |
| `ClipboardDocumentIcon` | `doc.on.doc` |
| `ArrowDownTrayIcon` | `square.and.arrow.down` |
| `SunIcon` | `sun.max` |
| `MoonIcon` | `moon` |
| `ComputerDesktopIcon` | `desktopcomputer` |
| `ArrowsPointingInIcon` | `arrow.down.right.and.arrow.up.left` |
| `ArrowsPointingOutIcon` | `arrow.up.left.and.arrow.down.right` |
| `PencilIcon` | `pencil` |

### 4.4 アニメーション

| Web版 (CSS) | Swift版 (SwiftUI) |
|---|---|
| `transition: opacity 200ms ease-out` | `.animation(.easeOut(duration: 0.2))` |
| `@keyframes fab-tap` | `.scaleEffect` + `withAnimation` |
| `translateY` / `opacity` | `.transition(.move(edge:).combined(with: .opacity))` |
| `prefers-reduced-motion` | `@Environment(\.accessibilityReduceMotion)` |

---

## Phase 5: 機能実装（詳細）

### 5.1 自動保存（500ms デバウンス）

```swift
// EditorViewModel 内
func updateBody(_ newBody: String) {
    document.body = newBody
    document.updatedAt = .now
    saveStatus = .idle

    saveTask?.cancel()
    saveTask = Task {
        try? await Task.sleep(for: .milliseconds(500))
        guard !Task.isCancelled else { return }
        await save()
    }
}
```

Web版の `useAutoSave` と同等のデバウンスロジック。

### 5.2 エクスポート

| 機能 | Web版 | Swift版 |
|---|---|---|
| クリップボードコピー | `navigator.clipboard.writeText()` | `UIPasteboard.general.string =` |
| テキストダウンロード | Blob + `<a>` download | **ShareLink** (iOS共有シート) |

```swift
ShareLink(item: exportText) {
    Label("共有", systemImage: "square.and.arrow.up")
}
```

iOS では「ダウンロード」よりも「共有」が自然。共有シートからファイルApp保存、AirDrop、メール等へ送れる。

### 5.3 集中モード

- iOS: ステータスバー + ナビバーを非表示 → `.toolbar(.hidden)` + `.statusBarHidden()`
- macOS: タイトルバーを非表示 → `.presentedWindowToolbarStyle(.unified(showsTitle: false))`
- 上端タッチでコントロール復帰（Web版のモバイル動作と同一）

### 5.4 日時フォーマット

Web版の `formatDate.ts` と同一ロジック:

```swift
extension Date {
    func inkFlowFormatted() -> String {
        if Calendar.current.isDateInToday(self) {
            return formatted(.dateTime.hour().minute())  // "12:30"
        } else if Calendar.current.isDateInYesterday(self) {
            return "昨日"
        } else if Calendar.current.isDate(self, equalTo: .now, toGranularity: .year) {
            return formatted(.dateTime.month().day())     // "3月1日"
        } else {
            return formatted(.dateTime.year().month().day()) // "2025年3月1日"
        }
    }
}
```

### 5.5 テーマ切替

3式サイクル: ライト → ダーク → システム → ライト

```swift
Button {
    themeManager.cycle()  // light → dark → system → light
} label: {
    Image(systemName: themeManager.currentIcon)
}
```

`.preferredColorScheme(themeManager.resolvedColorScheme)` でアプリ全体に適用。

---

## Phase 6: プラットフォーム対応

### 6.1 iOS 固有

| 項目 | 対応 |
|---|---|
| キーボード回避 | SwiftUI 標準の `.scrollDismissesKeyboard(.interactively)` |
| セーフエリア | `.safeAreaInset` で StatusBar 配置 |
| ハプティクス | 削除確認時に `UIImpactFeedbackGenerator` |
| アプリアイコン | Web版の icon-master.svg から生成 |

### 6.2 macOS 固有（Multiplatform）

| 項目 | 対応 |
|---|---|
| ウィンドウサイズ | `.defaultSize(width: 800, height: 600)` |
| キーボードショートカット | `⌘N` 新規作成、`⌘⌫` 削除 |
| ツールバー | macOS ネイティブツールバー |
| サイドバー | 将来的に `NavigationSplitView` でサイドバー表示も検討 |

### 6.3 iCloud 同期（将来）

SwiftData は CloudKit 統合をサポート。Web版の Phase 3「クラウド同期」に相当:

```swift
@Model
final class InkDocument {
    // SwiftData + CloudKit で自動同期
}
```

設定一つで iCloud 同期が有効になるのは、ネイティブアプリの大きな利点。

---

## Phase 7: テスト

### 7.1 テスト戦略

| レイヤー | テスト対象 | フレームワーク |
|---|---|---|
| Model | `InkDocument` 初期値、バリデーション | Swift Testing |
| Repository | CRUD操作、ソート順 | Swift Testing + in-memory ModelContainer |
| ViewModel | 自動保存デバウンス、状態遷移、空ドキュメント削除 | Swift Testing |
| Utility | 日時フォーマット、エクスポート | Swift Testing |
| UI | 画面遷移、ユーザー操作フロー | XCUITest |

### 7.2 Web版テストの移植対応表

| Web版テスト | Swift版テスト |
|---|---|
| `fake-indexeddb` でDBモック | in-memory `ModelConfiguration` |
| `vi.mock('@/lib/db')` | Protocol + Mock実装を注入 |
| `MemoryRouter` でルーティング | `NavigationStack` は直接テスト |
| `vi.useFakeTimers()` | `Clock` protocol でタイマーモック |
| `screen.getByRole` | XCUITest の `app.buttons["label"]` 等 |

---

## Phase 8: 配信・デプロイ

| 項目 | Web版 | Swift版 |
|---|---|---|
| ホスティング | Vercel | **App Store** + **TestFlight** |
| CI/CD | Vercel 自動デプロイ | **Xcode Cloud** or GitHub Actions + fastlane |
| 更新通知 | Service Worker | App Store 自動アップデート |
| オフライン | PWA キャッシュ | ネイティブアプリ（常にオフライン動作） |

---

## 実装順序（推奨）

| ステップ | 内容 | 推定規模 |
|---|---|---|
| 1 | Xcode プロジェクト作成 + ディレクトリ構造 | 小 |
| 2 | データモデル（SwiftData `InkDocument`）+ リポジトリ | 中 |
| 3 | カラートークン + タイポグラフィ + テーママネージャ | 中 |
| 4 | ドキュメント一覧画面（ListView + Card + EmptyState + FAB） | 大 |
| 5 | エディタ画面（TitleInput + BodyTextEditor + StatusBar） | 大 |
| 6 | 自動保存（500ms デバウンス） | 中 |
| 7 | エクスポート（コピー + 共有シート） | 小 |
| 8 | 集中モード | 中 |
| 9 | テーマ切替（ライト/ダーク/システム 3式サイクル） | 中 |
| 10 | アニメーション（トースト、カードリスト、FAB 等） | 中 |
| 11 | アクセシビリティ（VoiceOver、Dynamic Type 対応） | 中 |
| 12 | macOS 対応（Multiplatform 調整） | 中 |
| 13 | テスト（ユニット + UI テスト） | 大 |
| 14 | App Store 申請準備（アイコン、スクリーンショット、説明文） | 小 |

---

## Web版との機能差異まとめ

| 機能 | Web版 | Swift版 | 理由 |
|---|---|---|---|
| PWA インストール | ○ | 不要 | ネイティブアプリ |
| Service Worker | ○ | 不要 | 常にオフライン動作 |
| カード削除操作 | ホバーでゴミ箱アイコン | スワイプ削除 | iOS 標準操作 |
| テキストダウンロード | `.txt` ファイル保存 | 共有シート | iOS 標準操作 |
| URL ルーティング | `/` , `/doc/:id` | NavigationStack | ネイティブナビゲーション |
| 集中モード（デスクトップ） | マウスホバーで復帰 | マウスホバー (macOS) / メニューバー | プラットフォーム準拠 |
| フォント読み込み | Google Fonts CDN | バンドル or システムフォント | ネットワーク不要 |
| iCloud 同期 | 未実装 | SwiftData + CloudKit で容易に追加可能 | ネイティブの利点 |

---

## 現行 Web 版コードの扱い

現行の React/TypeScript コードは**そのまま保持**する。Swift プロジェクトは別ディレクトリ（`InkFlow/` or 別リポジトリ）として作成し、Web 版と並行して存在できるようにする。

Web版の仕様書（`docs/PRD.md`, `docs/architecture.md`, `docs/design-language.md`）は Swift 版でも共通のリファレンスとして使用する。Swift 固有の変更点は本ドキュメントに記載済み。
