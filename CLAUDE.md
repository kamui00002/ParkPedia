# CLAUDE.md - ParkPedia 開発ガイド

このファイルは、ParkPediaプロジェクトでClaude Codeを使用する際のガイドラインと、過去のエラー解決事例をまとめています。

---

## 📚 プロジェクト概要

**ParkPedia** - 公園情報を共有するReact Nativeアプリ（Expo）

### 主要技術スタック
- **フレームワーク**: React Native (Expo)
- **バックエンド**: Firebase (Authentication, Firestore, Storage)
- **認証**: Firebase Authentication
- **データベース**: Cloud Firestore
- **ストレージ**: Firebase Storage
- **広告**: Google AdMob

---

## 🔥 Firebase セキュリティルールの管理

### 重要なルールファイル

1. **Firestore セキュリティルール**: `firestore.rules`
2. **Storage セキュリティルール**: `storage.rules`

### ルールのデプロイ方法

#### Firestore ルール
1. Firebase Console > Firestore Database > ルールタブ
2. `firestore.rules`の内容をコピー＆ペースト
3. 「公開」をクリック

#### Storage ルール
1. Firebase Console > Storage > ルールタブ
2. `storage.rules`の内容をコピー＆ペースト
3. 「公開」をクリック

---

## 🚨 過去のエラーと解決事例

### エラー事例1: Firebase Storage セキュリティルールの期限切れ警告

**発生日**: 2025年11月30日

**エラーメッセージ**:
```
[Firebase] Cloud Storage for Firebase バケットへのクライアントのアクセス権があと 0 日で失効します

お客様はテストモードで開発を開始したため、Cloud Storage バケットが完全にインターネットに公開された状態になっています。
これによりお客様のアプリは攻撃に対して脆弱になっていたため、最初の 30 日間が過ぎるとクライアント リクエストが許可されなくなるように Cloud Storage の Firebase セキュリティルールが構成されました。

0 日後に、Cloud Storage バケットに対するクライアント リクエストはすべて拒否されるようになり、セキュリティ ルールが更新されるまで引き続き拒否されます。
```

**原因**:
- Firebase Storageのセキュリティルールがテストモード（全公開）のまま
- 30日間の猶予期間が終了し、すべてのアクセスが拒否される状態

**解決方法**:
1. `storage.rules`ファイルを作成
2. 適切なセキュリティルールを実装：
   - 認証済みユーザーのみアップロード可能
   - ユーザーごとにフォルダ分け（`/images/parks/{userId}/`など）
   - ファイルサイズ制限（公園・レビュー画像: 10MB、プロフィール画像: 5MB）
   - Content Type検証（画像ファイルのみ）
   - ファイル名検証（危険な文字をブロック）
3. Firebase Console > Storage > ルールで公開

**最適化内容**:
- 公式ドキュメント（https://firebase.google.com/docs/storage/security?hl=ja）に基づいて最適化
- 共通検証関数を追加（`isValidImage()`, `isValidFileName()`）
- `write`を`create`、`update`、`delete`に分離

**参考ファイル**: `storage.rules`, `FIREBASE_STORAGE_RULES_GUIDE.md`

---

### エラー事例2: Firestore 権限エラー

**発生日**: 2025年11月30日

**エラーメッセージ（アプリ内）**:
```
権限エラー
データの読み取り権限がありません。Firestore セキュリティルールを確認してください。
```

**原因**:
- `favorites`と`blockedUsers`コレクションで、`allow read`を使用していた
- クエリ（`list`）時に`resource.data`にアクセスできないため、エラーが発生

**解決方法**:
1. `allow read`を`allow get`と`allow list`に分離
2. `get`: 個別ドキュメントの取得（`resource.data`を使用可能）
3. `list`: クエリでのリスト取得（`resource.data`は使用不可、クエリの制限のみチェック）

**修正前**:
```javascript
match /favorites/{favoriteId} {
  allow read: if isAuthenticated()
    && resource.data.userId == request.auth.uid;
}
```

**修正後**:
```javascript
match /favorites/{favoriteId} {
  // Get: 個別ドキュメントの取得
  allow get: if isAuthenticated()
    && resource.data.userId == request.auth.uid;

  // List: クエリでのリスト取得
  allow list: if isAuthenticated()
    && request.query.limit <= 100;
}
```

**重要な注意点**:
- アプリ側のクエリに`where('userId', '==', currentUser.uid)`が含まれている必要がある
- `list`ルールでは、クエリの制限（`limit`）のみチェック可能

**参考ファイル**: `firestore.rules`, `FIRESTORE_RULES_FIX_GUIDE.md`

