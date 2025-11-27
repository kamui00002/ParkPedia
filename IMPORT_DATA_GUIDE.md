# サンプルデータ自動インポートガイド

このガイドでは、SAMPLE_DATA.jsのデータをFirestoreに自動的にインポートする方法を説明します。

## 📋 必要なもの

- ✅ Firebase Admin SDK（インストール済み）
- ✅ データインポートスクリプト（作成済み）
- ⏳ Firebaseサービスアカウントキー（これから取得）

---

## 🔑 Step 1: サービスアカウントキーを取得

### 1. Firebase Consoleを開く

[Firebase Console](https://console.firebase.google.com/) にアクセス

### 2. プロジェクトを選択

ParkPediaプロジェクトを選択

### 3. プロジェクト設定を開く

- 左上の **⚙️ 歯車アイコン** をクリック
- **Project Settings（プロジェクトの設定）** を選択

### 4. Service Accountsタブを開く

- 上部のタブから **Service Accounts（サービスアカウント）** をクリック

### 5. 秘密鍵を生成

- **Generate New Private Key（新しい秘密鍵を生成）** ボタンをクリック
- 確認ダイアログで **Generate Key（鍵を生成）** をクリック
- JSON形式のファイルがダウンロードされます

### 6. ファイルを配置

ダウンロードしたJSONファイルを以下の場所に配置：

```
/Users/yoshidometoru/Documents/GitHub/ParkPedia/parkpedia/serviceAccountKey.json
```

**重要:** このファイルは秘密情報なので、Gitにコミットしないでください！
（.gitignoreに既に追加済み）

---

## 🚀 Step 2: データをインポート

### ターミナルで実行

```bash
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia/parkpedia
node scripts/importSampleData.js
```

### 実行結果の例

```
🚀 サンプルデータのインポートを開始します...

📍 公園データをインポート中...
  ✅ 中央公園 (ID: abc123...)
  ✅ 桜の森公園 (ID: def456...)
  ✅ こどもの森公園 (ID: ghi789...)
  ✅ 水と緑の広場 (ID: jkl012...)
  ✅ 展望台公園 (ID: mno345...)

💬 レビューデータをインポート中...
  ✅ 中央公園 - 田中太郎のレビュー
  ✅ 中央公園 - 佐藤花子のレビュー
  ...（全15件）

✨ データインポートが完了しました！

📊 インポート結果:
  - 公園: 5件
  - レビュー: 15件

🔍 Firebase Consoleで確認してください:
  https://console.firebase.google.com/project/your-project-id/firestore
```

---

## ✅ Step 3: データを確認

### Firebase Consoleで確認

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. ParkPediaプロジェクトを選択
3. **Firestore Database** を開く
4. 以下のコレクションが作成されていることを確認：

```
📁 parks (5件)
  └─ 中央公園、桜の森公園、こどもの森公園、水と緑の広場、展望台公園

📁 reviews (15件)
  └─ 各公園に2-4件のレビュー
```

### アプリで確認

1. Expo Goアプリでアプリを開く
2. ホーム画面の「おすすめ」セクションに公園が表示される
3. 公園をタップ → レビューが表示される

---

## 🔧 トラブルシューティング

### エラー: serviceAccountKey.json が見つかりません

→ Step 1を再度確認し、ファイルが正しい場所にあることを確認してください

### エラー: Permission denied

→ Firebaseプロジェクトの権限を確認してください。プロジェクトのオーナーまたは編集者である必要があります。

### エラー: ECONNREFUSED

→ インターネット接続を確認してください

### データが重複している

スクリプトは既存データをチェックせずに追加します。重複を避けるには：

1. Firebase Console → Firestore Database
2. `parks` と `reviews` コレクションを手動で削除
3. スクリプトを再実行

---

## 📝 注意事項

1. **サービスアカウントキーは秘密情報**
   - Gitにコミットしない
   - 公開しない
   - 定期的にローテーションする

2. **データの上書き**
   - このスクリプトは新しいデータを追加します
   - 既存データを上書きしません

3. **本番環境での使用**
   - テスト環境で実行することを推奨
   - 本番環境では慎重に使用してください

---

## 🎯 次のステップ

データインポートが完了したら：

1. ✅ デモアカウント作成: `reviewer@parkpedia.test`
2. ✅ アプリでテスト
3. ✅ App Store Connectに情報を追加
4. ✅ レビューチームに返信

詳細は `APP_STORE_REVIEW_NOTES.md` を参照してください。
