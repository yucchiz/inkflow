# InkFlow PRD

## 0. ターゲットユーザー

### ペルソナA: 日常執筆者

- **年齢**: 28歳
- **端末**: iPhone中心（通勤中、カフェ、就寝前）
- **執筆内容**: 日記・エッセイ・思いつきのメモ
- **動機**: 思い浮かんだことをすぐに書き留めたい
- **重視すること**: シンプルさ、起動の速さ、余計な機能がないこと
- **InkFlowに求めるもの**: 開いて、書いて、閉じる。それだけの心地よさ

### ペルソナB: 集中執筆者

- **年齢**: 35歳
- **端末**: Mac中心（自宅の書斎、週末の長時間執筆）
- **執筆内容**: ブログ記事・短編小説・評論
- **動機**: 通知もボタンもない、文章だけの空間がほしい
- **重視すること**: 没入感、タイポグラフィの美しさ、集中モード
- **InkFlowに求めるもの**: 墨と余白だけの静かな執筆環境

### 対象外

- **Markdownが必須** → Obsidian / Typora
- **チーム共有・コラボレーション** → Notion / Google Docs
- **リッチテキスト編集** → Word / Pages

---

## 1. 機能要件

### 1.1 ドキュメント管理

#### 作成

| 項目 | 仕様 |
|------|------|
| 作成方法 | 一覧画面の新規作成ボタン(FAB) → エディタ画面へ遷移 |
| 初期状態 | タイトル空、本文空 |
| ID生成 | `UUID()`（Foundation の UUID 型） |

#### 一覧表示

| 項目 | 仕様 |
|------|------|
| 表示順 | 最終更新日時の降順 |
| 表示項目 | タイトル、本文プレビュー（冒頭2行）、最終更新日時 |
| タイトル未入力時 | 「無題のドキュメント」と表示 |
| タップ | エディタ画面へ遷移 |

#### 削除

| 項目 | 仕様 |
|------|------|
| 操作方法（iOS） | スワイプ削除（iOS 標準）/ 長押しコンテキストメニュー |
| 操作方法（macOS） | 右クリックコンテキストメニュー / `⌘⌫` ショートカット |
| 確認 | `.confirmationDialog` を表示（「このドキュメントを削除しますか？」） |
| 確定後 | SwiftData から完全削除。復元不可 |

#### 空ドキュメント自動削除

| 項目 | 仕様 |
|------|------|
| 条件 | タイトル・本文ともに未入力のままエディタを離脱 |
| 動作 | SwiftData から自動削除（削除トーストは表示しない） |

### 1.2 エディタ

#### テキスト入力

| 項目 | 仕様 |
|------|------|
| 入力形式 | プレーンテキスト（装飾なし） |
| タイトル入力 | 専用の `TextField`。プレースホルダー：「タイトル」 |
| 本文入力 | SwiftUI `TextEditor` 使用。プレースホルダー：「書き始める...」 |
| フォーカス | 画面遷移時に本文入力欄へ自動フォーカス（`@FocusState`） |
| 文字数制限 | なし |
| キーボード回避 | `.scrollDismissesKeyboard(.interactively)` でインタラクティブに閉じる |

#### 自動保存

| 項目 | 仕様 |
|------|------|
| デバウンス | 500ms（最後の入力から500ms後に SwiftData へ書き込み）。`Task.sleep(for:)` + キャンセルで実装 |
| 保存対象 | タイトル、本文、更新日時 |
| インジケーター | ヘッダーに「保存済み」表示 → 2秒後にフェードアウト |
| エラー時 | 「保存に失敗しました」のトースト通知 |

#### 文字数カウント

| 項目 | 仕様 |
|------|------|
| 表示位置 | ステータスバー（画面下部） |
| 対象 | 本文のみ（タイトルは含まない） |
| 表示形式 | 「1,234 文字」（リアルタイム更新） |

#### タイポグラフィ

