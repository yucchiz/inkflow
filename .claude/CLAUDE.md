# .claude/ 設定ガイド

Claude Code の動作設定を管理するディレクトリ。

## 構成

| ディレクトリ/ファイル | 役割 |
|----------------------|------|
| `settings.json` | 権限設定・フック |
| `rules/` | glob パターンで自動適用される実装規約 |
| `agents/` | 専門タスクを自律実行するエージェント定義 |
| `skills/` | `/` コマンドで呼び出す定型タスク |

## ルート CLAUDE.md との分担

- `/CLAUDE.md`: プロジェクト全体の方針（テックスタック、命名規則、設計判断）
- `rules/`: 特定ファイル種別向けの詳細規約（glob で自動適用）
- rules/ の内容がルートと一部重複するのは意図的（自己完結性のため）

## 各ファイルの書き方

### rules/

```yaml
---
globs: ["src/components/**/*.tsx"]
---
```

- 1ファイル1責務、kebab-case、glob は対象を正確に絞る
- 簡潔に（30行目安）。「〜すること」の形で記述

### agents/

```yaml
---
name: agent-name
description: 目的を1〜2文で
tools: Read, Write, Edit, Bash, Glob, Grep
---
```

- `agents/<name>.md` にフラット配置、kebab-case
- 本文構成: ワークフロー（番号付きステップ）→ 重要なルール
- tools は最小権限（読み取り専用なら `Read, Glob, Grep`）
- 変更を伴うエージェントには検証ステップ（`npm run test` 等）と停止条件を含める

### skills/

```yaml
---
name: skill-name
description: 目的を1行で
context: fork          # 読み取り専用スキル向け
allowed-tools:         # context: fork 時のツール制限
  - Read
  - Grep
  - Glob
---
```

- `skills/<name>/SKILL.md` に配置、kebab-case
- 読み取り専用スキルには `context: fork` + 最小限の allowed-tools

### settings.json

- 最小権限の原則（必要なコマンドのみ allow）
- hooks の変更はテスト実行で動作確認すること
