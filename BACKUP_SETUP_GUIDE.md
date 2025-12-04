# 🛡️ Firestore自動バックアップ設定ガイド

## 📋 概要

今回のようなデータ削除の事故を防ぐため、定期的な自動バックアップを設定しましょう。

---

## 🎯 設定方法

### 方法1: Firebase Extensions で簡単セットアップ（推奨）

最も簡単で確実な方法です。

#### ステップ1: Firebase Extensionsを開く

1. **Firebase Consoleを開く**
   - https://console.firebase.google.com/

2. **ParkPediaプロジェクトを選択**

3. **左メニューから「Extensions」をクリック**
   - 「ビルド」セクションにあります

#### ステップ2: Firestore Backup Extensionをインストール

1. **「Extensionsを参照」ボタンをクリック**

2. **「Firestore」でフィルタリング**

3. **「Export Collections to Cloud Storage」を探す**
   - 正式名称: `firestore-backup-export`
   - 提供元: Firebase

4. **「インストール」をクリック**

#### ステップ3: 設定

以下の設定を入力：

1. **Cloud Storage バケット**
   ```
   parkpedia-app.appspot.com
   ```

2. **バックアップパス**
   ```
   firestore-backups/{DATE}
   ```
   - `{DATE}` は自動的に日付に置き換えられます

3. **バックアップ対象のコレクション**
   ```
   parks,reviews,favorites,reports,blockedUsers
   ```
   - すべてのコレクションをバックアップ
   - カンマ区切りで指定

4. **スケジュール（Cron式）**
   ```
   0 3 * * *
   ```
   - 毎日午前3時に実行

5. **バックアップ保持期間**
   ```
   30
   ```
   - 30日間保持（古いバックアップは自動削除）

#### ステップ4: インストール完了

- 「拡張機能をインストール」をクリック
- 数分で完了します

---

### 方法2: Cloud Schedulerを使った手動設定（上級者向け）

より細かい制御が必要な場合の方法です。

#### ステップ1: Cloud Schedulerを有効化

1. **Google Cloud Consoleを開く**
   - https://console.cloud.google.com/

2. **プロジェクトを選択**（parkpedia-app）

3. **左メニューから「Cloud Scheduler」を選択**

4. **「API を有効にする」をクリック**（初回のみ）

#### ステップ2: ジョブを作成

1. **「ジョブを作成」をクリック**

2. **基本設定**
   - 名前: `firestore-daily-backup`
   - 説明: Firestoreの毎日バックアップ
   - リージョン: `us-central1`

3. **スケジュール**
   - 頻度: `0 3 * * *`
   - タイムゾーン: `Asia/Tokyo`（日本時間）

4. **実行内容**
   - ターゲットタイプ: `HTTP`
   - URL: 
     ```
     https://firestore.googleapis.com/v1/projects/parkpedia-app/databases/(default):exportDocuments
     ```
   - HTTPメソッド: `POST`
   - 本文:
     ```json
     {
       "outputUriPrefix": "gs://parkpedia-app.appspot.com/firestore-backups",
       "collectionIds": ["parks", "reviews", "favorites", "reports", "blockedUsers"]
     }
     ```
   - Authヘッダー: `OAuth トークンを追加`
   - サービス アカウント: `App Engine default service account`

5. **「作成」をクリック**

#### ステップ3: 手動テスト

1. 作成したジョブの右側にある「⋮」メニューをクリック
2. **「今すぐ実行」**をクリック
3. Cloud Storageでバックアップが作成されたか確認

---

## ✅ バックアップの確認

### バックアップファイルの場所

1. **Cloud Storageを開く**
   - https://console.cloud.google.com/storage

2. **バケットを選択**
   - `parkpedia-app.appspot.com`

3. **フォルダを確認**
   - `firestore-backups/` フォルダ内
   - 日付ごとにフォルダが作成されます
   - 例: `firestore-backups/2025-12-04/`

### バックアップの内容

各バックアップフォルダには以下のファイルが含まれます：

- `all_namespaces/`: すべてのデータ
- `kind_*` フォルダ: コレクションごとのデータ
- `.backup_info`: バックアップメタデータ

---

## 🔄 バックアップからの復元方法

万が一データが失われた場合、以下の手順で復元できます。

### 復元手順

1. **gcloud SDK をインストール**（まだの場合）
   - https://cloud.google.com/sdk/docs/install

