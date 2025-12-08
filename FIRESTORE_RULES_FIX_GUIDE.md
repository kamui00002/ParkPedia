# Firestore セキュリティルール修正ガイド

## 🔴 問題

アプリで「権限エラー: データの読み取り権限がありません」というエラーが表示されています。

## 🔍 原因

Firestoreのセキュリティルールで、`favorites`と`blockedUsers`コレクションのクエリ（`list`）が正しく設定されていませんでした。

### 問題のあったルール

```javascript
// ❌ 問題: クエリ時にresource.dataにアクセスできない
allow read: if isAuthenticated()
  && resource.data.userId == request.auth.uid;
```

このルールは、個別のドキュメントを取得する（`get`）場合は動作しますが、クエリでリストを取得する（`list`）場合は動作しません。

---

## ✅ 解決方法

### ステップ1: 修正されたルールをFirebase Consoleにデプロイ

1. **Firebase Consoleにログイン**
   - URL: https://console.firebase.google.com/
   - プロジェクト: `parkpedia-app` を選択

2. **Firestore Databaseを開く**
   - 左メニューから「Firestore Database」をクリック

3. **「ルール」タブをクリック**
   - Firestore Databaseページの上部のタブから選択

4. **ルールをコピー＆ペースト**
   - `firestore.rules`ファイルの内容をすべてコピー
   - Firebase Consoleのルールエディタに貼り付け

5. **「公開」をクリック**
   - ルールが保存され、すぐに有効になります

---

## 📋 修正内容

### 1. favoritesコレクション

**修正前**:
```javascript
allow read: if isAuthenticated()
  && resource.data.userId == request.auth.uid;
```

**修正後**:
```javascript
// Get: 個別ドキュメントの取得
allow get: if isAuthenticated()
  && resource.data.userId == request.auth.uid;

// List: クエリでのリスト取得
allow list: if isAuthenticated()
  && request.query.limit <= 100;
```

### 2. blockedUsersコレクション

**修正前**:
```javascript
allow read: if isAuthenticated()
  && resource.data.blockedBy == request.auth.uid;
```

**修正後**:
```javascript
// Get: 個別ドキュメントの取得
allow get: if isAuthenticated()
  && resource.data.blockedBy == request.auth.uid;

// List: クエリでのリスト取得
allow list: if isAuthenticated()
  && request.query.limit <= 100;
```

### 3. reportsコレクション

同様に修正しました。

---

## ⚠️ 重要な注意点

### 1. クエリの制限

`list`ルールでは、アプリ側でクエリに`where('userId', '==', currentUser.uid)`を含める必要があります。

現在のアプリの実装を確認：

```javascript
// MyPageScreen.js などで
const favoritesQuery = query(
  favoritesRef, 
  where('userId', '==', currentUser.uid),  // ← これが必要
  where('type', '==', 'favorite')
);
```

### 2. ルールの反映時間

- ルールを公開すると、**すぐに有効**になります
- アプリを再起動する必要はありませんが、エラーが続く場合は再起動してください

---

## 🧪 確認方法

### 1. Firebase Consoleでルールを確認

1. **Firestore Database > ルール**タブを開く
2. **構文エラーがないか確認**
   - エラーがある場合は赤く表示されます

### 2. アプリで確認

1. **アプリを再起動**（念のため）
2. **ホーム画面を開く**
   - 公園のリストが表示されることを確認
3. **マイページを開く**
   - お気に入り、行ってみたいリストなどが表示されることを確認

---

## 🔧 トラブルシューティング

### 問題1: まだエラーが表示される

**対処法**:
1. Firebase Consoleでルールが正しく公開されているか確認
2. アプリを完全に再起動（アプリを閉じて再度開く）
3. 数秒待ってから再度試す

### 問題2: 特定のコレクションでエラーが発生する

**対処法**:
1. エラーメッセージを確認
2. どのコレクションでエラーが発生しているか特定
3. 該当するルールを確認

### 問題3: クエリが失敗する

**対処法**:
1. アプリ側のクエリに`where('userId', '==', currentUser.uid)`が含まれているか確認
2. クエリの`limit`が100以下か確認

---

## ✅ チェックリスト

### 今すぐ実行

- [ ] Firebase Consoleにログイン
- [ ] Firestore Database > ルールタブを開く
- [ ] `firestore.rules`の内容をコピー＆ペースト
- [ ] 「公開」をクリック
- [ ] 構文エラーがないか確認
- [ ] アプリを再起動
- [ ] エラーが解消されたか確認

---

## 📝 ルールの説明

### read vs get/list

- **`read`**: `get`と`list`の両方を許可（簡易版）
- **`get`**: 個別ドキュメントの取得のみ
- **`list`**: クエリでのリスト取得のみ

### クエリ時の制約

`list`ルールでは、`resource.data`にアクセスできません。そのため：
- クエリの制限（`limit`）のみチェック可能
- アプリ側で`where`句を使用してフィルタリングする必要がある

---

## 🚀 次のステップ

1. **今すぐ**: Firebase Consoleでルールを公開
2. **確認**: アプリでエラーが解消されたか確認
3. **テスト**: 各機能が正常に動作するか確認

---

**緊急対応が必要です！今すぐFirebase Consoleでルールを公開してください！** 🚨

**最終更新**: 2025-11-30



