# TestFlightクラッシュ緊急修正サマリー

**修正日**: 2025-12-10
**バージョン**: 1.0.9 → 1.0.10
**ビルド番号**: 13 → 14
**対象デバイス**: iPad Air（TestFlightで起動時クラッシュ）

---

## 根本原因（4つの致命的な問題）

### 1. AdMob初期化タイミングの問題 ❌
- **場所**: `/Users/yoshidometoru/Documents/GitHub/ParkPedia/App.js`
- **問題**: useEffect内で非同期初期化 → AdMob公式推奨に反する
- **修正**: React Componentの外で初期化（アプリ起動時）

### 2. AsyncStorageの扱いが不適切 ❌
- **場所**: `/Users/yoshidometoru/Documents/GitHub/ParkPedia/firebaseConfig.js`
- **問題**: エラーを無視してFirebase Persistenceが機能しない
- **修正**: ネイティブ環境でAsyncStorageを必須化

### 3. useFocusEffectの依存配列エラー ❌
- **場所**: `/Users/yoshidometoru/Documents/GitHub/ParkPedia/screens/HomeScreen.js`
- **問題**: 無限ループの可能性、useFocusEffect重複
- **修正**: fetchParksをuseCallbackでメモ化、重複削除

### 4. SKAdNetworkItems不足 ❌
- **場所**: `/Users/yoshidometoru/Documents/GitHub/ParkPedia/app.json`
- **問題**: iOS 14.5以降必須のAdMob設定が欠落
- **修正**: 48個のSKAdNetworkIdentifier追加

---

## 修正内容

### ✅ App.js（完全書き換え）
```javascript
// 修正前: useEffect内で初期化 → クラッシュの原因
useEffect(() => {
    const initializeAdMob = async () => {
        try {
            const mobileAds = require('react-native-google-mobile-ads').default;
            await mobileAds.initialize();
            setIsAdMobInitialized(true);
        } catch (error) {
            setIsAdMobInitialized(true); // ❌ エラーでも続行
        }
    };
    initializeAdMob();
}, []);

// 修正後: React Componentの外で初期化 → AdMob公式推奨
let isAdMobInitialized = false;
if (Platform.OS !== 'web') {
    try {
        const mobileAds = require('react-native-google-mobile-ads').default;
        mobileAds.initialize().then(() => {
            isAdMobInitialized = true;
        }).catch((error) => {
            console.warn('AdMob初期化失敗:', error.message);
            isAdMobInitialized = true;
        });
    } catch (error) {
        console.warn('AdMobモジュール読み込み失敗:', error.message);
        isAdMobInitialized = true;
    }
}
```

### ✅ firebaseConfig.js（エラーハンドリング強化）
```javascript
// 修正前: エラーを無視 → Persistenceが機能しない
let AsyncStorage;
try {
  if (Platform.OS !== 'web') {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  }
} catch (error) {
  console.warn('AsyncStorage is not available:', error); // ❌
}

// 修正後: ネイティブ環境でAsyncStorageを必須化
let AsyncStorage = null;
if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (error) {
    console.error('CRITICAL: AsyncStorage is not available:', error);
    throw new Error('AsyncStorage is required for Firebase Auth on iOS/Android');
  }
}
```

### ✅ HomeScreen.js（依存配列修正）
```javascript
// 修正前: fetchParksがメモ化されていない → 無限ループの可能性
const fetchParks = async () => { /* ... */ };

useFocusEffect(
  useCallback(() => {
    fetchParks();
  }, [fetchParks]) // ❌ fetchParksが毎回新しい関数
);

// 修正後: fetchParksをuseCallbackでメモ化
const fetchParks = useCallback(async () => { /* ... */ }, []);

useFocusEffect(
  useCallback(() => {
    fetchParks();
  }, [fetchParks]) // ✅ fetchParksは常に同じ参照
);
```

