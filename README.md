# 📝 InkFlow — タイポグラフィ特化型メモアプリ

## App Concept

**コンセプト**: 「書く行為を、体験にする。」

超シンプルなTODOメモアプリでありながら、タイプライター風・万年筆風・手書き風など、
**書く体験そのもの**をタイポグラフィで差別化する。
機能の少なさが「洗練」として伝わるUIデザインを追求する。

---

## 1. 競合分析 & ポジショニング

### 既存競合アプリ

| アプリ名 | 特徴 | 弱点 |
|----------|------|------|
| My Typewriter | タイプライター風UIと効果音 | タイプライターに限定、モダンデザインではない |
| Typewrite | タイプライター風＋ミニマルデザイン | フォント体験の深さが不足 |
| Bear | 美しいマークダウンメモ | 高機能すぎる、シンプルではない |
| Apple Notes | 標準メモ | デザイン体験に個性がない |

### InkFlowのポジション

```
高機能 ← ─────────────────────── → シンプル
                                        ★ InkFlow
Bear ─────── Apple Notes ──────────────

汎用デザイン ← ──────────────── → 書く体験に特化
                                        ★ InkFlow
```

**差別化ポイント**:
- TODOしか書けないレベルのシンプルさ
- だが書く体験は他のどのアプリよりリッチ
- 「少なさが価値」という逆説的ポジション

---

## 2. 機能仕様（MVP）

### Core Features（1ヶ月で実装する範囲）

#### 2.1 メモ（TODO）機能
- メモの作成・編集・削除
- チェックボックスによる完了/未完了の切り替え
- 完了済みアイテムの取り消し線表示（フォントに合わせたスタイル）
- ドラッグ&ドロップによる並び替え（react-native-draggable-flatlist）

#### 2.2 タイポグラフィモード（3種 → MVP）
各モードで「書く体験」が全く異なる。

| モード | フォント | 背景 | 特殊効果 |
|--------|---------|------|---------|
| 🖋 **Fountain Pen** | セリフ体（Playfair Display / Lora） | クリーム色のペーパーテクスチャ | 文字入力時に微かなインク滲みアニメーション |
| ⌨️ **Typewriter** | モノスペース（Courier Prime / Special Elite） | 古い紙のテクスチャ | タイプ音（オプション）、微かな文字のブレ |
| ✒️ **Modern Ink** | サンセリフ（DM Serif Display / Cormorant Garamond） | ダークモード寄り、マットブラック | ミニマルで洗練、文字出現時のフェードイン |

#### 2.3 UI/UXデザイン
- **画面構成**: たった2画面（メモ一覧 / メモ編集）
- **ナビゲーション**: スワイプで削除、タップで編集
- **テーマ切替**: モード切替は設定画面ではなく、メモ一覧画面のヘッダーでシームレスに切替
- **フォント固定**: 各モードでフォントは固定（ユーザーが選ぶのは「体験モード」であり、フォントではない）
- **おしゃれなアニメーション**:
  - リスト表示時のスタガーアニメーション（上から順に登場）
  - チェック時の満足感のあるアニメーション
  - 画面遷移のスムーズなトランジション

#### 2.4 データ永続化
- AsyncStorage（MVP）→ 将来的にはiCloud同期可能な構成に
- メモデータ構造:

```typescript
interface Memo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
}

interface AppSettings {
  typographyMode: 'fountain-pen' | 'typewriter' | 'modern-ink';
  soundEnabled: boolean;
}
```

### Future Features（MVPの後に検討）
- タイプライターモードの打鍵音効果（expo-av）
- ウィジェット対応（iOS Widget）
- iCloud同期
- 追加タイポグラフィモード（和文モード：明朝体など）
- App Store公開

---

## 3. 技術アーキテクチャ

### 技術スタック

```
Framework:     React Native + Expo (SDK 52+)
Navigation:    Expo Router (file-based routing)
State:         React Context + useReducer
Animation:     react-native-reanimated + react-native-gesture-handler
Font:          expo-font + @expo-google-fonts/*
Storage:       @react-native-async-storage/async-storage
Sound:         expo-av（タイプライター音 - Phase 2）
Styling:       StyleSheet（Tailwind不使用、カスタムテーマシステム構築）
```

### ディレクトリ構成

