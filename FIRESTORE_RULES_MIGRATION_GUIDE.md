# Firestore セキュリティルール 移行ガイド

## 📋 概要

新しいセキュリティルールは、すべての CRITICAL、HIGH、MEDIUM レベルの脆弱性を修正し、エンタープライズグレードのセキュリティを実現しています。

## 🎯 主な変更点

### 1. タイムスタンプ管理の厳格化

**変更内容**:
- `createdAt` はサーバー時刻（`request.time`）を強制
- `updatedAt` も更新時にサーバー時刻を強制
- クライアント側でのタイムスタンプ改ざんを防止

**影響するコード**:
```javascript
// ❌ 旧コード（動作しなくなる）
await addDoc(collection(db, 'parks'), {
  name: '代々木公園',
  address: '東京都渋谷区',
  userId: user.uid,
  createdAt: new Date()  // クライアント時刻は拒否される
});

// ✅ 新コード（必須）
import { serverTimestamp } from 'firebase/firestore';

await addDoc(collection(db, 'parks'), {
  name: '代々木公園',
  address: '東京都渋谷区',
  userId: user.uid,
  createdAt: serverTimestamp()  // サーバー時刻を使用
});

// 更新時
await updateDoc(doc(db, 'parks', parkId), {
  name: '新しい名前',
  updatedAt: serverTimestamp()  // 必須
});
```

### 2. 必須フィールドの追加

**parks コレクション**:
- `name` (string, 1-100文字)
- `address` (string, 1-300文字)
- `userId` (string, 自動設定)
- `createdAt` (timestamp, サーバー時刻)

**reviews コレクション**:
- `parkId` (string, 存在する公園のID)
- `rating` (number, 1-5)
- `userId` (string, 自動設定)
- `createdAt` (timestamp, サーバー時刻)

**影響するコード**:
```javascript
// ✅ 公園作成の完全な例
await addDoc(collection(db, 'parks'), {
  name: '代々木公園',              // 必須
  address: '東京都渋谷区',          // 必須
  userId: user.uid,                // 必須（自動設定推奨）
  createdAt: serverTimestamp(),    // 必須
  latitude: 35.6712,               // オプション
  longitude: 139.6994,             // オプション
  description: '広大な都市公園'    // オプション（最大1000文字）
});

// ✅ レビュー作成の完全な例
await addDoc(collection(db, 'reviews'), {
  parkId: parkDocId,               // 必須
  rating: 5,                       // 必須（1-5）
  userId: user.uid,                // 必須
  createdAt: serverTimestamp(),    // 必須
  title: '素晴らしい公園',          // オプション（最大100文字）
  comment: 'とても楽しかった'       // オプション（最大1000文字）
});
```

### 3. 削除・更新権限の厳格化

**変更内容**:
- 削除・更新は作成者のみ可能
- `userId` の変更は不可
- `createdAt` の変更は不可

**影響するコード**:
```javascript
// 削除・更新前に所有権チェックが自動で行われる
// クライアント側での追加チェックは不要（ただし、UIで非表示にすることを推奨）

// ✅ 更新の例
if (park.userId === user.uid) {  // UIレベルでのチェック
  await updateDoc(doc(db, 'parks', parkId), {
    name: '新しい名前',
    address: '新しい住所',
    updatedAt: serverTimestamp()
    // userId: user.uid  ❌ 変更不可
    // createdAt: ...     ❌ 変更不可
  });
}

// ✅ 削除の例
if (park.userId === user.uid) {
  await deleteDoc(doc(db, 'parks', parkId));
}
```

### 4. データバリデーション

**文字列長制限**:
- `parks.name`: 1-100文字
- `parks.address`: 1-300文字
- `parks.description`: 最大1000文字
- `reviews.title`: 最大100文字
- `reviews.comment`: 最大1000文字
- `users.displayName`: 最大50文字
- `users.bio`: 最大500文字

**数値範囲制限**:
- `parks.latitude`: -90〜90
- `parks.longitude`: -180〜180
- `reviews.rating`: 1〜5

**影響するコード**:
```javascript
// クライアント側でもバリデーションを追加推奨
const validateParkName = (name) => {
  if (!name || name.trim().length === 0) {
    throw new Error('公園名は必須です');
  }
  if (name.length > 100) {
    throw new Error('公園名は100文字以内で入力してください');
  }
};

const validateRating = (rating) => {
  if (rating < 1 || rating > 5) {
    throw new Error('評価は1〜5の範囲で入力してください');
  }
};
```

