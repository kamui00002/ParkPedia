# 🚨 ParkPedia - 緊急セキュリティ修正ガイド

**作成日**: 2025年12月4日  
**優先度**: CRITICAL  
**対応期限**: 24-48時間以内

---

## ⚠️ 即座に対応が必要な脆弱性

### 1. Firebase APIキーの公開露出 🔴

**危険度**: ★★★★★ (最大)
**ファイル**: `firebaseConfig.js`
**対応時間**: 1時間

#### 問題

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCQlkTZ43bdJ8wsbZm8h4qrIU_mxjCTXUE",  // ← 公開されている
  authDomain: "parkpedia-app.firebaseapp.com",
  projectId: "parkpedia-app",
  // ...
};
```

#### 影響

- 誰でもこのAPIキーを使用してFirebaseにアクセス可能
- Firestoreデータの読み取り・書き込み
- 認証の悪用
- ストレージへのアクセス

#### 修正手順

**ステップ1: 既存キーの無効化（5分）**

1. Firebase Console を開く: https://console.firebase.google.com/
2. parkpedia-app プロジェクトを選択
3. ⚙️ **設定** → **プロジェクトの設定** → **全般**
4. 「ウェブアプリ」セクションで現在のAPIキーを確認
5. **削除**または**無効化**（即座に実行）

**ステップ2: 環境変数化（30分）**

```bash
# .env ファイルを作成（Gitにコミットしない）
cat > .env << 'EOF'
EXPO_PUBLIC_FIREBASE_API_KEY=新しいAPIキー
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=parkpedia-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=parkpedia-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=parkpedia-app.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=118041891633
EXPO_PUBLIC_FIREBASE_APP_ID=1:118041891633:ios:25c857a6e7d53dd7d51610
EOF

# .gitignore に追加
echo ".env" >> .gitignore
```

**ステップ3: コード修正（15分）**

`firebaseConfig.js`:
```javascript
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export default firebaseConfig;
```

**ステップ4: Git履歴のクリーンアップ（10分）**

```bash
# 既存のAPIキーをGit履歴から完全削除
git filter-branch --tree-filter 'sed -i "" "s/AIzaSyCQlkTZ43bdJ8wsbZm8h4qrIU_mxjCTXUE/YOUR_NEW_KEY/g" firebaseConfig.js' HEAD

# 強制プッシュ
git push origin main --force
```

---

### 2. サービスアカウントキーのGit履歴露出 🔴

**危険度**: ★★★★★
**ファイル**: `serviceAccountKey.json`
**対応時間**: 30分

#### 問題

サービスアカウントキーがGit履歴に含まれており、**全Firebase権限**を持つ。

#### 影響

- 全ユーザーデータへの無制限アクセス
- データベースの改ざん・削除
- ユーザーアカウントの乗っ取り

#### 修正手順

**ステップ1: Git履歴から削除（15分）**

```bash
# BFG Repo-Cleaner をインストール
brew install bfg

# リポジトリをクローン（バックアップ）
git clone --mirror https://github.com/kamui00002/ParkPedia.git

# サービスアカウントキーを削除
bfg --delete-files serviceAccountKey.json ParkPedia.git

# クリーンアップ
cd ParkPedia.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 強制プッシュ
git push --force
```

**ステップ2: 既存のサービスアカウントキーを無効化（5分）**

1. Firebase Console → ⚙️ 設定 → サービス アカウント
2. 既存のキーを**削除**
3. 新しいキーを生成
4. ローカルにのみ保存（Gitにコミットしない）

**ステップ3: .gitignore を更新（5分）**

```bash
# .gitignore に追加
cat >> .gitignore << 'EOF'
serviceAccountKey.json
*.json
!package.json
!package-lock.json
!app.json
!eas.json
!tsconfig.json
EOF
```

---

### 3. Firestore セキュリティルールの脆弱性 🔴

**危険度**: ★★★★☆
**ファイル**: `firestore.rules`
**対応時間**: 2時間

#### 問題1: 管理者権限の欠如

```javascript
match /reports/{reportId} {
  allow read: if isAuthenticated()
    && resource.data.reportedBy == request.auth.uid;
  // ❌ 管理者が報告を確認・削除できない
}
```

#### 問題2: ユーザー情報の露出

```javascript
match /parks/{parkId} {
  allow read: if true;  // ❌ userId が誰にでも見える
}
```

#### 修正手順

**ステップ1: 管理者クレームの追加（1時間）**

`firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 管理者チェック関数を追加
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.admin == true;
    }
    
    // Reports コレクションを修正
    match /reports/{reportId} {
      // 管理者または報告者のみ読み取り可能
      allow read: if isAdmin() || 
        (isAuthenticated() && resource.data.reportedBy == request.auth.uid);
      
      allow create: if isAuthenticated() && hasValidCreatedAt() && ...;
      
      // 管理者のみ更新・削除可能
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // 他のルールはそのまま...
  }
}
```

**ステップ2: 管理者ユーザーの設定（30分）**

```bash
# Firebase Admin SDK で管理者クレームを設定
node scripts/set-admin-claims.js
```

`scripts/set-admin-claims.js` (新規作成):
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 管理者ユーザーのUIDを指定
const adminUID = 'YOUR_ADMIN_USER_UID';  // ← 自分のUIDに変更

admin.auth().setCustomUserClaims(adminUID, { admin: true })
  .then(() => {
    console.log('✅ 管理者権限を設定しました');
  })
  .catch(console.error);
```

