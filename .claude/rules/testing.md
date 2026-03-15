---
globs: ['Tests/**/*.swift']
---

# テスト規約

## Swift Testing ベストプラクティス

- `@Test` マクロでテスト関数を定義する
- `@Suite` マクロでテストをグループ化する
- アサーションは `#expect()` マクロを使用する
- 前提条件の検証には `#require()` マクロを使用する（失敗時にテストを即座に中断）
- XCUITest では `app.buttons["label"]`, `app.textFields["label"]` のようにアクセシビリティ識別子で要素を特定する

## テスト設計

- ユーザー操作ベースのテストを書く（実装詳細に依存しない）
- 「ユーザーが何を見て、何をするか」の観点でテストする
- ViewModel の内部状態への直接的なアサーションは避ける — 公開プロパティ経由で検証する
- 依存関係は Protocol mock 注入パターンを基本とする

## モック

- SwiftData は in-memory 構成でテストする: `ModelConfiguration(isStoredInMemoryOnly: true)`
- Protocol を定義して依存を注入し、テスト時はモック実装に差し替える
- モックは最小限に — 本物を使えるなら本物を使う

## 記述スタイル

- `@Test("〜すること")` で日本語の表示名を記述可（仕様書が日本語のため）
- テスト名は「〜すること」「〜が表示されること」のように期待結果を明示する
- AAA パターン（Arrange, Act, Assert）に従う
