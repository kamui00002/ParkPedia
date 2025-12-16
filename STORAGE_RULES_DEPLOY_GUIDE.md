# Firebase Storage Rules デプロイガイド

## 概要
このガイドでは、Firebase Storage Rulesを正しくデプロイする手順を説明します。

## なぜStorage Rulesのデプロイが必要か

Firebase Storageに保存された画像ファイルにアクセスするには、セキュリティルールが正しく設定されている必要があります。

### よくある問題
- ❌ 画像がアプリ内で表示されない
- ❌ 画像のアップロードが失敗する
- ❌ 「storage/unauthorized」エラーが発生する

### 原因
- ローカルの`storage.rules`ファイルは自動的にFirebaseにデプロイされません
- Firebase Consoleで手動でルールを公開する必要があります

---

## デプロイ手順

### 手順1: Firebase Consoleにアクセス

1. ブラウザでFirebase Consoleを開く
   ```
   https://console.firebase.google.com/
   ```

2. ParkPediaプロジェクトを選択
   - プロジェクトID: `parkpedia-app`

### 手順2: Storageセクションに移動

1. 左側のメニューから「Storage」をクリック
2. 「Rules」タブをクリック

### 手順3: storage.rulesの内容を取得

ターミナルで以下のコマンドを実行してルールをクリップボードにコピー：

```bash
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia
pbcopy < storage.rules
```

または、以下のコマンドで内容を表示：

```bash
cat storage.rules
```

### 手順4: ルールを貼り付けて公開

1. Firebase Consoleの「Rules」エディタに内容を貼り付け
   - 既存のルールをすべて削除
   - `storage.rules`の内容を貼り付け

2. 「公開」ボタンをクリック

3. 確認ダイアログが表示されたら「公開」をクリック

### 手順5: デプロイ完了を確認

1. 「Rules」タブに以下の内容が表示されていることを確認：
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       ...
     }
   }
   ```

2. タイムスタンプが最新であることを確認
   - 右上に「最終更新: 数秒前」などと表示される

---

## 動作確認

### 確認方法1: アプリで画像を表示

1. ParkPediaアプリを起動
2. 公園詳細画面で既存の画像が表示されるか確認
3. 新しく公園を追加して画像をアップロード
4. アップロードした画像が表示されるか確認

### 確認方法2: Firebase Consoleで確認

1. Firebase Console > Storage > Files
2. 画像ファイルをクリック
3. 「トークンを含むURL」をコピー
4. ブラウザで開いて画像が表示されるか確認

### 確認方法3: ルールプレイグラウンドでテスト

1. Firebase Console > Storage > Rules
2. 「ルールプレイグラウンド」タブをクリック
3. 以下の内容でテスト：
   - **操作**: read
   - **パス**: `/images/parks/{userId}/{fileName}`
   - **認証**: 認証済みユーザー（UID: test-user-id）
4. 「実行」をクリックして「許可」と表示されることを確認

---

## Storage Rulesの構造

### 現在のルール構造

```
/images/
  ├── parks/
  │   └── {userId}/
  │       └── {fileName}  ← 公園画像
  ├── reviews/
  │   └── {userId}/
  │       └── {fileName}  ← レビュー画像
  └── profiles/
      └── {userId}/
          └── {fileName}  ← プロフィール画像
