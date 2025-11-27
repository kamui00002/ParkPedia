# ParkPedia 開発ナレッジベース

このドキュメントは、ParkPediaの開発過程で遭遇した問題、解決策、そして得られた教訓をまとめたものです。今後の開発や類似プロジェクトで同じ過ちを繰り返さないための参考資料です。

**最終更新日**: 2025年11月27日

---

## 目次

1. [App Store審査関連](#app-store審査関連)
2. [プライバシーポリシー](#プライバシーポリシー)
3. [GitHub Pages設定](#github-pages設定)
4. [セキュリティとクレデンシャル管理](#セキュリティとクレデンシャル管理)
5. [Firebase設定](#firebase設定)
6. [ビルドとデプロイ](#ビルドとデプロイ)
7. [コード構造とアーキテクチャ](#コード構造とアーキテクチャ)
8. [チェックリスト](#チェックリスト)

---

## App Store審査関連

### 問題1: アカウント削除機能の要件

**問題**: App Storeレビューで「Guideline 5.1.1(v) - Account Deletion」の指摘を受けた。

**原因**:
- アカウント削除機能が実装されていなかった
- または、実装されていてもレビュアーが見つけられなかった

**解決策**:
- `MyPageScreen.js`にアカウント削除ボタンを実装
- 削除ボタンは明確に表示され、簡単にアクセスできる場所に配置
- 削除実行時に確認ダイアログを表示
- 削除時にユーザーの全データを削除する処理を実装

**教訓**:
- **App Store提出前に必須**: アカウント削除機能は最初から実装すべき
- ボタンは分かりやすい場所に配置（マイページ下部など）
- データの完全削除を保証する

**関連ファイル**:
- `screens/MyPageScreen.js:150-180` - アカウント削除機能

---

### 問題2: ユーザー生成コンテンツの安全対策

**問題**: App Storeレビューで「Guideline 1.2 - User-Generated Content」の指摘を受けた。

**原因**:
- 不適切なコンテンツに対する対策が不十分
- 利用規約への同意機能がなかった
- ユーザーブロック機能がなかった

**解決策**:

#### a) 利用規約への同意機能
- **実装場所**: `screens/LoginScreen.js`
- 新規登録時に利用規約への同意チェックボックスを追加
- チェックしないとアカウント作成不可
- 利用規約画面（`screens/TermsOfServiceScreen.js`）へのリンク

#### b) ユーザーブロック機能
- **実装場所**: `screens/ParkDetailScreen.js`
- レビューカードに「🚫 ブロック」ボタンを追加
- ブロックしたユーザーのレビューをフィルタリング
- Firestoreの`blockedUsers`コレクションに保存

#### c) コンテンツ報告機能（既存）
- **実装場所**: `screens/ParkDetailScreen.js`
- レビューに「🚩 報告」ボタン
- 報告内容をFirestoreの`reports`コレクションに保存

**教訓**:
- **UGCアプリの必須要件**:
  1. 利用規約への同意（EULA）
  2. コンテンツ報告機能
  3. ユーザーブロック機能
  4. アカウント削除機能
  5. 24時間以内の対応を明記した利用規約
  6. ゼロトレランスポリシーの明示

**関連ファイル**:
- `screens/LoginScreen.js:120-150` - 利用規約同意機能
- `screens/TermsOfServiceScreen.js` - 利用規約画面
- `screens/ParkDetailScreen.js:280-320` - ユーザーブロック機能
- `screens/ParkDetailScreen.js:250-280` - コンテンツ報告機能
- `firestore.rules:216-254` - 報告機能のルール
- `firestore.rules:256-283` - ブロック機能のルール

---

## プライバシーポリシー

### 問題3: プライバシーポリシーURLの形式

**問題**: App Store提出時に`raw.githubusercontent.com`のURLを使用してしまった。

**原因**:
- GitHub Pagesの設定方法を知らなかった
- Markdown形式のURLをそのまま使用

**問題の詳細**:
- `https://raw.githubusercontent.com/kamui00002/ParkPedia/main/PRIVACY_POLICY.md`
- このURLでは、Markdownの記号（`#`, `**`など）がそのまま表示される
- 書式なしで非常に読みにくい
- App Storeレビューで却下される可能性が高い

**正しい解決策**:
1. HTMLファイルを作成（`docs/privacy-policy.html`）
2. GitHub Pagesを有効化（Settings > Pages > Source: main, /docs）
3. 正しいURL: `https://kamui00002.github.io/ParkPedia/privacy-policy.html`

**教訓**:
- **App Store提出前に必須**: GitHub Pagesでプライバシーポリシーを公開
- HTMLファイルを使用（Markdownは避ける）
- 日英両言語で作成
- 言語切り替え機能を実装
- ブラウザで実際に表示を確認してから提出

**関連ファイル**:
- `docs/privacy-policy.html` - 公開用HTMLファイル
- `PRIVACY_POLICY.md` - バックアップ用Markdownファイル
- `GITHUB_PAGES_SETUP.md` - GitHub Pages設定手順

**プライバシーポリシーに含めるべき内容**:
1. 収集する情報
2. 情報の使用方法
3. 情報の共有
4. データの保存とセキュリティ
5. ユーザーの権利（アカウント削除、データアクセス、ユーザーブロック）
6. 不適切なコンテンツの管理
7. 広告（AdMobを使用している場合）
8. 子供のプライバシー（13歳未満）
9. プライバシーポリシーの変更
10. お問い合わせ先
11. Firebase データ処理の詳細
12. 準拠法

---

## GitHub Pages設定

### 問題4: リポジトリの可視性とGitHub Pages

**問題**: GitHub Pagesを有効化しようとしたが、「Your current plan does not support GitHub Pages for this repository」エラーが発生。

**原因**:
- リポジトリがプライベートになっていた
- 無料プランではプライベートリポジトリでGitHub Pagesが使えない

**解決策**:
1. リポジトリをパブリックに変更
2. ただし、その前に機密情報がないか確認が必須

**手順**:
```bash
# 1. 機密情報のチェック
grep -r "API.*KEY\|SECRET\|PASSWORD\|private.*key" --include="*.js" --include="*.json" --exclude-dir=node_modules .

# 2. リポジトリをパブリックに変更
gh api --method PATCH /repos/kamui00002/ParkPedia -f "visibility=public"

# 3. GitHub Pagesを有効化
gh api --method POST /repos/kamui00002/ParkPedia/pages \
  -f "source[branch]=main" \
  -f "source[path]=/docs"
```

**教訓**:
- **パブリックリポジトリにする前に必ずチェック**:
  1. APIキー、シークレット、パスワードがないか
  2. Firebase ServiceAccountKey がないか
  3. クレデンシャルファイルがないか
- `.gitignore`に機密ファイルを追加
- GitHub Pagesは`/docs`フォルダを使うと管理しやすい

**関連ファイル**:
- `.gitignore:50-58` - Firebase関連の除外設定
- `GITHUB_PAGES_SETUP.md` - 設定手順書

---

## セキュリティとクレデンシャル管理

### 問題5: 機密情報の漏洩リスク

**問題**: リポジトリをパブリックにする前に、`serviceAccountKey.json`と`credentials.json`が存在していた。

**深刻度**: 🔴 **非常に高い** - Firebase管理者権限が漏洩する可能性

**発見した機密ファイル**:
- `serviceAccountKey.json` - Firebaseのサービスアカウントキー
- `credentials.json` - iOS配布証明書のパスワード

**対処方法**:

#### ステップ1: Git履歴を確認
```bash
git log --all --full-history -- serviceAccountKey.json credentials.json
```
→ 幸い、これらのファイルは一度もコミットされていなかった

#### ステップ2: .gitignoreに追加
```gitignore
# Firebase
serviceAccountKey.json

# Credentials
credentials.json
credentials/
```

#### ステップ3: もしコミット済みの場合
```bash
# Git履歴から完全削除（危険な操作）
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch serviceAccountKey.json" \
  --prune-empty --tag-name-filter cat -- --all

# 強制プッシュ
git push origin --force --all
```

#### ステップ4: Firebaseキーの無効化
- Firebase Console > プロジェクト設定 > サービスアカウント
- 既存のサービスアカウントキーを削除
- 新しいキーを生成

**教訓**:
- **絶対にコミットしてはいけないファイル**:
  - `serviceAccountKey.json` - Firebase管理者権限
  - `credentials.json` - 証明書パスワード
  - `.env` - 環境変数
  - `*.p12` - iOS証明書
  - `*.mobileprovision` - プロビジョニングプロファイル
  - `google-services.json` - Android Firebase設定（APIキーを含む場合）
  - `GoogleService-Info.plist` - iOS Firebase設定（APIキーを含む場合）

- **プロジェクト開始時に必ず実施**:
  1. `.gitignore`を最初に設定
  2. 機密ファイルは`.gitignore`に追加してからプロジェクトを開始
  3. 環境変数は`.env`で管理し、`.env`は`.gitignore`に追加

**関連ファイル**:
- `.gitignore` - 除外設定

---

## Firebase設定

### 問題6: Firestoreセキュリティルール

**状況**: Firestoreセキュリティルールは既に実装済み

**実装済みの機能**:
- Parks、Reviews、Favorites、Reports、BlockedUsers、Usersコレクションの完全なルール
- 認証チェック
- オーナーシップの検証
- データバリデーション
- 読み取り/書き込み権限の制限

**デプロイ方法**:
1. Firebase Consoleにログイン
2. Firestore Database > ルール を開く
3. `firestore.rules`の内容をコピー＆ペースト
4. 「公開」をクリック

**教訓**:
- Firestoreルールは開発の初期段階で実装すべき
- テストモード（`allow read, write: if true`）は本番環境で絶対に使わない
- すべての書き込み操作に認証とバリデーションを追加
- 定期的にFirebase Consoleでルールを確認

**関連ファイル**:
- `firestore.rules` - 完全なセキュリティルール

---

## ビルドとデプロイ

### 問題7: iOS証明書とプロビジョニングプロファイル

**学んだこと**:
- EAS Build（Expo Application Services）を使用してビルド
- ローカルでの証明書管理は複雑
- EASに証明書管理を任せると簡単

**ビルド手順**:
```bash
# プロダクションビルド
eas build --platform ios --profile production

# ビルドステータス確認
eas build:list
```

**教訓**:
- ビルド前に`app.json`のバージョンとビルド番号を更新
- バージョン形式: `1.0.x`（メジャー.マイナー.パッチ）
- ビルド番号: 整数、毎回インクリメント
- ビルドログはApp Store提出時の参考になるので保存

**関連ファイル**:
- `app.json` - アプリ設定
- `eas.json` - EASビルド設定

---

## コード構造とアーキテクチャ

### ベストプラクティス

#### 1. ファイル構造
```
ParkPedia/
├── screens/          # 画面コンポーネント
├── components/       # 再利用可能なコンポーネント
├── firebaseConfig.js # Firebase設定
├── adConfig.js       # 広告設定
├── App.js            # エントリーポイント
└── app.json          # アプリ設定
```

#### 2. Firebase統合
- Firebase Authentication: ユーザー認証
- Cloud Firestore: データベース
- Firebase Storage: 画像保存

#### 3. ナビゲーション
- React Navigation v6を使用
- Stack Navigatorで画面遷移

#### 4. 状態管理
- React Hooks（useState, useEffect）を使用
- グローバル状態は最小限に

---

## チェックリスト

### App Store提出前チェックリスト

#### 必須機能
- [ ] アカウント削除機能が実装されている
- [ ] アカウント削除ボタンがマイページから簡単にアクセスできる
- [ ] 利用規約への同意機能（新規登録時）
- [ ] 利用規約画面の実装
- [ ] コンテンツ報告機能
- [ ] ユーザーブロック機能

#### プライバシーポリシー
- [ ] プライバシーポリシーをHTMLで作成
- [ ] 日英両言語で記載
- [ ] GitHub Pagesで公開
- [ ] URLがブラウザで正しく表示される
- [ ] 連絡先メールアドレスが正しい
- [ ] App Store ConnectにURLを登録

#### セキュリティ
- [ ] `.gitignore`に機密ファイルを追加
- [ ] `serviceAccountKey.json`が除外されている
- [ ] `credentials.json`が除外されている
- [ ] Git履歴に機密情報が含まれていない
- [ ] Firestoreセキュリティルールがデプロイされている

#### ビルド
- [ ] `app.json`のバージョン番号を更新
- [ ] `app.json`のビルド番号をインクリメント
- [ ] EASビルドが成功
- [ ] ビルドをダウンロードして動作確認

#### App Store Connect
- [ ] アプリ情報が正確
- [ ] スクリーンショットをアップロード
- [ ] プライバシーポリシーURLを登録
- [ ] デモアカウント情報を提供（必要な場合）

---

## トラブルシューティング

### ビルドエラー

#### エラー: "No matching provisioning profiles found"
**解決策**:
```bash
eas credentials:configure -p ios
```
でプロビジョニングプロファイルを再生成

#### エラー: "Missing Info.plist"
**解決策**: `app.json`の`ios.infoPlist`設定を確認

### Firebase接続エラー

#### エラー: "FirebaseError: Missing or insufficient permissions"
**解決策**: Firestoreセキュリティルールを確認してデプロイ

### GitHub Pagesエラー

#### エラー: "404 Not Found"
**解決策**:
1. ファイルが`docs/`フォルダにあるか確認
2. GitHub Pages設定でソースが`/docs`になっているか確認
3. 数分待ってキャッシュをクリア

---

## 今後の改善案

### 機能追加
1. プッシュ通知
2. 地図機能の拡張
3. 公園のお気に入りリスト共有
4. 公園の混雑状況
5. イベント情報

### 技術的改善
1. TypeScriptへの移行
2. ユニットテストの追加
3. CI/CDパイプラインの構築
4. パフォーマンス最適化
5. オフライン対応

### UI/UX改善
1. ダークモード対応
2. アニメーションの追加
3. アクセシビリティの向上
4. 多言語対応の拡張

---

## 参考資料

### 公式ドキュメント
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)

### 重要なガイドライン
- [Guideline 1.2 - User-Generated Content](https://developer.apple.com/app-store/review/guidelines/#user-generated-content)
- [Guideline 5.1.1(v) - Account Deletion](https://developer.apple.com/app-store/review/guidelines/#data-collection-and-storage)

---

## バージョン履歴

### v1.0.5 (2025-11-27)
- 利用規約への同意機能を追加
- ユーザーブロック機能を追加
- プライバシーポリシーを作成・公開
- GitHub Pagesを設定
- App Store再提出準備完了

### v1.0.0 (初回リリース)
- 基本機能の実装
- 公園の検索・閲覧
- レビュー投稿・閲覧
- お気に入り機能
- アカウント管理

---

**メンテナンス**: このドキュメントは開発の進捗に応じて定期的に更新してください。

**連絡先**: kamui00002@yahoo.co.jp
