# 🔴 緊急: Firestoreルールのデプロイが必要です

## 現在のエラー

以下の権限エラーが発生しています：
- `管理者チェックエラー: Missing or insufficient permissions`
- `マイページデータ取得エラー: Missing or insufficient permissions`
- `ブロックユーザー取得エラー: Missing or insufficient permissions`
- `お気に入り状態確認エラー: Missing or insufficient permissions`

## 原因

Firebase Consoleに最新のFirestoreルールがデプロイされていない可能性があります。

## 解決方法

### ステップ1: Firebase Consoleを開く

1. https://console.firebase.google.com/ にアクセス
2. プロジェクト `parkpedia-app` を選択

### ステップ2: Firestore Database > ルールタブを開く

1. 左メニューから「Firestore Database」をクリック
2. 上部の「ルール」タブをクリック

### ステップ3: ルールをコピー＆ペースト

1. `/Users/yoshidometoru/Documents/GitHub/ParkPedia/firestore.rules` ファイルを開く
2. **すべての内容**をコピー（Cmd+A → Cmd+C）
3. Firebase Consoleのルールエディタに貼り付け（Cmd+V）

### ステップ4: 公開

1. 「公開」ボタンをクリック
2. 構文エラーがないか確認（エラーがある場合は赤く表示されます）

### ステップ5: アプリを再起動

1. アプリを完全に閉じる
2. 再度起動
3. エラーが解消されているか確認

## 重要な修正内容

### 1. `admins`コレクションの`list`ルール修正

**修正前**:
```javascript
allow list: if isAdmin();  // ❌ 循環参照
```

**修正後**:
```javascript
allow list: if isAuthenticated()
  && request.query.limit <= 100;  // ✅ 認証済みユーザーはクエリ可能
```

これにより、ユーザーが自分の管理者ステータスを確認できるようになります。

### 2. `favorites`と`blockedUsers`のルール

既に正しく設定されていますが、Firebase Consoleにデプロイされていない可能性があります。

## 確認方法

Firebase Consoleで以下を確認：

1. **ルールタブ**で構文エラーがないか
2. **使用状況**タブでエラーがないか
3. ルールが正しく保存されているか

---

**重要**: ルールを公開した後、数秒待ってからアプリを再起動してください。