### 5. ユーザー機密情報の保護

**変更内容**:
機密情報（email, phone等）は `users/{userId}/private/` サブコレクションに分離

**影響するコード**:
```javascript
// ❌ 旧コード（公開プロフィールと機密情報が混在）
await setDoc(doc(db, 'users', user.uid), {
  displayName: '太郎',
  email: 'taro@example.com',  // 全員に公開されてしまう
  phone: '090-1234-5678'       // 全員に公開されてしまう
});

// ✅ 新コード（分離）
// 公開プロフィール
await setDoc(doc(db, 'users', user.uid), {
  displayName: '太郎',
  photoURL: 'https://...',
  bio: '公園が好きです',
  createdAt: serverTimestamp()
});

// 機密情報（本人のみアクセス可能）
await setDoc(doc(db, 'users', user.uid, 'private', 'info'), {
  email: 'taro@example.com',
  phone: '090-1234-5678',
  emailVerified: true
});

// 読み取り
const publicProfile = await getDoc(doc(db, 'users', userId));  // 誰でも可能
const privateInfo = await getDoc(doc(db, 'users', user.uid, 'private', 'info'));  // 本人のみ
```

## 🔧 必須の修正箇所

### 1. AddParkScreen.js

```javascript
// 修正前
const newPark = {
  name: parkName,
  address: parkAddress,
  userId: user.uid,
  createdAt: new Date()
};

// 修正後
import { serverTimestamp } from 'firebase/firestore';

const newPark = {
  name: parkName,               // バリデーション: 1-100文字
  address: parkAddress,         // バリデーション: 1-300文字
  userId: user.uid,
  createdAt: serverTimestamp(),
  description: description || null,  // オプション: 最大1000文字
  latitude: latitude || null,
  longitude: longitude || null
};
```

### 2. AddReviewScreen.js

```javascript
// 修正前
const newReview = {
  parkId: parkId,
  rating: rating,
  userId: user.uid,
  createdAt: new Date()
};

// 修正後
import { serverTimestamp } from 'firebase/firestore';

const newReview = {
  parkId: parkId,               // 必須: 存在する公園のID
  rating: rating,               // 必須: 1-5の数値
  userId: user.uid,
  createdAt: serverTimestamp(),
  title: title || null,         // オプション: 最大100文字
  comment: comment || null      // オプション: 最大1000文字
};
```

### 3. ParkDetailScreen.js（更新・削除）

```javascript
// 更新時
import { serverTimestamp } from 'firebase/firestore';

await updateDoc(doc(db, 'parks', parkId), {
  name: updatedName,
  address: updatedAddress,
  updatedAt: serverTimestamp()  // 必須追加
});

// 削除時（権限チェックは自動だが、UIで制御推奨）
if (park.userId === user.uid) {
  await deleteDoc(doc(db, 'parks', parkId));
}
```

### 4. MyPageScreen.js（ユーザープロフィール）

```javascript
// 公開プロフィール更新
await updateDoc(doc(db, 'users', user.uid), {
  displayName: newDisplayName,   // 最大50文字
  bio: newBio,                   // 最大500文字
  updatedAt: serverTimestamp()   // 必須追加
});

// 機密情報の取得・更新
const privateRef = doc(db, 'users', user.uid, 'private', 'info');
await setDoc(privateRef, {
  email: newEmail,
  phone: newPhone
});
```

## 📝 推奨される追加実装

### 1. クライアント側バリデーション

```javascript
// utils/validation.js
export const validatePark = (park) => {
  const errors = {};

  if (!park.name || park.name.trim().length === 0) {
    errors.name = '公園名は必須です';
  } else if (park.name.length > 100) {
    errors.name = '公園名は100文字以内で入力してください';
  }

  if (!park.address || park.address.trim().length === 0) {
    errors.address = '住所は必須です';
  } else if (park.address.length > 300) {
    errors.address = '住所は300文字以内で入力してください';
  }

  if (park.description && park.description.length > 1000) {
    errors.description = '説明は1000文字以内で入力してください';
  }

  return errors;
};

export const validateReview = (review) => {
  const errors = {};

  if (!review.rating || review.rating < 1 || review.rating > 5) {
    errors.rating = '評価は1〜5の範囲で選択してください';
  }

  if (review.title && review.title.length > 100) {
    errors.title = 'タイトルは100文字以内で入力してください';
  }

  if (review.comment && review.comment.length > 1000) {
    errors.comment = 'コメントは1000文字以内で入力してください';
  }

  return errors;
};
```

