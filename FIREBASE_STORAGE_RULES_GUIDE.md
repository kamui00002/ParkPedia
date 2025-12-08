# Firebase Storage セキュリティルール設定ガイド

## 🔴 緊急対応が必要

Firebase Cloud Storageのセキュリティルールがテストモード（全公開）のままで、**0日後にすべてのクライアントリクエストが拒否**されます。

---

## ✅ 解決方法

### ステップ1: セキュリティルールファイルを確認

`storage.rules`ファイルが作成されています。内容を確認してください。

### ステップ2: Firebase Consoleでルールをデプロイ

1. **Firebase Consoleにログイン**
   - URL: https://console.firebase.google.com/
   - プロジェクト: `parkpedia-app` を選択

2. **Storageを開く**
   - 左メニューから「Storage」をクリック

3. **「ルール」タブをクリック**
   - Storageページの上部のタブから選択

4. **ルールをコピー＆ペースト**
   - `storage.rules`ファイルの内容をすべてコピー
   - Firebase Consoleのルールエディタに貼り付け

5. **「公開」をクリック**
   - ルールが保存され、すぐに有効になります

---

## 📋 ルールの内容

### 主な機能

1. **画像の読み取り**: 誰でも可能（公開画像）
2. **画像のアップロード**: 認証済みユーザーのみ
3. **フォルダ構造**: ユーザーごとにフォルダ分け
   - `/images/parks/{userId}/` - 公園の画像
   - `/images/reviews/{userId}/` - レビューの写真
   - `/images/profiles/{userId}/` - プロフィール画像

4. **ファイルサイズ制限**:
   - 公園・レビュー画像: 10MB
   - プロフィール画像: 5MB

5. **ファイル形式**: 画像ファイルのみ（`image/*`）

6. **削除**: 所有者のみ可能

---

## 🔍 ルールの詳細説明

### 1. 公園の画像 (`/images/parks/{userId}/{fileName}`)

```javascript
// 読み取り: 誰でも可能
allow read: if true;

// 作成: 認証済みユーザー、自分のフォルダのみ
allow create: if isAuthenticated()
  && isOwner(userId)  // 自分のuserIdフォルダのみ
  && request.resource.size < 10 * 1024 * 1024  // 10MB以下
  && request.resource.contentType.matches('image/.*');  // 画像のみ
```

### 2. レビューの写真 (`/images/reviews/{userId}/{fileName}`)

```javascript
// 読み取り: 誰でも可能
allow read: if true;

// 作成: 認証済みユーザー、自分のフォルダのみ
allow create: if isAuthenticated()
  && isOwner(userId)
  && request.resource.size < 10 * 1024 * 1024
  && request.resource.contentType.matches('image/.*');
```

### 3. プロフィール画像 (`/images/profiles/{userId}/{fileName}`)

```javascript
// 読み取り: 誰でも可能
allow read: if true;

// 書き込み: 所有者のみ
allow write: if isAuthenticated()
  && isOwner(userId)
  && request.resource.size < 5 * 1024 * 1024  // 5MB以下
  && request.resource.contentType.matches('image/.*');
```

---

## ⚠️ 重要な注意点

### 1. ルールの反映時間

- ルールを公開すると、**すぐに有効**になります
- 変更が反映されるまで数秒かかる場合があります

### 2. 既存のファイル

- 既存のファイルは影響を受けません
- 新しいアップロードのみ、新しいルールが適用されます

### 3. テストモードからの移行

- テストモード（全公開）から適切なルールに移行します
- アプリの機能は維持されますが、セキュリティが強化されます

---

## 🧪 ルールのテスト

### Firebase Consoleでテスト

1. **Storage > ルール**タブを開く
2. **「シミュレーター」タブをクリック**
3. **テストケースを作成**:
   - **場所**: `/images/parks/user123/image.jpg`
   - **操作**: 読み取り/書き込み
   - **認証**: あり/なし
   - **「実行」をクリック**

### 期待される結果

- ✅ 認証済みユーザーが自分のフォルダに書き込み: **許可**
- ✅ 認証済みユーザーが他人のフォルダに書き込み: **拒否**
- ✅ 未認証ユーザーが書き込み: **拒否**
- ✅ 誰でも読み取り: **許可**

---

## 📝 アプリ側の実装確認

### 画像アップロード時のパス構造

アプリで画像をアップロードする際は、以下のパス構造を使用してください：

```javascript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebaseConfig';

// 公園の画像をアップロード
const uploadParkImage = async (imageUri) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('ログインが必要です');
  }
  
  // パス: /images/parks/{userId}/{fileName}
  const storageRef = ref(
    storage, 
    `images/parks/${currentUser.uid}/${Date.now()}.jpg`
  );
  
  // ファイルをアップロード
  const response = await fetch(imageUri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob);
  
  // ダウンロードURLを取得
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

// レビューの写真をアップロード
const uploadReviewPhoto = async (imageUri) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('ログインが必要です');
  }
  
  // パス: /images/reviews/{userId}/{fileName}
  const storageRef = ref(
    storage, 
    `images/reviews/${currentUser.uid}/${Date.now()}.jpg`
  );
  
  const response = await fetch(imageUri);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob);
  
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
```

---

## 🔧 トラブルシューティング

### 問題1: アップロードが拒否される

**原因**: 
- ユーザーがログインしていない
- 間違ったパス構造を使用している
- ファイルサイズが制限を超えている

**対処法**:
1. ユーザーがログインしているか確認
2. パスが `/images/parks/{userId}/` または `/images/reviews/{userId}/` になっているか確認
3. ファイルサイズが10MB以下か確認

### 問題2: 読み取りができない

**原因**: 
- パスが間違っている
- ファイルが存在しない

**対処法**:
1. ファイルのパスを確認
2. Firebase Console > Storageでファイルが存在するか確認

### 問題3: ルールが反映されない

**原因**: 
- ルールの公開が完了していない
- 構文エラーがある

**対処法**:
1. Firebase Consoleでルールにエラーがないか確認
2. 「公開」ボタンを再度クリック
3. 数秒待ってから再度試す

---

## ✅ チェックリスト

### 今すぐ実行

- [ ] `storage.rules`ファイルの内容を確認
- [ ] Firebase Console > Storage > ルールを開く
- [ ] ルールをコピー＆ペースト
- [ ] 「公開」をクリック
- [ ] エラーがないか確認

### 確認事項

- [ ] ルールが正しく公開されたか確認
- [ ] アプリで画像アップロードが動作するか確認
- [ ] 画像の読み取りが動作するか確認

---

## 📞 サポート

問題が解決しない場合：

1. **Firebase Consoleのルールエディタでエラーを確認**
   - 構文エラーがある場合は赤く表示されます

2. **Firebase サポートに問い合わせ**
   - Firebase Console > ヘルプ > サポート

3. **Firebase Storage セキュリティルールの公式ドキュメント**
   - URL: https://firebase.google.com/docs/storage/security

---

## 🚀 次のステップ

1. **今すぐ**: Firebase Consoleでルールを公開
2. **確認**: アプリで画像アップロードが動作するか確認
3. **テスト**: シミュレーターでルールをテスト

---

**緊急対応が必要です！今すぐFirebase Consoleでルールを公開してください！** 🚨

**最終更新**: 2025-11-30




