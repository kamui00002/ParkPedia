# セキュリティ漏洩の修正レポート

## 📋 概要

GitGuardianから「Company Email Password」の検出通知を受け、リポジトリ内のセンシティブ情報を調査・修正しました。

**検出日時**: 2025年12月16日 23:21:31 UTC
**リポジトリ**: kamui00002/ParkPedia

---

## 🔍 検出された問題

### 1. デモアカウントのパスワード（低リスク）

**ファイル**: `APP_STORE_CRASH_RESPONSE.md`

**内容**:
```
Username: [REDACTED]
Password: [REDACTED]
```

**リスクレベル**: 🟡 低
- これはApp Storeレビュー用のデモアカウント例として記載したもの
- 実際のアカウントではなく、プレースホルダーとして記載
- ただし、GitGuardianがパターンマッチングで検出

**対処**: プレースホルダーに変更済み

---

### 2. Firebase設定ファイル（中リスク）

**ファイル**: `GoogleService-Info.plist`

**内容**: FirebaseプロジェクトのAPIキー、プロジェクトID、その他の設定情報

**リスクレベル**: 🟠 中
- Firebase設定ファイルにはAPIキーが含まれる
- ただし、FirebaseのAPIキーは公開されても問題ない設計（Firestore RulesとStorage Rulesで保護）
- それでも、ベストプラクティスとして公開リポジトリには含めるべきではない

**対処**: .gitignoreに追加し、今後のコミットから除外

---

## ✅ 実施した修正

### 修正1: APP_STORE_CRASH_RESPONSE.mdの修正

**変更前**:
```
Demo Account:
Username: [REDACTED]
Password: [REDACTED]
```

**変更後**:
```
Demo Account:
Username: [Your demo account email]
Password: [Your demo account password]

IMPORTANT: Do NOT commit actual credentials to the repository.
Provide demo account credentials securely through App Store Connect's
"App Review Information" section or via encrypted communication.
```

### 修正2: .gitignoreの更新

以下を追加:
```
# Firebase
GoogleService-Info.plist
google-services.json
```

### 修正3: Gitキャッシュから削除

```bash
git rm --cached GoogleService-Info.plist
```

---

## ⚠️ 重要: Git履歴からの完全削除について

### 現状

- 上記の修正により、**今後のコミット**にはセンシティブ情報は含まれません
- しかし、**過去のコミット履歴**には以下が残っています：
  1. `GoogleService-Info.plist`（複数のコミットに含まれる）
  2. デモアカウントのパスワード（1つのコミットに含まれる）

### Git履歴から完全に削除する方法

#### オプション1: BFG Repo-Cleaner（推奨）

最も簡単で高速な方法です：

```bash
# BFG Repo-Cleanerをインストール（Homebrew）
brew install bfg

# リポジトリのバックアップを作成
cd /Users/yoshidometoru/Documents/GitHub/
cp -r ParkPedia ParkPedia_backup

# 特定のファイルを履歴から削除
cd ParkPedia
bfg --delete-files GoogleService-Info.plist

# 特定の文字列を履歴から削除（パスワード）
bfg --replace-text <(echo '[YOUR_PASSWORD]=>***REMOVED***')

# 変更を適用
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 強制プッシュ（注意！）
git push --force
```

#### オプション2: git filter-branch（従来の方法）

```bash
# リポジトリのバックアップを作成
cd /Users/yoshidometoru/Documents/GitHub/
cp -r ParkPedia ParkPedia_backup

cd ParkPedia

# GoogleService-Info.plistを履歴から削除
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch GoogleService-Info.plist" \
  --prune-empty --tag-name-filter cat -- --all

# リモートに強制プッシュ
git push --force --all
git push --force --tags
```

#### オプション3: GitHubリポジトリの再作成（最も確実）

完全に新しいスタートを切りたい場合：

1. 現在のリポジトリをプライベートに変更またはアーカイブ
2. 新しいリポジトリを作成
3. 最新のコード（センシティブ情報を削除したもの）を新しいリポジトリにプッシュ

---

## 🔒 実際のリスク評価

### GoogleService-Info.plistのAPIキーが漏洩した場合

#### 影響範囲

FirebaseのAPIキーは**公開されても大きな問題はありません**。理由：

1. **Firestore Rules と Storage Rules で保護**
   - すべてのデータアクセスはFirebase側のルールで制御
   - APIキーだけではデータにアクセスできない

2. **iOSアプリバンドルIDで制限**
   - Firebase Consoleで`com.parkpedia.app`のみに制限可能
   - 他のアプリからは使用不可

3. **使用量の監視**
   - Firebase Consoleで異常なトラフィックを検出可能
   - 予算アラートを設定可能

#### それでも対処すべき理由

