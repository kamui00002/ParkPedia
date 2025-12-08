# app-ads.txt 問題の修正ガイド

## 🔴 現在の問題

AdMobで以下のエラーが表示されています：
- **「ParkPedia（iOS）を確認できませんでした」**
- **「app-ads.txt ファイルが設定されている可能性がありますが、お客様の詳細情報が AdMob アカウントの情報と一致しません」**

---

## ✅ 現在の状況

### 確認済み
- ✅ app-ads.txtファイルは存在: `docs/app-ads.txt`
- ✅ 内容は正しい: `google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0`
- ✅ GitHub Pagesで公開済み: https://kamui00002.github.io/ParkPedia/app-ads.txt
- ✅ ファイルにアクセス可能（curlで確認済み）

### 問題点
- ⚠️ app-ads.txtがサブパス（`/ParkPedia/`）に配置されている
- ⚠️ AdMobは通常、ドメインのルート（`https://kamui00002.github.io/app-ads.txt`）を期待する可能性がある
- ⚠️ App Store Connectに登録されているウェブサイトURLを確認する必要がある

---

## 🎯 解決方法

### ステップ1: App Store ConnectでウェブサイトURLを確認

1. **App Store Connectにログイン**
   - URL: https://appstoreconnect.apple.com/

2. **ParkPediaアプリを選択**
   - 「マイApp」> 「ParkPedia」

3. **「App情報」タブをクリック**

4. **「一般情報」セクションを確認**
   - **「マーケティングURL」** または **「サポートURL」** を確認
   - 登録されているURLをメモしてください

### ステップ2: ウェブサイトURLに基づいてapp-ads.txtを配置

#### ケースA: マーケティングURLが `https://kamui00002.github.io` の場合

**問題**: AdMobは `https://kamui00002.github.io/app-ads.txt` を探しますが、現在は `https://kamui00002.github.io/ParkPedia/app-ads.txt` に配置されています。

**解決策**: `kamui00002.github.io` リポジトリを作成してルートに配置

#### ケースB: マーケティングURLが `https://kamui00002.github.io/ParkPedia` の場合

**問題**: AdMobがサブパスでの配置を認識していない可能性があります。

**解決策**: AdMobサポートに問い合わせるか、ルートに配置する方法を検討

---

## 📋 推奨される対応手順

### オプション1: kamui00002.github.io リポジトリを作成（推奨）

この方法により、ドメインのルートにapp-ads.txtを配置できます。

#### 1-1. 新しいリポジトリを作成

1. **GitHubにログイン**
   - URL: https://github.com/

2. **新しいリポジトリを作成**
   - 「New repository」をクリック
   - **リポジトリ名**: `kamui00002.github.io`（正確にこの名前）
   - **Public**を選択
   - 「Create repository」をクリック

#### 1-2. app-ads.txtファイルを作成

ローカルで新しいディレクトリを作成：

```bash
# 新しいディレクトリを作成
mkdir -p ~/Documents/GitHub/kamui00002.github.io
cd ~/Documents/GitHub/kamui00002.github.io

# app-ads.txtファイルを作成
cat > app-ads.txt << 'EOF'
google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0
EOF
```

#### 1-3. Gitリポジトリを初期化

```bash
# Gitリポジトリを初期化
git init
git add app-ads.txt
git commit -m "Add app-ads.txt for AdMob"

# リモートリポジトリを追加
git remote add origin https://github.com/kamui00002/kamui00002.github.io.git

# GitHubにpush
git branch -M main
git push -u origin main
```

#### 1-4. GitHub Pagesを有効化

1. **GitHubリポジトリページを開く**
   - URL: https://github.com/kamui00002/kamui00002.github.io

2. **「Settings」タブをクリック**

3. **左サイドバーで「Pages」をクリック**

4. **「Source」セクションで**:
   - Branch: `main` を選択
   - Folder: `/ (root)` を選択
   - 「Save」をクリック

5. **数分待つと、GitHub Pagesが有効化されます**

#### 1-5. 確認

以下のURLにアクセスして、app-ads.txtが表示されることを確認：

```
https://kamui00002.github.io/app-ads.txt
```

---

### オプション2: 現在のリポジトリで対応（簡単）

現在のリポジトリで対応する場合、App Store ConnectのマーケティングURLを確認して、AdMobに正しいURLを手動で設定する方法もあります。

#### 2-1. AdMob Consoleで手動設定

1. **AdMob Consoleにログイン**
   - URL: https://apps.admob.com/

2. **アプリを選択** > **「app-ads.txt」タブ**

3. **「手動でURLを指定」** または **「カスタムURL」** を選択

4. **URLを入力**:
   ```
   https://kamui00002.github.io/ParkPedia/app-ads.txt
   ```

5. **「確認」をクリック**

---

## 🔍 確認手順

### 1. app-ads.txtファイルの内容を確認

```bash
# 現在のファイルを確認
cat docs/app-ads.txt
```

**正しい内容**:
```
google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0
```

### 2. ファイルが公開されているか確認

```bash
# GitHub Pagesで公開されているか確認
curl https://kamui00002.github.io/ParkPedia/app-ads.txt
```

**期待される出力**:
```
google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0
```

### 3. AdMob Consoleで確認

1. **AdMob Consoleにログイン**
2. **アプリを選択**
3. **「app-ads.txt」タブを確認**
4. **ステータスが「確認済み」になるまで待つ**（最大24時間）

---

## ⚠️ 重要な注意点

### 1. Publisher IDの確認

app-ads.txtファイルのPublisher IDがAdMobアカウントのPublisher IDと一致していることを確認：

- **AdMob Console** > **「アカウント」** > **「アカウント情報」**
- **Publisher ID**: `pub-5237930968754753`（確認済み）

### 2. ファイル形式の確認

app-ads.txtファイルは以下の形式である必要があります：

```
google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0
```

- 各行は改行で区切られる
- 余分な空白や改行がない
- 文字コードはUTF-8

### 3. 公開の確認

- ファイルが公開されている（認証不要でアクセス可能）
- HTTPSでアクセス可能
- ファイルが正しく表示される（404エラーではない）

---

## 📝 チェックリスト

### 今すぐ確認すべきこと

- [ ] App Store ConnectでマーケティングURLを確認
- [ ] app-ads.txtファイルの内容が正しいか確認
- [ ] GitHub Pagesでファイルが公開されているか確認
- [ ] AdMob ConsoleでPublisher IDが一致しているか確認

### 対応が必要なこと

- [ ] オプション1またはオプション2を選択
- [ ] app-ads.txtを適切な場所に配置
- [ ] GitHubにpush
- [ ] GitHub Pagesで公開
- [ ] AdMob Consoleで確認（24時間待つ）

---

## 🚀 次のステップ

### 今すぐ実行

1. **App Store ConnectでマーケティングURLを確認**
   - これにより、app-ads.txtを配置する場所が決まります

2. **オプション1またはオプション2を選択**
   - オプション1（推奨）: kamui00002.github.ioリポジトリを作成
   - オプション2: 現在のリポジトリで対応

3. **app-ads.txtを配置してGitHubにpush**

4. **24時間待ってAdMob Consoleで確認**

---

## 📞 サポート

問題が解決しない場合：

1. **AdMobサポートに問い合わせ**
   - AdMob Console > ヘルプ > サポートに問い合わせ
   - app-ads.txtの検証エラーについて説明

2. **app-ads.txtの公式ガイドを確認**
   - URL: https://support.google.com/admob/answer/10532191

---

**最終更新**: 2025-11-30










