# GitLeaks セキュリティスキャン設定ガイド

## 概要

ParkPediaプロジェクトに、GitLeaksを使用したシークレット情報の自動検出機能を導入しました。

## セットアップ完了内容

### 1. `.gitleaksignore` - 誤検知除外設定
- **場所**: `/Users/yoshidometoru/Documents/GitHub/ParkPedia/.gitleaksignore`
- **目的**: 誤検知（false positive）を除外するための設定ファイル
- **使い方**: 誤検知が発生した場合、fingerprintを追加して除外

### 2. `.github/workflows/security.yml` - GitHub Actions自動スキャン
- **場所**: `/Users/yoshidometoru/Documents/GitHub/ParkPedia/.github/workflows/security.yml`
- **実行タイミング**:
  - mainまたはdevelopブランチへのpush時
  - mainまたはdevelopブランチへのPR作成時
  - 毎週月曜日 10:00 JST（自動実行）
  - 手動実行（workflow_dispatch）
- **機能**:
  - リポジトリ全体の秘密情報をスキャン
  - 検出時に自動でIssue作成
  - PRには検出内容をコメント
  - レポートをArtifactとして保存

### 3. `.husky/pre-commit` - コミット前チェック
- **場所**: `/Users/yoshidometoru/Documents/GitHub/ParkPedia/.husky/pre-commit`
- **動作**:
  - gitleaksがインストールされている場合のみ実行
  - ステージされたファイルをスキャン
  - 秘密情報が検出された場合、コミットを中断
  - インストールされていない場合は警告を表示してスキップ

### 4. `package.json` - NPMスクリプト追加
- **追加されたスクリプト**:
  ```json
  "security:scan": "gitleaks detect --source . --verbose",
  "security:protect": "gitleaks protect --staged --verbose"
  ```

## GitLeaksのインストール

### macOS (Homebrew)
```bash
brew install gitleaks
```

### その他のOS
公式ドキュメントを参照: https://github.com/gitleaks/gitleaks#installation

## 使用方法

### ローカルでの手動スキャン

#### リポジトリ全体をスキャン
```bash
npm run security:scan
# または
gitleaks detect --source . --verbose
```

#### ステージされたファイルのみスキャン（コミット前チェック）
```bash
npm run security:protect
# または
gitleaks protect --staged --verbose
```

### 自動チェック

#### コミット前（pre-commit hook）
```bash
git add .
git commit -m "feat: 新機能追加"
# → 自動的にgitleaksがステージされたファイルをスキャン
```

gitleaksがインストールされていない場合:
```
ℹ️  GitLeaks not installed. Skipping secret scan.
   Install with: brew install gitleaks
```

秘密情報が検出された場合:
```
❌ GitLeaks detected potential secrets in your staged changes.

Please review the findings above and take one of the following actions:
  1. Remove the secret and use environment variables instead
  2. If it's a false positive, add it to .gitleaksignore with a comment

To bypass this check (NOT recommended):
  git commit --no-verify
```

## 誤検知への対処

### 1. 誤検知の確認
検出された内容を確認し、本当に秘密情報でないかチェックしてください。

### 2. .gitleaksignoreへの追加
誤検知であることが確認できた場合、以下の手順で除外します。

```bash
# 1. gitleaks scanを実行してfingerprintを取得
gitleaks detect --source . --verbose

# 2. 出力からfingerprintをコピー
# 例: abc123def456...

# 3. .gitleaksignoreに追加（必ずコメントで理由を記載）
echo "# Safe: テストデータのモックAPI key" >> .gitleaksignore
echo "abc123def456" >> .gitleaksignore

# 4. 再度スキャンして誤検知が消えたか確認
gitleaks detect --source . --verbose
```

### 誤検知の例
- テストファイル内のモックデータ
- ドキュメント内のサンプルコード
- 環境変数のプレースホルダー（例: `API_KEY=your_key_here`）
- パブリックな設定値やデフォルト値

## GitHub Actionsでの動作

### ワークフローの実行確認
1. GitHub リポジトリページにアクセス
2. "Actions" タブをクリック
3. "Security Scan (GitLeaks)" ワークフローを確認

### 秘密情報が検出された場合
- **Issueの自動作成**: "Security Alert: X Potential Secret(s) Detected"
- **PRへのコメント**: 検出内容と対処方法を自動コメント
- **レポートの保存**: Artifactsに詳細レポートを保存（30日間保持）

### Issue対応フロー
1. Issueまたはワークフローログで検出内容を確認
2. 本物の秘密情報の場合:
   - すぐに該当の認証情報を無効化（API keyの削除など）
   - 環境変数に移行
   - Git履歴から完全に削除（`git filter-repo`等を使用）
3. 誤検知の場合:
   - `.gitleaksignore`に追加
   - コメントで理由を明記
   - 再度スキャンして確認
4. Issueをクローズ

## ベストプラクティス

### 1. 環境変数の使用
すべての秘密情報は環境変数で管理してください。

```javascript
// ❌ Bad
const apiKey = "sk-EXAMPLE_KEY_DO_NOT_USE";

// ✅ Good
const apiKey = process.env.API_KEY;
```

### 2. .env.exampleの活用
実際の値は含めず、キー名のみを記載したサンプルファイルを作成してください。

```bash
# .env.example
API_KEY=your_api_key_here
DATABASE_URL=your_database_url_here
```

### 3. 定期的なスキャン
- 毎週月曜日に自動実行されますが、重要な変更前には手動でもスキャン
- 新しいチームメンバーの追加時にも全体スキャンを推奨

### 4. pre-commitフックの活用
- gitleaksをインストールして、コミット前の自動チェックを有効化
- `--no-verify`でのバイパスは緊急時のみ使用

## トラブルシューティング

### gitleaksコマンドが見つからない
```bash
# インストールされているか確認
which gitleaks

# インストール
brew install gitleaks

# バージョン確認
gitleaks version
```

### 誤検知が多すぎる
- `.gitleaksignore`を適切に設定
- 必要に応じてカスタム設定ファイル（`.gitleaks.toml`）を作成

### GitHub Actionsが失敗する
1. Actionsタブでエラーログを確認
2. ローカルで同じコマンドを実行して再現
3. 必要に応じてワークフローの設定を調整

## 関連ドキュメント

- [GitLeaks公式ドキュメント](https://github.com/gitleaks/gitleaks)
- [開発ナレッジベース](./DEVELOPMENT_KNOWLEDGE_BASE.md)
- [セキュリティ監査ワークフロー](./.github/workflows/security-audit.yml)

## 注意事項

- **秘密情報が検出された場合、絶対に無視しないでください**
- **誤検知を除外する際は、必ず内容を確認してください**
- **本物の秘密情報がコミットされた場合、Git履歴から完全に削除する必要があります**
- **`--no-verify`でのコミットは極力避けてください**

## まとめ

このセットアップにより、ParkPediaプロジェクトでは以下のセキュリティ対策が自動化されました:

1. コミット前のローカルチェック（pre-commit hook）
2. GitHub Actionsでの継続的なスキャン
3. PR時の自動レビュー
4. 定期的な全体スキャン（毎週月曜日）
5. 検出時の自動Issue作成と通知

安全な開発を心がけましょう。