| 項目 | iPhone（Compact） | Mac / iPad（Regular） |
|------|---------|-------------|
| 本文フォントサイズ | 16pt | 18pt |
| タイトルフォントサイズ | 22pt | 28pt |
| 行間 | 1.8 | 2.0 |
| エディタ最大幅 | 全幅（左右パディング: 16pt） | 680pt（中央寄せ） |
| フォント | `docs/design-language.md` の「タイポグラフィ」セクションを参照 |

> 本文は Noto Serif JP をアプリにバンドル。UI はシステムフォント（San Francisco / ヒラギノ）を使用。フォントバンドルにより常にオフラインで一貫した執筆体験を提供する。

#### 集中モード

| 項目 | 仕様 |
|------|------|
| 起動 | ヘッダーメニュー内「集中モード」ボタン |
| 動作 | ナビゲーションバー・ステータスバーを非表示にし、エディタのみ表示 |
| iOS 実装 | `.toolbar(.hidden)` + `.statusBarHidden()` |
| macOS 実装 | `.presentedWindowToolbarStyle(.unified(showsTitle: false))` |
| UI復帰（macOS） | 画面上端60pt領域にマウスホバー → ヘッダーがスライドイン |
| UI復帰（iOS） | 画面上端60pt領域をタップ → ヘッダーが表示 |
| 解除 | 復帰したヘッダーの解除ボタン / `Escape` キー（macOS） |

### 1.3 エクスポート

| 機能 | 操作 | 仕様 |
|------|------|------|
| クリップボードコピー | メニュー内「コピー」 | `UIPasteboard.general.string` で本文全体をコピー。トースト「コピーしました」 |
| 共有 | メニュー内「共有」 | `ShareLink` で iOS 共有シートを表示。`.txt`（UTF-8）形式。ファイル名: `{タイトル}.txt`（未入力時は `inkflow-{日付}.txt`）。ファイル名サニタイズ: `/ \ : * ? " < > |` を `_` に置換、先頭末尾の空白除去。内容: タイトル + 改行2つ + 本文 |

### 1.4 テーマ切替

| 項目 | 仕様 |
|------|------|
| 切替方法 | 一覧画面：ヘッダーにサイクルトグルアイコン / エディタ画面：メニュー内に切替項目 |
| 選択肢 | ライト → ダーク → システム追従 の3式サイクル |
| アイコン表示 | 現在の状態を表す SF Symbols アイコンを表示（`sun.max` ライト / `moon` ダーク / `desktopcomputer` システム）。タップで次の状態へ遷移 |
| デフォルト | OS のシステム設定に追従（`.preferredColorScheme(nil)`） |
| 永続化 | `@AppStorage("inkflow:theme")` で UserDefaults に保存 |

### 1.5 App Store 配信

| 項目 | 仕様 |
|------|------|
| 対象プラットフォーム | iOS / macOS（Multiplatform App） |
| 配信チャネル | App Store + TestFlight（ベータ配信） |
| オフライン対応 | ネイティブアプリのため常時オフライン動作。ネットワーク不要 |
| 更新 | App Store の自動アップデート機構 |

### 1.6 設定

| 設定名 | デフォルト | 保存先 | 説明 |
|--------|-----------|--------|------|
| theme | `"system"` | `@AppStorage("inkflow:theme")` UserDefaults | `"light"` / `"dark"` / `"system"` |

> MVP方針: 設定画面は設けず、テーマ切替のみUIに露出。フォントサイズ変更等は Phase 2 以降。

### 1.7 将来機能（MVP対象外）

| 機能 | Phase |
|------|-------|
| 検索（インクリメンタルサーチ） | 2 |
| フォルダ / タグ | 2 |
| .md エクスポート | 2 |
| 執筆統計（累計文字数、連続執筆日数） | 2 |
| キーボードショートカット（macOS 拡充） | 2 |
| フォントサイズ変更 | 2 |
| iCloud 同期（SwiftData + CloudKit） | 3 |
| Markdownプレビュー | 3 |
| AI執筆アシスタント | 3 |
| iPad サイドバーレイアウト（`NavigationSplitView`） | 3 |

