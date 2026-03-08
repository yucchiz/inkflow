# InkFlow アーキテクチャ

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
| フォント | Noto Serif JP（本文）+ Noto Sans JP（見出し・UI） | Google Fonts |
| アイコン | Heroicons | v2 |
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

## 設計判断

| 判断 | 選択 | 理由 |
|------|------|------|
| テキスト入力 | `<textarea>` | contentEditableの複雑さを回避 |
| 自動保存 | 500msデバウンス → IndexedDB | ユーザー体験とパフォーマンスのバランス |
| タイトル実装 | 独立したinput | タイトルと本文の明確な責務分離 |
| 集中モード | CSS transitionで非表示 | JS制御を最小限に、GPUアクセラレーション活用 |
| テーマ管理 | CSS変数 + localStorage | FOUC防止（同期読み取り）、CSS変数で一括切替 |
| アニメーション | transform + opacityのみ | レイアウトシフト回避、合成レイヤーで60fps維持 |

## データモデル

> 注: データモデルは `docs/PRD.md` 4.1 にも記載あり（意図的な重複）。変更時は両方を更新すること。

```typescript
interface Document {
  id: string;        // UUID v4 (crypto.randomUUID())
  title: string;     // 最大200文字
  body: string;      // プレーンテキスト
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
}
```

## パフォーマンス基準

| 指標 | 基準値 |
|------|--------|
| バンドルサイズ | gzip後 200KB以下 |
| 初回ロード | 3秒以内（3G想定） |
| PWA起動 | 1秒以内（キャッシュ済み） |
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| エディタ入力遅延 | 体感0ms |
