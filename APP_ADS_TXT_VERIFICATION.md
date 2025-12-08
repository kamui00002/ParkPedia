# app-ads.txt 検証と修正ガイド

## 🔍 現在の状況

### 確認済み
- ✅ `parkpedia-website`リポジトリに`app-ads.txt`が存在
- ✅ ファイルの内容は正しい: `google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0`
- ✅ 5日前にコミット済み

### 問題
- ❌ AdMobが「ParkPedia（iOS）を確認できませんでした」と表示
- ❌ 広告配信が制限されている（「Verify app to lift limit」）

---

## 🎯 原因の特定

AdMobは以下のURLで`app-ads.txt`を探します：
- **期待されるURL**: `https://kamui00002.github.io/app-ads.txt`（マーケティングURLのルート）

現在の`parkpedia-website`リポジトリの場合：
- **実際のURL**: `https://kamui00002.github.io/parkpedia-website/app-ads.txt`（サブパス）

**問題**: AdMobはルート（`/app-ads.txt`）を探しますが、現在はサブパス（`/parkpedia-website/app-ads.txt`）に配置されています。

---

## ✅ 解決方法

### オプション1: kamui00002.github.io リポジトリを作成（推奨）

この方法により、ドメインのルートに`app-ads.txt`を配置できます。

#### 手順

1. **GitHubで新しいリポジトリを作成**
   - リポジトリ名: `kamui00002.github.io`（正確に）
   - Publicを選択

2. **ローカルでapp-ads.txtを作成**

```bash
# 新しいディレクトリを作成
mkdir -p ~/Documents/GitHub/kamui00002.github.io
cd ~/Documents/GitHub/kamui00002.github.io

# app-ads.txtファイルを作成
echo "google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0" > app-ads.txt

# 内容を確認
cat app-ads.txt
```

3. **GitHubにpush**

```bash
git init
git add app-ads.txt
git commit -m "Add app-ads.txt for AdMob verification"
git remote add origin https://github.com/kamui00002/kamui00002.github.io.git
git branch -M main
git push -u origin main
```

4. **GitHub Pagesを有効化**
   - リポジトリの「Settings」→「Pages」
   - Source: `main` branch, `/ (root)` folder
   - 保存

5. **確認**
   - https://kamui00002.github.io/app-ads.txt にアクセス可能か確認

---

### オプション2: parkpedia-websiteリポジトリで対応

`parkpedia-website`リポジトリが既にGitHub Pagesで公開されている場合、AdMobに手動でURLを指定する方法もあります。

#### 手順

1. **GitHub Pagesの設定を確認**
   - `parkpedia-website`リポジトリの「Settings」→「Pages」
   - 公開URLを確認

2. **app-ads.txtのURLを確認**
   - もし`parkpedia-website`がルートに公開されている場合:
     - URL: `https://kamui00002.github.io/app-ads.txt`（GitHub Pagesの設定による）
   - サブパスに公開されている場合:
     - URL: `https://kamui00002.github.io/parkpedia-website/app-ads.txt`

3. **AdMob Consoleで手動設定**（必要に応じて）
   - AdMob Console > アプリ > app-ads.txtタブ
   - カスタムURLを指定（ただし、AdMobは通常ルートを期待）

---

## 🔍 確認手順

### 1. 現在のapp-ads.txtのURLを確認

以下のコマンドで確認：

```bash
# ルートを確認
curl https://kamui00002.github.io/app-ads.txt

# parkpedia-websiteを確認
curl https://kamui00002.github.io/parkpedia-website/app-ads.txt
```

### 2. GitHub Pagesの設定を確認

1. **parkpedia-websiteリポジトリの設定**
   - https://github.com/kamui00002/parkpedia-website/settings/pages
   - SourceとBranchを確認

2. **kamui00002.github.ioリポジトリの存在確認**
   - https://github.com/kamui00002/kamui00002.github.io
   - 存在しない場合は作成が必要

### 3. AdMob Consoleで確認

1. **AdMob Consoleにログイン**
   - https://apps.admob.com/

2. **アプリを選択** > **「app-ads.txt」タブ**

3. **ステータスを確認**
   - 「確認済み」になるまで最大24時間待つ
   - エラーが表示される場合は、上記の解決方法を実施

---

## ⚠️ 重要な注意点

### 1. リポジトリ名の重要性

- **kamui00002.github.io**という名前のリポジトリは、GitHub Pagesで特別な扱いを受けます
- このリポジトリのルートに配置されたファイルは、`https://kamui00002.github.io/ファイル名`でアクセス可能になります

### 2. ファイルの配置場所

- **正しい**: `kamui00002.github.io`リポジトリのルートに`app-ads.txt`を配置
- **間違い**: `parkpedia-website`リポジトリに配置（サブパスになる）

### 3. 検証のタイミング

- AdMobのクローラーがファイルを検出するまで、最大24時間かかる場合があります
- ファイルを配置した後、24時間待ってから再度確認してください

---

## 📋 チェックリスト

### 今すぐ確認

- [ ] `kamui00002.github.io`リポジトリが存在するか確認
- [ ] 存在しない場合は作成
- [ ] `app-ads.txt`をルートに配置
- [ ] GitHub Pagesを有効化
- [ ] https://kamui00002.github.io/app-ads.txt にアクセス可能か確認

### 24時間後

- [ ] AdMob Consoleでapp-ads.txtのステータスを確認
- [ ] 「確認済み」になっているか確認
- [ ] 広告配信の制限が解除されているか確認

---

## 🚀 推奨される対応

**最も確実な方法**: `kamui00002.github.io`リポジトリを作成して、ルートに`app-ads.txt`を配置する

これにより：
- ✅ AdMobが期待するURL（`https://kamui00002.github.io/app-ads.txt`）でファイルにアクセス可能
- ✅ マーケティングURL（`https://kamui00002.github.io`）と一致
- ✅ 将来的に他のファイル（プライバシーポリシーなど）も配置可能

---

**最終更新**: 2025-11-30









