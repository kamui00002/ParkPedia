# 🔴 緊急: Firebase Storage ルールの期限切れ問題

## 🚨 問題の原因

Firebase Consoleに設定されているStorageルールが**期限付きルール**のままです。

### 現在のルール（問題あり）

```javascript
allow read, write: if request.time < timestamp.date(2025, 12, 6);
```

**問題点**:
- 2025年12月6日までしか有効
- 期限が切れると、すべてのアクセスが拒否される
- セキュリティが不十分（誰でも読み書き可能）

---

## ✅ 解決方法

### ステップ1: Firebase Consoleでルールを開く

1. **Firebase Consoleにログイン**
   - URL: https://console.firebase.google.com/
   - プロジェクト: `parkpedia-app` を選択

2. **Storageを開く**
   - 左メニューから「Storage」をクリック

3. **「ルール」タブをクリック**
   - Storageページの上部のタブから選択

### ステップ2: 適切なルールに置き換え

現在のルール（期限付き）を**すべて削除**して、以下のルールに**完全に置き換え**てください：

```javascript
// Firebase Storage Security Rules
// Copy and paste this into Firebase Console > Storage > Rules

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // ===========================
    // Helper Functions
    // ===========================
    
    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Check if authenticated user matches specified userId
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Validate image file (size and content type)
    function isValidImage(maxSizeMB) {
      return request.resource.size < maxSizeMB * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    
    // Validate file name (prevent dangerous file names)
    // Note: fileName must be passed as parameter since it's from match pattern
    function isValidFileName(fileName) {
      return fileName.matches('^[a-zA-Z0-9._-]+$');
    }
    
    // ===========================
    // Parks Images
    // ===========================
    // Specific rules for park images
    
    match /images/parks/{userId}/{fileName} {
      // Read: Anyone can read (public images)
      allow read: if true;
      
      // Create: Authenticated users only, own folder only
      allow create: if isAuthenticated()
        && isOwner(userId)
        && isValidImage(10)
        && isValidFileName(fileName);
      
      // Update: Owner only
      allow update: if isAuthenticated()
        && isOwner(userId)
        && isValidImage(10)
        && isValidFileName(fileName);
      
      // Delete: Owner only
      allow delete: if isAuthenticated()
        && isOwner(userId);
    }
    
    // ===========================
    // Reviews Images
    // ===========================
    // Specific rules for review photos
    
    match /images/reviews/{userId}/{fileName} {
      // Read: Anyone can read (public images)
      allow read: if true;
      
      // Create: Authenticated users only, own folder only
      allow create: if isAuthenticated()
        && isOwner(userId)
        && isValidImage(10)
        && isValidFileName(fileName);
      
      // Update: Owner only
      allow update: if isAuthenticated()
        && isOwner(userId)
        && isValidImage(10)
        && isValidFileName(fileName);
      
      // Delete: Owner only
      allow delete: if isAuthenticated()
        && isOwner(userId);
    }
    
    // ===========================
    // User Profile Images
    // ===========================
    // Profile photos and avatars
    
    match /images/profiles/{userId}/{fileName} {
      // Read: Anyone can read (public profile images)
      allow read: if true;
      
      // Create: Owner only
      allow create: if isAuthenticated()
        && isOwner(userId)
        && isValidImage(5)
        && isValidFileName(fileName);
      
      // Update: Owner only
      allow update: if isAuthenticated()
        && isOwner(userId)
        && isValidImage(5)
        && isValidFileName(fileName);
      
      // Delete: Owner only
      allow delete: if isAuthenticated()
        && isOwner(userId);
    }
    
    // ===========================
    // Default: Deny all other paths
    // ===========================
    match /{allPaths=**} {
      // Deny all other paths by default
      allow read, write: if false;
    }
  }
}
```

### ステップ3: ルールを公開

1. **「公開」ボタンをクリック**
   - ルールが保存され、すぐに有効になります

2. **構文エラーがないか確認**
   - エディタで赤く表示されていないか確認
   - エラーがある場合は修正してください

### ステップ4: 確認

1. **アプリを再起動**（念のため）
2. **匿名ログインを実行**
3. **画像アップロードを試行**
4. **エラーが解消されたか確認**

---

## 📋 変更内容の比較

### 変更前（期限付きルール）

```javascript
match /{allPaths=**} {
  allow read, write: if request.time < timestamp.date(2025, 12, 6);
}
```

**問題点**:
- ❌ 期限が切れるとすべてのアクセスが拒否される
- ❌ 誰でも読み書き可能（セキュリティが不十分）
- ❌ 匿名ユーザーも含めて、すべてのユーザーが全データにアクセス可能

### 変更後（適切なルール）

```javascript
match /images/parks/{userId}/{fileName} {
  allow read: if true;
  allow create: if isAuthenticated()
    && isOwner(userId)
    && isValidImage(10)
    && isValidFileName(fileName);
}
```

**改善点**:
- ✅ 期限切れの心配がない
- ✅ 認証済みユーザーのみアップロード可能
- ✅ ユーザーごとにフォルダ分け（セキュリティ強化）
- ✅ ファイルサイズ、Content Type、ファイル名の検証

---

## ⚠️ 重要な注意点

### 1. 匿名ユーザーにも対応

新しいルールは匿名ユーザーにも対応しています：
- `isAuthenticated()`は匿名ユーザーも認証済みとして扱う
- `request.auth.uid`は匿名ユーザーでも有効なUIDを返す

### 2. パス構造

アプリ側で画像をアップロードする際は、以下のパス構造を使用してください：

```javascript
// 公園の画像
/images/parks/{userId}/{fileName}

// レビューの写真
/images/reviews/{userId}/{fileName}

// プロフィール画像
/images/profiles/{userId}/{fileName}
```

### 3. ファイル名の制約

ファイル名は以下の文字のみ使用可能です：
- 英数字（a-z, A-Z, 0-9）
- ピリオド（.）
- アンダースコア（_）
- ハイフン（-）

---

## 🔧 トラブルシューティング

### エラー: "Permission denied"

**原因**:
- パス構造が間違っている
- ファイル名が正規表現に一致していない
- 匿名ユーザーが認証されていない

**解決方法**:
1. パスが`images/{folder}/{userId}/{fileName}`の形式になっているか確認
2. ファイル名が英数字、ピリオド、アンダースコア、ハイフンのみか確認
3. 匿名ログインが成功しているか確認

### エラー: 構文エラー

**原因**:
- ルールのコピー＆ペーストが不完全

**解決方法**:
1. ルール全体を再度コピー＆ペースト
2. 構文エラーがないか確認
3. 「公開」をクリック

---

## ✅ チェックリスト

- [ ] Firebase Console > Storage > ルールを開いた
- [ ] 期限付きルールを削除した
- [ ] 適切なルールをコピー＆ペーストした
- [ ] 構文エラーがないか確認した
- [ ] 「公開」をクリックした
- [ ] アプリを再起動した
- [ ] エラーが解消されたか確認した

---

## 🚀 今すぐ実行してください！

**緊急対応が必要です！** 今すぐFirebase Consoleでルールを更新してください。

1. Firebase Console > Storage > ルールを開く
2. 期限付きルールを削除
3. 適切なルールをコピー＆ペースト
4. 「公開」をクリック

これで問題が解決するはずです！

---

**最終更新**: 2025-11-30



