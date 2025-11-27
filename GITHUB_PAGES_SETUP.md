# GitHub Pages 設定手順

## プライバシーポリシーをGitHub Pagesで公開する

### ステップ1: GitHubにpush

現在のファイルをGitHubにpushします：

```bash
# 変更をステージング
git add docs/privacy-policy.html PRIVACY_POLICY.md GITHUB_PAGES_SETUP.md

# コミット
git commit -m "Add privacy policy for App Store submission"

# GitHubにpush
git push origin main
```

### ステップ2: GitHub Pagesを有効化

1. GitHubリポジトリページを開く
   - URL: https://github.com/kamui00002/ParkPedia

2. 「Settings」タブをクリック

3. 左サイドバーで「Pages」をクリック

4. 「Source」セクションで:
   - Branch: `main` を選択
   - Folder: `/docs` を選択
   - 「Save」ボタンをクリック

5. 数分待つと、GitHub Pagesが有効化されます

### ステップ3: URLを確認

GitHub Pagesが有効化されると、以下のURLでアクセスできます：

```
https://kamui00002.github.io/ParkPedia/privacy-policy.html
```

ブラウザで開いて、プライバシーポリシーが正しく表示されることを確認してください。

### ステップ4: App Store Connectに登録

App Store Connectのアプリ情報ページで、以下のURLを登録します：

**プライバシーポリシーURL**:
```
https://kamui00002.github.io/ParkPedia/privacy-policy.html
```

---

## 確認事項

### ✅ チェックリスト

- [ ] `docs/privacy-policy.html` ファイルが作成されている
- [ ] GitHubにpushした
- [ ] GitHub Pagesを有効化した（Settings > Pages > Source: main, /docs）
- [ ] URLがブラウザで正しく表示される
- [ ] App Store ConnectにURLを登録した

---

## トラブルシューティング

### ページが表示されない場合

1. **GitHubでファイルが存在するか確認**
   - https://github.com/kamui00002/ParkPedia/blob/main/docs/privacy-policy.html

2. **GitHub Pagesが有効化されているか確認**
   - Settings > Pages で「Your site is live at...」のメッセージが表示されているか

3. **キャッシュをクリア**
   - ブラウザのキャッシュをクリアしてリロード

4. **待機時間**
   - GitHub Pagesの反映には数分かかる場合があります

### 404エラーが出る場合

- ファイル名を確認: `privacy-policy.html`（スペルミスがないか）
- ブランチを確認: `main` ブランチにpushされているか
- フォルダを確認: `docs/` フォルダ内にファイルがあるか

---

## その他のオプション

### カスタムドメインを使用する場合

独自ドメインをお持ちの場合、以下のようなURLにすることも可能です：
- `https://parkpedia.app/privacy-policy.html`

設定方法：
1. DNSで`CNAME`レコードを設定
2. GitHub Pages設定で「Custom domain」にドメインを入力
3. 「Enforce HTTPS」を有効化

---

## 連絡先情報の更新

プライバシーポリシーに記載されているメールアドレス（`privacy@parkpedia.app`）は仮のものです。

実際のメールアドレスをお持ちの場合は、`docs/privacy-policy.html` を編集して更新してください。

---

**作成日**: 2025年11月27日
