# 04 - データ仕様

## 1. データモデル

### 1.1 Memo

```typescript
interface Memo {
  id: string;          // UUID v4（crypto.randomUUID()）
  text: string;        // メモ本文（最大100文字）
  completed: boolean;  // 完了フラグ
  createdAt: string;   // 作成日時（ISO 8601形式）
  updatedAt: string;   // 更新日時（ISO 8601形式）
  order: number;       // 表示順序（0始まり、小さいほど上）
}
```

### フィールド詳細

| フィールド | 型 | 必須 | デフォルト値 | バリデーション |
|-----------|------|------|-------------|---------------|
| id | string | Yes | `crypto.randomUUID()` | UUID v4形式 |
| text | string | Yes | `""` | 0〜100文字。空文字の場合は画面離脱時に自動削除 |
| completed | boolean | Yes | `false` | - |
| createdAt | string | Yes | `new Date().toISOString()` | ISO 8601形式 |
| updatedAt | string | Yes | `new Date().toISOString()` | ISO 8601形式。テキスト変更・完了切替時に更新 |
| order | number | Yes | 既存メモの最大order + 1 | 0以上の整数 |

### 1.2 AppSettings

```typescript
interface AppSettings {
  typographyMode: 'fountain-pen' | 'typewriter' | 'modern-ink';
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onboardingCompleted: boolean;
}
```

### フィールド詳細

| フィールド | 型 | デフォルト値 | 説明 |
|-----------|------|-------------|------|
| typographyMode | string | `'modern-ink'` | 選択中のタイポグラフィモード |
| soundEnabled | boolean | `false` | タイプライター音（Phase 2。MVPでは常にfalse） |
| hapticsEnabled | boolean | `false` | ハプティクスフィードバック |
| onboardingCompleted | boolean | `false` | オンボーディング表示済みフラグ |

---

## 2. AsyncStorageキー設計

| キー | 値の型 | 説明 |
|------|--------|------|
| `@inkflow/memos` | `Memo[]` | メモデータの配列（JSON文字列として保存） |
| `@inkflow/settings` | `AppSettings` | アプリ設定（JSON文字列として保存） |

### ストレージ操作

```
読み込み: AsyncStorage.getItem(key) → JSON.parse()
書き込み: JSON.stringify(data) → AsyncStorage.setItem(key)
```

---

## 3. 状態管理（Context + useReducer）

### 3.1 MemoContext

#### State

```typescript
interface MemoState {
  memos: Memo[];
  isLoading: boolean;
}
```

#### Actions

| Action | Payload | 説明 |
|--------|---------|------|
| `LOAD_MEMOS` | `Memo[]` | AsyncStorageからメモを読み込み |
| `ADD_MEMO` | `Memo` | 新規メモを追加 |
| `UPDATE_MEMO` | `{ id: string; text: string }` | メモのテキストを更新 |
| `TOGGLE_MEMO` | `{ id: string }` | 完了/未完了を切替 |
| `DELETE_MEMO` | `{ id: string }` | メモを削除 |
| `RESTORE_MEMO` | `{ memo: Memo; index: number }` | 削除したメモを元の位置に復元 |
| `REORDER_MEMOS` | `Memo[]` | 並び替え後のメモ配列をセット |

### 3.2 ThemeContext

#### State

```typescript
interface ThemeState {
  mode: 'fountain-pen' | 'typewriter' | 'modern-ink';
  settings: AppSettings;
}
```

#### Actions

| Action | Payload | 説明 |
|--------|---------|------|
| `LOAD_SETTINGS` | `AppSettings` | AsyncStorageから設定を読み込み |
| `SET_MODE` | `TypographyMode` | タイポグラフィモードを変更 |
| `SET_HAPTICS` | `boolean` | ハプティクスのON/OFF切替 |
| `COMPLETE_ONBOARDING` | なし | オンボーディング完了フラグをON |

---

## 4. データフロー

### メモ作成フロー

```
FABタップ
  → 新規Memo生成（id, text: "", completed: false, order: max+1）
  → ADD_MEMO dispatch
  → AsyncStorageに保存
  → 編集画面へ遷移
  → テキスト入力（デバウンス500ms）
  → UPDATE_MEMO dispatch
  → AsyncStorageに保存
  → 画面離脱時にtextが空なら DELETE_MEMO dispatch
```

### メモ削除フロー

```
左スワイプ
  → 削除対象のMemoとindexを一時保存
  → DELETE_MEMO dispatch
  → AsyncStorageに保存
  → Undoトースト表示（3秒）
  → [元に戻すタップ] → RESTORE_MEMO dispatch → AsyncStorageに保存
  → [3秒経過] → 一時保存データを破棄
```

### モード切替フロー

```
ヘッダーアイコンタップ
  → SET_MODE dispatch
  → テーマ（カラー・フォント）が即座に切り替わる
  → AsyncStorageに設定を保存
```

---

## 5. データマイグレーション

### 方針

MVP段階では明示的なマイグレーション機構は設けない。
将来のスキーマ変更に備え、以下の原則を守る:

| 原則 | 詳細 |
|------|------|
| バージョンフィールド | 将来的に `@inkflow/schema_version` キーを追加可能な設計とする |
| デフォルト値 | 新フィールド追加時はデフォルト値で埋める（既存データとの互換性確保） |
| 読み込み時の防御 | `JSON.parse` 後にフィールドの存在チェックを行い、欠損フィールドはデフォルト値で補完 |