**ステップ3: ルールをデプロイ（5分）**

```bash
firebase deploy --only firestore:rules --project parkpedia-app
```

---

### 4. ユーザー入力の検証不足（XSS・インジェクション） 🟠

**危険度**: ★★★★☆
**ファイル**: `AddParkScreen.js`, `AddReviewScreen.js`
**対応時間**: 3時間

#### 問題

```javascript
// ❌ 最小文字数チェックなし、特殊文字チェックなし
if (!name.trim()) {
  Alert.alert('エラー', '公園名を入力してください');
  return;
}
```

#### 修正手順

**バリデーション関数の作成**

`utils/validation.js` (新規作成):
```javascript
export const validateParkInput = (name, address, description) => {
  // 必須チェック
  if (!name || typeof name !== 'string') {
    throw new Error('公園名は必須です');
  }
  
  const trimmedName = name.trim();
  
  // 長さチェック
  if (trimmedName.length < 2) {
    throw new Error('公園名は2文字以上で入力してください');
  }
  if (trimmedName.length > 100) {
    throw new Error('公園名は100文字以内で入力してください');
  }
  
  // 特殊文字チェック
  const dangerousChars = /<script|<iframe|javascript:|onerror=|onclick=/i;
  if (dangerousChars.test(trimmedName)) {
    throw new Error('入力に不正な文字が含まれています');
  }
  
  // サニタイゼーション
  const sanitize = (str) => {
    return str
      .replace(/[<>]/g, '')  // HTMLタグ削除
      .replace(/['"]/g, '')  // クォート削除
      .trim();
  };
  
  return {
    name: sanitize(trimmedName),
    address: sanitize(address.trim()),
    description: sanitize(description.trim()),
  };
};

export const validateReviewInput = (rating, comment) => {
  // 評価の検証
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw new Error('評価は1-5の範囲で選択してください');
  }
  
  // コメントの検証
  if (comment && comment.length > 1000) {
    throw new Error('コメントは1000文字以内で入力してください');
  }
  
  return {
    rating,
    comment: comment ? comment.replace(/[<>]/g, '').trim() : '',
  };
};
```

**AddParkScreen.js の修正**:
```javascript
import { validateParkInput } from '../utils/validation';

const handleSubmit = async () => {
  try {
    // バリデーション
    const validatedData = validateParkInput(name, address, description);
    
    // Firestoreに保存
    await addDoc(collection(db, 'parks'), {
      ...validatedData,
      userId: currentUser.uid,
      createdAt: serverTimestamp(),
    });
    
    Alert.alert('成功', '公園を登録しました');
    navigation.goBack();
  } catch (error) {
    Alert.alert('入力エラー', error.message);
  }
};
```

---

## ✅ チェックリスト

### 緊急対応（24時間以内）

- [ ] Firebase APIキーを無効化
- [ ] 新しいAPIキーを生成
- [ ] 環境変数化の実装
- [ ] サービスアカウントキーをGit履歴から削除
- [ ] 既存のサービスアカウントキーを無効化
- [ ] 新しいサービスアカウントキーを生成
- [ ] .gitignore を更新

### 重要対応（48時間以内）

- [ ] Firestoreセキュリティルールを修正
- [ ] 管理者クレームを設定
- [ ] ルールをデプロイ
- [ ] 入力バリデーション関数を作成
- [ ] すべての入力箇所にバリデーションを適用

### 検証（72時間以内）

- [ ] セキュリティスキャンツールで検証
- [ ] Firebase Console でルールをテスト
- [ ] 手動でAPIキー露出をチェック
- [ ] Git履歴をスキャン（GitHub Secretスキャン）

---

## 📞 サポート

問題が発生した場合：
- Firebase サポート: https://firebase.google.com/support
- GitHub セキュリティ: https://github.com/security

---

**このガイドの完了後、必ず検証してください。セキュリティは妥協できません。**
