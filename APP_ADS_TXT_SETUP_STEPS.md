# app-ads.txt 設定手順（マーケティングURL確認済み）

## ✅ 確認済み情報

- **マーケティングURL**: `https://kamui00002.github.io`
- **必要なapp-ads.txt URL**: `https://kamui00002.github.io/app-ads.txt`
- **現在のapp-ads.txt URL**: `https://kamui00002.github.io/ParkPedia/app-ads.txt` ❌

**問題**: AdMobはドメインのルート（`/app-ads.txt`）を探しますが、現在はサブパス（`/ParkPedia/app-ads.txt`）に配置されています。

---

## 🎯 解決方法

`kamui00002.github.io` リポジトリを作成して、ルートにapp-ads.txtを配置します。

---

## 📋 手順

### ステップ1: GitHubで新しいリポジトリを作成

1. **GitHubにログイン**
   - URL: https://github.com/
   - アカウント: kamui00002

2. **新しいリポジトリを作成**
   - 右上の「+」アイコンをクリック
   - 「New repository」を選択
   - **リポジトリ名**: `kamui00002.github.io`（正確にこの名前）
   - **説明**: （任意）"Website for ParkPedia app-ads.txt"
   - **Public**を選択（GitHub PagesはPublicリポジトリのみ）
   - 「Add a README file」は**チェックしない**
   - 「Create repository」をクリック

---

### ステップ2: ローカルでapp-ads.txtファイルを作成

ターミナルで以下のコマンドを実行：

```bash
# 新しいディレクトリを作成
mkdir -p ~/Documents/GitHub/kamui00002.github.io
cd ~/Documents/GitHub/kamui00002.github.io

# app-ads.txtファイルを作成
cat > app-ads.txt << 'EOF'
google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0
EOF

# ファイルの内容を確認
cat app-ads.txt
```

**期待される出力**:
```
google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0
```

---

### ステップ3: Gitリポジトリを初期化してGitHubにpush

```bash
# Gitリポジトリを初期化
git init

# ファイルを追加
git add app-ads.txt

# コミット
git commit -m "Add app-ads.txt for AdMob verification"

# リモートリポジトリを追加（GitHubで作成したリポジトリのURLを使用）
git remote add origin https://github.com/kamui00002/kamui00002.github.io.git

# ブランチ名をmainに変更
git branch -M main

# GitHubにpush
git push -u origin main
```

**注意**: GitHubでリポジトリを作成した際に表示されたURLを使用してください。上記のURLが正しくない場合は、GitHubのリポジトリページで「Code」ボタンをクリックして正しいURLをコピーしてください。

---

### ステップ4: GitHub Pagesを有効化

1. **GitHubリポジトリページを開く**
   - URL: https://github.com/kamui00002/kamui00002.github.io

2. **「Settings」タブをクリック**
   - リポジトリページの上部のタブから選択

3. **左サイドバーで「Pages」をクリック**
   - Settingsページの左側のメニューから選択

4. **「Source」セクションで設定**
   - **Branch**: `main` を選択
   - **Folder**: `/ (root)` を選択
   - **「Save」ボタンをクリック**

5. **数分待つ**
   - GitHub Pagesが有効化されるまで数分かかります
   - 通常、1〜5分で有効化されます

---

### ステップ5: 確認

1. **ブラウザでアクセス**
   - URL: https://kamui00002.github.io/app-ads.txt
   - ファイルの内容が表示されることを確認

2. **期待される表示**:
   ```
   google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0
   ```

3. **curlコマンドで確認**（オプション）:
   ```bash
   curl https://kamui00002.github.io/app-ads.txt
   ```

---

### ステップ6: AdMob Consoleで確認

1. **AdMob Consoleにログイン**
   - URL: https://apps.admob.com/

2. **アプリを選択**
   - ParkPedia（iOS）を選択

3. **「app-ads.txt」タブを確認**
   - ステータスが「確認中」または「確認済み」になるまで待つ
   - **最大24時間かかる場合があります**

4. **エラーが表示される場合**
   - ファイルが正しく公開されているか再確認
   - 24時間待ってから再度確認

---

## ✅ チェックリスト

### 完了したらチェック

- [ ] GitHubで `kamui00002.github.io` リポジトリを作成
- [ ] ローカルで `app-ads.txt` ファイルを作成
- [ ] ファイルの内容が正しいことを確認
- [ ] Gitリポジトリを初期化してGitHubにpush
- [ ] GitHub Pagesを有効化（Settings > Pages）
- [ ] https://kamui00002.github.io/app-ads.txt にアクセス可能
- [ ] ファイルの内容が正しく表示される
- [ ] AdMob Consoleで確認（24時間待つ）

---

## ⚠️ 重要な注意点

### 1. リポジトリ名は正確に

- **正しい**: `kamui00002.github.io`
- **間違い**: `kamui00002.github.io.git` や `kamui00002.github.io/` など

### 2. ファイル名は正確に

- **正しい**: `app-ads.txt`
- **間違い**: `app-ads.txt.txt` や `app_ads.txt` など

### 3. ファイルの内容

- **正しい**: `google.com, pub-5237930968754753, DIRECT, f08c47fec0942fa0`
- 余分な空白や改行がないことを確認
- 文字コードはUTF-8

### 4. GitHub Pagesの有効化

- PublicリポジトリのみGitHub Pagesが使用可能
- 有効化まで数分かかる場合があります

---

## 🔍 トラブルシューティング

### 問題1: ファイルにアクセスできない

**確認事項**:
1. GitHub Pagesが有効化されているか（Settings > Pages）
2. ブランチが `main` に設定されているか
3. フォルダが `/ (root)` に設定されているか
4. 数分待ってから再度アクセス

### 問題2: 404エラーが表示される

**対処法**:
1. GitHubリポジトリでファイルが存在するか確認
2. ファイル名が `app-ads.txt` であることを確認
3. GitHub Pagesの設定を再確認

### 問題3: AdMobで検証されない

**対処法**:
1. https://kamui00002.github.io/app-ads.txt にアクセス可能か確認
2. ファイルの内容が正しいか確認
3. 24時間待ってから再度確認
4. AdMobサポートに問い合わせ

---

## 📞 サポート

問題が解決しない場合：

1. **AdMobサポートに問い合わせ**
   - AdMob Console > ヘルプ > サポートに問い合わせ
   - app-ads.txtの検証エラーについて説明

2. **app-ads.txtの公式ガイドを確認**
   - URL: https://support.google.com/admob/answer/10532191

---

**準備完了！上記の手順を実行してください！** 🚀

**最終更新**: 2025-11-30