```

### 各パスの権限

#### 公園画像 (`/images/parks/{userId}/{fileName}`)
- **読み取り (read)**: 誰でも可能（`allow read: if true;`）
- **作成 (create)**: ログイン済み、自分のフォルダのみ、10MB以下、画像ファイル
- **更新 (update)**: オーナーのみ、10MB以下、画像ファイル
- **削除 (delete)**: オーナーのみ

#### レビュー画像 (`/images/reviews/{userId}/{fileName}`)
- 公園画像と同じ権限

#### プロフィール画像 (`/images/profiles/{userId}/{fileName}`)
- **読み取り (read)**: 誰でも可能
- **作成 (create)**: ログイン済み、自分のフォルダのみ、5MB以下、画像ファイル
- **更新 (update)**: オーナーのみ、5MB以下、画像ファイル
- **削除 (delete)**: オーナーのみ

#### 旧パス (`/images/{userId}/{fileName}`)
- 後方互換性のため読み取りのみ許可
- 新規アップロードは`/images/parks/`を使用すること

---

## トラブルシューティング

### 画像が表示されない

#### 症状
- 画像URLにアクセスすると403エラー
- アプリで画像が読み込めない
- コンソールに「storage/unauthorized」エラー

#### 解決方法

1. **Storage Rulesがデプロイされているか確認**
   - Firebase Console > Storage > Rules
   - 最新のルールが公開されているか確認

2. **ルールの構文エラーを確認**
   - Firebase Console > Storage > Rules
   - エラーメッセージが表示されていないか確認

3. **画像パスが正しいか確認**
   ```javascript
   // 正しい: /images/parks/{userId}/{fileName}
   const storageRef = ref(storage, `images/parks/${userId}/${fileName}`);

   // 間違い: /parks/{userId}/{fileName}
   const storageRef = ref(storage, `parks/${userId}/${fileName}`);
   ```

4. **ユーザーがログインしているか確認**
   ```javascript
   const currentUser = auth.currentUser;
   if (!currentUser) {
     console.error('ログインが必要です');
   }
   ```

### 画像のアップロードが失敗する

#### 症状
- 「storage/unauthorized」エラー
- 「storage/unknown」エラー
- アップロード処理が完了しない

#### 解決方法

1. **ユーザーがログインしているか確認**
   - 匿名ログインも可能（auth.currentUserがnullでなければOK）

2. **画像のContent-Typeが正しいか確認**
   ```javascript
   const metadata = {
     contentType: 'image/jpeg',  // 必須
   };
   await uploadBytes(storageRef, blob, metadata);
   ```

3. **ファイル名が有効か確認**
   - ファイル名は`[a-zA-Z0-9._-]+`のみ許可
   - スペースや特殊文字は使用不可

4. **ファイルサイズを確認**
   - 公園/レビュー画像: 10MB以下
   - プロフィール画像: 5MB以下

### Firebase Consoleでログを確認

1. Firebase Console > Storage > Rules
2. 「ログ」タブをクリック
3. 拒否されたリクエストを確認
   - パス
   - ユーザーID
   - エラーの理由

---

## よくある質問

### Q1: storage.rulesファイルを変更したらどうすれば良いですか？

A1: 変更内容をFirebase Consoleで再度公開してください。ローカルファイルの変更は自動的に反映されません。

### Q2: Firebase CLIを使ってデプロイできますか？

A2: 可能です。以下のコマンドを実行：

```bash
# Firebase CLIをインストール（未インストールの場合）
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクトを初期化（初回のみ）
firebase init storage

# Storage Rulesをデプロイ
firebase deploy --only storage
```

### Q3: テストモードと本番モードの違いは？

A3:
- **テストモード**: 誰でもアクセス可能（期限付き）- 本番環境では使用禁止
- **本番モード**: 認証とバリデーションが必要 - 現在のstorage.rulesが本番モード

### Q4: 画像が一部だけ表示されない

A4:
- 旧パス構造（`/images/{userId}/{fileName}`）の画像は表示されます
- 新しいパス構造（`/images/parks/{userId}/{fileName}`）を使用してください
- 両方のパスに対応したルールが設定されています

### Q5: CORS関連のエラーが出る

A5: Firebase Storageはデフォルトでクロスオリジンリクエストを許可しています。CORS問題は通常発生しません。ブラウザのキャッシュをクリアしてみてください。

---

## 参考リンク

- [Firebase Storage Security Rules 公式ドキュメント](https://firebase.google.com/docs/storage/security/start)
- [Storage Rules リファレンス](https://firebase.google.com/docs/storage/security/rules-reference)
- [Storage Rules のベストプラクティス](https://firebase.google.com/docs/storage/security/best-practices)

---

## まとめ

1. ✅ `storage.rules`ファイルをFirebase Consoleで公開
2. ✅ タイムスタンプが最新であることを確認
3. ✅ アプリで画像が表示されることを確認
4. ✅ 新しい画像のアップロードが成功することを確認

問題が解決しない場合は、Firebase Consoleのログを確認してください。