---

### エラー事例3: StorageルールをFirestore Databaseに誤って貼り付けた問題

**発生日**: 2025年11月30日

**問題の状況**:
- Firebase Storageのルール（`service firebase.storage`）をFirestore Databaseのルールに貼り付けてしまった
- 構文エラーが発生し、Firestore Databaseが正しく動作しない可能性

**原因**:
- StorageルールとFirestoreルールの違いを理解していなかった
- ルールの貼り付け先を間違えた

**解決方法**:
1. **Firestore Database > ルール**に正しいルールを貼り付け
   - `service cloud.firestore {` で始まるルールを使用
   - `firestore.rules`ファイルの内容をコピー＆ペースト

2. **Storage > ルール**に正しいルールを貼り付け
   - `service firebase.storage {` で始まるルールを使用
   - `storage.rules`ファイルの内容をコピー＆ペースト

**重要な違い**:

| 項目 | Firestore Database | Firebase Storage |
|------|-------------------|------------------|
| サービス名 | `service cloud.firestore` | `service firebase.storage` |
| 場所 | Firebase Console > Firestore Database > ルール | Firebase Console > Storage > ルール |
| 用途 | データベースの読み書き | 画像・ファイルのアップロード/ダウンロード |
| マッチパターン | `match /databases/{database}/documents` | `match /b/{bucket}/o` |

**確認方法**:
1. Firebase Consoleで各ルールタブを開く
2. ルールの最初の行を確認：
   - Firestore: `service cloud.firestore {`
   - Storage: `service firebase.storage {`

**参考ファイル**: `firestore.rules`, `storage.rules`, `FIRESTORE_RULES_COPY_PASTE.txt`, `STORAGE_RULES_COPY_PASTE.txt`

---

### エラー事例4: Firebase Storage ルールの期限付きルールが残っていた問題

**発生日**: 2025年11月30日

**問題の状況**:
- Firebase ConsoleのStorageルールに期限付きルールが残っていた
- `allow read, write: if request.time < timestamp.date(2025, 12, 6);` のような期限チェックが含まれていた
- 期限が切れると、すべてのアクセスが拒否される

**原因**:
- テストモードのデフォルトルールが残っていた
- 適切なルールに置き換えていなかった

**解決方法**:
1. Firebase Console > Storage > ルールを開く
2. 期限付きルールをすべて削除
3. `storage.rules`ファイルの内容（期限チェックなし）をコピー＆ペースト
4. 「公開」をクリック

**期限付きルールの例（問題あり）**:
```javascript
// ❌ 期限付きルール（避けるべき）
match /{allPaths=**} {
  allow read, write: if request.time < timestamp.date(2025, 12, 6);
}
```

**適切なルールの例**:
```javascript
// ✅ 適切なルール（推奨）
match /images/parks/{userId}/{fileName} {
  allow read: if true;
  allow create: if isAuthenticated()
    && isOwner(userId)
    && isValidImage(10)
    && isValidFileName(fileName);
}
```

**重要な注意点**:
- 期限付きルールは一時的な対処法に過ぎない
- 適切なセキュリティルールを実装することで、期限切れの心配がなくなる
- 匿名ユーザーにも対応したルールを実装する

**参考ファイル**: `storage.rules`, `STORAGE_RULES_URGENT_FIX.md`

---

### エラー事例5: TestFlightでの起動時クラッシュ（StartupProcedure.throwException）

**発生日**: 2025年12月11日

**エラーメッセージ（Xcodeクラッシュレポート）**:
```
Thread 4:
- libobjc.A.dylib: objc_exception_throw
- CoreFoundation: [NSException raise]
- ParkPedia: StartupProcedure.throwException(...)
- ParkPedia: protocol witness for ErrorRecoveryDelegate.throwException(...) in conformance StartupProcedure
- ParkPedia: ErrorRecovery.crash()
```

**原因**:
- v1.0.14で追加したExpo Updatesの設定が、TestFlight環境でクラッシュを引き起こしていた
- EAS Updateサーバーへの接続試行時に、ネイティブ側でエラーが発生
- App Storeビルドでは、OTA（Over-The-Air）更新機能は不要かつ推奨されない

**問題のあった設定（v1.0.14）**:
```json
"updates": {
  "url": "https://u.expo.dev/d557bbc6-e7ef-4acc-915b-26ab09766021"
},
"runtimeVersion": {
  "policy": "appVersion"
}
```

**解決方法（v1.0.15）**:
1. `app.json`のExpo Updates設定を完全に無効化
```json
"updates": {
  "enabled": false
}
```

