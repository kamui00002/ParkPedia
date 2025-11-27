# App Store提出前 最終チェックリスト

このチェックリストは、ParkPediaをApp Storeに提出する前に確認すべき項目をまとめたものです。

**現在のバージョン**: 1.0.5 (Build 9)
**最終更新日**: 2025年11月27日

---

## 📋 必須機能の確認

### アカウント管理

- [x] **アカウント削除機能が実装されている**
  - 場所: マイページ（screens/MyPageScreen.js）
  - ボタンテキスト: "アカウントを削除"
  - 赤い枠線で目立つ表示
  - 確認ダイアログが表示される
  - すべてのユーザーデータが削除される

- [x] **ログアウト機能が実装されている**
  - 場所: マイページ
  - ボタンテキスト: "ログアウト"

### ユーザー生成コンテンツの安全対策

- [x] **利用規約（EULA）への同意機能**
  - 場所: ログイン画面（screens/LoginScreen.js）
  - 新規登録時にチェックボックス表示
  - チェックしないとアカウント作成不可
  - 利用規約画面へのリンクあり

- [x] **利用規約画面の実装**
  - 場所: screens/TermsOfServiceScreen.js
  - 不適切なコンテンツへのゼロトレランスを明記
  - 24時間以内の対応を明記
  - ユーザーブロック機能についても記載

- [x] **コンテンツ報告機能**
  - 場所: 公園詳細画面のレビューセクション（screens/ParkDetailScreen.js）
  - 「🚩 報告」ボタンが各レビューに表示
  - 確認ダイアログあり
  - Firestoreの`reports`コレクションに保存
  - 自分のレビューは報告不可

- [x] **ユーザーブロック機能**
  - 場所: 公園詳細画面のレビューセクション（screens/ParkDetailScreen.js）
  - 「🚫 ブロック」ボタンが各レビューに表示
  - 確認ダイアログあり
  - ブロックしたユーザーのレビューは非表示
  - Firestoreの`blockedUsers`コレクションに保存
  - 自分自身はブロック不可

---

## 🔒 プライバシーとセキュリティ

### プライバシーポリシー

- [x] **プライバシーポリシーが作成されている**
  - ファイル: docs/privacy-policy.html
  - 日英両言語で記載
  - 適切なスタイル・デザイン

- [ ] **GitHub Pagesで公開されている** ⚠️
  - URL: https://kamui00002.github.io/ParkPedia/privacy-policy.html
  - ブラウザで正しく表示されることを確認
  - メールアドレスが kamui00002@yahoo.co.jp になっている
  - 日英切り替えが機能する

- [ ] **App Store ConnectにURLを登録** ⚠️
  - App Store Connect > アプリ情報 > プライバシーポリシーURL
  - https://kamui00002.github.io/ParkPedia/privacy-policy.html

### セキュリティ

- [x] **.gitignoreに機密ファイルを追加**
  - serviceAccountKey.json
  - credentials.json
  - credentials/
  - .env

- [x] **Git履歴に機密情報が含まれていない**
  - serviceAccountKey.json は未コミット
  - credentials.json は未コミット

- [ ] **Firestoreセキュリティルールがデプロイされている** ⚠️
  - Firebase Console > Firestore Database > ルール
  - firestore.rules の内容をコピー＆ペースト
  - 「公開」をクリック
  - 手順書: FIRESTORE_RULES_DEPLOY.md

---

## 📱 アプリ設定

### app.json

- [x] **バージョン番号が正しい**
  - 現在: 1.0.5
  - 形式: メジャー.マイナー.パッチ

- [x] **ビルド番号が正しい**
  - iOS buildNumber: 9
  - Android versionCode: 8
  - 毎回インクリメント必須

- [x] **Bundle Identifierが正しい**
  - com.parkpedia.app

- [x] **権限の説明文が適切**
  - 位置情報: "このアプリは近くの公園を検索するために位置情報を使用します。"
  - カメラ: "このアプリは公園の写真を撮影するためにカメラを使用します。"
  - フォトライブラリ: "このアプリは公園の写真を選択するためにフォトライブラリにアクセスします。"

---

## 🏗️ ビルドとテスト

### ビルド

- [ ] **EASビルドが成功** ⚠️
  ```bash
  eas build --platform ios --profile production
  ```
  - ビルドIDを記録
  - ビルドログを確認

- [ ] **ビルドをダウンロードしてテスト** ⚠️
  - TestFlightまたは実機でインストール
  - すべての主要機能をテスト

### 機能テスト

- [ ] **アカウント削除機能のテスト**
  - マイページでボタンが表示される
  - 確認ダイアログが表示される
  - （実際には削除しない）

- [ ] **利用規約同意機能のテスト**
  - 新規登録画面でチェックボックスが表示される
  - チェックなしでエラーが表示される
  - 利用規約画面が開ける

- [ ] **コンテンツ報告機能のテスト**
  - レビューに報告ボタンが表示される
  - 報告ダイアログが表示される
  - 報告が成功する

- [ ] **ユーザーブロック機能のテスト**
  - レビューにブロックボタンが表示される
  - ブロックダイアログが表示される
  - ブロック後、そのユーザーのレビューが非表示になる

