# XcodeでExpoプロジェクトを開く方法

## ✅ 現在の状態

Expoプロジェクトのネイティブコード（iOS）は既に生成されています：
- `ios/ParkPedia.xcworkspace` が存在します
- CocoaPodsの依存関係もインストール済みです

## 🚀 Xcodeで開く方法

### 方法1: ターミナルから開く（推奨）

```bash
cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia/ios
open ParkPedia.xcworkspace
```

### 方法2: Finderから開く

1. Finderで以下のパスを開く：
   ```
   /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia/ios/
   ```
2. `ParkPedia.xcworkspace` をダブルクリック

### 方法3: Xcodeから開く

1. Xcodeを起動
2. `File` → `Open...`（⌘ + O）
3. 以下のパスを選択：
   ```
   /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia/ios/ParkPedia.xcworkspace
   ```

## ⚠️ 重要な注意事項

### `.xcworkspace` を開く
- ✅ **正しい**: `ParkPedia.xcworkspace` を開く
- ❌ **間違い**: `ParkPedia.xcodeproj` を開かない（CocoaPodsの依存関係が読み込まれません）

## 🔧 もしXcodeで正しく表示されない場合

### 1. ネイティブコードを再生成

```bash
cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia
npx expo prebuild --clean
```

### 2. CocoaPodsの依存関係を再インストール

```bash
cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia/ios
pod install
```

### 3. Xcodeで開く

```bash
open ParkPedia.xcworkspace
```

## 📱 Xcodeでビルド・実行する方法

### 1. シミュレーターで実行

1. Xcodeでプロジェクトを開く
2. 上部のデバイス選択でシミュレーターを選択（例: iPhone 15 Pro）
3. `Product` → `Run`（⌘ + R）をクリック

### 2. 実機で実行

1. Xcodeでプロジェクトを開く
2. 上部のデバイス選択で接続した実機を選択
3. 署名と証明書を設定
4. `Product` → `Run`（⌘ + R）をクリック

## 🎯 Expo Goとの違い

### Expo Go
- 開発中に使用
- ホットリロードが可能
- 実機で簡単にテスト可能

### Xcode（ネイティブビルド）
- 本番ビルド用
- App Store配信用
- 完全なネイティブアプリとして動作

## 📝 確認事項

Xcodeで正しく開けているか確認：

1. ✅ プロジェクト名が「ParkPedia」である
2. ✅ 左側のプロジェクトナビゲーターに以下が表示される：
   - `ParkPedia`（アプリターゲット）
   - `Pods`（依存関係）
3. ✅ ビルドエラーがない（⌘ + B でビルド確認）

## 🐛 トラブルシューティング

### ビルドエラーが発生する場合

1. **クリーンビルド**:
   ```
   Product → Clean Build Folder (⌘ + Shift + K)
   ```

2. **Derived Dataを削除**:
   ```
   Xcode → Settings → Locations → Derived Data のパスを開いて削除
   ```

3. **Podを再インストール**:
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   ```

### 依存関係のエラー

```bash
cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia/ios
pod deintegrate
pod install
```

## ✅ まとめ

- ExpoプロジェクトはXcodeで開けます
- `parkpedia/ios/ParkPedia.xcworkspace` を開いてください
- 既にネイティブコードは生成済みです
- ビルドエラーがあれば、上記のトラブルシューティングを試してください