```
inkflow/
├── app/
│   ├── _layout.tsx          # Root layout（フォントロード、テーマプロバイダ）
│   ├── index.tsx            # メモ一覧画面
│   └── memo/
│       └── [id].tsx         # メモ編集画面
├── components/
│   ├── MemoItem.tsx         # 個別メモコンポーネント
│   ├── MemoList.tsx         # メモリスト
│   ├── ModeSelector.tsx     # タイポグラフィモード切替UI
│   ├── AnimatedCheckbox.tsx # チェックボックスアニメーション
│   └── EmptyState.tsx       # 空状態の美しい表示
├── theme/
│   ├── index.ts             # テーマエクスポート
│   ├── typography.ts        # フォント定義・テキストスタイル
│   ├── colors.ts            # カラーパレット
│   └── modes/
│       ├── fountain-pen.ts  # 万年筆モードのテーマ
│       ├── typewriter.ts    # タイプライターモードのテーマ
│       └── modern-ink.ts    # モダンインクモードのテーマ
├── context/
│   ├── ThemeContext.tsx      # テーマ・モード管理
│   └── MemoContext.tsx       # メモデータ管理
├── hooks/
│   ├── useMemos.ts          # メモCRUDロジック
│   ├── useTypographyMode.ts # モード管理
│   └── useAnimatedEntry.ts  # エントリーアニメーション
├── utils/
│   └── storage.ts           # AsyncStorageラッパー
└── assets/
    ├── fonts/               # カスタムフォントファイル
    ├── textures/            # 背景テクスチャ画像
    └── sounds/              # タイプライター音（Phase 2）
```

### フォント選定（すべてGoogle Fonts / OFLライセンス）

| モード | 本文フォント | 見出しフォント | 理由 |
|--------|-------------|-------------|------|
| Fountain Pen | Lora (Regular) | Playfair Display (Bold) | 万年筆の太さ変化を想起させるセリフ体 |
| Typewriter | Courier Prime (Regular) | Special Elite (Regular) | 実際のタイプライター書体の再現 |
| Modern Ink | Cormorant Garamond (Regular) | DM Serif Display (Regular) | 現代的な高級感あるセリフ体 |

### カラーパレット

```typescript
// Fountain Pen Mode
const fountainPen = {
  background: '#FDF6E3',     // 温かみのあるクリーム
  surface: '#FAF0DC',        // やや濃いクリーム
  text: '#1A1A2E',           // 深い墨色
  accent: '#2C3E6B',         // ブルーブラックインク
  completed: '#8B7355',      // セピア
  border: '#E8DCC8',         // 淡いカーキ
};

// Typewriter Mode
const typewriter = {
  background: '#F5F0E8',     // 古い紙
  surface: '#EDE7DB',        // やや黄ばんだ紙
  text: '#2D2D2D',           // タイプインク（完全な黒ではない）
  accent: '#8B0000',         // 赤いタイプリボン
  completed: '#999999',      // 薄れたインク
  border: '#D4CBB8',         // 紙の端
};

// Modern Ink Mode
const modernInk = {
  background: '#0A0A0A',     // マットブラック
  surface: '#141414',        // やや明るい黒
  text: '#E8E4DE',           // オフホワイト
  accent: '#C9A96E',         // ゴールドアクセント
  completed: '#555555',      // 暗めのグレー
  border: '#222222',         // 微かなボーダー
};
```

---

## 4. 開発ロードマップ（4週間）

### Week 1: 基盤構築（Day 1-7）

| Day | タスク | 成果物 |
|-----|--------|--------|
| 1 | Expoプロジェクト初期化、ディレクトリ構成作成 | プロジェクトスケルトン |
| 2 | フォントのロード・設定（expo-font, Google Fonts） | 3モードのフォント表示確認 |
| 3 | テーマシステム構築（ThemeContext, 3モードの定義） | モード切替でカラー・フォント変更 |
| 4 | データモデル定義、AsyncStorageラッパー | CRUD動作確認 |
| 5 | MemoContext + useReducerによる状態管理 | メモの追加・削除・更新 |
| 6 | Expo Router設定（2画面構成） | 画面遷移動作確認 |
| 7 | Week 1レビュー＆バグ修正 | 機能面の基盤完成 |

### Week 2: コアUI実装（Day 8-14）

| Day | タスク | 成果物 |
|-----|--------|--------|
| 8 | メモ一覧画面のレイアウト実装 | 基本リスト表示 |
| 9 | MemoItemコンポーネント（チェックボックス、テキスト） | 個別メモUI |
| 10 | メモ編集画面のUI実装 | テキスト入力・保存 |
| 11 | ModeSelector（タイポグラフィモード切替UI） | 3モード切替UI |
| 12 | スワイプ削除の実装（Gesture Handler） | スワイプ操作 |
| 13 | 空状態（EmptyState）のデザイン | 美しい空状態 |
| 14 | Week 2レビュー＆バグ修正 | コアUI完成 |

