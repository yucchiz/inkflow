# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# InkFlow

## プロジェクト概要

「書く。ただ、それだけを美しく。」— シンプルな執筆専用 PWA。
プレーンテキストの執筆に特化し、美しい UI と心地よい書き味を提供する。

## 開発コマンド

```bash
npm run dev              # 開発サーバー起動（Vite）
npm run build            # プロダクションビルド（TypeScript チェック + Vite ビルド）
npm test                 # テスト実行（Vitest、全テスト一括）
npm run test:watch       # テストをウォッチモードで実行
npm run test:coverage    # カバレッジ付きテスト実行
npm run preview          # ビルド結果プレビュー

# 単一テストファイルの実行
npx vitest src/__tests__/hooks/useEditor.test.tsx
```

## 自動フック（`.claude/settings.json`）

- **コミット前**: `npm run build && npm test` が自動実行される。全て通らないとコミットできない
- **`src/**/*.ts(x)` 編集後**: `npx tsc --noEmit` が自動実行され、型エラーがあれば即座にフィードバックされる

## アーキテクチャ

### テックスタック

React 19 + TypeScript + Vite + IndexedDB + PWA (Workbox)。状態管理はカスタム hooks + React Context（外部ライブラリ不使用）。ストレージは IndexedDB（idb ライブラリ）+ localStorage（テーマ設定）。アイコンは lucide-react。

### import エイリアス

`@/` → `src/`（vite.config.ts + tsconfig.json で設定済み）

```typescript
import { useRepository } from '@/contexts/RepositoryContext'
import type { InkDocument } from '@/models/InkDocument'
```

### データフロー

```
UI操作 → hooks アクション → DocumentRepository (IndexedDB) → state 更新 → 再レンダリング
```

- hooks のアクション関数が **Repository を先に呼び、成功後に state を更新** する
- Repository は `RepositoryContext` 経由で依存注入（テスト時は `MockDocumentRepository` に差替）
- エラー時は `console.error("[プレフィックス]", context)` で記録

### アプリ構成

```
BrowserRouter (basename="/inkflow") > ThemeProvider > ToastProvider > RepositoryProvider > Routes > Pages
```

- `main.tsx` が `BrowserRouter` をルートに設定
- ルート: `/` → `DocumentListPage`、`/edit/:id` → `EditorPage`（React Router v7）

### 主要モジュール

| レイヤー | 場所 | 役割 |
|----------|------|------|
| データモデル | `src/models/` | `InkDocument` interface（id, title, body, createdAt, updatedAt） |
| データ層 | `src/data/` | `DocumentRepository` interface + `IndexedDBRepository` 実装 + `DocumentFactory` |
| hooks | `src/hooks/` | `useDocumentList`, `useEditor`（自動保存デバウンス含む）, `useTheme`, `useReduceMotion` |
| Context | `src/contexts/` | `ThemeContext`, `ToastContext`, `RepositoryContext` |
| 一覧画面 | `src/components/document-list/` | DocumentListPage, DocumentCard（スワイプ削除）, EmptyState, FABButton |
| エディタ | `src/components/editor/` | EditorPage, TitleInput, BodyTextArea, StatusBar, EditorHeader, EditorMenu |
| 共通UI | `src/components/common/` | Toast, ConfirmDialog, ThemeToggleButton, Header |
| テーマ | `src/theme/` | tokens.css（カラー・影・Glassmorphism）, colors.ts, typography.ts |
| ユーティリティ | `src/utils/` | dateFormatter, exportHelper（clipboard）, constants |
| テスト | `src/__tests__/` | components/, data/, hooks/, utils/ のユニットテスト |

### テーマシステム

1. `ThemeProvider` が `localStorage("inkflow:theme")` でテーマモード（light/dark/system）を永続化
2. `<html data-theme="light|dark|system">` 属性で CSS カスタムプロパティを切替
3. system モードの場合、`prefers-color-scheme` メディアクエリで OS 設定に自動追従
4. カラーは CSS カスタムプロパティ `var(--inkflow-bg)`, `var(--inkflow-text)` 等で参照

### カラーパレット（Digital Atelier — クールニュートラル + インディゴアクセント）

| 名称 | ライト | ダーク |
|------|--------|--------|
| bg | `#FAFAFA` | `#161618` |
| bgSub | `#F2F2F0` | `#1C1C1E` |
| text | `#1C1C1E` | `#E5E5E7` |
| textSub | `#8E8E93` | `#8E8E93` |
| border | `#E5E5EA` | `#38383A` |
| accent | `#5856D6` | `#7B79E8` |
| accentHover | `#4A48C4` | `#9594F0` |
| danger | `#FF3B30` | `#FF453A` |
| dangerBg | `#FF3B30` | `#FF453A` |

追加トークン: `--inkflow-shadow-1/2/3`（Elevation System）、`--inkflow-glass-bg/border`（Glassmorphism）、`--inkflow-accent-shadow`（FAB の色付きシャドウ）

