# 問題と解決方法

## 1. 広告が消えている

### 原因
- **Expo Go環境では広告モジュールが利用できません**
- `AdBanner.js`では、Expo Go環境（`Constants.executionEnvironment === 'storeClient'`）を検出すると、自動的に広告を無効化しています
- `react-native-google-mobile-ads`はネイティブモジュールのため、Expo Goでは動作しません

### 解決方法
**開発ビルドまたは本番ビルドが必要です：**

1. **開発ビルドを作成**:
   ```bash
   npx expo run:ios
   # または
   npx expo run:android
   ```

2. **EAS Buildを使用**:
   ```bash
   eas build --profile development --platform ios
   # または
   eas build --profile development --platform android
   ```

3. **本番ビルドを作成**:
   ```bash
   eas build --platform ios
   # または
   eas build --platform android
   ```

### 確認方法
- 開発ビルドまたは本番ビルドをインストールすると、広告が表示されます
- Expo Goでは広告は表示されません（これは正常な動作です）

---

## 2. 写真が出ない

### 原因
- `AddParkScreen.js`では、ローカルURI（`file://`）をそのままFirestoreに保存しています
- ローカルURIは一時的なもので、アプリを再起動すると無効になります
- Firebase Storageにアップロードしていないため、画像が表示されません

### 解決方法
`AddParkScreen.js`と`AddReviewScreen.js`を修正して、Firebase Storageに画像をアップロードする必要があります。

**修正が必要なファイル:**
- `screens/AddParkScreen.js` - 公園の写真をアップロード
- `screens/AddReviewScreen.js` - レビューの写真をアップロード

**修正内容:**
1. `imageUploader.js`をインポート
2. 画像を選択した後、Firebase Storageにアップロード
3. ダウンロードURLをFirestoreに保存

---

## 3. HOMEにレビューが反映されていない

### 原因
- `AddReviewScreen.js`では`updateParkRating`が呼び出されていますが、`HomeScreen`がデータを再取得していない可能性があります
- または、Firestoreからデータを取得する際に、`rating`と`reviewCount`が正しく読み込まれていない可能性があります

### 解決方法
1. **`HomeScreen`でデータを再取得する**:
   - `useFocusEffect`を使用して、画面がフォーカスされたときにデータを再取得
   - または、レビュー投稿後に`HomeScreen`に戻ったときにデータを再取得

2. **データが正しく更新されているか確認**:
   - Firebase Consoleで`parks`コレクションを確認
   - `rating`と`reviewCount`が正しく更新されているか確認

3. **`updateParkRating`が正しく動作しているか確認**:
   - レビュー投稿後に、Firebase Consoleで公園の`rating`と`reviewCount`が更新されているか確認

---

## 4. 管理者ページの使用方法

### アクセス方法
1. マイページを開く
2. 管理者権限がある場合、「🔧 管理者ページ」ボタンが表示されます
3. ボタンをタップして管理者ページにアクセス

### 機能

#### レポート管理（デフォルトタブ）
- **対応待ちレポート**: ユーザーから報告されたレビューが表示されます
- **操作**:
  - **解決済み**: レポートを解決済みにマーク（不適切なコンテンツを削除した場合など）
  - **却下**: レポートを却下（問題がない場合）
  - **レビュー削除**: 報告されたレビューを削除

#### 公園管理
- **公園一覧**: すべての公園が表示されます
- **操作**:
  - **削除**: 公園を削除（関連するレビューもすべて削除されます）

#### レビュー管理
- **レビュー一覧**: すべてのレビューが表示されます
- **操作**:
  - **削除**: レビューを削除（公園の評価も自動的に更新されます）

### 管理者権限の設定方法
1. Firebase Consoleを開く
2. Firestore Databaseを開く
3. `admins`コレクションを作成（まだ存在しない場合）
4. 新しいドキュメントを追加:
   - **ドキュメントID**: 管理者のユーザーUID（Firebase AuthenticationのUID）
   - **フィールド**:
     - `userId` (string): 管理者のユーザーUID（ドキュメントIDと同じ）

### 注意事項
- 管理者権限は、Firestoreの`admins`コレクションにユーザーUIDが登録されている場合にのみ付与されます
- 最初の管理者は、Firebase Consoleから手動で追加する必要があります
- 最初の管理者が登録されれば、その管理者が他の管理者を追加できます

---

## 修正が必要なファイル

### 優先度: 高
1. **`screens/AddParkScreen.js`** - 画像をFirebase Storageにアップロード
2. **`screens/AddReviewScreen.js`** - 画像をFirebase Storageにアップロード
3. **`screens/HomeScreen.js`** - データの再取得を実装

### 優先度: 中
4. **広告の表示** - 開発ビルドまたは本番ビルドが必要（Expo Goでは表示されない）

---

## 次のステップ

1. **画像アップロード機能を実装**（`AddParkScreen.js`と`AddReviewScreen.js`を修正）
2. **`HomeScreen`でデータを再取得**（レビュー投稿後に評価が反映されるように）
3. **開発ビルドを作成**（広告を表示するため）