2. **ターミナルで以下を実行**

   ```bash
   # プロジェクトを設定
   gcloud config set project parkpedia-app
   
   # 復元するバックアップのパスを指定
   gcloud firestore import gs://parkpedia-app.appspot.com/firestore-backups/2025-12-04/
   ```

3. **復元完了を待つ**
   - 数分〜数時間かかる場合があります
   - 進捗は Firebase Console で確認できます

---

## 📅 バックアップスケジュール

### 推奨スケジュール

| 環境 | 頻度 | 保持期間 |
|------|------|----------|
| **開発環境** | 毎日 1回 | 7日間 |
| **本番環境** | 毎日 1回 + 毎週 1回 | 30日間 |

### Cron式の例

- **毎日午前3時**: `0 3 * * *`
- **毎週日曜日午前2時**: `0 2 * * 0`
- **毎月1日午前1時**: `0 1 1 * *`

---

## 💰 コストについて

### バックアップのコスト

1. **Cloud Storage 料金**
   - Regional: 約 $0.020/GB/月
   - バックアップサイズの目安:
     - テストデータのみ: 〜1MB（ほぼ無料）
     - 小規模アプリ（100件の公園）: 〜10MB（月額 $0.0002）
     - 中規模アプリ（1000件の公園）: 〜100MB（月額 $0.002）

2. **Cloud Scheduler 料金**
   - 最初の3ジョブ: 無料
   - それ以降: $0.10/ジョブ/月

**結論**: 小規模なアプリの場合、バックアップコストはほぼ無料です。

---

## 🛠️ トラブルシューティング

### 問題1: バックアップが作成されない

**確認事項:**
1. Cloud Scheduler のジョブが正常に実行されているか確認
2. Cloud Storage バケットへのアクセス権限があるか確認
3. Firestore のデータが存在するか確認

**解決方法:**
- Cloud Scheduler のログを確認
- 手動でジョブを実行してエラーメッセージを確認

### 問題2: 復元が失敗する

**確認事項:**
1. バックアップファイルが存在するか確認
2. 正しいパスを指定しているか確認
3. gcloud のプロジェクト設定が正しいか確認

**解決方法:**
```bash
# プロジェクト設定を確認
gcloud config list

# 認証を再設定
gcloud auth login
```

### 問題3: 権限エラーが発生する

**確認事項:**
- サービス アカウントに適切な権限があるか確認
  - `Cloud Datastore Import Export Admin`
  - `Storage Admin`

**解決方法:**
1. Firebase Console → 設定 → サービス アカウント
2. 権限を確認・追加

---

## 📋 セットアップチェックリスト

### 初期設定

- [ ] Firebase Extensions をインストール（または Cloud Scheduler を設定）
- [ ] バックアップスケジュールを設定
- [ ] 手動でバックアップを実行してテスト
- [ ] Cloud Storage でバックアップファイルを確認
- [ ] gcloud SDK をインストール（復元用）

### 定期確認（月1回）

- [ ] バックアップが正常に作成されているか確認
- [ ] バックアップファイルのサイズを確認
- [ ] 古いバックアップが削除されているか確認（保持期間を過ぎたもの）
- [ ] 復元手順をドキュメント化

### 緊急時の準備

- [ ] 復元コマンドをドキュメント化
- [ ] gcloud SDK の使い方を確認
- [ ] 緊急連絡先をメモ（Firebaseサポート、チームメンバー）

---

## 🎯 まとめ

### バックアップの重要性

今回の事故で学んだこと：
1. **バックアップは必須**: 手動削除のミスは誰にでも起こる
2. **自動化が重要**: 手動バックアップは忘れがち
3. **定期確認**: バックアップが正常に動作しているか定期的に確認

### 推奨する設定

1. **Firebase Extensions でバックアップを設定**（最も簡単）
2. **毎日午前3時に自動実行**
3. **30日間保持**
4. **月1回、復元テストを実行**

---

## 📞 サポート

問題が発生した場合：

- **Firebase サポート**: https://firebase.google.com/support
- **Cloud Scheduler ドキュメント**: https://cloud.google.com/scheduler/docs
- **Firestore バックアップ ドキュメント**: https://cloud.google.com/firestore/docs/backups

---

**最終更新**: 2025年12月4日

**データは大切に！必ずバックアップを設定してください！** 🛡️