> 全テキスト・背景の組み合わせで WCAG AA コントラスト比 4.5:1 以上を保証すること。

### 自動保存システム

- title/body の変更で `scheduleSave()` を呼び出し。`isLoading` 中はスキップ（初期ロード時の誤保存防止）
- 500ms（`AUTO_SAVE_DEBOUNCE_MS`）の `setTimeout` デバウンス。ref 経由で stale closure を回避
- タイマー発火で `repository.save()` → saveStatus: idle → saving → saved（2秒後に idle）
- **ページ離脱時**: title+body が空白のみなら自動削除、内容があればフラッシュ保存

### 集中モード

- `useEditor` hook の `isFocusMode` / `showControls` で EditorHeader・StatusBar の表示を制御
- CSS で header/statusbar を非表示にし、エディタ領域を全画面に拡張
- 上端クリック/タップでコントロール復帰、`Escape` キーで解除

### lucide-react アイコンマッピング

| 用途 | アイコン名 |
|------|-----------|
| 新規作成（FAB） | `Plus` |
| 削除 | `Trash2` |
| 戻る | `ChevronLeft` |
| メニュー | `MoreHorizontal` |
| クリップボードコピー | `Copy` |
| 共有 | `Share` |
| ライトテーマ | `Sun` |
| ダークテーマ | `Moon` |
| システムテーマ | `Monitor` |
| 集中モード開始 | `Maximize2` |
| 集中モード解除 | `Minimize2` |
| 空状態 | `PenLine` |

## 仕様書

| ドキュメント | 内容 |
|------------|------|
| `docs/PRD.md` | 機能要件・画面仕様・データ仕様・アニメーション仕様 |
| `docs/architecture.md` | テックスタック・プロジェクト構造・設計判断・データモデル・パフォーマンス基準 |
| `docs/design-language.md` | デザイン哲学「Digital Atelier」・カラーパレット・タイポグラフィ・角丸・アニメーション仕様 |

## 自動適用ルール（`.claude/rules/`）

ファイル種別に応じて以下のルールが自動適用される:

- `react-components.md` — React コンポーネント定義・アクセシビリティ・アニメーション規約
- `testing.md` — Vitest + Testing Library のテスト設計・モック方針
- `data-layer.md` — IndexedDB 操作・hooks 状態管理・エラーハンドリングパターン

## 命名規則

- **コンポーネント**: PascalCase（`DocumentCard.tsx`）
- **ページ**: PascalCase + `Page` サフィックス（`EditorPage.tsx`）
- **hooks**: camelCase + `use` プレフィックス（`useEditor.ts`）
- **ユーティリティ**: camelCase（`dateFormatter.ts`）
- **CSS**: コンポーネント名と同名（`DocumentCard.css`）
- **型定義**: PascalCase（`interface InkDocument`）
- **定数**: camelCase（`constants.ts` 内で `export const` として定義）

## import 順序

1. React / React DOM
2. サードパーティ（`react-router-dom`, `lucide-react`, `idb` 等）
3. 内部モジュール（`@/` エイリアス使用）

## テストパターン

- **hooks テスト**: `renderHook` + `MockDocumentRepository` を注入（RepositoryContext 経由）。Mock は spy パターン（`saveCallCount`, `lastRemovedId` 等）+ 個別エラーフラグ（`shouldThrowOnSave` 等）
- **IndexedDB 統合テスト**: `fake-indexeddb` でインメモリ IndexedDB を使用し、テスト間の独立性を保証
- **日時フォーマットテスト**: `formatDate(date, now)` で「現在時刻」を注入し、決定的にテスト
- **非同期テスト**: `vi.useFakeTimers()` + `vi.advanceTimersByTime()` でデバウンスを制御
- **コンポーネントテスト**: `@testing-library/react` の `render` + `@testing-library/user-event` でユーザー操作をシミュレート

## デプロイ

- **ホスティング**: GitHub Pages
- **CI/CD**: GitHub Actions（`.github/workflows/deploy.yml`）— Node 22、`dist/404.html` コピーで SPA 対応
- **トリガー**: main ブランチへの push で自動デプロイ
- **ベースパス**: `/inkflow/`

## 設計上の禁止事項

- クラスコンポーネントを使用しない — 関数コンポーネント + hooks のみ
- 外部状態管理ライブラリ（Redux, Zustand, TCA 等）を使わない
- インラインスタイルを使用しない — CSS カスタムプロパティ + CSS ファイルを使用する
- `any` 型を濫用しない — 具体的な型 or interface を使用する
- `!` (non-null assertion) を濫用しない — 適切な null チェックを行う
- `prefers-reduced-motion` を無視しない — アニメーションは必ずアクセシビリティ設定を尊重する
- コンポーネントから IndexedDB を直接操作しない — 必ず hooks/repository 経由
- CSS でシステム標準カラーを直接使用しない — `var(--inkflow-*)` トークン経由にする