### Week 3: アニメーション & デザイン磨き込み（Day 15-21）

| Day | タスク | 成果物 |
|-----|--------|--------|
| 15 | リスト表示のスタガーアニメーション（Reanimated） | 登場アニメーション |
| 16 | チェックボックスアニメーション | 完了時の気持ちいいフィードバック |
| 17 | 画面遷移アニメーション（Shared Transition） | スムーズな画面遷移 |
| 18 | 背景テクスチャの実装（各モード） | 紙のような質感 |
| 19 | Fountain Penモード：インク滲みエフェクト | 文字入力時の微かなアニメーション |
| 20 | Typewriterモード：文字ブレ＋キャレットアニメーション | タイプライター感の演出 |
| 21 | Modern Inkモード：フェードイン＋光沢感 | 高級感の演出 |

### Week 4: 仕上げ & 完成（Day 22-28）

| Day | タスク | 成果物 |
|-----|--------|--------|
| 22 | ハプティクスフィードバック追加（expo-haptics） | タップ時の触覚体験 |
| 23 | アプリアイコン＆スプラッシュスクリーン作成 | ブランドアイデンティティ |
| 24 | パフォーマンス最適化（FlatList, メモ化） | 60fps確保 |
| 25 | 全モードのデザインQA＆微調整 | デザインの完成度 |
| 26 | バグ修正＆エッジケース対応 | 安定性確保 |
| 27 | 最終テスト（実機テスト） | 品質確認 |
| 28 | README作成、GitHubリポジトリ整理 | **MVP完成** 🎉 |

---

## 5. 学べる技術（スキルアップ効果）

### React Native / Expo

| 技術 | 詳細 | 難易度 |
|------|------|--------|
| expo-font | カスタムフォントのロードと管理 | ★☆☆ |
| expo-router | ファイルベースルーティング | ★★☆ |
| expo-haptics | ハプティクスフィードバック | ★☆☆ |
| react-native-reanimated | 高性能アニメーション | ★★★ |
| react-native-gesture-handler | スワイプ・ドラッグ操作 | ★★★ |
| Context + useReducer | グローバル状態管理パターン | ★★☆ |
| AsyncStorage | ローカルデータ永続化 | ★☆☆ |

### デザインエンジニアリング

| スキル | 詳細 |
|--------|------|
| デザインシステム構築 | テーマ・カラー・タイポグラフィの体系的管理 |
| アニメーション設計 | ユーザー体験を高めるモーションデザイン |
| テクスチャ・質感表現 | 紙やインクの質感をデジタルで再現 |
| アクセシビリティ | フォントサイズ、コントラスト比の配慮 |

---

## 6. App Store審査対策

### ガイドライン 4.2（Minimum Functionality）対策

Appleが「単なるTODOアプリ」としてリジェクトするリスクへの対策:

1. **独自のタイポグラフィモードシステム**: 3つの異なる書く体験を提供
2. **デザインの質**: プレミアムなUI品質がMinimum Functionalityの壁を超える根拠になる
3. **App Store説明文での差別化**:
   - 「メモアプリ」ではなく「書く体験アプリ」として訴求
   - タイポグラフィへのこだわりをメインバリューとして伝える

### 参考: App Review Guidelines

> **4.2 Minimum Functionality**
> Your app should include features, content, and UI that elevate it
> beyond a repackaged website. If your app is not particularly useful,
> unique, or "app-like," it doesn't belong on the App Store.

**出典**: Apple Developer - App Review Guidelines
https://developer.apple.com/app-store/review/guidelines/#minimum-functionality

---

## 7. 将来の拡張シナリオ

### Phase 2（MVP後 1-2ヶ月）
- タイプライター打鍵音（expo-av）
- 和文モード追加（Noto Serif JP / Zen Old Mincho）
- ウィジェット対応

### Phase 3（収益化検討）
- フリーミアム: 基本1モード無料 → 全モード解放 ¥250買い切り
- 追加モード課金（和文モード、カリグラフィモード等）
- App Storeでの「書く体験」カテゴリでのASO最適化

---

## まとめ

InkFlowは「少なさ」を武器にするアプリ。
TODOしか書けないシンプルさの中に、
タイポグラフィの質感という「深さ」を埋め込む。

**「何ができるか」ではなく「どう書けるか」で選ばれるアプリ。**
