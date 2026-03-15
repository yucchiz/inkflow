# InkFlow

> 書く。ただ、それだけを美しく。

プレーンテキストの執筆に特化したシンプルな PWA アプリ。美しい UI と心地よい書き味で、書くことだけに集中できる環境を提供します。

## 主要機能

- オフライン対応（PWA / Service Worker）
- 自動保存（500ms デバウンス）
- ダークモード（システム設定追従 / 手動切替）
- 集中モード（UI を非表示にして執筆に集中）
- テキストのコピー・ダウンロード
- レスポンシブデザイン（デスクトップ・モバイル対応）

## テックスタック

| カテゴリ       | 技術                             |
| -------------- | -------------------------------- |
| フレームワーク | React 19 + TypeScript (strict)   |
| ビルド         | Vite 7                           |
| スタイル       | Tailwind CSS v4                  |
| 状態管理       | Context + useReducer             |
| ストレージ     | IndexedDB (`idb`) + localStorage |
| ルーティング   | React Router v7                  |
| テスト         | Vitest + Testing Library         |
| PWA            | vite-plugin-pwa (Workbox)        |

## セットアップ

```bash
git clone <repository-url>
cd inkflow
npm install
npm run dev
```

## 開発コマンド

| コマンド                | 説明                              |
| ----------------------- | --------------------------------- |
| `npm run dev`           | 開発サーバー起動                  |
| `npm run build`         | 型チェック + プロダクションビルド |
| `npm run test`          | テスト実行（watch モード）        |
| `npm run test -- --run` | テスト一括実行                    |
| `npm run lint`          | ESLint                            |
| `npm run format`        | Prettier（自動修正）              |
| `npm run format:check`  | Prettier（チェックのみ）          |

## プロジェクト構成

```
src/
├── components/
│   ├── common/           # 共通 UI（Toast, ConfirmDialog, Header 等）
│   ├── document-list/    # 一覧画面（DocumentCard, EmptyState, Fab 等）
│   └── editor/           # エディタ（TitleInput, BodyTextarea, StatusBar 等）
├── contexts/             # React Context（Document, Theme, Toast）
├── hooks/                # カスタムフック（useAutoSave, useFocusMode 等）
├── lib/                  # ユーティリティ（DB, formatDate, exportDocument）
├── pages/                # ページコンポーネント（DocumentListPage, EditorPage）
├── styles/               # Tailwind エントリー + デザイントークン
├── test/                 # テストセットアップ
└── types/                # 型定義
```

## ドキュメント

| ドキュメント                                         | 内容                                         |
| ---------------------------------------------------- | -------------------------------------------- |
| [`docs/PRD.md`](docs/PRD.md)                         | 機能要件・画面仕様・データ仕様               |
| [`docs/architecture.md`](docs/architecture.md)       | テックスタック・設計判断・パフォーマンス基準 |
| [`docs/design-language.md`](docs/design-language.md) | デザイン哲学「墨と余白」・カラーパレット     |
| [`CLAUDE.md`](CLAUDE.md)                             | Claude Code 向けガイド・開発規約             |