2. `runtimeVersion`の設定を削除

3. バージョン更新
   - version: 1.0.14 → 1.0.15
   - iOS buildNumber: 18 → 19
   - Android versionCode: 14 → 15

**重要な学び**:
- App Storeビルドでは、Expo Updatesは無効化すべき
- OTA更新は、App Storeのガイドライン（2.5.2）に抵触する可能性がある
- すべての更新は、App Store経由で行うべき

**検証**:
```bash
$ npx expo-doctor
Running 17 checks on your project...
17/17 checks passed. No issues detected!
```

**参考ファイル**: `TESTFLIGHT_CRASH_FIX_V1.0.15.md`, `V1.0.15_FIX_SUMMARY.md`

---

### エラー事例6: グローバルエラーハンドラーによるクラッシュ（RCTExceptionsManager reportFatal）

**発生日**: 2025年12月11日

**エラーメッセージ（Xcodeクラッシュレポート）**:
```
Thread 3 Crashed:: com.facebook.react.ExceptionsManagerQueue
0   Foundation        -[_NSCallStackArray _descriptionWithBuffer:size:] + 484
1   CoreFoundation    __handleUncaughtException + 1136
2   libobjc.A.dylib   _objc_terminate() + 112
3   ParkPedia         RCTGetFatalHandler (RCTAssert.m:161)
4   ParkPedia         -[RCTExceptionsManager reportFatal:stack:exceptionId:extraDataAsJSON:] + 484
```

**原因**:
- v1.0.16のApp.jsで追加したグローバルエラーハンドラーが、**開発環境で元のハンドラーを呼び出していた**ため、ExceptionsManagerのreportFatalを呼び出してクラッシュしていた
- JavaScriptエラーが発生した際に、エラーハンドラーがネイティブ側にエラーを伝播させてしまっていた

**問題のあったコード（v1.0.16）**:
```javascript
// App.js:135-136
if (__DEV__ && originalHandler && typeof originalHandler === 'function') {
    originalHandler(error, isFatal);  // ← これがクラッシュの原因！
}
```

この`originalHandler(error, isFatal)`の呼び出しが、ExceptionsManagerのreportFatalを呼び出し、それがネイティブ側でクラッシュしていました。

**解決方法（v1.0.17）**:
1. **開発環境ではエラーハンドラーを無効化**
```javascript
useEffect(() => {
    // グローバルエラーハンドラーを設定（本番環境のみ）
    // 開発環境ではデフォルトのRed Screenを表示してデバッグを容易にする
    if (!__DEV__) {
        const errorHandler = (error, isFatal) => {
            console.error('グローバルエラー:', error);
        };

        const ErrorUtils = global.ErrorUtils || (typeof ErrorUtils !== 'undefined' ? ErrorUtils : null);
        if (ErrorUtils && typeof ErrorUtils.setGlobalHandler === 'function') {
            ErrorUtils.setGlobalHandler(errorHandler);
        }
    }

    // 認証状態の変更を監視（シンプル化）
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
}, []);
```

2. バージョン更新
   - version: 1.0.16 → 1.0.17
   - iOS buildNumber: 22 → 23
   - Android versionCode: 16 → 17

**重要な学び**:
- **開発環境ではRed Screenを表示**することで、エラーを確認しやすくする
- **本番環境でのみエラーハンドラーを有効化**して、アプリがクラッシュしないようにする
- グローバルエラーハンドラー内で**元のハンドラーを呼び出さない**（ExceptionsManagerのreportFatalを呼び出すとクラッシュする可能性がある）
- エラーログはFirebase Crashlyticsなどに送信することを推奨

**検証**:
- 開発環境: JavaScriptエラーが発生した場合、Red Screenが表示される
- 本番環境: JavaScriptエラーが発生した場合、エラーハンドラーが吸収してアプリは続行する

**参考ファイル**: `V1.0.17_FIX_SUMMARY.md`

---

### エラー事例7: AdBanner "Cannot call a class as a function" エラー

**発生日**: 2025年12月11日

**エラーメッセージ（Red Screen）**:
```
Render Error
Cannot call a class as a function

AdBanner.js:17:50
const [BannerAdComponent, setBannerAdComponent] = useState(null);
```

**原因**:
- v1.0.17でグローバルエラーハンドラーの修正後、新たなエラーが発生
- `AdBanner.js`で、`BannerAd`クラスコンポーネントをstateに保存し、JSX構文で直接レンダリングしようとしていた
- Reactは、stateに保存されたクラスコンポーネント参照を直接JSXで使用すると、正しくインスタンス化できない

