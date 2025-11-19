# ParkPedia クイックスタートガイド

このガイドでは、ParkPediaアプリをセットアップして起動するまでの手順を説明します。

## 前提条件

- Node.js (v16以上) がインストールされていること
- npm または yarn がインストールされていること
- Expo CLI がインストールされていること（`npm install -g expo-cli`）
- Firebase アカウントを持っていること

## ステップ1: プロジェクトのセットアップ

### 1.1 依存関係のインストール

```bash
cd parkpedia
npm install
```

### 1.2 Expo CLIのインストール（未インストールの場合）

```bash
npm install -g expo-cli
```

## ステップ2: Firebaseプロジェクトの作成

### 2.1 Firebase Consoleでプロジェクトを作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `parkpedia-app`）
4. プロジェクトを作成

### 2.2 Authentication の有効化

1. Firebase Consoleで「Authentication」を選択
2. 「始める」をクリック
3. 「メール/パスワード」を有効化
4. 「保存」をクリック

### 2.3 Firestore Database の作成

1. Firebase Consoleで「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 「テストモードで開始」を選択（後でセキュリティルールを適用）
4. ロケーションを選択（例: `asia-northeast1`）
5. 「有効にする」をクリック

### 2.4 Firebase設定値の取得

1. Firebase Console > プロジェクト設定 > 全般
2. 「あなたのアプリ」セクションで「</>」アイコン（ウェブ）をクリック
3. 表示される設定値をコピー

### 2.5 firebaseConfig.js の設定

`firebaseConfig.js` を開き、取得した設定値を入力：

```javascript
const firebaseConfig = {
  apiKey: "AIza...", // 実際のAPIキー
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
};
```

## ステップ3: Firestoreセキュリティルールの設定

### 3.1 セキュリティルールの適用

1. Firebase Console > Firestore Database > ルール
2. `firestore.rules` の内容をコピー＆ペースト
3. 「公開」をクリック

## ステップ4: サンプルデータの追加（オプション）

### 4.1 公園データの追加

1. Firebase Console > Firestore Database
2. 「コレクションを開始」をクリック
3. コレクションID: `parks` を入力
4. `SAMPLE_DATA.js` の `sampleParks` を参考に、各公園のデータを追加

各ドキュメントのフィールド:
- `name` (string): 公園名
- `address` (string): 住所
- `description` (string): 説明
- `latitude` (number): 緯度
- `longitude` (number): 経度
- `rating` (number): 評価（0-5）
- `createdAt` (timestamp): 作成日時
- `userId` (string): 作成者のユーザーID

### 4.2 レビューデータの追加（オプション）

1. 「コレクションを開始」をクリック
2. コレクションID: `reviews` を入力
3. `SAMPLE_DATA.js` の `sampleReviews` を参考に、レビューデータを追加

## ステップ5: アプリの起動

### 5.1 開発サーバーの起動

```bash
npm start
```

または

```bash
expo start
```

### 5.2 デバイスで実行

#### iOSシミュレーター（Macのみ）

```bash
npm run ios
```

#### Androidエミュレーター

```bash
npm run android
```

#### 実機で実行

1. 開発サーバー起動後、QRコードが表示されます
2. iOS: CameraアプリでQRコードをスキャン
3. Android: Expo GoアプリでQRコードをスキャン

## ステップ6: アプリの使用

### 6.1 アカウント作成

1. アプリを起動
2. 「アカウントをお持ちでない方はこちら」をタップ
3. メールアドレスとパスワードを入力
4. 「新規登録」をタップ

### 6.2 ログイン

1. メールアドレスとパスワードを入力
2. 「ログイン」をタップ

### 6.3 公園の閲覧

1. ホーム画面で公園一覧を確認
2. 検索バーで公園を検索
3. 公園カードをタップして詳細を表示

### 6.4 レビューの投稿

1. 公園詳細画面で「レビューを書く」をタップ
2. 星評価を選択（1-5）
3. コメントを入力
4. 「レビューを投稿」をタップ

## トラブルシューティング

### エラー: "Firebase: Error (auth/network-request-failed)"

- インターネット接続を確認
- Firebase設定値が正しいか確認

### エラー: "Firestore: Permission denied"

- Firestoreセキュリティルールが正しく設定されているか確認
- ユーザーがログインしているか確認

### アプリが起動しない

```bash
# キャッシュをクリア
expo start -c

# または
npm start -- --clear
```

### 依存関係のエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
```

## 次のステップ

- 公園追加機能の実装
- 写真アップロード機能の追加
- 位置情報ベースの検索機能
- お気に入り機能の追加

詳細は `README.md` を参照してください。








