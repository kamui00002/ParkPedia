# 管理者チェックエラーの修正

## 問題

`adminUtils.js`で`where('userId', '==', currentUser.uid)`を使用してクエリしていましたが、Firestoreルールでは`admins`コレクションのドキュメントIDが`adminId`（ユーザーUID）であることを想定しています。

## 修正内容

`adminUtils.js`の`checkIsAdmin`関数を修正し、`where`クエリの代わりに`getDoc`を使用してドキュメントIDを直接取得するように変更しました。

### 変更前
```javascript
const adminsRef = collection(db, 'admins');
const q = query(adminsRef, where('userId', '==', currentUser.uid));
const querySnapshot = await getDocs(q);
return !querySnapshot.empty;
```

### 変更後
```javascript
const adminDocRef = doc(db, 'admins', currentUser.uid);
const adminDocSnap = await getDoc(adminDocRef);
return adminDocSnap.exists();
```

## 理由

Firestoreルールの`admins`コレクションでは：
- `allow get: if isAuthenticated() && request.auth.uid == adminId;` - ドキュメントIDがユーザーUIDと一致する場合に許可
- `allow list: if isAuthenticated() && request.query.limit <= 100;` - リストクエリは許可されているが、`where`句の検証は行っていない

`getDoc`を使用することで、`allow get`ルールが適用され、より確実に権限チェックが行われます。

## 確認事項

1. `admins`コレクションのドキュメントIDがユーザーUIDと一致していることを確認
2. アプリを再起動してエラーが解消されたか確認

## 次のステップ

アプリを再起動し、以下のエラーが解消されたか確認：
- `管理者チェックエラー: Missing or insufficient permissions`
- `マイページデータ取得エラー: Missing or insufficient permissions`