---

## 2. 非機能要件

### 2.1 対応プラットフォーム

| プラットフォーム | 最低バージョン |
|---------|-----------|
| iOS | 17.0+ |
| macOS | 14.0+ (Sonoma) |

| デバイス | 画面サイズ |
|---------|--------|
| iPhone | SE（3rd）以上 |
| iPad | 全モデル |
| Mac | Apple Silicon / Intel（macOS 14+） |

配信方法: App Store（Multiplatform App）

### 2.2 レスポンシブデザイン

| サイズクラス | 条件 | レイアウト方針 |
|------|------|---------------|
| Compact | iPhone（縦）/ `horizontalSizeClass == .compact` | 単一カラム。一覧とエディタは `NavigationStack` で画面遷移 |
| Regular | iPad / Mac / `horizontalSizeClass == .regular` | 単一カラム。余白を広めに。エディタ最大幅制限、中央配置 |
| macOS ウィンドウ | `.defaultSize(width: 800, height: 600)` | 将来的に `NavigationSplitView` でサイドバー表示も検討 |

> SwiftUI の `@Environment(\.horizontalSizeClass)` で判定し、レイアウトを切り替える。

### 2.3 パフォーマンス

| 項目 | 基準値 |
|------|--------|
| アプリ起動 | コールドスタート 1秒以内 |
| 自動保存 | デバウンス500ms → SwiftData 書き込み 100ms以内 |
| 一覧画面 | 100件のドキュメントを `List` で 60fps スクロール |
| メモリ使用量 | アイドル時 50MB 以下 |
| フレームレート | 全アニメーション 60fps 維持 |

最適化方針: SwiftData の遅延ロード活用、フォントバンドルのサブセット化、SF Symbols によるベクターアイコン使用

### 2.4 セキュリティ

| 項目 | 仕様 |
|------|------|
| 認証 | なし（ローカルデータのみ） |
| 外部通信 | なし（完全オフライン動作） |
| データ保護 | iOS Data Protection（ファイル暗号化）に準拠 |
| App Sandbox | macOS で有効化（App Store 配信要件） |

### 2.5 アクセシビリティ

| 項目 | 仕様 |
|------|------|
| VoiceOver | 全 UI 要素に `.accessibilityLabel()` を適切に設定 |
| VoiceOver ヒント | 操作方法の補足が必要な要素に `.accessibilityHint()` を設定 |
| Dynamic Type | テキストサイズはユーザー設定に追従（アクセシビリティサイズ含む） |
| フォーカス管理 | `@FocusState` による適切なフォーカス移動 |
| 操作順序（一覧画面） | テーマトグル → ドキュメントカード（上から順）→ FAB |
| 操作順序（エディタ画面） | 戻るボタン → メニューボタン → タイトル入力 → 本文入力 |
| カラーコントラスト | WCAG AA 準拠（テキスト 4.5:1 以上） |
| キーボードナビゲーション | macOS でキーボードのみでの全機能操作に対応 |
| Reduce Motion | `@Environment(\.accessibilityReduceMotion)` 対応。有効時はアニメーション無効化 |
| macOS ショートカット | `⌘N` 新規作成、`⌘⌫` 削除 等を `.keyboardShortcut()` で実装 |

UI言語は日本語のみ（MVP）。入力言語は制限なし。

監視・分析はMVP対象外。Phase 2 で Xcode Organizer のクラッシュレポート・メトリクス活用を検討。

---

## 3. 画面仕様

### 3.1 ドキュメント一覧画面

#### ヘッダー（`.toolbar`）