### ✅ app.json（SKAdNetworkItems追加）
```json
"infoPlist": {
  "NSLocationWhenInUseUsageDescription": "...",
  "ITSAppUsesNonExemptEncryption": false,
  "SKAdNetworkItems": [
    { "SKAdNetworkIdentifier": "cstr6suwn9.skadnetwork" },
    { "SKAdNetworkIdentifier": "4fzdc2evr5.skadnetwork" },
    // ... 合計48個
  ]
}
```

---

## 修正ファイル一覧

| ファイル | 変更行 | 変更内容 |
|---------|-------|---------|
| `App.js` | 38-82 | AdMob初期化をReact Componentの外に移動 |
| `firebaseConfig.js` | 10-22, 60-91 | AsyncStorageエラーハンドリング強化 |
| `screens/HomeScreen.js` | 149-257 | fetchParksメモ化、重複削除 |
| `app.json` | 5, 22, 29-174 | バージョン1.0.10、SKAdNetworkItems追加 |

---

## なぜこの修正で解決するか

### 理論的根拠

1. **AdMob公式ドキュメント**:
   > This needs to be done only once, ideally at app launch.

   → React Componentの外で初期化することで、この要件を満たす

2. **Firebase Auth Persistence**:
   > In React Native, persistence is enabled by default using AsyncStorage.

   → AsyncStorageを必須にすることで、Persistenceが確実に機能

3. **React Hooks Rules**:
   > useCallback memoizes the function

   → fetchParksをメモ化することで、依存配列が正しく機能

4. **Apple SKAdNetwork**:
   > Apps that use advertising must include the SKAdNetworkItems key.

   → iOS 14.5以降の必須要件を満たす

---

## TestFlightで再テストする手順

### 1. ビルド準備
```bash
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia

# パッケージインストール確認
npm install

# プロジェクト健全性チェック
npx expo-doctor

# キャッシュクリア
npx expo start -c
```

### 2. EASビルド
```bash
# iOSビルド（本番環境）
eas build --platform ios --profile production

# TestFlightに自動アップロード
eas submit --platform ios --profile production
```

### 3. TestFlightでの動作確認

**必須チェック項目**:
- ✅ アプリが起動する（クラッシュしない）
- ✅ AdMobバナー広告が表示される
- ✅ Firebase認証が機能する
- ✅ 公園リストが読み込まれる
- ✅ iPadで縦・横両方で動作する

**デバッグ情報**:
- Xcodeコンソールログ確認
- TestFlightクラッシュレポート確認
- Firebase Consoleエラーログ確認

---

## トラブルシューティング

### もしまだクラッシュする場合

#### A. AdMobを一時的に無効化
```javascript
// adConfig.js
export const AD_ENABLED = false; // 一時的に無効化
```
→ これでクラッシュしなくなれば、AdMobが原因

#### B. Xcodeシミュレータでテスト
```bash
# iPad Air (5th generation)
npm run ios:ipadair5

# iPad Air 11-inch (M3)
npm run ios:ipadair11
```
→ シミュレータでクラッシュする場合、Xcodeコンソールで詳細確認

#### C. 最小構成でテスト
1. すべての機能を無効化
2. 段階的に機能を有効化
3. どこでクラッシュするか特定

---

## 期待される結果

### ✅ 修正完了
- AdMob初期化タイミング → 公式推奨に準拠
- AsyncStorageエラーハンドリング → ネイティブ環境で必須化
- useFocusEffect依存配列 → メモ化で正しく機能
- SKAdNetworkItems → iOS 14.5以降の要件を満たす

### ✅ 期待される動作
- iPadでアプリが正常に起動する
- AdMobバナー広告が表示される
- Firebase認証とデータ読み込みが機能する
- クラッシュが発生しない

---

## 詳細レポート

完全な技術的詳細は以下を参照:
- `/Users/yoshidometoru/Documents/GitHub/ParkPedia/TESTFLIGHT_CRASH_FIX_V1.0.10.md`

---

**最終更新**: 2025-12-10
**修正者**: Claude (Technical Support Specialist)