**問題のあったコード（v1.0.17）**:
```javascript
// AdBanner.js:89-106
return (
  <View style={styles.container}>
    <BannerAdComponent  // ❌ クラスコンポーネントをJSXで直接使用
      unitId={adUnitId}
      size={BannerAdSize.BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: false,
      }}
      onAdLoaded={() => {
        if (__DEV__) {
          console.log('AdMob: 広告が読み込まれました');
        }
      }}
      onAdFailedToLoad={(error) => {
        if (__DEV__) {
          console.log('AdMob: 広告の読み込みに失敗しました:', error);
        }
      }}
    />
  </View>
);
```

**解決方法（v1.0.18）**:

1. `AdBanner.js`を修正して、`React.createElement()`を使用

**修正後のコード**:
```javascript
// AdBanner.js:89-106
return (
  <View style={styles.container}>
    {React.createElement(BannerAdComponent, {  // ✅ React.createElement()を使用
      unitId: adUnitId,
      size: BannerAdSize.BANNER,
      requestOptions: {
        requestNonPersonalizedAdsOnly: false,
      },
      onAdLoaded: () => {
        if (__DEV__) {
          console.log('AdMob: 広告が読み込まれました');
        }
      },
      onAdFailedToLoad: (error) => {
        if (__DEV__) {
          console.log('AdMob: 広告の読み込みに失敗しました:', error);
        }
      },
    })}
  </View>
);
```

2. `app.json`のバージョン更新
   - version: 1.0.17 → 1.0.18
   - iOS buildNumber: 23 → 24
   - Android versionCode: 17 → 18

**重要な学び**:

**動的コンポーネントのレンダリングパターン**:

❌ **避けるべきパターン**:
```javascript
const [Component, setComponent] = useState(null);
// ...
return <Component />;  // クラスコンポーネントでは失敗
```

✅ **推奨パターン**:
```javascript
const [Component, setComponent] = useState(null);
// ...
return React.createElement(Component, { /* props */ });  // 正しく動作
```

**React.createElement()を使用する理由**:
1. **クラスコンポーネントの正しいインスタンス化**: `React.createElement(Component, props)`は、クラスコンポーネントを正しくインスタンス化する
2. **動的コンポーネントのレンダリング**: 動的にロードされたコンポーネント（`require()`で取得）をレンダリングする場合、`React.createElement()`が推奨される
3. **型チェックの回避**: `React.createElement()`を使用することで、Reactの内部型チェックを回避し、stateに保存されたクラスコンポーネント参照でも正しく動作する

**検証**:
```bash
$ npx expo run:ios --device "iPad Air 11-inch (M3)"
› Build Succeeded
› 0 error(s), and 5 warning(s)
(エラーログなし - 正常に動作)
```

**参考ファイル**: `V1.0.18_FIX_SUMMARY.md`

---

## 📋 Firebase セキュリティルールのベストプラクティス

### 1. Firestore ルール

#### クエリと個別取得の分離
```javascript
// ❌ 避ける: クエリ時にresource.dataにアクセスできない
allow read: if resource.data.userId == request.auth.uid;

// ✅ 推奨: getとlistを分離
allow get: if resource.data.userId == request.auth.uid;
allow list: if request.query.limit <= 100;
```

#### タイムスタンプの検証
```javascript
// createdAtはサーバー時刻を強制
function hasValidCreatedAt() {
  return request.resource.data.createdAt == request.time;
}

// updatedAtもサーバー時刻を強制
function hasValidUpdatedAt() {
  return request.resource.data.updatedAt == request.time;
}
```

#### データバリデーション
```javascript
// 必須フィールドのチェック
&& request.resource.data.keys().hasAll(['name', 'address', 'userId', 'createdAt'])

// 文字列の長さ制限
&& request.resource.data.name.size() <= 100
```

### 2. Storage ルール

#### パスベースの認可
```javascript
// ユーザーごとにフォルダ分け
match /images/parks/{userId}/{fileName} {
  allow create: if isAuthenticated()
    && isOwner(userId)  // 自分のフォルダのみ
    && isValidImage(10)
    && isValidFileName(fileName);
}
```

#### ファイル検証
```javascript
// サイズ制限
request.resource.size < 10 * 1024 * 1024  // 10MB

// Content Type検証
request.resource.contentType.matches('image/.*')

// ファイル名検証（パストラバーサル攻撃を防止）
fileName.matches('^[a-zA-Z0-9._-]+$')
```

---

## 🔧 トラブルシューティング

### Firebase ルール関連のエラー

#### エラー: "権限エラー: データの読み取り権限がありません"

