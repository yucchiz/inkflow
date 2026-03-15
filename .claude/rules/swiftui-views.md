---
globs: ['Sources/**/Views/**/*.swift', 'App/**/*.swift']
---

# SwiftUI View 規約

## View 定義

- `struct` で `View` protocol に準拠する
- 1ファイル1View を厳守
- プロパティは View の stored property として定義する（`let` / `@State` / `@Binding` / `@Environment` 等）
- Preview は同ファイル末尾に `#Preview` マクロで定義する

## アクセシビリティ

- `.accessibilityLabel()` で全てのインタラクティブ要素にラベルを付与する
- `.accessibilityHint()` で操作結果の説明を補足する
- `.accessibilityValue()` で現在の状態を伝える（トグル、スライダー等）
- VoiceOver で全画面を操作可能にする — 画像やアイコンのみの要素にもラベルを付与する
- Dynamic Type に対応する — フォントサイズは `.font()` modifier でシステムフォントを使用し、固定サイズを避ける
- `@Environment(\.accessibilityReduceMotion)` でモーション制御を行う

## スタイリング

- SwiftUI modifier チェーンを使用する
- プロジェクト定義のカラートークン `Color.InkFlow` を使用する
- システム標準の `Color` を直接使用しない — 必ずトークン経由にする
- SF Symbols をアイコンとして使用する（`Image(systemName:)`）

## アニメーション

- `withAnimation` ブロックまたは `.animation()` modifier のみを使用する
- `@Environment(\.accessibilityReduceMotion)` を確認し、`true` の場合はアニメーションを無効化またはシンプルにする
- 明示的な `Animation` 値を指定する（`.default` に頼らない）
- レイアウトシフトを起こすアニメーションは避ける — `opacity` と `scaleEffect` を優先する