- **ベストプラクティス違反**: セキュリティのベストプラクティスとして、設定ファイルは公開すべきではない
- **予防的措置**: 将来的なリスクを避けるため
- **監査対応**: セキュリティ監査で指摘される可能性

---

## 📝 今後の予防策

### 1. .gitignoreの厳格な運用

すでに`.gitignore`に以下を追加済み：

```gitignore
# Firebase
GoogleService-Info.plist
google-services.json

# 環境変数
.env
.env.local
.env.*

# 認証情報
credentials.json
credentials/
serviceAccountKey.json
```

### 2. コミット前のチェック

**pre-commitフック**を設定して、センシティブファイルのコミットを防止：

```bash
# .git/hooks/pre-commit を作成
#!/bin/sh

# センシティブファイルのチェック
if git diff --cached --name-only | grep -E "GoogleService-Info.plist|google-services.json|\.env$|credentials\.json"; then
    echo "❌ Error: センシティブファイルがコミットに含まれています"
    echo "以下のファイルを.gitignoreに追加してください："
    git diff --cached --name-only | grep -E "GoogleService-Info.plist|google-services.json|\.env$|credentials\.json"
    exit 1
fi

# パスワードパターンのチェック
if git diff --cached | grep -iE "password\s*[:=]\s*['\"]?[a-zA-Z0-9!@#$%^&*]{8,}"; then
    echo "❌ Warning: パスワードらしき文字列が検出されました"
    echo "コミット内容を確認してください"
    exit 1
fi

exit 0
```

```bash
# 実行権限を付与
chmod +x .git/hooks/pre-commit
```

### 3. GitGuardianの活用

- GitGuardianは引き続き有効化しておく
- 検出された場合は即座に対処
- 定期的にダッシュボードを確認

### 4. 環境変数の使用

センシティブ情報は環境変数で管理：

```javascript
// 悪い例
const apiKey = "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx";

// 良い例
const apiKey = process.env.FIREBASE_API_KEY;
```

### 5. ドキュメントのレビュー

ドキュメントに実際の認証情報を記載しない：

- ✅ プレースホルダーを使用: `[Your API Key]`
- ❌ 実際の値を記載: `AIzaSyBxxxxxxx`

---

## 🎯 チェックリスト：センシティブ情報の確認

今後、コミット前に以下を確認してください：

### ファイル

- [ ] `.env`ファイルが`.gitignore`に含まれているか
- [ ] `GoogleService-Info.plist`が`.gitignore`に含まれているか
- [ ] `google-services.json`が`.gitignore`に含まれているか
- [ ] `credentials.json`などの認証ファイルが`.gitignore`に含まれているか

### コード

- [ ] APIキーがハードコードされていないか
- [ ] パスワードがハードコードされていないか
- [ ] 秘密鍵が含まれていないか
- [ ] トークンが含まれていないか

### ドキュメント

- [ ] 実際のパスワードが記載されていないか
- [ ] 実際のAPIキーが記載されていないか
- [ ] 個人情報が記載されていないか
- [ ] デモアカウントはプレースホルダーになっているか

---

## 📚 参考リンク

- [GitGuardian Documentation](https://docs.gitguardian.com/)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [Git Filter-Branch Documentation](https://git-scm.com/docs/git-filter-branch)
- [GitHub: Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

## 🚀 次のアクション

### 緊急度: 高

1. ✅ **APP_STORE_CRASH_RESPONSE.mdのパスワードを削除**（完了）
2. ✅ **.gitignoreにGoogleService-Info.plistを追加**（完了）
3. ✅ **Gitキャッシュから削除**（完了）
4. ⏳ **コミットしてプッシュ**（次のステップ）

### 緊急度: 中

5. ⚠️ **Git履歴から完全に削除**（オプション、推奨）
   - BFG Repo-Cleanerを使用
   - または、リポジトリを再作成

### 緊急度: 低

6. 📝 **pre-commitフックの設定**（今後の予防）
7. 🔍 **定期的なセキュリティ監査**（月次）

---

## 💡 まとめ

### 検出された問題

1. デモアカウントのパスワード例（`APP_STORE_CRASH_RESPONSE.md`）
2. Firebase設定ファイル（`GoogleService-Info.plist`）

### 実施した対処

1. パスワードをプレースホルダーに変更
2. `.gitignore`に追加
3. Gitキャッシュから削除

### 残っている課題

- Git履歴には過去のコミットが残っている
- 完全に削除するにはBFG Repo-Cleanerまたはリポジトリ再作成が必要

### 実際のリスク

- **低〜中**: FirebaseのAPIキーは公開されても、Rulesで保護されているため大きな問題はない
- **予防的措置**: ベストプラクティスとして、今後は含めないようにする

---

**作成日**: 2025年12月（GitGuardian検出後）
**最終更新**: 2025年12月
**ステータス**: 一部対処完了、Git履歴削除は任意