| 要素 | 仕様 |
|------|------|
| アプリ名 | 「InkFlow」をブランドフォントで表示（`.navigationTitle`） |
| テーマ切替 | 3式サイクルトグルアイコン（ライト→ダーク→システム→ライト）。現在の状態を表す SF Symbols アイコンを表示 |
| 位置 | `NavigationStack` のナビゲーションバー |

#### ドキュメントリスト

| 要素 | 仕様 |
|------|------|
| 実装 | SwiftUI `List` |
| 最大幅 | 640pt（中央寄せ。`.frame(maxWidth:)` で制限） |
| 表示順 | 最終更新日時の降順（SwiftData `SortDescriptor`） |

#### ドキュメントカード

| 要素 | 仕様 |
|------|------|
| タイトル | 1行。はみ出し時は省略（`.lineLimit(1)`）。未入力時は「無題のドキュメント」 |
| プレビュー | 本文の冒頭2行分。はみ出し時は省略（`.lineLimit(2)`） |
| 更新日時 | 右下に表示（日時フォーマットは後述） |
| タップ | `NavigationLink(value:)` でエディタ画面へ遷移 |
| スワイプ削除（iOS） | `.swipeActions` でゴミ箱アイコンの削除アクション。スワイプで確認ダイアログ表示 |
| コンテキストメニュー | `.contextMenu` で長押し（iOS）/ 右クリック（macOS）に削除メニュー表示 |
| ホバー（macOS） | 背景色変化 |

#### 日時表示フォーマット

| 条件 | 表示例 |
|------|--------|
| 今日 | `12:30` |
| 昨日 | `昨日` |
| 今年内 | `3月1日` |
| 去年以前 | `2025年3月1日` |

#### FAB（新規作成ボタン）

| 要素 | 仕様 |
|------|------|
| 位置 | 画面右下（`.overlay(alignment: .bottomTrailing)` で固定配置） |
| デザイン | 円形、`InkFlow.text` 背景 + `InkFlow.bg` アイコン色（反転コントラスト）、SF Symbols `plus` |
| macOS | FAB + キーボードショートカット `⌘N` |

#### ローディング状態

| 要素 | 仕様 |
|------|------|
| 表示条件 | SwiftData からドキュメント読み込み中（`isLoading == true`） |
| 表示内容 | スケルトンUI（カード3枚分のプレースホルダー）。タイトル・プレビュー・日時の位置にグレーのパルスアニメーション（`.redacted(reason: .placeholder)`） |
| FAB | ローディング中も表示（即座に新規作成可能） |

#### エラー状態

| 要素 | 仕様 |
|------|------|
| 表示条件 | SwiftData 読み込み失敗時 |
| テキスト | 「データの読み込みに失敗しました」+「再試行してください」 |
| ボタン | 「再試行」ボタン（`loadDocuments()` を再実行） |

#### 空状態（EmptyState）

| 要素 | 仕様 |
|------|------|
| 表示条件 | ドキュメントが0件 |
| テキスト | 「まだドキュメントがありません」+「+ボタンで書き始めましょう」 |
| アイコン | SF Symbols `pencil` |

### 3.2 エディタ画面

#### ヘッダー（`.toolbar`）

| 要素 | 仕様 |
|------|------|
| 戻るボタン | 左端。ナビゲーションバーの自動バック（`NavigationStack` 標準） |
| 保存ステータス | 中央付近。保存完了時に「保存済み」表示 → 2秒後にフェードアウト |
| メニューボタン | 右端。タップでメニュー表示 |

#### メニュー（`.menu` / `.confirmationDialog`）

| メニュー項目 | 動作 |
|-------------|------|
| コピー | 本文全体をクリップボードにコピー → トースト表示 |
| 共有 | `ShareLink` で共有シートを表示 |
| テーマ切替 | ライト / ダーク / システム追従 を切り替え（一覧画面と設定共有） |
| 集中モード | ナビゲーションバー・ステータスバー非表示の没入体験 |
| 削除 | `.confirmationDialog` → 削除 → 一覧画面へ遷移 |

