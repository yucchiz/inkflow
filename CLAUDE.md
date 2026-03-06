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

## リポジトリマップ

| パス | 内容 |
|------|------|
| `docs/PRD.md` | 機能要件・画面仕様・データ仕様・アニメーション仕様 |
| `docs/architecture.md` | テックスタック・構造・設計判断・データモデル・パフォーマンス基準 |
| `.claude/` | rules（自動適用規約）、agents、skills |
| `src/` | アプリケーションコード（未作成） |

> `src/` 作成後、`src/lib/CLAUDE.md`（IndexedDBルール）と `src/contexts/CLAUDE.md`（状態管理ルール）をローカル規約として追加予定。

## 開発コマンド（計画）

```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run preview    # ビルド結果のプレビュー
npm run test       # テスト実行
npm run lint       # ESLint実行
npm run format     # Prettier実行
```

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

## 設計上の禁止事項

- `contentEditable` を使わない — `<textarea>` を使用する
- `dangerouslySetInnerHTML` を使わない
- `width`/`height`/`top`/`left` 等のレイアウトプロパティをアニメーションしない
- 外部状態管理ライブラリ（Redux, Zustand等）を使わない
