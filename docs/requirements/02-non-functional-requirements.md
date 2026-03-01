# 02 - 非機能要件

## 1. 対応プラットフォーム

| 項目 | 仕様 |
|------|------|
| 対応OS | iOS専用 |
| 最低バージョン | iOS 16.0以上 |
| 対応デバイス | iPhone（iPadはストレッチゴール） |
| 画面サイズ | iPhone SE（第3世代）〜 iPhone 16 Pro Max |

---

## 2. 言語

| 項目 | 仕様 |
|------|------|
| UI言語 | 日本語のみ |
| テキスト方向 | LTR（左から右） |
| フォント | 欧文フォントを使用（メモ内容は日本語・英語どちらも入力可） |

---

## 3. パフォーマンス

| 項目 | 基準値 |
|------|--------|
| リスト描画 | 60fps維持（50件フル表示時） |
| 画面遷移 | 300ms以内 |
| 自動保存の遅延 | デバウンス500ms以内にAsyncStorageへ書き込み完了 |
| アプリ起動 | コールドスタート3秒以内（フォントロード含む） |
| メモリ使用量 | 100MB以下（通常使用時） |

---

## 4. データ永続化

| 項目 | 仕様 |
|------|------|
| ストレージ | AsyncStorage（ローカルのみ） |
| オフライン対応 | 完全オフラインで動作 |
| ネットワーク依存 | なし（MVP） |
| データ同期 | なし（将来的にiCloud同期を検討） |
| バックアップ | iOSの端末バックアップに含まれる（AsyncStorageのデフォルト動作） |

---

## 5. セキュリティ

| 項目 | 仕様 |
|------|------|
| 認証 | なし（ローカルアプリのため） |
| データ暗号化 | AsyncStorageのデフォルト（端末暗号化に依存） |
| 個人情報 | 収集しない |
| 外部通信 | なし |

---

## 6. アクセシビリティ

| 項目 | 仕様 |
|------|------|
| VoiceOver | MVPでは対応しない |
| Dynamic Type | MVPでは対応しない |
| Reduce Motion | MVPでは対応しない |
| コントラスト比 | 各モードで最低4.5:1を確保（WCAG AA準拠を目標） |

> **Phase 2検討**: VoiceOverラベル、Dynamic Type対応、Reduce Motion対応

---

## 7. 品質基準

| 項目 | 基準 |
|------|------|
| クラッシュ率 | 99.5%以上クラッシュフリー |
| ANR（Application Not Responding） | 発生させない |
| テスト | ユニットテスト（Context、hooks）、手動テスト（UI） |

---

## 8. 技術的制約

| 項目 | 仕様 |
|------|------|
| フレームワーク | React Native + Expo (SDK 52+) |
| ナビゲーション | Expo Router（ファイルベースルーティング） |
| 状態管理 | React Context + useReducer |
| アニメーション | react-native-reanimated + react-native-gesture-handler |
| フォント | expo-font + @expo-google-fonts/* |
| ストレージ | @react-native-async-storage/async-storage |
| スタイリング | StyleSheet（Tailwind不使用、カスタムテーマシステム） |
| ビルド | EAS Build（Expo Application Services） |
