# UID（ユーザーID）とは

## 📋 概要

**UID**（User ID）は、Firebase Authenticationが各ユーザーに割り当てる**一意の識別子**です。

## 🔑 特徴

### 1. 一意性
- 各ユーザーに**1つだけ**割り当てられます
- 世界中で**重複しません**
- 例: `abc123def456ghi789jkl012mno345pqr678`

### 2. 不変性
- 一度割り当てられると**変更されません**
- ユーザーが削除されない限り、同じUIDが使用されます

### 3. 形式
- **文字列**（string）形式
- 通常、28文字程度の英数字の組み合わせ
- 例: `xYz123AbC456DeF789GhI012JkL345MnO678`

## 🎯 用途

### 1. ユーザー識別
- どのユーザーがデータを作成・編集したかを識別
- 例: 公園の投稿者、レビューの投稿者

### 2. セキュリティ
- Firestoreルールで、ユーザーが自分のデータのみアクセスできるように制限
- 例: 自分のレビューのみ削除可能

### 3. 管理者権限
- `admins`コレクションで、管理者を識別
- 例: ドキュメントID = ユーザーUID

## 📍 確認方法

### Firebase Consoleで確認
1. **Firebase Consoleを開く**
   - https://console.firebase.google.com/project/parkpedia-app/authentication/users
2. **Authentication > Users**を開く
3. ユーザー一覧から確認したいユーザーを選択
4. **UID**フィールドをコピー

### アプリ内で確認（開発者向け）
```javascript
import { auth } from './firebaseConfig';

const currentUser = auth.currentUser;
if (currentUser) {
  console.log('UID:', currentUser.uid);
}
```

## 🔧 管理者権限の設定での使用

### 手順
1. Firebase ConsoleでユーザーのUIDを確認
2. Firestore Database > `admins`コレクションを開く
3. 新しいドキュメントを追加:
   - **ドキュメントID**: ユーザーUID（例: `xYz123AbC456DeF789GhI012JkL345MnO678`）
   - **フィールド**: `userId` (string) = ユーザーUID（同じ値）

### 例
```
コレクション: admins
ドキュメントID: xYz123AbC456DeF789GhI012JkL345MnO678
フィールド:
  - userId: "xYz123AbC456DeF789GhI012JkL345MnO678"
```

## ⚠️ 注意事項

### セキュリティ
- **UIDは公開情報ではありません**
- 他人のUIDを知られても、セキュリティルールで保護されています
- ただし、不必要に公開しないように注意

### 変更不可
- UIDは変更できません
- ユーザーを削除して再作成すると、新しいUIDが割り当てられます

## 📚 関連用語

- **Email**: ユーザーのメールアドレス（変更可能）
- **Display Name**: ユーザーの表示名（変更可能）
- **UID**: ユーザーの一意の識別子（変更不可）

