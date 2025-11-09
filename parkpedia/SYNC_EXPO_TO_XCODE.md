# Expoの更新をXcodeに反映する方法

## 🔍 問題の原因

Expoでコードを変更してもXcodeに反映されない場合、以下の原因が考えられます：

1. **JavaScriptコードの変更**: 通常は自動反映されますが、キャッシュの問題で反映されない場合があります
2. **app.jsonの変更**: ネイティブ設定の変更は`expo prebuild`が必要です
3. **新しいネイティブモジュールの追加**: `pod install`が必要です
4. **Xcodeのビルドキャッシュ**: 古いキャッシュが残っている

## ✅ 解決方法

### 方法1: Xcodeのクリーンビルド（最も簡単）

1. Xcodeでプロジェクトを開く
2. `Product` → `Clean Build Folder`（⌘ + Shift + K）
3. `Product` → `Run`（⌘ + R）で再ビルド

### 方法2: Expo prebuildの再実行（app.jsonを変更した場合）

```bash
cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia
npx expo prebuild --clean --platform ios
```

### 方法3: 完全な同期（推奨）

```bash
cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia

# 1. ネイティブコードを再生成
npx expo prebuild --clean --platform ios

# 2. CocoaPodsの依存関係を再インストール
cd ios
pod install
cd ..

# 3. Xcodeで開く
open ios/ParkPedia.xcworkspace
```

### 方法4: XcodeのDerived Dataを削除

1. Xcodeを開く
2. `Xcode` → `Settings`（⌘ + ,）
3. `Locations`タブを開く
4. `Derived Data`のパスをコピー
5. Finderでそのパスを開く
6. プロジェクト関連のフォルダを削除
7. Xcodeでクリーンビルド（⌘ + Shift + K）

## 🚀 開発時の推奨ワークフロー

### JavaScriptコードの変更の場合

通常、以下の手順で自動的に反映されます：

1. Expo GoまたはMetro bundlerを起動：
   ```bash
   cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia
   npx expo start
   ```

2. Xcodeでビルド・実行：
   - Xcodeで `Product` → `Run`（⌘ + R）
   - Metro bundlerが自動的に最新のコードをバンドルします

### app.jsonやネイティブ設定を変更した場合

1. `expo prebuild`を実行：
   ```bash
   npx expo prebuild --clean --platform ios
   ```

2. `pod install`を実行：
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. Xcodeで再ビルド

## 📝 確認事項

### JavaScriptコードの変更が反映されない場合

1. **Metro bundlerが起動しているか確認**
   ```bash
   npx expo start
   ```

2. **Xcodeのビルド設定を確認**
   - Debugビルドでは`SKIP_BUNDLING=1`が設定されている場合があります
   - Releaseビルドでは自動的にバンドルされます

3. **キャッシュをクリア**
   ```bash
   npx expo start --clear
   ```

### ネイティブ設定の変更が反映されない場合

1. **app.jsonの変更を確認**
2. **expo prebuildを実行**
3. **pod installを実行**
4. **Xcodeでクリーンビルド**

## 🐛 トラブルシューティング

### エラー: "The sandbox is not in sync with the Podfile.lock"

```bash
cd ios
pod install
```

### エラー: "Module not found"

```bash
cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia
npm install
cd ios
pod install
```

### ビルドが古いコードを表示する

1. Xcodeでクリーンビルド（⌘ + Shift + K）
2. Derived Dataを削除
3. 再ビルド（⌘ + R）

## ✅ まとめ

- **JavaScriptコードの変更**: 通常は自動反映（Metro bundlerが起動していれば）
- **app.jsonの変更**: `expo prebuild`が必要
- **新しいネイティブモジュール**: `pod install`が必要
- **反映されない場合**: クリーンビルドとDerived Dataの削除を試す