#### タイトル入力欄

| 要素 | 仕様 |
|------|------|
| 実装 | SwiftUI `TextField` |
| プレースホルダー | 「タイトル」 |
| 改行 | 不可（Return で本文へフォーカス移動。`@FocusState` で制御） |
| 文字数制限 | 200文字（`.onChange` で切り詰め）。残り20文字以下で文字数カウント表示（例: 「185 / 200」）。カウントは `InkFlow.text` + `.bold()` で強調表示 |
| ボーダー | なし |

#### 本文入力欄

| 要素 | 仕様 |
|------|------|
| 実装 | SwiftUI `TextEditor` |
| 高さ | コンテンツに合わせて自動拡張（`ScrollView` 内配置） |
| スクロール | `ScrollView` で画面全体がスクロール |
| ボーダー | なし |

#### ステータスバー

| 要素 | 仕様 |
|------|------|
| 位置 | 画面下部に固定（`.safeAreaInset(edge: .bottom)` で配置） |
| 内容 | 文字数カウント |
| 入力中の挙動 | テキスト入力開始時にフェードアウト。入力停止から3秒後にフェードインで再表示（「道具は消える」原則） |
| 集中モード時 | 非表示 |

### 3.3 共通UI要素

#### トースト通知

| 要素 | 仕様 |
|------|------|
| 実装 | `.overlay` + `withAnimation` |
| 位置 | 画面下部中央 |
| 表示時間 | 3秒（自動消滅） |
| 用途 | 「コピーしました」「保存に失敗しました」等 |
| 複数発生時 | 常に1件のみ表示。新しいトーストが前のトーストを即座に置換する |

#### 確認ダイアログ

| 要素 | 仕様 |
|------|------|
| 実装 | `.confirmationDialog` |
| ボタン | 「キャンセル」（自動表示）+「削除」（`.destructive` ロール、SF Symbols `trash` 付き） |
| 閉じる | キャンセルタップ / 背景タップ / `Escape`（macOS） |

### 3.4 画面遷移

```
[アプリ起動] → [一覧画面]
  ├── FABタップ → 新規Document作成(SwiftData) → [エディタ画面]
  ├── カードタップ → NavigationLink(value:) → [エディタ画面]
  ├── スワイプ削除(iOS) → 確認ダイアログ → 削除 → 一覧に留まる
  └── コンテキストメニュー削除 → 確認ダイアログ → 削除 → 一覧に留まる

[エディタ画面]
  ├── 戻るボタン/スワイプバック → 空ドキュメント判定(空なら自動削除) → [一覧画面]
  ├── メニュー → コピー → トースト
  ├── メニュー → 共有 → 共有シート
  └── メニュー → 削除 → 確認ダイアログ → [一覧画面]
```

遷移アニメーション: `NavigationStack` 標準のプッシュ / ポップアニメーション

---

## 4. データ仕様

### 4.1 データモデル

> 注: データモデルは `docs/architecture.md` にも記載あり（意図的な重複）。変更時は両方を更新すること。

#### InkDocument フィールド詳細

| フィールド | 型 | デフォルト値 | バリデーション |
|-----------|------|-------------|---------------|
| id | `UUID` | `UUID()` | UUID 型 |
| title | `String` | `""` | 最大200文字（View 側の `.onChange` で制限）。空文字は一覧で「無題のドキュメント」表示 |
| body | `String` | `""` | 上限なし（ストレージ容量に依存） |
| createdAt | `Date` | `.now` | Foundation `Date` 型 |
| updatedAt | `Date` | `.now` | Foundation `Date` 型。title/body 変更時に更新 |

#### AppSettings

| フィールド | 型 | デフォルト値 | 保存先 | 説明 |
|-----------|------|-------------|--------|------|
| theme | `ThemeMode` (`"light"` / `"dark"` / `"system"`) | `"system"` | `@AppStorage("inkflow:theme")` | カラーテーマ |