**確認事項**:
1. Firebase Consoleでルールが正しく公開されているか
2. `allow read`を使用している場合、`allow get`と`allow list`に分離する
3. クエリに適切な`where`句が含まれているか

**解決手順**:
1. `firestore.rules`を確認
2. `allow read`を`allow get`と`allow list`に分離
3. Firebase Consoleで公開
4. アプリを再起動

#### エラー: "Storage バケットへのクライアントのアクセス権があと X 日で失効します"

**確認事項**:
1. `storage.rules`ファイルが存在するか
2. Firebase Consoleでルールが公開されているか
3. 期限付きルール（`request.time`を含む）が残っていないか

**解決手順**:
1. Firebase Console > Storage > ルールを開く
2. 期限付きルール（`request.time`を含む）をすべて削除
3. `storage.rules`ファイルの内容をコピー＆ペースト
4. 「公開」をクリック
5. ルールが正しく適用されているか確認

#### エラー: ルールの構文エラー（Firestore Database）

**確認事項**:
1. Firestore Database > ルールに`service cloud.firestore`で始まるルールが貼り付けられているか
2. Storage > ルールに`service firebase.storage`で始まるルールが貼り付けられているか
3. ルールの貼り付け先が正しいか

**解決手順**:
1. Firebase Consoleで各ルールタブを開く
2. ルールの最初の行を確認：
   - Firestore: `service cloud.firestore {`
   - Storage: `service firebase.storage {`
3. 間違っていた場合は、正しいルールに置き換える
4. 「公開」をクリック

---

## 📝 開発時の注意事項

### 1. セキュリティルールの変更時

- ルールを変更したら、必ずFirebase Consoleで公開する
- アプリを再起動して動作確認する
- エラーが発生した場合は、Firebase Consoleのルールエディタで構文エラーを確認

### 2. クエリの実装時

- Firestoreのクエリには、セキュリティルールで許可された条件を含める
- `list`ルールを使用する場合、アプリ側で`where`句を使用してフィルタリングする

### 3. 画像アップロード時

- Storageのパス構造を正しく使用する（`/images/parks/{userId}/{fileName}`など）
- ファイルサイズとContent Typeを確認する
- ファイル名に危険な文字が含まれていないか確認する

### 4. ルールの貼り付け時

- **Firestore Database > ルール**には`service cloud.firestore`で始まるルールを貼り付ける
- **Storage > ルール**には`service firebase.storage`で始まるルールを貼り付ける
- ルールの最初の行を確認してから貼り付ける
- 期限付きルール（`request.time`を含む）は避ける

---

## 🎯 今後の参考

### エラーが発生した場合の確認手順

1. **エラーメッセージを確認**
   - アプリ内のエラーメッセージ
   - Firebase Consoleの通知
   - ブラウザのコンソールログ

2. **Firebase Consoleで確認**
   - Firestore Database > ルール
   - Storage > ルール
   - 構文エラーがないか確認

3. **ルールファイルを確認**
   - `firestore.rules`
   - `storage.rules`
   - 最新の内容が反映されているか

4. **アプリ側の実装を確認**
   - クエリに適切な条件が含まれているか
   - パス構造が正しいか
   - 認証状態が正しいか

---

## 📚 参考ドキュメント

- [Firebase Storage セキュリティ](https://firebase.google.com/docs/storage/security?hl=ja)
- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started?hl=ja)
- `FIREBASE_STORAGE_RULES_GUIDE.md` - Storageルールの詳細ガイド
- `FIRESTORE_RULES_FIX_GUIDE.md` - Firestoreルールの修正ガイド

---

**最終更新**: 2025-12-11 (v1.0.18)

---

## ⚠️ 重要な注意事項

### StorageルールとFirestoreルールの違い

**絶対に混同しないでください**:

- **Firestore Database > ルール**: `service cloud.firestore {` で始まるルール
- **Storage > ルール**: `service firebase.storage {` で始まるルール

ルールを貼り付ける前に、必ずルールの最初の行を確認してください。

### 期限付きルールについて

Firebase Consoleに期限付きルール（`request.time`を含む）が残っている場合：

1. **すぐに削除**して、適切なルールに置き換える
2. 期限付きルールは一時的な対処法に過ぎない
3. 適切なセキュリティルールを実装することで、期限切れの心配がなくなる

### 匿名ログインとの関係

- 匿名ログインを使用している場合でも、StorageルールとFirestoreルールは正常に動作する
- `isAuthenticated()`は匿名ユーザーも認証済みとして扱う
- `request.auth.uid`は匿名ユーザーでも有効なUIDを返す

---

