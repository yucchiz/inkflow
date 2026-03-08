---
name: scaffold
description: プロジェクトの初期セットアップを行うエージェント。Vite + React + TypeScript プロジェクトの初期化、依存パッケージのインストール、設定ファイルの構成、ディレクトリ構造の作成を実行する。
tools: Read, Write, Edit, Bash, Glob, Grep
---

# プロジェクトスキャフォールディングエージェント

CLAUDE.md の「実装開始手順」に従い、プロジェクトの基盤を構築する。

## ワークフロー

### 1. 前提チェック
- `package.json` や `src/` が既に存在しないか確認する
- 既に存在する場合はスキップ理由を報告し、部分的なセットアップのみ実施する
- `docs/architecture.md` を読み、テックスタックとプロジェクト構造を把握する

### 2. Vite プロジェクト初期化
- `npm create vite@latest . -- --template react-ts` を実行する
- 生成されたファイルの不要な部分（デフォルトの CSS、サンプルコンポーネント等）を整理する

### 3. 依存パッケージのインストール

#### ランタイム依存
```bash
npm install idb react-router vite-plugin-pwa tailwindcss @tailwindcss/vite @heroicons/react
```

#### 開発依存
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom eslint prettier eslint-config-prettier
```

### 4. TypeScript 設定
- `tsconfig.json` および `tsconfig.app.json` に `@/*` パスエイリアスを追加:
  ```json
  {
    "compilerOptions": {
      "paths": { "@/*": ["./src/*"] }
    }
  }
  ```

### 5. Vite 設定（`vite.config.ts`）
- `@tailwindcss/vite` プラグインを追加
- `vite-plugin-pwa` プラグインを追加（基本設定）
- `resolve.alias` で `@` → `./src` のパスエイリアスを設定
- Vitest の設定を追加（`test.environment: 'jsdom'`, `test.setupFiles`）

### 6. ディレクトリ構造の作成
`docs/architecture.md` のプロジェクト構造に従い、以下を作成する:
```
src/
├── components/
│   ├── common/         # .gitkeep
│   ├── editor/         # .gitkeep
│   └── document-list/  # .gitkeep
├── contexts/           # .gitkeep
├── hooks/              # .gitkeep
├── lib/                # .gitkeep
├── pages/              # .gitkeep
├── styles/             # global.css
└── types/              # document.ts
```

### 7. 型定義の作成
- `src/types/document.ts` に `Document` と `AppSettings` インターフェースを作成する
- `docs/architecture.md` および `docs/PRD.md` セクション 4.1 のデータモデルに準拠する

### 8. グローバルCSS
- `src/styles/global.css` を作成する
- `docs/design-language.md` からカラートークン、フォントスタック、スペーシングを CSS 変数として定義する
- `@import "tailwindcss"` を含める
- `prefers-reduced-motion: reduce` メディアクエリを含める

### 9. ESLint + Prettier 設定
- プロジェクト規約に沿った最小限の設定ファイルを作成する
- `eslint-config-prettier` で ESLint と Prettier の競合を防ぐ

### 10. ローカル規約ファイルの作成
- `src/lib/CLAUDE.md` — IndexedDB 操作ルール（`data-layer.md` の要約）
- `src/contexts/CLAUDE.md` — 状態管理ルール（Context + useReducer パターン）

### 11. 動作確認
- `npm run lint` でリント通過を確認
- `npm run test -- --run` でテスト実行を確認（テストファイルがなくてもエラーにならないこと）
- `npx tsc --noEmit` で型チェック通過を確認
- `npm run build` でビルド成功を確認

### 12. 報告
- 作成・変更したファイルの一覧
- インストールしたパッケージの一覧
- 動作確認の結果
- 次のステップ（最初に実装すべき機能の提案）

## 重要なルール
- **仕様書に忠実** — `docs/architecture.md` のテックスタックとバージョンを正確に使用する
- **最小限のセットアップ** — 必要なものだけを設定し、過度な設定をしない
- **冪等性** — 既にセットアップ済みの部分はスキップする
- **既存ファイルを壊さない** — `.claude/`, `docs/`, `CLAUDE.md` 等の既存ファイルを変更しない
- **動作確認必須** — セットアップ完了後、必ず lint/test/build が通ることを確認する
