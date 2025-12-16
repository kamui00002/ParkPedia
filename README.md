# ParkPedia

公園情報共有アプリ - React Native + Expo + Firebase

## 概要

ParkPediaは、ユーザーが公園の情報を共有し、レビューを投稿できるモバイルアプリケーションです。

## 主な機能

- 🔐 **ユーザー認証**: Firebase Authenticationを使用したメール/パスワード認証
- 📍 **公園一覧**: Firestoreから公園情報を取得して表示
- 🔍 **検索機能**: 公園名や住所で検索
- ⭐ **レビュー機能**: 星評価とコメントによるレビュー投稿
- 📱 **レスポンシブデザイン**: iOS/Android対応

## 技術スタック

- **React**: 18.3.1
- **React Native**: 0.76.5
- **Expo SDK**: ~54.0.29
- **Firebase**: Authentication, Firestore, Storage
- **React Navigation**: ナビゲーション管理
- **AdMob**: react-native-google-mobile-ads v16.0.0

## セットアップ

### 1. 必要な環境

- Node.js (v16以上推奨)
- npm または yarn
- Expo CLI
- Firebase プロジェクト

### 2. インストール

```bash
# 依存関係のインストール
npm install

# または
yarn install
```

### 3. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authentication を有効化（メール/パスワード認証）
3. Firestore Database を作成
4. Storage を有効化（必要に応じて）
5. `firebaseConfig.js` に設定値を記載

### 4. Firestoreセキュリティルール

`firestore.rules` の内容を Firebase Console > Firestore Database > ルール にコピー＆ペーストしてください。

### 5. Firebase Storageセキュリティルール（重要）

`storage.rules` の内容を Firebase Console > Storage > ルール にコピー＆ペーストして公開してください。

**詳細な手順は `STORAGE_RULES_DEPLOY_GUIDE.md` を参照してください。**

```bash
# ルールをクリップボードにコピー（Mac）
pbcopy < storage.rules

# または内容を表示
cat storage.rules
```

⚠️ **Storage Rulesをデプロイしないと画像が表示されません！**

### 6. サンプルデータの追加

`SAMPLE_DATA.js` を参考に、Firebase Consoleからサンプルデータを追加できます。

### 7. アプリの起動

```bash
# 開発サーバーを起動
npm start

# iOSシミュレーターで起動
npm run ios

# Androidエミュレーターで起動
npm run android
```

## クイックスタート（詳細）

- **依存関係のインストール**: `npm install`
- **Firebaseの準備**: Authentication / Firestore / Storage を有効化し、`firebaseConfig.js` を設定
- **Firestoreルール適用**: `firestore.rules` を Console に貼り付けて公開
- **起動**: `npm start`（必要なら `expo start -c` でキャッシュクリア）

よくあるエラー:
- **Firestore Permission denied**: ルールが未公開 or ログインしていない
- **Firebase auth/network-request-failed**: ネットワーク/設定値を確認

運用・審査・トラブルシュートの詳細は `docs/DEVELOPMENT_KNOWLEDGE_BASE.md` を参照してください。

## プロジェクト構成（要点）

```
.
├── App.js                 # メインアプリケーションファイル
├── firebaseConfig.js      # Firebase設定
├── package.json           # 依存関係
├── app.json              # Expo設定
├── screens/              # 画面コンポーネント
│   ├── HomeScreen.js     # ホーム画面
│   ├── ParkDetailScreen.js  # 公園詳細画面
│   ├── AddReviewScreen.js   # レビュー追加画面
│   └── LoginScreen.js    # ログイン画面
└── SAMPLE_DATA.js        # サンプルデータ
```

詳細な構造・設計のメモは `docs/DEVELOPMENT_KNOWLEDGE_BASE.md` と `docs/ARCHIVE.md` に統合しました。

## バージョン情報

- **最新バージョン**: 1.0.25
- **ビルド番号**: 31 (iOS)
- **最終更新**: 2025-12-17

### 最新の変更点（v1.0.25）

- ✅ React 18.3.1へのダウングレード（React 19互換性問題を解決）
- ✅ AdMobバナー広告を再有効化（useState関連エラーを修正）
- ✅ Firebase Storage画像表示の問題診断とドキュメント作成

詳細は `V1.0.25_FIX_SUMMARY.md` を参照してください。

## ドキュメント

- **v1.0.25修正サマリー**: `V1.0.25_FIX_SUMMARY.md`
- **Storage Rules デプロイガイド**: `STORAGE_RULES_DEPLOY_GUIDE.md` ⭐重要
- **運用/審査/トラブルシュート集約**: `docs/DEVELOPMENT_KNOWLEDGE_BASE.md`
- **過去の作業メモの統合アーカイブ**: `docs/ARCHIVE.md`
- **公開用プライバシーポリシー（HTML）**: `docs/privacy-policy.html`
- **広告（app-ads.txt）**: `docs/app-ads.txt`

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。












