# InkFlow

書く。ただ、それだけを美しく。

シンプルな執筆専用 PWA。プレーンテキストの執筆に特化し、美しい UI と心地よい書き味を提供します。

## 機能

- オフライン対応（Service Worker）
- ホーム画面にインストール可能
- 自動保存（500ms デバウンス）
- ライト/ダーク/システムテーマ
- 集中モード
- 文字数カウント

## 開発

```bash
npm install      # 依存関係インストール
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm test         # テスト実行
npm run preview  # ビルド結果プレビュー
```

## デプロイ

GitHub Pages に自動デプロイ（main ブランチへの push でトリガー）。

## テックスタック

React 19 / TypeScript / Vite / IndexedDB / PWA (Workbox)

## ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [PRD](docs/PRD.md) | 機能要件・画面仕様・データ仕様 |
| [アーキテクチャ](docs/architecture.md) | テックスタック・プロジェクト構造・設計判断 |
| [デザインランゲージ](docs/design-language.md) | 「墨と余白」デザインシステム |

## ライセンス

Private
