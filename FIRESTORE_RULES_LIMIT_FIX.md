# Firestoreルールのlimitチェック修正

## 問題

Firestoreルールの`list`操作で、`request.query.limit <= 100`という条件を設定していましたが、クエリに`limit`が設定されていない場合、この条件が`false`になり、エラーが発生していました。

## 修正内容

すべての`list`ルールで、`limit`が設定されていない場合も許可するように修正しました。

### 修正前
```javascript
allow list: if isAuthenticated()
  && request.query.limit <= 100;
```

### 修正後
```javascript
allow list: if isAuthenticated()
  && (request.query.limit == null || request.query.limit <= 100);
```

## 修正対象コレクション

1. **favorites** - お気に入り、行った、行ってみたいリスト
2. **blockedUsers** - ブロックユーザーリスト
3. **reports** - 報告リスト
4. **admins** - 管理者リスト

## 次のステップ

1. 修正された`firestore.rules`をFirebase Consoleにデプロイ
2. アプリを再起動
3. エラーが解消されたか確認

## 確認方法

以下のエラーが解消されたか確認：
- `お気に入り状態確認エラー`
- `行った状態確認エラー`
- `行ってみたい状態確認エラー`
- `ブロックユーザー取得エラー`
- `マイページデータ取得エラー`

