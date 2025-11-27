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

- **React Native**: 0.74.5
- **Expo**: ~51.0.0
- **Firebase**: Authentication, Firestore, Storage
- **React Navigation**: ナビゲーション管理

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

### 5. サンプルデータの追加

`SAMPLE_DATA.js` を参考に、Firebase Consoleからサンプルデータを追加できます。

### 6. アプリの起動

```bash
# 開発サーバーを起動
npm start

# iOSシミュレーターで起動
npm run ios

# Androidエミュレーターで起動
npm run android
```

## プロジェクト構成

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

詳細は `FILE_STRUCTURE.md` を参照してください。

## クイックスタート

詳細なセットアップ手順は `QUICKSTART.md` を参照してください。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。