### 4.2 ストレージ設計（SwiftData）

| 項目 | 値 |
|------|------|
| フレームワーク | SwiftData |
| モデル | `@Model final class InkDocument` |
| コンテナ | `ModelContainer(for: InkDocument.self)` |
| コンテキスト | `ModelContext`（`@Environment(\.modelContext)` で取得） |

| モデル | 主キー | ソート |
|----------|---------|-------------|
| `InkDocument` | `@Attribute(.unique) id: UUID` | `updatedAt` 降順（`SortDescriptor`） |

設定（AppSettings）は `@AppStorage` で UserDefaults に保存（キー: `inkflow:theme`）。
理由: 少量のキーバリューデータであり、同期的に読めるためアプリ起動時に即座にテーマを適用できる。

### 4.3 データアクセス層（DocumentRepository）

```swift
protocol DocumentRepository {
    func getAll() async throws -> [InkDocument]        // 全件取得（updatedAt降順）
    func getById(_ id: UUID) async throws -> InkDocument?  // 1件取得
    func save(_ document: InkDocument) async throws    // upsert
    func remove(_ id: UUID) async throws               // 削除
}
```

| 方針 | 詳細 |
|------|------|
| 実装 | `SwiftDataRepository`（`ModelContext` でCRUD操作） |
| エラーハンドリング | do-catch + トースト通知 |
| テスト | in-memory `ModelConfiguration` でモック不要 |

### 4.4 状態管理

#### DocumentListViewModel

```swift
@Observable
class DocumentListViewModel {
    var documents: [InkDocument] = []
    var isLoading = true
    var error: Error?

    func loadDocuments() async { ... }
    func createDocument() async -> InkDocument? { ... }
    func deleteDocument(_ id: UUID) async { ... }
}
```

#### EditorViewModel

```swift
@Observable
class EditorViewModel {
    var document: InkDocument
    var saveStatus: SaveStatus = .idle  // .idle | .saving | .saved
    var isFocusMode = false
    var showControls = true

    func updateTitle(_ title: String) { ... }
    func updateBody(_ body: String) { ... }
    func save() async { ... }
    func deleteDocument() async { ... }
    func cleanupEmptyDocument() async { ... }
}
```

#### ThemeManager

```swift
@Observable
class ThemeManager {
    @AppStorage("inkflow:theme") var themeMode: ThemeMode = .system

    var resolvedColorScheme: ColorScheme? { ... }  // .light / .dark / nil（システム追従）
    func cycle() { ... }  // light → dark → system → light
}
```

> ViewModel は `@Observable` マクロで定義し、`@Environment` で View ツリーに注入する。

### 4.5 データフロー

**ドキュメント作成**: FABタップ → `InkDocument` 生成（UUID） → SwiftData 保存 → `documents` 配列更新 → `NavigationStack` でエディタへ遷移 → 本文に自動フォーカス

**自動保存**: 編集 → `Task.sleep(for: .milliseconds(500))` でデバウンス → `updatedAt` 更新 → SwiftData 保存 → `saveStatus = .saved`（2秒後に `.idle` へ）

**削除**: スワイプ/メニュー削除 → `.confirmationDialog` → SwiftData 削除 → `documents` 配列更新 → （エディタの場合）一覧へ遷移

**空ドキュメント削除**: エディタ離脱（`.onDisappear`）→ `title.isEmpty && body.isEmpty` 判定 → 空なら SwiftData 削除 → 一覧へ遷移（トーストなし）/ 空でなければ通常遷移

**テーマ切替**: トグルタップ → `themeManager.cycle()` → `@AppStorage` に保存 → `.preferredColorScheme()` が即座に切替

**アプリ起動**: `@AppStorage` → テーマ即時適用 → SwiftData → ドキュメント読み込み（async） → `documents` 配列更新 → 描画

