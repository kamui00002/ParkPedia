# Xcodeで正しいプロジェクトを開く方法

## ⚠️ 重要な注意事項

このワークスペースには**2つの異なるプロジェクト**が存在しています：

1. **ルートディレクトリ**: Capacitor + React (Web) プロジェクト
2. **parkpediaディレクトリ**: Expo + React Native プロジェクト ← **こちらを使用**

## ✅ 正しいXcodeプロジェクト

Expo + React Nativeプロジェクト（Expo Goで表示しているもの）をXcodeで開くには：

### パス
```
/Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia/ios/ParkPedia.xcworkspace
```

### 開き方

#### 方法1: Finderから
1. Finderで以下のパスを開く：
   ```
   /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia/ios/
   ```
2. `ParkPedia.xcworkspace` をダブルクリック

#### 方法2: ターミナルから
```bash
cd /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia/ios
open ParkPedia.xcworkspace
```

#### 方法3: Xcodeから
1. Xcodeを起動
2. `File` → `Open...`
3. 以下のパスを選択：
   ```
   /Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/parkpedia/ios/ParkPedia.xcworkspace
   ```

## ❌ 間違ったプロジェクト

以下のプロジェクトは**開かないでください**（別のプロジェクトです）：

```
/Users/yoshidometoru/.cursor/worktrees/ParkPedia/ixZpa/ios/App/App.xcworkspace
```

これはCapacitor + React (Web)プロジェクトで、Expo Goで表示しているものとは異なります。

## 🔍 確認方法

正しいプロジェクトを開いているか確認する方法：

1. Xcodeで開いたプロジェクト名が **"ParkPedia"** であることを確認
2. プロジェクト内に以下のファイルがあることを確認：
   - `App.js`（`App.tsx`ではない）
   - `screens/HomeScreen.js`
   - `firebaseConfig.js`
   - `app.json`

## 📝 プロジェクト構造の違い

### Expo + React Nativeプロジェクト（正しい）
```
parkpedia/
├── App.js                    ← React Native
├── app.json                  ← Expo設定
├── screens/                  ← React Native画面
│   ├── HomeScreen.js
│   ├── ParkDetailScreen.js
│   └── ...
├── components/               ← React Nativeコンポーネント
│   ├── CustomHeader.js
│   └── ...
└── ios/
    └── ParkPedia.xcworkspace ← これを開く
```

### Capacitor + React (Web)プロジェクト（間違い）
```
（ルートディレクトリ）/
├── App.tsx                   ← React (Web)
├── vite.config.ts            ← Vite設定
├── components/               ← React (Web)コンポーネント
│   ├── Header.tsx
│   └── ...
└── ios/
    └── App.xcworkspace       ← これは開かない
```

## 🎯 まとめ

- **Expo Goで表示しているアプリ** = `parkpedia/` ディレクトリのExpoプロジェクト
- **Xcodeで開くべきファイル** = `parkpedia/ios/ParkPedia.xcworkspace`
- **間違って開いている可能性があるファイル** = `ios/App/App.xcworkspace`（Capacitorプロジェクト）

