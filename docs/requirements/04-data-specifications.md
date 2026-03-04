# 04 - データ仕様

## 1. データモデル

### 1.1 Document

```typescript
interface Document {
  id: string;        // UUID v4（crypto.randomUUID()）
  title: string;     // ドキュメントタイトル
  body: string;      // 本文（プレーンテキスト）
  createdAt: string;  // 作成日時（ISO 8601形式）
  updatedAt: string;  // 更新日時（ISO 8601形式）
}
```

### フィールド詳細

| フィールド | 型 | 必須 | デフォルト値 | バリデーション |
|-----------|------|------|-------------|---------------|
| id | string | Yes | `crypto.randomUUID()` | UUID v4形式 |
| title | string | Yes | `""` | 最大200文字。空文字の場合は一覧画面で「無題のドキュメント」と表示 |
| body | string | Yes | `""` | 文字数上限なし（実質的にはブラウザのIndexedDB容量に依存） |
| createdAt | string | Yes | `new Date().toISOString()` | ISO 8601形式 |
| updatedAt | string | Yes | `new Date().toISOString()` | ISO 8601形式。title / body 変更時に更新 |

### 1.2 AppSettings

```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
}
```

### フィールド詳細

| フィールド | 型 | デフォルト値 | 説明 |
|-----------|------|-------------|------|
| theme | string | `'system'` | カラーテーマ。OS設定に追従 or 手動切替 |

---

## 2. IndexedDB設計

### データベース

| 項目 | 値 |
|------|------|
| データベース名 | `inkflow` |
| バージョン | `1` |

### オブジェクトストア

| ストア名 | キーパス | インデックス | 説明 |
|----------|---------|-------------|------|
| `documents` | `id` | `updatedAt`（降順ソート用） | ドキュメントデータ |

### 設定の保存

アプリ設定（`AppSettings`）は `localStorage` に保存する。

| キー | 値の型 | 説明 |
|------|--------|------|
| `inkflow:theme` | `'light' \| 'dark' \| 'system'` | カラーテーマ設定 |

**IndexedDB vs localStorage の使い分け:**

| 用途 | ストレージ | 理由 |
|------|-----------|------|
| ドキュメントデータ | IndexedDB | 大量データ・構造化データの保存に適する |
| アプリ設定 | localStorage | 少量のキーバリュー。同期的に読めるため初期表示が速い |

---

## 3. データアクセス層

IndexedDBの操作を抽象化するモジュールを用意する。

### DocumentRepository

```typescript
// ドキュメントの永続化操作
interface DocumentRepository {
  getAll(): Promise<Document[]>;           // 全件取得（updatedAt降順）
  getById(id: string): Promise<Document | undefined>;  // 1件取得
  save(doc: Document): Promise<void>;      // 作成 or 更新（upsert）
  remove(id: string): Promise<void>;       // 削除
}
```

### 実装方針

| 方針 | 詳細 |
|------|------|
| ライブラリ | `idb`（IndexedDBの薄いPromiseラッパー）を使用 |
| トランザクション | 各操作は単一トランザクションで完結 |
| エラーハンドリング | try-catch でラップし、失敗時はトースト通知 |

---

## 4. 状態管理

### 方針

React の標準機能（`useState` / `useReducer` + Context）で管理する。
外部状態管理ライブラリは使用しない。

### 4.1 DocumentContext

#### State

```typescript
interface DocumentState {
  documents: Document[];
  isLoading: boolean;
}
```

#### Actions

| Action | Payload | 説明 |
|--------|---------|------|
| `LOAD_DOCUMENTS` | `Document[]` | IndexedDBからドキュメントを読み込み |
| `ADD_DOCUMENT` | `Document` | 新規ドキュメントを追加 |
| `UPDATE_DOCUMENT` | `Document` | ドキュメントを更新 |
| `DELETE_DOCUMENT` | `{ id: string }` | ドキュメントを削除 |

### 4.2 ThemeContext

#### State

```typescript
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';  // systemの場合はOS設定を解決した値
}
```

#### Actions

| Action | Payload | 説明 |
|--------|---------|------|
| `SET_THEME` | `'light' \| 'dark' \| 'system'` | テーマを変更。localStorageに保存 |

---

## 5. データフロー

### ドキュメント作成フロー

```
FABクリック
  → 新規Document生成（id: UUID, title: "", body: ""）
  → IndexedDBに保存
  → ADD_DOCUMENT dispatch
  → エディタ画面へ遷移（/doc/:id）
  → 本文入力欄に自動フォーカス
```

### 自動保存フロー

```
タイトル or 本文を編集
  → デバウンス（500ms 無入力で発火）
  → updatedAt を現在時刻に更新
  → UPDATE_DOCUMENT dispatch
  → IndexedDBに保存
  → ヘッダーに「保存済み」表示 → 2秒後にフェードアウト
```

### ドキュメント削除フロー

```
削除ボタンクリック
  → 確認ダイアログ表示
  → [キャンセル] → 何もしない
  → [削除] → DELETE_DOCUMENT dispatch
          → IndexedDBから削除
          → （エディタ画面の場合）一覧画面へ遷移
```

### テーマ切替フロー

```
テーマトグルクリック
  → SET_THEME dispatch（light ↔ dark をトグル）
  → localStorageに保存
  → CSS変数が即座に切り替わる
```

### アプリ起動フロー

```
アプリ起動
  → localStorageからテーマ設定を読み込み（同期）
  → テーマを即座に適用（FOUC防止）
  → IndexedDBからドキュメント一覧を読み込み（非同期）
  → LOAD_DOCUMENTS dispatch
  → isLoading: false → 一覧画面を描画
```

---

## 6. データマイグレーション

### 方針

MVP段階では明示的なマイグレーション機構は設けない。
将来のスキーマ変更に備え、以下の原則を守る:

| 原則 | 詳細 |
|------|------|
| DBバージョン管理 | IndexedDBの `version` パラメータで管理。スキーマ変更時にインクリメント |
| `onupgradeneeded` | IndexedDB標準のアップグレードイベントで新ストア/インデックスを作成 |
| デフォルト値補完 | 新フィールド追加時は読み込み時にデフォルト値で補完 |
| 後方互換 | 既存データを破壊しない変更のみ許可 |
