# 🔴 緊急: Firebase ConsoleでFirestoreルールをデプロイ

## 現在のエラー

以下の権限エラーが発生しています：
- `管理者チェックエラー: Missing or insufficient permissions`
- `マイページデータ取得エラー: Missing or insufficient permissions`
- `お気に入り状態確認エラー: Missing or insufficient permissions`
- `ブロックユーザー取得エラー: Missing or insufficient permissions`
- `行った状態確認エラー: Missing or insufficient permissions`
- `行ってみたい状態確認エラー: Missing or insufficient permissions`

## 原因

Firebase Consoleに最新のFirestoreルールがデプロイされていません。

## 解決手順（5分で完了）

### ステップ1: Firebase Consoleを開く

1. ブラウザで以下のURLにアクセス：
   ```
   https://console.firebase.google.com/project/parkpedia-app/firestore/rules
   ```

2. ログインが必要な場合は、Googleアカウントでログイン

### ステップ2: ルールエディタを開く

1. 左メニューから「Firestore Database」をクリック
2. 上部のタブから「ルール」をクリック
3. ルールエディタが表示されます

### ステップ3: 既存のルールを削除

1. ルールエディタ内のすべてのテキストを選択（Cmd+A / Ctrl+A）
2. 削除（Deleteキー）

### ステップ4: 新しいルールを貼り付け

1. `/Users/yoshidometoru/Documents/GitHub/ParkPedia/firestore.rules` ファイルを開く
2. **すべての内容**をコピー（Cmd+A → Cmd+C）
3. Firebase Consoleのルールエディタに貼り付け（Cmd+V）

### ステップ5: 公開

1. エディタの下部にある「公開」ボタンをクリック
2. 構文エラーがないか確認
   - エラーがある場合は赤く表示されます
   - エラーがない場合は「公開しました」というメッセージが表示されます

### ステップ6: アプリを再起動

1. アプリを完全に閉じる（バックグラウンドからも削除）
2. 数秒待つ（ルールが反映されるまで）
3. アプリを再度起動
4. エラーが解消されているか確認

## 確認方法

### Firebase Consoleで確認

1. 「ルール」タブで、ルールが正しく保存されているか確認
2. 「使用状況」タブで、エラーがないか確認

### アプリで確認

1. ホーム画面が正常に表示される
2. マイページが正常に表示される
3. お気に入り機能が動作する
4. エラーログに権限エラーが表示されない

## トラブルシューティング

### 問題1: ルールを公開できない（構文エラー）

**対処法**:
1. エラーメッセージを確認
2. `firestore.rules`ファイルの内容を再度確認
3. コメント行（`//`で始まる行）は問題ありません
4. すべての括弧が正しく閉じられているか確認

### 問題2: 公開後もエラーが続く

**対処法**:
1. 数秒待ってからアプリを再起動（ルールの反映に時間がかかる場合があります）
2. Firebase Consoleでルールが正しく保存されているか再確認
3. アプリを完全に再起動（バックグラウンドからも削除）

### 問題3: 特定のコレクションでエラーが続く

**対処法**:
1. エラーメッセージを確認
2. 該当するコレクションのルールを確認
3. `firestore.rules`ファイルの該当部分を再確認

## 重要な修正内容

### 1. `admins`コレクション
- `list`ルールを修正：認証済みユーザーがクエリ可能に

### 2. `favorites`コレクション
- `list`ルールを確認：認証済みユーザーがクエリ可能

### 3. `blockedUsers`コレクション
- `list`ルールを確認：認証済みユーザーがクエリ可能

---

**重要**: ルールを公開した後、必ずアプリを再起動してください。

