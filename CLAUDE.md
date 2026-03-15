# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# InkFlow

## プロジェクト概要

「書く。ただ、それだけを美しく。」— シンプルな執筆専用PWAアプリ。
プレーンテキストの執筆に特化し、美しいUIと心地よい書き味を提供する。

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # tsc -b && vite build（型チェック + ビルド）
npm run test         # vitest（watchモード）
npm run test -- --run                               # テスト一括実行
npm run test -- --run src/lib/db                     # パターンで絞り込み
npm run lint         # ESLint
npm run format       # Prettier --write
npm run format:check # Prettier --check（書き込みなし）
node scripts/generate-icons.mjs  # PWA アイコン PNG 再生成（sharp 使用）
```

## 自動フック（`.claude/settings.json`）

- **コミット前**: `npm run lint && npm run format:check && npm run test -- --run` が自動実行される。全て通らないとコミットできない
- **`src/**/_.ts_`編集後**:`npx tsc --noEmit` が自動実行され、型エラーがあれば即座にフィードバックされる

## アーキテクチャ

### テックスタック

React 19 + TypeScript (strict) + Vite 7 + Tailwind CSS v4。状態管理は Context + useReducer（外部ライブラリ不使用）。ストレージは IndexedDB (`idb`) + localStorage。ルーティングは React Router v7（`react-router` パッケージのみ）。アイコンは Heroicons v2。

### データフロー

```
UI操作 → Context アクション関数 → documentRepository (IndexedDB) → dispatch (reducer) → 状態更新 → 再描画
```

- Context のアクション関数（`addDocument`, `updateDocument` 等）が **repository を先に呼び、成功後に dispatch** する
- エラー時は `console.error('[プレフィックス]', {context})` で記録し、throw で呼び出し元に伝播
- テーマ設定のみ localStorage に保存（同期読み取りで FOUC 防止）

### Provider 構成（`App.tsx` + `main.tsx`）

```
StrictMode > BrowserRouter > DocumentProvider > ThemeProvider > ToastProvider > Suspense > Routes + Toast + UpdateNotification
```

- ルート: `/` → DocumentListPage, `/doc/:id` → EditorPage
- ページコンポーネントは `React.lazy` で遅延ロード（ルートベースのコード分割）
- `Suspense` の fallback は `<main>` + `role="status"` のローディングテキスト

### 主要モジュール

| レイヤー       | 場所                            | 役割                                                                                                                                                                                                                                                               |
| -------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 型定義         | `src/types/`                    | Document, DocumentRepository, ThemeState 等のインターフェース                                                                                                                                                                                                      |
| データ層       | `src/lib/db.ts`                 | IndexedDB の DocumentRepository 実装（`idb` ライブラリ使用）                                                                                                                                                                                                       |
| ファクトリ     | `src/lib/document.ts`           | `createDocument()` — UUID生成 + ISO 8601タイムスタンプ                                                                                                                                                                                                             |
| ユーティリティ | `src/lib/formatDate.ts`         | 日時フォーマット（今日→HH:MM / 昨日→「昨日」/ 今年→M月D日 / 去年以前→YYYY年M月D日）                                                                                                                                                                                |
| ユーティリティ | `src/lib/exportDocument.ts`     | `copyToClipboard(body)` — Clipboard APIラッパー、`downloadAsTxt(title, body)` — テキストファイルダウンロード                                                                                                                                                       |
| 状態管理       | `src/contexts/`                 | DocumentContext（CRUD + repository連携）, ThemeContext（localStorage + media query）, ToastContext（3秒自動消滅）                                                                                                                                                  |
| フック         | `src/hooks/`                    | `useDocuments()`, `useTheme()`, `useToast()` — Context の null guard 付きアクセサ。`useAutoSave()` — 500msデバウンス自動保存。`useFocusMode()` — 集中モード（RAFスロットリング）。`useServiceWorker()` — PWA更新検知。`useDelayedClose()` — 閉じアニメーション遅延 |
| 共通UI         | `src/components/common/`        | Toast, ConfirmDialog（`<dialog>`）, DropdownMenu（キーボードナビ対応）, Header, ThemeToggle, UpdateNotification（PWA更新バナー）                                                                                                                                   |
| 一覧画面       | `src/components/document-list/` | DocumentCard, DocumentList, EmptyState, Fab                                                                                                                                                                                                                        |
| エディタ       | `src/components/editor/`        | EditorHeader, TitleInput, BodyTextarea, StatusBar, EditorMenu（コピー・DL・テーマ・集中モード・削除）                                                                                                                                                              |
| スタイル       | `src/styles/index.css`          | Tailwind v4 エントリー + デザイントークン（`@theme`）+ ダークテーマ（`.dark`）+ アニメーション（`@keyframes`）                                                                                                                                                     |
| アイコン生成   | `scripts/`                      | `icon-master.svg`（512x512 マスター SVG）+ `generate-icons.mjs`（sharp で 512/192/180px PNG を `public/icons/` に生成）                                                                                                                                            |

### テーマシステム

1. `index.html` のインラインスクリプトが React 読み込み前に localStorage を同期読み取り → `.dark` クラスを `<html>` に適用（FOUC 防止）
2. `ThemeContext` が `prefers-color-scheme` media query を監視し、system モード時に自動追従
3. CSS 変数は `@theme` ディレクティブ（ライト）と `.dark` クラス（ダーク）で切り替え

### PWA アーキテクチャ

- `vite-plugin-pwa`（`registerType: 'prompt'`）で Service Worker を生成
- Web App Manifest: `standalone` 表示、192/512px アイコン
- Workbox: Google Fonts を `CacheFirst` でランタイムキャッシュ（stylesheets + webfonts）
- `useServiceWorker` フックが `virtual:pwa-register/react` の `useRegisterSW` をラップ
- `UpdateNotification` が `needRefresh` 検知時にユーザーへ更新プロンプトを表示（`role="alert"`）

### 集中モード（`useFocusMode`）

- `EditorPage` で `useFocusMode()` を使用し、`isFocusMode` / `showControls` で EditorHeader・StatusBar の表示を制御
- デスクトップ: 画面上部 60px 以内でマウス移動 → コントロール表示（`requestAnimationFrame` スロットリング）
- モバイル: 上部 60px タッチでトグル
- `Escape` キーで集中モード解除
- `isFocusMode=false` のときはイベントリスナー未登録（パフォーマンス）

### 自動保存システム（`useAutoSave`）

- `setTitle` / `setBody` が呼ばれるたびに 500ms タイマーをリセット（デバウンス）
- タイマー発火で `updateDocument()` → `saveStatus`: idle → saving → saved（2秒後に idle に戻る）
- アンマウント時に pending があれば即座にフラッシュ保存（fire-and-forget + `.catch()`）
- `useRef` で最新値を保持し stale closure を回避

## 仕様書

| ドキュメント              | 内容                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `docs/PRD.md`             | 機能要件・画面仕様・データ仕様・アニメーション仕様                                 |
| `docs/architecture.md`    | テックスタック・プロジェクト構造・設計判断・データモデル・パフォーマンス基準       |
| `docs/design-language.md` | デザイン哲学「墨と余白」・カラーパレット・タイポグラフィ・アイコン・トーン＆マナー |

## 自動適用ルール（`.claude/rules/`）

ファイル種別に応じて以下のルールが自動適用される:

- `react-components.md` — コンポーネント定義・アクセシビリティ・スタイリング規約
- `testing.md` — Testing Library のクエリ優先順位・テスト設計・モック方針
- `data-layer.md` — IndexedDB操作・状態管理・エラーハンドリングパターン

## 命名規則

- **コンポーネント**: PascalCase（`DocumentCard.tsx`）、default export
- **フック**: camelCase、`use`プレフィックス（`useAutoSave.ts`）、named export
- **ユーティリティ**: camelCase（`formatDate.ts`）、named export
- **型定義**: PascalCase、`interface`優先（`Document`, `AppSettings`）
- **定数**: UPPER_SNAKE_CASE（`MAX_TITLE_LENGTH`）

## インポート順序

1. React / React関連
2. 外部ライブラリ
3. 内部モジュール（`@/`エイリアス使用）
4. 型のみのインポート（`import type`）

## テストパターン

- **IndexedDB テスト**: `fake-indexeddb/auto` + `IDBFactory` で毎テストリセット
- **Context テスト**: `vi.mock('@/lib/db')` で repository をモック化 → `import` でモック取得 → `vi.mocked()` でアクセス。`TestComponent` パターンで値キャプチャ
- **ページ統合テスト**: `MemoryRouter` + `Routes` + `Route` でラップ（`useParams` が動作するために必要）。`findByRole` で非同期データ読み込み完了を待つ
- **Theme テスト**: `localStorage` と `matchMedia` を `Object.defineProperty` でモック化
- **タイマーテスト**: `vi.useFakeTimers()` + `vi.advanceTimersByTime()` + `act()` で状態更新をラップ
- **PWA テスト**: `virtual:pwa-register/react` を `vi.mock` で完全モック化
- **Clipboard/Download テスト**: `navigator.clipboard.writeText`, `URL.createObjectURL/revokeObjectURL`, `HTMLAnchorElement.prototype.click` をモック化
- **フォーカス管理テスト**: `MemoryRouter` の `initialEntries` に `{ pathname, key }` を渡し、`location.key` による初回/遷移判定を検証
- **アニメーションテスト**: `button.dispatchEvent(new Event('animationend', { bubbles: true }))` を `act()` で囲んで発火。React の `onAnimationEnd` は jsdom で不安定なため native listener + dispatchEvent を使用

## 設計上の禁止事項

- `contentEditable` を使わない — `<textarea>` を使用する
- `dangerouslySetInnerHTML` を使わない
- `width`/`height`/`top`/`left` 等のレイアウトプロパティをアニメーションしない — `transform` + `opacity` のみ
- 外部状態管理ライブラリ（Redux, Zustand等）を使わない
- `React.FC` を使わない — 関数宣言を使用する