### 2. エラーハンドリング

```javascript
try {
  await addDoc(collection(db, 'parks'), newPark);
} catch (error) {
  if (error.code === 'permission-denied') {
    Alert.alert(
      'エラー',
      '公園の作成に失敗しました。必須項目をすべて入力してください。'
    );
  } else {
    Alert.alert('エラー', error.message);
  }
}
```

### 3. UI制御（削除・編集ボタン）

```javascript
// ParkDetailScreen.js
const isOwner = park.userId === user?.uid;

return (
  <View>
    {/* ... park details ... */}
    {isOwner && (
      <View>
        <Button title="編集" onPress={handleEdit} />
        <Button title="削除" onPress={handleDelete} />
      </View>
    )}
  </View>
);
```

## 🧪 テスト手順

### 1. Firebaseコンソールでルールをデプロイ

1. Firebase Console にログイン
2. プロジェクトを選択
3. Firestore Database > ルール
4. `parkpedia/firestore.rules` の内容をコピー＆ペースト
5. 「公開」をクリック

### 2. アプリケーションの動作確認

```javascript
// ✅ 成功するケース
- 認証済みユーザーが公園を作成（必須フィールドあり）
- 作成者が自分の公園を編集
- 作成者が自分の公園を削除
- 認証済みユーザーがレビューを作成
- 作成者が自分のレビューを編集・削除

// ❌ 失敗するケース（permission-denied）
- 未認証ユーザーが公園を作成
- 他人の公園を編集・削除
- 必須フィールドが欠けている
- 文字列長が制限を超えている
- rating が 1-5 の範囲外
- serverTimestamp() を使わずに Date オブジェクトを使用
```

### 3. Firebase Emulator でのローカルテスト

```bash
# Emulator起動
firebase emulators:start

# テストファイル実行
npm test
```

## ⚠️ 注意事項

### 1. 段階的移行の推奨

既存のデータがある場合は以下の順序で移行してください：

1. **ステージング環境でテスト**
2. **既存データのマイグレーション**（createdAt/updatedAt追加）
3. **アプリケーションコード更新**
4. **本番環境にデプロイ**

### 2. 既存データのマイグレーション

既存のドキュメントに `createdAt` がない場合、Cloud Functions で一括追加：

```javascript
// migration/addTimestamps.js
const admin = require('firebase-admin');
admin.initializeApp();

const migrateParks = async () => {
  const snapshot = await admin.firestore().collection('parks').get();

  const batch = admin.firestore().batch();
  snapshot.docs.forEach((doc) => {
    if (!doc.data().createdAt) {
      batch.update(doc.ref, {
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

  await batch.commit();
  console.log('Migration completed');
};

migrateParks();
```

### 3. 互換性の維持

新ルールは既存データに影響を与えませんが、**更新時には新ルールが適用されます**。
古いドキュメントを更新する際は、必須フィールドがすべて揃っていることを確認してください。

## 📚 参考リンク

- [Firebase セキュリティルール ドキュメント](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore データバリデーション](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [serverTimestamp() リファレンス](https://firebase.google.com/docs/reference/js/firestore_.servertimestamp)

## 🎉 完了チェックリスト

- [ ] `firestore.rules` を Firebase Console にデプロイ
- [ ] `serverTimestamp()` をすべての作成・更新処理に追加
- [ ] 必須フィールドのバリデーションを追加
- [ ] 文字列長・数値範囲のバリデーションを追加
- [ ] 削除・編集ボタンの表示制御を追加
- [ ] エラーハンドリングを改善
- [ ] ユーザー機密情報を `private` サブコレクションに移行
- [ ] すべての画面で動作確認完了
- [ ] ステージング環境でテスト完了
- [ ] 本番環境にデプロイ

---

**作成日**: 2025-11-21
**対象ファイル**: `parkpedia/firestore.rules`
