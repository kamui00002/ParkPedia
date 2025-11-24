# ParkPedia ファイル構造

このドキュメントでは、ParkPediaプロジェクトのファイル構造と各ファイルの役割を説明します。

## プロジェクト構造

```
parkpedia/
├── App.js                    # メインアプリケーションファイル
├── firebaseConfig.js         # Firebase設定ファイル
├── package.json              # 依存関係とスクリプト
├── app.json                  # Expo設定ファイル
├── .gitignore                # Git除外ファイル
├── firestore.rules           # Firestoreセキュリティルール
├── SAMPLE_DATA.js            # サンプルデータ
├── README.md                 # プロジェクト概要
├── QUICKSTART.md             # クイックスタートガイド
├── FILE_STRUCTURE.md         # このファイル
└── screens/                  # 画面コンポーネント
    ├── HomeScreen.js         # ホーム画面
    ├── ParkDetailScreen.js   # 公園詳細画面
    ├── AddReviewScreen.js    # レビュー追加画面
    └── LoginScreen.js        # ログイン画面
```

## ファイル詳細

### ルートディレクトリ

#### `App.js`
- **役割**: アプリケーションのエントリーポイント
- **機能**:
  - React Navigationの設定
  - 認証状態の管理
  - 画面間のナビゲーション設定
  - グローバルなスタイル設定

#### `firebaseConfig.js`
- **役割**: Firebaseサービスの初期化とエクスポート
- **機能**:
  - Firebase Appの初期化
  - Authentication、Firestore、Storageのエクスポート
  - 設定値の管理

#### `package.json`
- **役割**: プロジェクトの依存関係とスクリプトを定義
- **内容**:
  - 依存パッケージのリスト
  - 開発用スクリプト（start, ios, android, web）
  - プロジェクトメタデータ

#### `app.json`
- **役割**: Expoアプリの設定
- **設定内容**:
  - アプリ名、バージョン、アイコン
  - iOS/Android固有の設定
  - パーミッション設定（位置情報、カメラなど）
  - Expoプラグイン設定

#### `.gitignore`
- **役割**: Gitで追跡しないファイルを指定
- **除外内容**:
  - node_modules/
  - .expo/
  - 環境変数ファイル（.env）
  - ビルドファイル
  - IDE設定ファイル

#### `firestore.rules`
- **役割**: Firestoreデータベースのセキュリティルール
- **定義内容**:
  - parksコレクションの読み書き権限
  - reviewsコレクションの読み書き権限
  - usersコレクションの読み書き権限

#### `SAMPLE_DATA.js`
- **役割**: Firebase Consoleに追加するサンプルデータ
- **内容**:
  - サンプル公園データ（5件）
  - サンプルレビューデータ
  - データ追加方法の説明

### screens/ ディレクトリ

#### `screens/HomeScreen.js`
- **役割**: 公園一覧を表示するホーム画面
- **機能**:
  - Firestoreから公園リストを取得
  - 検索機能（公園名、住所で検索）
  - 公園カードの表示
  - 公園詳細画面への遷移
  - 公園追加ボタン（将来実装予定）

#### `screens/ParkDetailScreen.js`
- **役割**: 公園の詳細情報とレビューを表示
- **機能**:
  - 公園の詳細情報表示（名前、住所、説明）
  - 平均評価の計算と表示
  - レビュー一覧の表示
  - レビュー追加画面への遷移

#### `screens/AddReviewScreen.js`
- **役割**: 新しいレビューを投稿する画面
- **機能**:
  - 星評価の選択（1-5）
  - コメント入力
  - Firestoreへのレビュー保存
  - バリデーション

#### `screens/LoginScreen.js`
- **役割**: ユーザー認証を行う画面
- **機能**:
  - メール/パスワードでのログイン
  - 新規アカウント作成
  - ログイン/新規登録の切り替え
  - エラーハンドリング

## データ構造

### Firestore コレクション

#### `parks` コレクション
```javascript
{
  name: string,           // 公園名
  address: string,        // 住所
  description: string,    // 説明
  latitude: number,       // 緯度
  longitude: number,      // 経度
  rating: number,         // 平均評価（0-5）
  createdAt: timestamp,   // 作成日時
  userId: string          // 作成者のユーザーID
}
```

#### `reviews` コレクション
```javascript
{
  parkId: string,         // 公園のドキュメントID
  userId: string,         // レビュー投稿者のユーザーID
  userName: string,       // レビュー投稿者の名前
  rating: number,         // 評価（1-5）
  comment: string,        // コメント
  createdAt: timestamp    // 作成日時
}
```

#### `users` コレクション（将来実装予定）
```javascript
{
  displayName: string,    // 表示名
  email: string,          // メールアドレス
  createdAt: timestamp,   // 作成日時
  // その他のプロフィール情報
}
```

## ナビゲーション構造

```
LoginScreen (未ログイン時)
  ↓
HomeScreen (ログイン後)
  ├─→ ParkDetailScreen
  │     └─→ AddReviewScreen
  └─→ (将来: AddParkScreen)
```

## スタイルガイド

- **メインカラー**: `#4CAF50` (緑)
- **背景色**: `#f5f5f5` (薄いグレー)
- **テキストカラー**: `#333` (ダークグレー)
- **セカンダリテキスト**: `#666` (ミディアムグレー)

## 今後の拡張予定

- [ ] 公園追加機能（AddParkScreen）
- [ ] 写真アップロード機能
- [ ] 位置情報ベースの検索
- [ ] お気に入り機能
- [ ] ユーザープロフィール画面
- [ ] プッシュ通知
- [ ] オフライン機能

## 関連ドキュメント

- `README.md`: プロジェクト概要とセットアップ
- `QUICKSTART.md`: 詳細なセットアップ手順
- `SAMPLE_DATA.js`: サンプルデータと使用方法