---

## 📸 App Store Connect

### アプリ情報

- [ ] **プライバシーポリシーURLを登録** ⚠️
  - https://kamui00002.github.io/ParkPedia/privacy-policy.html

- [ ] **スクリーンショットをアップロード**
  - iPhone 6.7インチ（必須）
  - iPhone 6.5インチ（必須）
  - その他のサイズ（オプション）

- [ ] **アプリ説明文を確認**
  - 日本語と英語
  - キーワードを適切に配置

- [ ] **連絡先情報を確認**
  - メール: kamui00002@yahoo.co.jp
  - サポートURL（あれば）

### デモアカウント

- [ ] **デモアカウントが有効**
  - Email: reviewer@parkpedia.test
  - Password: ReviewTest2024!
  - アカウントが削除されていない
  - ログインできる

- [ ] **デモアカウント情報をApp Store Connectに記載**
  - アプリレビュー情報 > サインイン必要情報

### レビューノート

- [ ] **返信ドラフトを準備**
  - ファイル: APP_STORE_CONNECT_REPLY_DRAFT.md
  - すべての指摘事項に対応
  - プライバシーポリシーURLを含む
  - テスト手順を明記

---

## 📄 ドキュメント

### 必須ドキュメント

- [x] **README.md** - プロジェクト概要
- [x] **PRIVACY_POLICY.md** - プライバシーポリシー（バックアップ）
- [x] **docs/privacy-policy.html** - プライバシーポリシー（公開用）
- [x] **DEVELOPMENT_KNOWLEDGE_BASE.md** - 開発ナレッジベース
- [x] **FIRESTORE_RULES_DEPLOY.md** - Firestoreルールデプロイ手順
- [x] **APP_STORE_CONNECT_REPLY_DRAFT.md** - App Store Connect返信ドラフト
- [x] **GITHUB_PAGES_SETUP.md** - GitHub Pages設定手順
- [x] **NEXT_STEPS.md** - 次のステップ
- [x] **APP_STORE_SUBMISSION_CHECKLIST.md** - このファイル

---

## ✅ 最終確認

### 提出前の最終チェック

- [ ] すべての必須機能が実装されている
- [ ] すべての必須機能が正しく動作する
- [ ] プライバシーポリシーが公開されている
- [ ] Firestoreセキュリティルールがデプロイされている
- [ ] ビルドが成功している
- [ ] デモアカウントが有効
- [ ] App Store Connectの情報が最新
- [ ] 返信ドラフトが準備できている

### 提出手順

1. **App Store Connectにログイン**
   - https://appstoreconnect.apple.com/

2. **ParkPediaアプリを選択**

3. **アプリ情報を確認・更新**
   - プライバシーポリシーURL
   - スクリーンショット
   - 説明文

4. **ビルドを選択**
   - 最新のビルド（Build 9）を選択
   - Export Compliance情報を入力

5. **審査に提出**
   - 「審査に提出」ボタンをクリック
   - 確認画面で内容を確認
   - 提出完了

6. **提出後**
   - Submission IDを記録
   - ステータスを定期的に確認
   - レビュアーからの連絡に迅速に対応

---

## 📞 トラブルシューティング

### ビルドエラー

**エラー: "No matching provisioning profiles found"**
```bash
eas credentials
:configure -p ios
```

### GitHub Pagesエラー

**エラー: "404 Not Found"**
1. GitHub Pages設定を確認（Settings > Pages）
2. ソースが `/docs` フォルダになっているか確認
3. 数分待ってキャッシュをクリア

### Firebaseエラー

**エラー: "Missing or insufficient permissions"**
1. Firestoreセキュリティルールを確認
2. ユーザーが認証されているか確認
3. ルールが正しくデプロイされているか確認

---

## 📚 参考資料

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Firebase Documentation](https://firebase.google.com/docs)
- DEVELOPMENT_KNOWLEDGE_BASE.md

---

## 🎯 重要な注意事項

### ❌ 絶対にやってはいけないこと

1. **デモアカウントを削除しない**
   - レビュアーがテストに使用
   - reviewer@parkpedia.test は常に有効に保つ

2. **本番環境でテストモードを使わない**
   - Firestoreルールで `allow read, write: if true` は使わない

3. **機密情報をコミットしない**
   - serviceAccountKey.json
   - credentials.json
   - .env

4. **ビルド番号を忘れない**
   - 毎回インクリメント必須
   - 同じビルド番号は使えない

### ✅ 必ずやること

1. **変更後はテスト**
   - すべての変更は実機でテスト
   - 主要な機能は必ず動作確認

2. **バックアップを取る**
   - 重要なデータはバックアップ
   - Firebaseのデータもエクスポート

3. **ドキュメントを更新**
   - DEVELOPMENT_KNOWLEDGE_BASE.md を更新
   - 問題や解決策を記録

---

**最終確認日**: _________（提出前に記入）

**提出者**: yoshidometoru

**連絡先**: kamui00002@yahoo.co.jp

---

このチェックリストを印刷またはPDF化して、項目を1つずつチェックしながら進めることをお勧めします。
