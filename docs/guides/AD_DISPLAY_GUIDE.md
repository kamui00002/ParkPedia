# 📱 広告表示ガイド

## ❓ 広告が表示されない理由

### Expo Go では広告が表示されません

**理由**:
- Expo Go はネイティブモジュール（`react-native-google-mobile-ads`）をサポートしていません
- `AdBanner.js` の38-40行目で、Expo Go環境を検出して広告を自動的に無効化しています

```javascript
// Expo Go環境を検出
if (Constants.executionEnvironment === 'storeClient') {
  return null; // 広告を表示しない
}
```

---

## ✅ 広告を表示する方法

### 方法1: Development Build を使用

1. **Development Build を作成**:
   ```bash
   npx expo prebuild
   npx expo run:ios
   # または
   npx expo run:android
   ```

2. **EAS Build を使用する場合**:
   ```bash
   eas build --profile development --platform ios
   # または
   eas build --profile development --platform android
   ```

### 方法2: 本番ビルドを使用

- App Store / Google Play に公開されたアプリ
- TestFlight / Internal Testing で配布されたアプリ

---

## 🔍 現在の環境を確認

### Expo Go かどうかを確認

ターミナルで以下を実行:
```bash
npx expo start
```

**Expo Go の場合**:
- QRコードが表示される
- Expo Goアプリでスキャンして起動

**Development Build の場合**:
- ネイティブビルドが必要
- カスタムネイティブコードが使用可能

---

## 📊 広告設定の確認

### `adConfig.js` の設定

```javascript
// 広告が有効になっているか確認
export const AD_ENABLED = true; // ✅ true になっているか確認

// 広告ユニットID
export const AD_UNIT_IDS = {
  banner: 'ca-app-pub-5237930968754753/1172496343'
};
```

### 開発環境でのテスト広告

開発環境（`__DEV__ === true`）では、自動的にテスト広告IDが使用されます:
- テスト広告ID: `ca-app-pub-3940256099942544/6300978111`

---

## 🛠️ トラブルシューティング

### 1. 広告が表示されない場合

**チェックリスト**:
- [ ] Expo Go ではなく Development Build を使用しているか
- [ ] `AD_ENABLED` が `true` になっているか
- [ ] `react-native-google-mobile-ads` がインストールされているか
- [ ] AdMob の初期化が成功しているか（`App.js` で確認）

### 2. コンソールログを確認

Development Build で実行している場合、以下のログが表示されます:

```
AdMob初期化成功
AdMob: 広告が読み込まれました
```

エラーが表示される場合:
```
AdMob: 広告の読み込みに失敗しました: [エラー内容]
```

### 3. AdMob の設定を確認

- [ ] AdMob アカウントでアプリが登録されているか
- [ ] 広告ユニットIDが正しいか
- [ ] アプリのパッケージ名が AdMob の設定と一致しているか

---

## 📝 まとめ

| 環境 | 広告表示 | 理由 |
|------|---------|------|
| Expo Go | ❌ 表示されない | ネイティブモジュール非対応 |
| Development Build | ✅ 表示される | ネイティブモジュール対応 |
| 本番ビルド | ✅ 表示される | ネイティブモジュール対応 |

---

## 🚀 次のステップ

1. **Development Build を作成**:
   ```bash
   npx expo prebuild
   npx expo run:ios
   ```

2. **または EAS Build を使用**:
   ```bash
   eas build --profile development --platform ios
   ```

3. **広告の動作を確認**:
   - Development Build でアプリを起動
   - ホーム画面などで広告が表示されることを確認

---

**最終更新**: 2025年12月21日


