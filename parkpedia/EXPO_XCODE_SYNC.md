# Expoの更新をXcodeに反映する方法

## 🔍 問題の原因

Expoでコードを変更してもXcodeに反映されない場合、以下の原因が考えられます：

1. **JavaScriptコードの変更**: 通常は自動反映されますが、キャッシュの問題で反映されない場合があります
2. **app.jsonの変更**: ネイティブ設定の変更は`expo prebuild`が必要です
3. **Xcodeのビルドキャッシュ**: 古いキャッシュが残っている

## ✅ 解決方法（優先順位順）

### 方法1: Xcodeのクリーンビルド（最も簡単・推奨）

**JavaScriptコードの変更の場合、これで解決することが多いです：**

1. Xcodeでプロジェクトを開く
2. `Product` → `Clean Build Folder`（⌘ + Shift + K）
3. `Product` → `Run`（⌘ + R）で再ビルド

**これで、Metro bundlerが最新のJavaScriptコードを自動的にバンドルします。**

### 方法2: Metro bundlerを起動してからXcodeでビルド

1. ターミナルでMetro bundlerを起動：
   ```bash
   cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia
   npx expo start
   ```

2. 別のターミナルでXcodeからビルド：
   - Xcodeで `Product` → `Run`（⌘ + R）
   - Metro bundlerが最新のコードをバンドルします

### 方法3: app.jsonを変更した場合のみprebuildを実行

**⚠️ 注意: app.jsonやネイティブ設定を変更した場合のみ必要です**

```bash
cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia

# アイコンファイルの問題を回避するため、一時的にapp.jsonから参照を削除
# （または、アイコンファイルを作成してから実行）

# ネイティブコードを再生成
npx expo prebuild --platform ios

# CocoaPodsの依存関係を再インストール
cd ios
pod install
cd ..
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

### JavaScriptコードの変更の場合（通常の開発）

1. **コードを変更**（例: `HomeScreen.js`を編集）

2. **Xcodeでクリーンビルド**:
   - `Product` → `Clean Build Folder`（⌘ + Shift + K）
   - `Product` → `Run`（⌘ + R）

3. **または、Metro bundlerを起動**:
   ```bash
   npx expo start
   ```
   その後、Xcodeでビルドすると自動的に最新コードが反映されます

### app.jsonやネイティブ設定を変更した場合

1. **アイコンファイルを作成**（1024x1024pxのPNG形式）
   - `assets/icon.png` を作成

2. **prebuildを実行**:
   ```bash
   npx expo prebuild --platform ios
   ```

3. **pod installを実行**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Xcodeで再ビルド**

## 📝 重要なポイント

### JavaScriptコードの変更は自動反映される

- Expoプロジェクトでは、JavaScriptコードの変更は**Xcodeでビルドする際に自動的に反映**されます
- `expo prebuild`は**不要**です（app.jsonを変更した場合のみ必要）

### DebugビルドとReleaseビルドの違い

- **Debugビルド**: Metro bundlerが起動していれば、最新コードが自動的に反映されます
- **Releaseビルド**: コードがバンドルされて含まれます

## 🐛 トラブルシューティング

### 変更が反映されない場合

1. **Xcodeでクリーンビルド**（⌘ + Shift + K）
2. **Derived Dataを削除**
3. **Metro bundlerを起動**（`npx expo start`）
4. **Xcodeで再ビルド**（⌘ + R）

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

## ✅ まとめ

- **JavaScriptコードの変更**: クリーンビルド（⌘ + Shift + K）で解決
- **app.jsonの変更**: `expo prebuild`が必要（ただし、アイコンファイルが必要）
- **反映されない場合**: Derived Dataの削除を試す
- **通常の開発**: Metro bundlerを起動してからXcodeでビルド