**マイグレーション方針**: MVP段階では明示的なマイグレーション機構は設けない。SwiftData の `VersionedSchema` + `SchemaMigrationPlan` で管理し、新フィールドはデフォルト値で補完。

---

## 5. アニメーション仕様

### 5.1 基本方針・共通トークン

| 方針 | 詳細 |
|------|------|
| パフォーマンス | `scaleEffect`、`opacity`、`offset` のみアニメーション。**例外**: テーマ切替時の色変化トランジションは対象外（レイアウトシフトなし） |
| アクセシビリティ | `@Environment(\.accessibilityReduceMotion)` が `true` の場合、アニメーション無効化 |
| 実装 | SwiftUI `withAnimation` / `.animation()` / `.transition()` |

```swift
// アニメーショントークン
extension Animation {
    static let inkFast = Animation.easeOut(duration: 0.15)
    static let inkNormal = Animation.easeOut(duration: 0.2)
    static let inkSlow = Animation.easeOut(duration: 0.3)
}
```

```swift
// Reduce Motion 対応
@Environment(\.accessibilityReduceMotion) private var reduceMotion

withAnimation(reduceMotion ? .none : .inkNormal) {
    // アニメーション対象の状態変更
}
```

### 5.2 アニメーション一覧

| コンポーネント | 状態 | アニメーション | duration | easing |
|--------------|------|--------------|----------|--------|
| 画面遷移 | 一覧→エディタ | `NavigationStack` 標準プッシュ | システム標準 | システム標準 |
| 画面遷移 | エディタ→一覧 | `NavigationStack` 標準ポップ | システム標準 | システム標準 |
| カードリスト | 初回表示 | フェードイン + スライドアップ（`.offset(y: 12)` → `.offset(y: 0)`）。遅延: `0.05 * min(index, 10)`。11件目以降は遅延なしで即座に表示 | 300ms | `.easeOut` |
| カード | ホバー（macOS） | 背景色変化 | 200ms | `.easeInOut` |
| カード | スワイプ削除（iOS） | SwiftUI `List` 標準スワイプアニメーション | システム標準 | システム標準 |
| FAB | 初回表示 | スケールイン（`.scaleEffect(0)` → `.scaleEffect(1)`） | 300ms | `.easeOut` |
| FAB | タップ | スケールダウン→戻り（`1→0.92→1`）。`withAnimation(.easeInOut(duration: 0.15))` | 150ms | `.easeInOut` |
| テーマ切替 | 切替時 | `.preferredColorScheme` によるシステム標準トランジション | 300ms | `.easeInOut` |
| 保存ステータス | 表示 | フェードイン（`.opacity(0)` → `.opacity(1)`） | 150ms | `.easeOut` |
| 保存ステータス | 消滅 | 2秒後にフェードアウト | 300ms | `.easeIn` |
| 集中モード | ヘッダー非表示 | スライドアップ（`.transition(.move(edge: .top))`） | 200ms | `.easeIn` |
| 集中モード | ヘッダー復帰 | スライドダウン（`.transition(.move(edge: .top))`） | 200ms | `.easeOut` |
| 集中モード | ステータスバー | フェードアウト/イン（`.transition(.opacity)`） | 200ms | `.easeInOut` |
| ステータスバー | 入力開始時 | フェードアウト（`.opacity(1)` → `.opacity(0)`） | 200ms | `.easeIn` |
| ステータスバー | 入力停止3秒後 | フェードイン（`.opacity(0)` → `.opacity(1)`） | 300ms | `.easeOut` |
| トースト | 表示 | スライドアップ + フェードイン（`.transition(.move(edge: .bottom).combined(with: .opacity))`） | 200ms | `.easeOut` |
| トースト | 消滅 | フェードアウト（3秒後に自動開始） | 200ms | `.easeIn` |
| 確認ダイアログ | 表示/閉じる | `.confirmationDialog` のシステム標準アニメーション | システム標準 | システム標準 |
