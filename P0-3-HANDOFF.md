# P0-3 ParkPedia 引き継ぎプロンプト

> ⚠️ このファイルは **別ターミナルで起動した Claude Code セッション**に渡すための引き継ぎ書です。Discord channels モードの本セッションは P1-1 (AdMob リンク) を進めているので、こちらは P0-3 を独立して実行してください。

---

## 役割

あなたは **ParkPedia の git commit + EAS dev build trigger** を実行する作業者です。

---

## 現状 (2026-05-08 朝)

### リポジトリ
- 場所: `~/Documents/GitHub/ParkPedia`
- ブランチ: `main` (origin/main より 2 commits ahead、push 未済)

### 既に完了している作業
- ✅ Firebase Analytics SDK インストール (`@react-native-firebase/analytics ^23.7.0`)
- ✅ App.js に `analytics().logAppOpen()` 実装 (Crashlytics と同 pattern)
- ✅ CLAUDE.md スリム化 (195 → 93 行)、5/8 セクション追加
- ✅ .gitignore に log/env パターン追加
- ✅ .serena/project.yml にコメント追加 (cosmetic)

### 未コミットの変更
```
Modified:
  App.js                  ← Analytics 追加
  package.json            ← analytics dependency
  package-lock.json       ← npm install 結果
  CLAUDE.md               ← スリム化
  .gitignore              ← 3 行追加 (eas-submit-retry.log, auto-promote.log, ads/.env)
  .serena/project.yml     ← コメント追加 (cosmetic)

Untracked (このタスクでは触らない):
  .codex/
  AGENTS.md
  ad-assets/
  ads/
  scripts/retry-eas-submit.sh
```

---

## やること (順番厳守)

### Commit 1: Analytics 機能追加 ⭐ 本丸

```bash
cd ~/Documents/GitHub/ParkPedia
git add package.json package-lock.json App.js
git commit -m "feat(analytics): Add Firebase Analytics for AdMob ↔ Firebase 連携"
```

### Commit 2: CLAUDE.md スリム化

```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE.md): スリム化 + Analytics/広告戦略セクション追加 (195→93 行)"
```

### Commit 3: 設定整理

```bash
git add .gitignore .serena/project.yml
git commit -m "chore: gitignore に log/env 追加、serena config コメント更新"
```

### EAS dev build trigger ⭐ ビルド長時間

```bash
eas build --profile development --platform ios
```

→ 10-20 分かかる。完了まで待つ必要なし、URL もらってバックグラウンドで進む。

---

## 重要な注意

- **main ブランチ直 commit OK** (このプロジェクトの方針)
- **コミットメッセージは日本語または英語、いずれもコンベンショナルコミット形式**
- **untracked ファイルは触らない** (別途確認待ち)
- **`git add .` 禁止** (上記 untracked が紛れ込む)、必ずファイル明示

---

## 完了したら

Discord 経由で報告:
```
P0-3 完了！
- Commit 1: feat(analytics) ✅
- Commit 2: docs(CLAUDE.md) ✅
- Commit 3: chore: gitignore ✅
- EAS dev build URL: https://expo.dev/accounts/.../builds/xxxxx
```

または直接、本セッション (Discord channels) に「P0-3 完了」と送ってもらえれば、私が状況を取り込みます。

---

## 失敗したら

- エラーメッセージをそのまま Discord か本セッションに送る
- 途中で止まっても OK、再開可能
- EAS build がエラーで失敗した場合: `eas build:list --status=errored --limit 1` でエラー詳細取得

---

## 参照ノート (任意)

- [[2026-05-07 ParkPedia Analytics ログイベント設計]] (Vault) — Analytics 設計の詳細
- [[2026-05-08 [TODO] Mac 戻ったらやること 優先順位付き]] (Vault) — 全体 TODO

---

## 実行フロー (推奨順)

```
1. cd ~/Documents/GitHub/ParkPedia
2. git status              ← 上記 "Modified" と一致するか確認
3. Commit 1, 2, 3 実行
4. git log --oneline -5    ← 3 件追加されたか確認
5. eas build --profile development --platform ios
6. URL 報告
```

→ お願いします 🚀
