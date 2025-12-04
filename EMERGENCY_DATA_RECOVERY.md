# 🚨 緊急: Firestoreデータ復元ガイド

## ⚠️ 状況

Firestoreのデータを誤って削除してしまった場合の緊急対応ガイドです。

**重要**: データ復元には時間が重要です。すぐに行動してください！

---

## 🔴 今すぐやるべきこと（優先度: 最高）

### ステップ1: これ以上操作しない（最重要）

1. **Firebase Consoleを閉じる**
   - 追加の削除や変更を防ぐため

2. **アプリの使用を停止する**
   - データの上書きを防ぐため

3. **落ち着く**
   - パニックにならず、冷静に対応しましょう

### ステップ2: Firebase サポートに緊急連絡（5分以内）

Firebaseには自動バックアップがないため、Google Cloud サポートに連絡する必要があります。

#### 方法1: Firebase サポートに問い合わせ

1. **Firebase Consoleを開く**
   - https://console.firebase.google.com/

2. **サポートページにアクセス**
   - 右上の **「?」アイコン** → **「サポート」** → **「お問い合わせ」**

3. **緊急チケットを作成**
   - 件名: **「緊急: Firestoreデータの誤削除 - 復元依頼」**
   - 説明:
     ```
     【緊急】Firestoreデータを誤って削除してしまいました。
     データの復元をお願いします。

     プロジェクトID: [あなたのプロジェクトID]
     削除した日時: 2025年12月4日 [具体的な時刻]
     削除したコレクション: parks, reviews, favorites, reports, blockedUsers
     削除前のデータ概要: 公園データ約X件、レビュー約Y件

     可能な限り早急な対応をお願いします。
     ```

#### 方法2: Google Cloud サポート（有料プランの場合）

Google Cloud の有料サポートプランに加入している場合：

1. **Google Cloud Consoleを開く**
   - https://console.cloud.google.com/

2. **サポートページにアクセス**
   - 左上のメニュー → **「サポート」** → **「ケースを作成」**

3. **優先度「P1（緊急）」でチケットを作成**

#### 方法3: Firebase コミュニティに助けを求める

1. **Stack Overflow**
   - https://stackoverflow.com/questions/tagged/firebase
   - タグ: `firebase`, `google-cloud-firestore`, `data-recovery`

2. **Firebase Slack コミュニティ**
   - https://firebase.community/

---

## 📋 データ復元の可能性

### ケース1: バックアップが存在する場合 ✅

以下のいずれかが該当する場合、復元可能です：

1. **手動でエクスポートしたバックアップがある**
   - Cloud Storage バケットにエクスポートファイルがある
   - ローカルにバックアップファイルがある

2. **Firebase Extensions でバックアップを設定していた**
   - Firestore Backup Extension が有効だった

3. **Cloud Scheduler でバックアップを自動化していた**

#### 確認方法

1. **Cloud Storage を確認**
   ```
   Firebase Console → Storage
   または
   https://console.cloud.google.com/storage
   ```

2. **バックアップファイルを探す**
   - ファイル名: `firestore-export-YYYY-MM-DD-*`
   - フォルダ名: `firestore-backups/` など

3. **見つかった場合**
   - すぐに「ステップ3: バックアップから復元」に進む

### ケース2: バックアップが存在しない場合 ❌

残念ながら、Firestoreには自動バックアップ機能がありません。

#### 復元の可能性（非常に低い）

1. **Google Cloud サポートに依頼**
   - まれに、内部バックアップから復元できる可能性がある
   - ただし、保証はなく、復元には時間がかかる可能性がある

2. **削除から24時間以内であれば、わずかな可能性**
   - Google の内部システムに一時的なコピーが残っている可能性
   - サポートに緊急で連絡することが重要

#### 復元できない場合の対応

「ステップ4: データの再構築」に進む

---

## ステップ3: バックアップから復元

### 前提条件

- Cloud Storage にバックアップファイルが存在する
- バックアップファイルのパスが分かる

### 復元手順

#### 方法1: gcloud コマンドで復元

1. **Google Cloud SDK をインストール**
   - https://cloud.google.com/sdk/docs/install

2. **ターミナルを開く**

3. **プロジェクトを設定**
   ```bash
   gcloud config set project [YOUR_PROJECT_ID]
   ```

4. **バックアップから復元**
   ```bash
   gcloud firestore import gs://[YOUR_BUCKET_NAME]/[BACKUP_PATH]
   ```

   例:
   ```bash
   gcloud firestore import gs://parkpedia-backups/firestore-export-2025-12-04/
   ```

5. **復元の完了を待つ**
   - 数分〜数時間かかる場合があります

#### 方法2: Firebase Console から復元

残念ながら、Firebase Console からの直接復元機能はありません。
gcloud コマンドを使用する必要があります。

---

## ステップ4: データの再構築

バックアップが存在しない、またはサポートから復元できない場合、データを再構築する必要があります。

### 4-1. 削除前の状況を確認

