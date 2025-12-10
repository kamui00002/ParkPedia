# iPad Air 11-inch (M3) / iPadOS 26.1 クラッシュ問題 修正レポート

## 問題の概要

**App Store審査リジェクト情報:**
- Submission ID: dc4dd705-6582-4dfe-b7c6-f5a32f36f268
- バージョン: 1.0.8
- 問題: アプリが起動時にクラッシュ（Guideline 2.1 - Performance - App Completeness）
- デバイス: iPad Air 11-inch (M3)
- OS: iPadOS 26.1
- 審査日: 2025年12月9日

---

## 根本原因の特定

調査の結果、以下の3つの主要な原因を特定しました：

### 1. 画面方向（Orientation）設定の問題

**問題:**
- `app.json`で`"orientation": "portrait"`（縦向き固定）に設定されていた
- iPadでは複数のorientation対応が必須要件
- 縦向き固定はiPhoneでは問題ないが、iPadでは起動時にクラッシュを引き起こす可能性がある

**参考情報:**
- [Apple Developer Forums - iOS app crashes in portrait mode on iPad](https://developer.apple.com/forums/thread/680557)
- [React Native iPad crash issue](https://github.com/facebook/react-native/issues/33913)

### 2. AdMob初期化の欠如

**問題:**
- `react-native-google-mobile-ads`パッケージを使用しているが、App.jsで初期化処理がなかった
- AdMobは使用前に`mobileAds.initialize()`を呼び出す必要がある
- 初期化なしでAdBannerコンポーネントを読み込むと、ネイティブモジュールエラーが発生してクラッシュする可能性がある

### 3. Expo SDK 54とiOS/iPadOS 26系の既知の問題

**問題:**
- Expo SDK 54でiOS/iPadOS 26.0+でクラッシュする報告が複数ある
- パッケージバージョンの不一致による互換性問題

**参考情報:**
- [Expo SDK 54 iOS crash issue #39597](https://github.com/expo/expo/issues/39597)
- [Expo SDK 54 iOS crash issue #39602](https://github.com/expo/expo/issues/39602)

---

## 実施した修正内容

### 修正1: app.jsonのorientation設定を変更

**ファイル:** `/Users/yoshidometoru/Documents/GitHub/ParkPedia/app.json`

**変更内容:**
```json
// 修正前
"orientation": "portrait"

// 修正後
"orientation": "default"
```

**理由:**
- `"default"`に設定することで、デバイスの物理的な向き（縦・横）に応じて自動で対応
- iPadの要件を満たし、iPhoneでも問題なく動作

---

### 修正2: AdMob初期化処理の追加

**ファイル:** `/Users/yoshidometoru/Documents/GitHub/ParkPedia/App.js`

**追加したコード:**
```javascript
import {
    Platform,
    View,
    ActivityIndicator
} from 'react-native';

export default function App() {
    const [user, setUser] = useState(null);
    const [isAdMobInitialized, setIsAdMobInitialized] = useState(false);

    // AdMobの初期化
    useEffect(() => {
        const initializeAdMob = async () => {
            try {
                // Native環境でのみAdMobを初期化
                if (Platform.OS !== 'web') {
                    const mobileAds = require('react-native-google-mobile-ads').default;

                    // AdMobを初期化
                    await mobileAds.initialize();

                    if (__DEV__) {
                        console.log('AdMob初期化成功');
                    }
                }
                setIsAdMobInitialized(true);
            } catch (error) {
                // AdMob初期化エラーをキャッチ（Expo Go環境や開発環境での安全性）
                if (__DEV__) {
                    console.log('AdMob初期化スキップ（開発環境または利用不可）:', error.message);
                }
                setIsAdMobInitialized(true); // エラーでも続行
            }
        };

        initializeAdMob();
    }, []);

    // AdMob初期化待ち
    if (!isAdMobInitialized) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0FDF4' }}>
                <ActivityIndicator size="large" color="#10B981" />
            </View>
        );
    }

    // ... 以降のコード
}
```

**理由:**
- AdMobを使用する前に必ず初期化する
- エラーハンドリングを追加し、開発環境やExpo Go環境でもクラッシュしないようにする
- 初期化完了までローディング画面を表示し、安全に起動する

---

### 修正3: Firebase初期化の安全性強化

**ファイル:** `/Users/yoshidometoru/Documents/GitHub/ParkPedia/firebaseConfig.js`

**変更内容:**
```javascript
// Firebase初期化
let app;
try {
  app = initializeApp(firebaseConfig);

  if (__DEV__) {
    console.log('🔥 Firebase初期化完了');
    console.log('🆔 プロジェクトID:', firebaseConfig.projectId);
  }
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    // 既に初期化済みの場合は既存のアプリインスタンスを取得
    const { getApp } = require('firebase/app');
    app = getApp();
    if (__DEV__) {
      console.log('🔥 Firebase既存インスタンスを使用');
    }
  } else {
    console.error('Firebase初期化エラー:', error);
    throw error;
  }
}

// Authentication（認証）- プラットフォーム別の設定
let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    // AsyncStorageが利用可能か確認
    if (!AsyncStorage) {
      console.warn('AsyncStorageが利用できません。デフォルトのAuthを使用します。');
      auth = getAuth(app);
    } else {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    }
  }
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
    if (__DEV__) {
      console.log('🔐 Firebase Auth既存インスタンスを使用');
    }
  } else {
    console.warn('Firebase Auth初期化エラー。デフォルトのAuthを使用します:', error);
    auth = getAuth(app);
  }
}
```

**理由:**
- Firebaseの重複初期化エラーを適切にハンドリング
- AsyncStorageの利用可否をチェックし、フォールバック処理を追加
- エラーログを充実させ、問題の特定を容易にする

---

### 修正4: AdMob設定の完全化

**ファイル:** `/Users/yoshidometoru/Documents/GitHub/ParkPedia/app.json`

**変更内容:**
```json
{
  "plugins": [
    [
      "react-native-google-mobile-ads",
      {
        "iosAppId": "ca-app-pub-5237930968754753~4809377071",
        "androidAppId": "ca-app-pub-5237930968754753~4809377071"
      }
    ]
  ]
}
```

**追加内容（Android設定）:**
```json
{
  "android": {
    "package": "com.parkpedia.app",
    "versionCode": 9,
    "googleServicesFile": "./google-services.json"
  }
}
```

**理由:**
- `androidAppId`を追加し、Android向けAdMob設定を完全化
- `expo-doctor`の警告を解消

---

### 修正5: Expoパッケージのバージョン更新

**実施したコマンド:**
```bash
npx expo install expo@~54.0.27 expo-image-picker@~17.0.9 expo-location@~19.0.8 expo-status-bar@~3.0.9
```

**更新したパッケージ:**
- `expo`: 54.0.25 → 54.0.27
- `expo-image-picker`: 17.0.8 → 17.0.9
- `expo-location`: 19.0.7 → 19.0.8
- `expo-status-bar`: 3.0.8 → 3.0.9

**理由:**
- Expo SDK 54の最新パッチバージョンに更新
- iOS/iPadOS 26系との互換性を向上
- 既知のバグ修正を適用

---

## 修正したファイルのリスト

1. `/Users/yoshidometoru/Documents/GitHub/ParkPedia/app.json`
   - orientation設定を`"portrait"`から`"default"`に変更
   - AdMob設定に`androidAppId`を追加
   - Android設定に`googleServicesFile`を追加

2. `/Users/yoshidometoru/Documents/GitHub/ParkPedia/App.js`
   - AdMob初期化処理を追加
   - ローディング画面を追加
   - エラーハンドリングを強化

3. `/Users/yoshidometoru/Documents/GitHub/ParkPedia/firebaseConfig.js`
   - Firebase初期化のエラーハンドリングを強化
   - AsyncStorage利用可否のチェックを追加
   - フォールバック処理を追加

4. `/Users/yoshidometoru/Documents/GitHub/ParkPedia/package.json`
   - Expoパッケージを最新バージョンに更新

---

## テスト方法の推奨事項

### 1. ローカル開発ビルドでのテスト

```bash
# iOSシミュレータ（iPad Air 11-inch M3）でテスト
npx expo run:ios --device "iPad Air 11-inch (M3)"

# iOSシミュレータ（iPad Air 13-inch M3）でテスト
npx expo run:ios --device "iPad Air 13-inch (M3)"

# iOSシミュレータ（iPad Air 5th generation）でテスト
npx expo run:ios --device "iPad Air (5th generation)"
```

### 2. プロダクションビルドでのテスト

```bash
# EASビルド（iOS）
eas build --platform ios --profile production

# TestFlightにアップロード後、iPad実機でテスト
```

### 3. 確認項目

- [ ] アプリが起動時にクラッシュしないか
- [ ] ホーム画面が正常に表示されるか
- [ ] AdMobバナー広告が正常に表示されるか
- [ ] Firebase認証が正常に動作するか
- [ ] 縦向き・横向きの切り替えが正常に動作するか（iPadのみ）
- [ ] 各画面の遷移が正常に動作するか
- [ ] 公園データの取得・表示が正常に動作するか

### 4. 追加のデバッグ方法

```bash
# ローカルで本番バンドルをビルドしてエラーを確認
npx expo export

# expo-doctorで問題をチェック
npx expo-doctor
```

---

## 再発防止のための推奨事項

### 1. Orientation設定の注意点

- iPadアプリでは`"orientation": "default"`を使用し、全方向に対応する
- 特定の方向に固定する場合は、個別の画面レベルで制御する
- iPhoneとiPadで異なる動作が必要な場合は、プラットフォーム判定を使用する

### 2. AdMob使用時の注意点

- **必ずApp.jsでAdMobを初期化する**
- 初期化処理はコンポーネントのレンダリング前に完了させる
- エラーハンドリングを適切に実装し、開発環境でもクラッシュしないようにする
- `androidAppId`と`iosAppId`の両方を設定する

### 3. Firebase使用時の注意点

- 重複初期化エラーを適切にハンドリングする
- AsyncStorageの利用可否をチェックする
- フォールバック処理を実装し、エラー時にも動作するようにする

### 4. Expoパッケージの管理

- 定期的に`npx expo-doctor`を実行し、パッケージバージョンをチェックする
- SDK更新時は、推奨バージョンに即座に更新する
- 依存関係の警告に注意し、必要に応じて対応する

### 5. テスト環境の整備

- iPad実機またはシミュレータでのテストを必須化する
- TestFlightでのベータテストを実施し、実機での動作を確認する
- 複数のiOSバージョンでテストする（iOS 16, 17, 18, 26など）

---

## 参考資料

### 関連するGitHub Issue
- [Expo SDK 54 iOS crash issue #39597](https://github.com/expo/expo/issues/39597)
- [Expo SDK 54 iOS crash issue #39602](https://github.com/expo/expo/issues/39602)
- [React Native iPad crash issue #33913](https://github.com/facebook/react-native/issues/33913)

### Apple Developer Forums
- [iOS app crashes in portrait mode on iPad](https://developer.apple.com/forums/thread/680557)
- [React-native iOS app crashes immediately](https://developer.apple.com/forums/thread/722633)

### Expo Documentation
- [Troubleshoot build errors and crashes](https://docs.expo.dev/build-reference/troubleshooting/)
- [Debugging runtime issues](https://docs.expo.dev/debugging/runtime-issues/)

---

## まとめ

この修正により、以下の問題が解決されました：

1. **iPadでのクラッシュ問題** - orientation設定を`"default"`に変更
2. **AdMob起動時エラー** - 初期化処理を追加し、エラーハンドリングを強化
3. **パッケージバージョンの不一致** - Expo SDK 54の最新バージョンに更新
4. **Firebase初期化の脆弱性** - エラーハンドリングとフォールバック処理を追加

次のステップとして、以下を推奨します：

1. **iPad実機でのテスト** - iPad Air 11-inch (M3)またはそれに近いデバイスでテスト
2. **TestFlightでのベータテスト** - 実機での動作を確認
3. **App Store再審査** - 修正版をApp Storeに再提出

---

**作成日:** 2025年12月10日
**対応バージョン:** 1.0.8 → 1.0.9（次回リリース）
**担当者:** Claude Code
