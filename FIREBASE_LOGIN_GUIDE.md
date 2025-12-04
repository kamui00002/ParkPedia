# Firebase CLI ログインガイド

## 🔴 エラー: "Invalid API key · Please run /login"

このエラーは、Firebase CLIが認証されていない状態でFirebaseコマンドを実行しようとしたときに発生します。

---

## ✅ 解決方法

### ステップ1: Firebase CLIにログイン

ターミナルで以下のコマンドを実行：

```bash
firebase login
```

### ステップ2: ブラウザで認証

1. コマンドを実行すると、ブラウザが自動的に開きます
2. Googleアカウントでログインします
3. Firebaseプロジェクトへのアクセスを許可します
4. ターミナルに「Success! Logged in as: [あなたのメールアドレス]」と表示されれば完了

---

## 🔍 よくある状況

### 状況1: Firestoreルールをデプロイしようとした

```bash
# エラーが発生する場合
firebase deploy --only firestore:rules

# 解決方法
firebase login
firebase deploy --only firestore:rules
```

### 状況2: Firebaseプロジェクトを初期化しようとした

```bash
# エラーが発生する場合
firebase init

# 解決方法
firebase login
firebase init
```

### 状況3: その他のFirebaseコマンドを実行しようとした

```bash
# エラーが発生する場合
firebase deploy
firebase functions:deploy
firebase hosting:deploy

# 解決方法
firebase login
# その後、必要なコマンドを実行
```

---

## 📋 ログイン状態の確認

現在のログイン状態を確認するには：

```bash
firebase login:list
```

ログインしているアカウントの一覧が表示されます。

---

## 🔄 ログアウトする場合

別のアカウントでログインしたい場合：

```bash
firebase logout
firebase login
```

---

## ⚠️ 注意点

1. **プロジェクトの選択**
   - ログイン後、正しいFirebaseプロジェクトを選択しているか確認
   - プロジェクトを選択するには：
     ```bash
     firebase use parkpedia-app
     ```
   - または、プロジェクトディレクトリで`.firebaserc`ファイルを確認

2. **権限の確認**
   - 使用しているGoogleアカウントがFirebaseプロジェクトへのアクセス権限を持っているか確認
   - Firebase Consoleで確認できます

3. **複数のアカウント**
   - 複数のGoogleアカウントを使用している場合、正しいアカウントでログインしているか確認

---

## 🎯 次のステップ

ログインが完了したら、以下のコマンドを実行できます：

### Firestoreルールのデプロイ

```bash
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia/parkpedia
firebase deploy --only firestore:rules
```

### プロジェクトの確認

```bash
firebase projects:list
```

---

## 💡 トラブルシューティング

### 問題1: ブラウザが開かない

**解決方法:**
```bash
firebase login --no-localhost
```

このコマンドを実行すると、認証用のURLが表示されます。そのURLをブラウザで開いて認証してください。

### 問題2: 認証が完了しない

**解決方法:**
1. ブラウザのキャッシュをクリア
2. シークレットモードでブラウザを開く
3. 再度 `firebase login` を実行

### 問題3: 権限エラーが発生する

**解決方法:**
1. Firebase Consoleで、使用しているGoogleアカウントに適切な権限があるか確認
2. プロジェクトのオーナーまたは編集者権限が必要です

---

## 📞 サポート

問題が解決しない場合：
- [Firebase CLI ドキュメント](https://firebase.google.com/docs/cli)
- [Firebase サポート](https://firebase.google.com/support)

---

**最終更新**: 2025-11-25