1. **削除したデータの内容を思い出す**
   - 公園の数: 約 ___ 件
   - レビューの数: 約 ___ 件
   - ユーザーの数: 約 ___ 件

2. **SAMPLE_DATA.js を確認**
   - テストデータの構造を確認
   - 必要に応じて本番データを再作成

3. **アプリのスクリーンショットを確認**
   - 過去のスクリーンショットからデータを復元できる可能性

### 4-2. テストデータを再インポート（開発環境の場合）

開発環境であり、テストデータのみが削除された場合：

```bash
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia
node scripts/importSampleData.js
```

### 4-3. 本番データの再構築（本番環境の場合）

**ユーザーに協力を依頼する必要があります**：

1. **ユーザーへの通知**
   - アプリ内で通知を表示
   - 「システムトラブルによりデータが失われました。再投稿をお願いします」

2. **一時的な代替手段**
   - キャッシュされたデータがあれば使用
   - AsyncStorage にデータが残っている可能性

3. **段階的な復元**
   - 重要なデータから優先的に復元
   - ユーザーに再投稿を促す

### 4-4. キャッシュからの部分的な復元

一部のデータは、ユーザーのデバイスにキャッシュされている可能性があります。

#### AsyncStorage を確認

アプリのコードで、最近見た公園などが AsyncStorage に保存されています：

```javascript
// 最近見た公園のキー
const recentParksKey = `recentParks_${userId}`;
```

これらのデータは各ユーザーのデバイスに残っている可能性があります。

---

## 🔄 今後の対策（再発防止）

### 1. 定期的なバックアップの設定

#### 自動バックアップスクリプトの作成

```bash
# scripts/backupFirestore.sh
#!/bin/bash

PROJECT_ID="parkpedia-app"
BUCKET_NAME="parkpedia-backups"
DATE=$(date +%Y-%m-%d-%H-%M-%S)

gcloud firestore export gs://${BUCKET_NAME}/firestore-export-${DATE}/ \
  --project=${PROJECT_ID}

echo "✅ バックアップ完了: firestore-export-${DATE}"
```

#### Cloud Scheduler でバックアップを自動化

1. **Cloud Scheduler を開く**
   - https://console.cloud.google.com/cloudscheduler

2. **ジョブを作成**
   - 頻度: 毎日 午前3時（`0 3 * * *`）
   - ターゲット: Cloud Function（バックアップスクリプトを実行）

### 2. Firebase Extensions でバックアップ

1. **Firebase Console → Extensions**
2. **「Firestore Backup and Restore」をインストール**
3. **自動バックアップを設定**

### 3. ステージング環境の作成

本番環境とは別に、テスト用の環境を作成：

- **開発環境**: テストデータのみ
- **本番環境**: 実際のユーザーデータ

### 4. 削除前の確認手順

1. **削除前に必ずバックアップを取る**
2. **削除対象を二重チェック**
3. **本番環境での操作は慎重に**

---

## 📞 サポート連絡先

### Firebase サポート

- **Firebase Console**: https://console.firebase.google.com/
- **サポートページ**: 右上の「?」アイコン → 「サポート」

### Google Cloud サポート

- **Cloud Console**: https://console.cloud.google.com/
- **サポートページ**: 左メニュー → 「サポート」

### コミュニティサポート

- **Stack Overflow**: https://stackoverflow.com/questions/tagged/firebase
- **Firebase Slack**: https://firebase.community/
- **Reddit**: https://www.reddit.com/r/Firebase/

---

## 📋 チェックリスト

### 緊急対応（今すぐ）

- [ ] Firebase Consoleを閉じた
- [ ] アプリの使用を停止した
- [ ] Firebase サポートに連絡した（5分以内）
- [ ] 削除の詳細をメモした（日時、コレクション名など）

### バックアップの確認

- [ ] Cloud Storage でバックアップファイルを探した
- [ ] ローカルにバックアップファイルがあるか確認した
- [ ] Firebase Extensions のバックアップ設定を確認した

### 復元作業

- [ ] バックアップから復元を試みた（バックアップがある場合）
- [ ] サポートの返信を待っている
- [ ] データ再構築の計画を立てた

### 再発防止

- [ ] 自動バックアップの設定を完了した
- [ ] ステージング環境を作成した
- [ ] チーム内で削除手順を共有した

---

## 💡 重要なポイント

1. **時間が重要**: 削除直後であれば、わずかな可能性で復元できる
2. **サポートに連絡**: すぐにFirebase/Google Cloudサポートに連絡
3. **落ち着く**: パニックにならず、冷静に対応
4. **今後の対策**: 再発防止のため、必ずバックアップを設定

---

## 🙏 お願い

この経験を無駄にしないために：

1. **バックアップを設定してください**
2. **削除前に必ず確認してください**
3. **本番環境では慎重に操作してください**

---

**最終更新**: 2025年12月4日

**緊急の場合は、すぐにサポートに連絡してください！**
