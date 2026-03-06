# InkFlow

## プロジェクト概要

「書く。ただ、それだけを美しく。」— シンプルな執筆専用PWAアプリ。
プレーンテキストの執筆に特化し、美しいUIと心地よい書き味を提供する。

## プロジェクト状態

**未実装** — 仕様書とプロジェクト設定のみ。`src/` および `package.json` は未作成。

### 実装開始手順

1. `npm create vite@latest . -- --template react-ts` でプロジェクト初期化
2. 依存パッケージ追加: `idb`, `react-router`, `vite-plugin-pwa`, `tailwindcss`
3. 開発ツール追加: `vitest`, `@testing-library/react`, `eslint`, `prettier`
4. `tsconfig.json` に `@/` パスエイリアスを設定
5. `npm run lint && npm run test` で自動フックの動作を確認

## テックスタック

| 項目 | 技術 | バージョン |
|------|------|-----------|
| フレームワーク | React + Vite (SPA) | React 19 |
| 言語 | TypeScript | strict mode |
| スタイリング | Tailwind CSS | v4 |
| 状態管理 | React Context + useReducer | — |
| ストレージ | IndexedDB (`idb`) + localStorage | — |
| PWA | vite-plugin-pwa (Workbox) | — |
| ルーティング | React Router | v7 |
| テスト | Vitest + Testing Library | — |
| コード品質 | ESLint + Prettier | — |

## プロジェクト構造（計画）

```
src/
├── components/        # UIコンポーネント
│   ├── common/        # 共通コンポーネント（Toast, Dialog等）
│   ├── editor/        # エディタ画面のコンポーネント
│   └── document-list/ # 一覧画面のコンポーネント
├── contexts/          # React Context（DocumentContext, ThemeContext）
├── hooks/             # カスタムフック
├── lib/               # ユーティリティ・ヘルパー
│   ├── db.ts          # IndexedDBアクセス層（DocumentRepository）
│   └── utils.ts       # 汎用ユーティリティ
├── pages/             # ページコンポーネント（ルートに対応）
│   ├── DocumentListPage.tsx
│   └── EditorPage.tsx
├── styles/            # グローバルスタイル・CSSトークン
├── types/             # 型定義
├── App.tsx
└── main.tsx
```

## 開発コマンド（計画）

```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run preview    # ビルド結果のプレビュー
npm run test       # テスト実行
npm run lint       # ESLint実行
npm run format     # Prettier実行
```

## 自動フック（`.claude/settings.json`）

| トリガー | タイミング | 実行内容 |
|----------|-----------|----------|
| `git commit` | コミット前 | `npm run lint && npm run format -- --check && npm run test -- --run` |
| `src/**/*.ts*` の Write/Edit | 書込み後 | `npx tsc --noEmit` (型チェック) |

> **注意**: `package.json` 未作成の段階ではフックは動作しない。実装開始手順の完了後に有効になる。

## 命名規則

- **コンポーネント**: PascalCase（`DocumentCard.tsx`）
- **フック**: camelCase、`use`プレフィックス（`useAutoSave.ts`）
- **ユーティリティ**: camelCase（`formatDate.ts`）
- **型定義**: PascalCase、`interface`優先（`Document`, `AppSettings`）
- **定数**: UPPER_SNAKE_CASE（`MAX_TITLE_LENGTH`）

## インポート順序

1. React / React関連
2. 外部ライブラリ
3. 内部モジュール（`@/`エイリアス使用）
4. 型のみのインポート（`import type`）

## キーとなる設計判断

- **textarea使用**: contentEditableは使わない（複雑さ回避）
- **自動保存**: 500msデバウンス → IndexedDB保存
- **タイトル分離**: タイトル欄と本文欄を独立したinput/textareaで実装
- **集中モード**: ヘッダーとステータスバーをCSS transitionで非表示
- **テーマ**: CSS変数で管理、localStorageに永続化
- **アニメーション**: transform + opacityのみ使用（レイアウトシフト回避）

## データモデル

```typescript
interface Document {
  id: string;        // UUID v4 (crypto.randomUUID())
  title: string;     // 最大200文字
  body: string;      // プレーンテキスト
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

## パフォーマンス基準

- バンドルサイズ: gzip後200KB以下
- 初回ロード: 3秒以内（3G想定）
- PWA起動: 1秒以内（キャッシュ済み状態）
- LCP < 2.5s / FID < 100ms / CLS < 0.1
- エディタ入力遅延: 体感0ms

## `.claude/` 設定

本 CLAUDE.md はプロジェクト全体の方針を定義する。
ファイル種別ごとの詳細規約は `.claude/rules/` で管理され、glob パターンで自動適用される。
構成の詳細は `.claude/CLAUDE.md` を参照。

| ディレクトリ/ファイル | 内容 |
|----------------------|------|
| `rules/react-components.md` | コンポーネント設計、アクセシビリティ、アニメーション |
| `rules/testing.md` | Testing Library ベストプラクティス、モック方針 |
| `rules/data-layer.md` | IndexedDB操作、状態管理、エラーハンドリング |
| `agents/` | 専門エージェント7種（tdd, test-writer, refactor, perf-optimizer, a11y-auditor, explainer, mentor） |
| `skills/` | スキル3種（new-component, check-specs, review） |

## 要件ドキュメント

詳細な仕様は `PRD.md` を参照（機能要件/非機能要件/画面仕様/データ仕様/アニメーション仕様を統合）。
