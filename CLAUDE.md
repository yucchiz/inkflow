# InkFlow

## プロジェクト概要

「書く。ただ、それだけを美しく。」— シンプルな執筆専用PWAアプリ。
プレーンテキストの執筆に特化し、美しいUIと心地よい書き味を提供する。

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

## プロジェクト構造

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

## 開発コマンド

```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run preview    # ビルド結果のプレビュー
npm run test       # テスト実行
npm run lint       # ESLint実行
npm run format     # Prettier実行
```

## コーディング規約

### 命名規則
- **コンポーネント**: PascalCase（`DocumentCard.tsx`）
- **フック**: camelCase、`use`プレフィックス（`useAutoSave.ts`）
- **ユーティリティ**: camelCase（`formatDate.ts`）
- **型定義**: PascalCase、`interface`優先（`Document`, `AppSettings`）
- **定数**: UPPER_SNAKE_CASE（`MAX_TITLE_LENGTH`）
- **CSSクラス**: Tailwind CSSのユーティリティクラスを使用

### コンポーネント設計
- 関数コンポーネント + フックのみ（クラスコンポーネント不使用）
- 1ファイル1コンポーネントを原則とする
- Props型は同ファイル内で定義（`type Props = { ... }`）
- `children`が不要なコンポーネントは自己閉じタグ（`<Component />`）
- `React.FC`は使用しない — 通常の関数宣言を使用する

### 状態管理の方針
- グローバル状態: React Context + useReducer（DocumentContext, ThemeContext）
- ローカル状態: useState / useReducer
- 外部状態管理ライブラリは使用しない（MVP段階）

### インポート順序
1. React / React関連
2. 外部ライブラリ
3. 内部モジュール（`@/`エイリアス使用）
4. 型のみのインポート（`import type`）

### エラーハンドリング
- IndexedDB操作は必ずtry-catchでラップ
- ユーザー向けエラーはトースト通知で表示
- コンソールエラーにはコンテキスト情報を含める

## データモデル

```typescript
// src/types/document.ts
interface Document {
  id: string;        // UUID v4 (crypto.randomUUID())
  title: string;     // 最大200文字
  body: string;      // プレーンテキスト
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

## キーとなる設計判断

- **textarea使用**: contentEditableは使わない（複雑さ回避）
- **自動保存**: 500msデバウンス → IndexedDB保存
- **タイトル分離**: タイトル欄と本文欄を独立したinput/textareaで実装
- **集中モード**: ヘッダーとステータスバーをCSS transitionで非表示
- **テーマ**: CSS変数で管理、localStorageに永続化
- **アニメーション**: transform + opacityのみ使用（レイアウトシフト回避）

## パフォーマンス基準

- バンドルサイズ: gzip後200KB以下
- 初回ロード: 3秒以内（3G想定）
- LCP < 2.5s / FID < 100ms / CLS < 0.1
- エディタ入力遅延: 体感0ms

## テスト方針

- **ユニットテスト**: データアクセス層、ユーティリティ関数、カスタムフック
- **コンポーネントテスト**: Testing Libraryでユーザー操作をシミュレート
- **テストファイル配置**: `__tests__/`ディレクトリまたは`*.test.ts(x)`

## 要件ドキュメント

詳細な仕様は `docs/requirements/` を参照:
- `01-functional-requirements.md` — 機能要件
- `02-non-functional-requirements.md` — 非機能要件
- `03-screen-specifications.md` — 画面仕様
- `04-data-specifications.md` — データ仕様
- `05-animation-specifications.md` — アニメーション仕様
