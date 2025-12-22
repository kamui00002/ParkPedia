# プライバシーデータ棚卸し / Privacy Data Inventory

**最終更新日 / Last Updated**: 2025年12月19日 / December 19, 2025

このドキュメントは、ParkPediaアプリケーションが収集、保存、処理するすべての個人データの包括的な棚卸しを提供します。

---

## 日本語版

### 1. 収集するデータの概要

#### 1.1 アカウント情報 (Firebase Authentication)

| データ項目 | データ型 | 必須/任意 | 収集目的 | 保存場所 |
|-----------|---------|----------|---------|---------|
| メールアドレス | String | 必須 | ユーザー認証、アカウント回復 | Firebase Authentication |
| UID (ユーザーID) | String | 自動生成 | ユーザー識別 | Firebase Authentication |
| パスワード | String (ハッシュ化) | 必須 | ユーザー認証 | Firebase Authentication |
| アカウント作成日時 | Timestamp | 自動記録 | アカウント管理 | Firebase Authentication |
| 最終ログイン日時 | Timestamp | 自動記録 | セキュリティ監視 | Firebase Authentication |

**保持期間**: アカウントが有効な間
**削除方法**: アカウント削除時に自動削除

#### 1.2 プロフィール情報 (Cloud Firestore: users コレクション)

| データ項目 | データ型 | 必須/任意 | 収集目的 | 保存場所 |
|-----------|---------|----------|---------|---------|
| 表示名 | String | 任意 | ユーザー識別、コミュニティ機能 | Firestore /users/{userId} |
| プロフィール写真URL | String | 任意 | ユーザー識別、コミュニティ機能 | Firestore /users/{userId} |
| 作成日時 | Timestamp | 自動記録 | データ管理 | Firestore /users/{userId} |

**保持期間**: アカウントが有効な間
**削除方法**: アカウント削除時に自動削除

#### 1.3 公園投稿データ (Cloud Firestore: parks コレクション)

| データ項目 | データ型 | 必須/任意 | 収集目的 | 保存場所 |
|-----------|---------|----------|---------|---------|
| 公園名 | String | 必須 | 公園識別、検索 | Firestore /parks/{parkId} |
| 住所 | String | 必須 | 位置情報、検索 | Firestore /parks/{parkId} |
| 緯度・経度 | GeoPoint | 必須 | 地図表示、近隣検索 | Firestore /parks/{parkId} |
| 説明 | String | 任意 | 公園情報提供 | Firestore /parks/{parkId} |
| メイン画像URL | String | 任意 | ビジュアル表示 | Firestore /parks/{parkId} |
| 画像URL配列 | Array<String> | 任意 | ビジュアル表示 | Firestore /parks/{parkId} |
| 作成者UID | String | 自動記録 | データ管理、権限制御 | Firestore /parks/{parkId} |
| 作成日時 | Timestamp | 自動記録 | データ管理 | Firestore /parks/{parkId} |

**保持期間**: アカウントが有効な間、または公園が削除されるまで
**削除方法**: アカウント削除時に自動削除（現行実装では残る - 要改善）

#### 1.4 レビューデータ (Cloud Firestore: reviews コレクション)

| データ項目 | データ型 | 必須/任意 | 収集目的 | 保存場所 |
|-----------|---------|----------|---------|---------|
| 評価 (1-5) | Number | 必須 | 公園評価 | Firestore /reviews/{reviewId} |
| コメント | String | 任意 | 詳細レビュー | Firestore /reviews/{reviewId} |
| 写真URL配列 | Array<String> | 任意 | ビジュアルレビュー | Firestore /reviews/{reviewId} |
| 作成者UID | String | 自動記録 | データ管理、権限制御 | Firestore /reviews/{reviewId} |
| 作成者名 | String | 自動取得 | 表示用 | Firestore /reviews/{reviewId} |
| 公園ID | String | 自動記録 | 公園との関連付け | Firestore /reviews/{reviewId} |
| 作成日時 | Timestamp | 自動記録 | データ管理、並び替え | Firestore /reviews/{reviewId} |

**保持期間**: アカウントが有効な間、またはレビューが削除されるまで
**削除方法**: アカウント削除時に自動削除

#### 1.5 お気に入り・訪問履歴 (Cloud Firestore: favorites コレクション)

| データ項目 | データ型 | 必須/任意 | 収集目的 | 保存場所 |
|-----------|---------|----------|---------|---------|
| ユーザーID | String | 自動記録 | ユーザー識別 | Firestore /favorites/{favoriteId} |
| 公園ID | String | 必須 | 公園との関連付け | Firestore /favorites/{favoriteId} |
| タイプ | String | 必須 | お気に入り種別 (favorite/wantToVisit/visited) | Firestore /favorites/{favoriteId} |
| 作成日時 | Timestamp | 自動記録 | データ管理 | Firestore /favorites/{favoriteId} |

**保持期間**: アカウントが有効な間、または削除されるまで
**削除方法**: アカウント削除時に自動削除

#### 1.6 ユーザーブロック情報 (Cloud Firestore: users/{userId}/blockedUsers)

| データ項目 | データ型 | 必須/任意 | 収集目的 | 保存場所 |
|-----------|---------|----------|---------|---------|
| ブロックされたユーザーID | String | 自動記録 | ブロック機能 | Firestore /users/{userId}/blockedUsers/{blockedUserId} |
| ブロック日時 | Timestamp | 自動記録 | データ管理 | Firestore /users/{userId}/blockedUsers/{blockedUserId} |

**保持期間**: アカウントが有効な間、またはブロック解除まで
**削除方法**: アカウント削除時に自動削除

#### 1.7 レビュー報告データ (Cloud Firestore: reports コレクション)

| データ項目 | データ型 | 必須/任意 | 収集目的 | 保存場所 |
|-----------|---------|----------|---------|---------|
| レビューID | String | 自動記録 | 報告対象識別 | Firestore /reports/{reportId} |
| 報告者UID | String | 自動記録 | 報告者識別 | Firestore /reports/{reportId} |
| 理由 | String | 必須 | 報告理由 | Firestore /reports/{reportId} |
| 詳細コメント | String | 任意 | 詳細説明 | Firestore /reports/{reportId} |
| ステータス | String | 自動記録 | 審査状態管理 | Firestore /reports/{reportId} |
| 作成日時 | Timestamp | 自動記録 | データ管理 | Firestore /reports/{reportId} |

**保持期間**: 審査完了後90日間
**削除方法**: 90日後に自動削除（要実装）

#### 1.8 画像ファイル (Firebase Storage)

| データ項目 | データ型 | 必須/任意 | 収集目的 | 保存場所 |
|-----------|---------|----------|---------|---------|
| 公園写真 | Image | 任意 | 公園情報提供 | Storage /parks/{parkId}/{imageId} |
| レビュー写真 | Image | 任意 | レビュー情報提供 | Storage /reviews/{reviewId}/{imageId} |
| プロフィール写真 | Image | 任意 | ユーザー識別 | Storage /users/{userId}/profile |

**保持期間**: 関連データが存在する間
**削除方法**: アカウント削除時に自動削除（要実装改善）

#### 1.9 ローカルストレージデータ (AsyncStorage)

| データ項目 | データ型 | 必須/任意 | 収集目的 | 保存場所 |
|-----------|---------|----------|---------|---------|
| 最近見た公園 | JSON Array | 自動記録 | ユーザー体験向上 | デバイスローカル |

**保持期間**: デバイスにアプリがインストールされている間
**削除方法**: アカウント削除時、またはアプリ削除時

#### 1.10 技術情報・分析データ

| データ項目 | データ型 | 必須/任意 | 収集目的 | 保存場所 |
|-----------|---------|----------|---------|---------|
| デバイスタイプ | String | 自動収集 | クラッシュ分析 | Firebase Crashlytics |
| OSバージョン | String | 自動収集 | クラッシュ分析 | Firebase Crashlytics |
| アプリバージョン | String | 自動収集 | クラッシュ分析 | Firebase Crashlytics |
| クラッシュログ | Log | 自動収集 | バグ修正 | Firebase Crashlytics |

**保持期間**: 90日間
**削除方法**: 90日後に自動削除

#### 1.11 広告関連データ (Google AdMob)

| データ項目 | データ型 | 必須/任意 | 収集目的 | 保存場所 |
|-----------|---------|----------|---------|---------|
| 広告ID | String | 自動収集 | 広告配信 | Google AdMob |
| デバイス情報 | Various | 自動収集 | 広告最適化 | Google AdMob |

**保持期間**: Google AdMobのポリシーに準拠
**削除方法**: デバイスの広告設定でリセット可能

---

### 2. データフローマップ

```
ユーザー登録
  └→ Firebase Authentication (メール、パスワード)
      └→ Firestore users コレクション (プロフィール情報)

公園投稿
  └→ Firebase Storage (画像アップロード)
      └→ Firestore parks コレクション (公園情報 + 画像URL)

レビュー投稿
  └→ Firebase Storage (画像アップロード)
      └→ Firestore reviews コレクション (レビュー + 画像URL)

お気に入り・訪問履歴
  └→ Firestore favorites コレクション

最近見た公園
  └→ AsyncStorage (ローカルストレージ)

アカウント削除
  ├→ Firestore favorites コレクション (削除)
  ├→ Firestore reviews コレクション (削除)
  ├→ AsyncStorage recentParks (削除)
  └→ Firebase Authentication (アカウント削除)
```

---

### 3. 第三者サービスとのデータ共有

#### 3.1 Google Firebase

**共有データ**:
- すべてのユーザーデータ (認証、Firestore、Storage)
- 技術情報 (クラッシュレポート)

**共有目的**: アプリケーションインフラストラクチャ
**データ処理場所**: 米国
**プライバシーポリシー**: https://firebase.google.com/support/privacy

#### 3.2 Google AdMob

**共有データ**:
- 広告ID
- デバイス情報
- アプリ使用情報

**共有目的**: 広告配信
**データ処理場所**: 米国
**プライバシーポリシー**: https://support.google.com/admob/answer/6128543

#### 3.3 その他の第三者サービス

現時点で他の第三者サービスとのデータ共有はありません。

---

### 4. ユーザー権利の実装状況

| 権利 | 実装状況 | 実装方法 |
|-----|---------|---------|
| データアクセス権 | ✅ 実装済み | アプリ内でマイページから閲覧可能 |
| データ訂正権 | ✅ 実装済み | アプリ内で編集可能 |
| データ削除権 | ✅ 実装済み | アカウント削除機能 |
| データポータビリティ権 | ❌ 未実装 | 今後の実装予定 |
| 処理制限権 | ⚠️ 部分実装 | ブロック機能で一部実現 |

---

### 5. データセキュリティ対策

#### 5.1 転送時の暗号化
- すべての通信はHTTPS/TLS 1.3で暗号化

#### 5.2 保存時の暗号化
- Firebase Authentication: パスワードはbcryptでハッシュ化
- Firestore: Googleによる自動暗号化
- Storage: Googleによる自動暗号化

#### 5.3 アクセス制御
- Firestore Security Rules による細かいアクセス制御
- Storage Rules による画像アクセス制御
- ユーザー認証必須

#### 5.4 監査とログ
- Firebase Crashlytics によるエラー監視
- Firestore のセキュリティルールログ

---

### 6. データ保持期間まとめ

| データカテゴリ | 保持期間 | 削除方法 |
|--------------|---------|---------|
| アカウント情報 | アカウント有効期間中 | アカウント削除で即時削除 |
| プロフィール情報 | アカウント有効期間中 | アカウント削除で即時削除 |
| 公園投稿 | アカウント有効期間中 | アカウント削除で削除（要改善） |
| レビュー | アカウント有効期間中 | アカウント削除で即時削除 |
| お気に入り・訪問履歴 | アカウント有効期間中 | アカウント削除で即時削除 |
| 画像ファイル | 関連データ存在期間中 | アカウント削除で削除（要改善） |
| レビュー報告 | 審査完了後90日 | 自動削除（要実装） |
| クラッシュログ | 90日 | 自動削除 |

---

### 7. 改善が必要な項目

#### 7.1 公園投稿の削除
**現状**: アカウント削除時に公園投稿が残る可能性
**改善案**: アカウント削除時に投稿者の公園も削除するか、匿名化

#### 7.2 画像の完全削除
**現状**: Storage内の画像削除が不完全な可能性
**改善案**: アカウント削除時にStorage内の全画像を確実に削除

#### 7.3 レビュー報告の自動削除
**現状**: 報告データが無期限に保存される
**改善案**: Cloud Functionsで90日後の自動削除を実装

#### 7.4 データエクスポート機能
**現状**: ユーザーが自分のデータをエクスポートできない
**改善案**: データポータビリティ機能の実装

---

### 8. コンプライアンスチェックリスト

#### GDPR対応
- [x] データ収集の透明性 (プライバシーポリシーで開示)
- [x] 同意の取得 (アカウント作成時)
- [x] データアクセス権 (アプリ内で実現)
- [x] 削除権 (アカウント削除機能)
- [ ] データポータビリティ (未実装)
- [x] 処理の合法性 (ユーザー同意ベース)

#### 日本の個人情報保護法対応
- [x] 利用目的の通知 (プライバシーポリシーで開示)
- [x] 適正取得 (不正な手段で取得していない)
- [x] 安全管理措置 (暗号化、アクセス制御)
- [x] 第三者提供の制限 (必要最小限)
- [x] 開示請求への対応 (アプリ内で実現)

#### App Store Review Guidelines
- [x] プライバシーポリシーの公開
- [x] データ収集の開示
- [x] ユーザーの同意取得
- [x] セキュリティ対策

---

## English Version

### 1. Data Collection Overview

#### 1.1 Account Information (Firebase Authentication)

| Data Item | Data Type | Required/Optional | Collection Purpose | Storage Location |
|-----------|-----------|-------------------|-------------------|------------------|
| Email Address | String | Required | User authentication, account recovery | Firebase Authentication |
| UID (User ID) | String | Auto-generated | User identification | Firebase Authentication |
| Password | String (Hashed) | Required | User authentication | Firebase Authentication |
| Account Creation Date | Timestamp | Auto-recorded | Account management | Firebase Authentication |
| Last Login Date | Timestamp | Auto-recorded | Security monitoring | Firebase Authentication |

**Retention Period**: While account is active
**Deletion Method**: Automatically deleted upon account deletion

#### 1.2 Profile Information (Cloud Firestore: users collection)

| Data Item | Data Type | Required/Optional | Collection Purpose | Storage Location |
|-----------|-----------|-------------------|-------------------|------------------|
| Display Name | String | Optional | User identification, community features | Firestore /users/{userId} |
| Profile Photo URL | String | Optional | User identification, community features | Firestore /users/{userId} |
| Creation Date | Timestamp | Auto-recorded | Data management | Firestore /users/{userId} |

**Retention Period**: While account is active
**Deletion Method**: Automatically deleted upon account deletion

#### 1.3 Park Submission Data (Cloud Firestore: parks collection)

| Data Item | Data Type | Required/Optional | Collection Purpose | Storage Location |
|-----------|-----------|-------------------|-------------------|------------------|
| Park Name | String | Required | Park identification, search | Firestore /parks/{parkId} |
| Address | String | Required | Location info, search | Firestore /parks/{parkId} |
| Latitude/Longitude | GeoPoint | Required | Map display, nearby search | Firestore /parks/{parkId} |
| Description | String | Optional | Park information | Firestore /parks/{parkId} |
| Main Image URL | String | Optional | Visual display | Firestore /parks/{parkId} |
| Image URLs Array | Array<String> | Optional | Visual display | Firestore /parks/{parkId} |
| Creator UID | String | Auto-recorded | Data management, access control | Firestore /parks/{parkId} |
| Creation Date | Timestamp | Auto-recorded | Data management | Firestore /parks/{parkId} |

**Retention Period**: While account is active or until park is deleted
**Deletion Method**: Deleted upon account deletion (requires improvement)

#### 1.4 Review Data (Cloud Firestore: reviews collection)

| Data Item | Data Type | Required/Optional | Collection Purpose | Storage Location |
|-----------|-----------|-------------------|-------------------|------------------|
| Rating (1-5) | Number | Required | Park rating | Firestore /reviews/{reviewId} |
| Comment | String | Optional | Detailed review | Firestore /reviews/{reviewId} |
| Photo URLs Array | Array<String> | Optional | Visual review | Firestore /reviews/{reviewId} |
| Creator UID | String | Auto-recorded | Data management, access control | Firestore /reviews/{reviewId} |
| Creator Name | String | Auto-fetched | Display purposes | Firestore /reviews/{reviewId} |
| Park ID | String | Auto-recorded | Park association | Firestore /reviews/{reviewId} |
| Creation Date | Timestamp | Auto-recorded | Data management, sorting | Firestore /reviews/{reviewId} |

**Retention Period**: While account is active or until review is deleted
**Deletion Method**: Automatically deleted upon account deletion

#### 1.5 Favorites & Visit History (Cloud Firestore: favorites collection)

| Data Item | Data Type | Required/Optional | Collection Purpose | Storage Location |
|-----------|-----------|-------------------|-------------------|------------------|
| User ID | String | Auto-recorded | User identification | Firestore /favorites/{favoriteId} |
| Park ID | String | Required | Park association | Firestore /favorites/{favoriteId} |
| Type | String | Required | Favorite type (favorite/wantToVisit/visited) | Firestore /favorites/{favoriteId} |
| Creation Date | Timestamp | Auto-recorded | Data management | Firestore /favorites/{favoriteId} |

**Retention Period**: While account is active or until deleted
**Deletion Method**: Automatically deleted upon account deletion

#### 1.6 User Block Information (Cloud Firestore: users/{userId}/blockedUsers)

| Data Item | Data Type | Required/Optional | Collection Purpose | Storage Location |
|-----------|-----------|-------------------|-------------------|------------------|
| Blocked User ID | String | Auto-recorded | Block feature | Firestore /users/{userId}/blockedUsers/{blockedUserId} |
| Block Date | Timestamp | Auto-recorded | Data management | Firestore /users/{userId}/blockedUsers/{blockedUserId} |

**Retention Period**: While account is active or until unblocked
**Deletion Method**: Automatically deleted upon account deletion

#### 1.7 Review Report Data (Cloud Firestore: reports collection)

| Data Item | Data Type | Required/Optional | Collection Purpose | Storage Location |
|-----------|-----------|-------------------|-------------------|------------------|
| Review ID | String | Auto-recorded | Report target identification | Firestore /reports/{reportId} |
| Reporter UID | String | Auto-recorded | Reporter identification | Firestore /reports/{reportId} |
| Reason | String | Required | Report reason | Firestore /reports/{reportId} |
| Detailed Comment | String | Optional | Detailed explanation | Firestore /reports/{reportId} |
| Status | String | Auto-recorded | Review status management | Firestore /reports/{reportId} |
| Creation Date | Timestamp | Auto-recorded | Data management | Firestore /reports/{reportId} |

**Retention Period**: 90 days after review completion
**Deletion Method**: Auto-deleted after 90 days (requires implementation)

#### 1.8 Image Files (Firebase Storage)

| Data Item | Data Type | Required/Optional | Collection Purpose | Storage Location |
|-----------|-----------|-------------------|-------------------|------------------|
| Park Photos | Image | Optional | Park information | Storage /parks/{parkId}/{imageId} |
| Review Photos | Image | Optional | Review information | Storage /reviews/{reviewId}/{imageId} |
| Profile Photos | Image | Optional | User identification | Storage /users/{userId}/profile |

**Retention Period**: While related data exists
**Deletion Method**: Deleted upon account deletion (requires improvement)

#### 1.9 Local Storage Data (AsyncStorage)

| Data Item | Data Type | Required/Optional | Collection Purpose | Storage Location |
|-----------|-----------|-------------------|-------------------|------------------|
| Recently Viewed Parks | JSON Array | Auto-recorded | User experience enhancement | Device local storage |

**Retention Period**: While app is installed on device
**Deletion Method**: Upon account deletion or app uninstall

#### 1.10 Technical Information & Analytics Data

| Data Item | Data Type | Required/Optional | Collection Purpose | Storage Location |
|-----------|-----------|-------------------|-------------------|------------------|
| Device Type | String | Auto-collected | Crash analysis | Firebase Crashlytics |
| OS Version | String | Auto-collected | Crash analysis | Firebase Crashlytics |
| App Version | String | Auto-collected | Crash analysis | Firebase Crashlytics |
| Crash Logs | Log | Auto-collected | Bug fixes | Firebase Crashlytics |

**Retention Period**: 90 days
**Deletion Method**: Auto-deleted after 90 days

#### 1.11 Advertising Data (Google AdMob)

| Data Item | Data Type | Required/Optional | Collection Purpose | Storage Location |
|-----------|-----------|-------------------|-------------------|------------------|
| Advertising ID | String | Auto-collected | Ad delivery | Google AdMob |
| Device Information | Various | Auto-collected | Ad optimization | Google AdMob |

**Retention Period**: According to Google AdMob policy
**Deletion Method**: Can be reset in device ad settings

---

### 2. Data Flow Map

```
User Registration
  └→ Firebase Authentication (email, password)
      └→ Firestore users collection (profile info)

Park Submission
  └→ Firebase Storage (image upload)
      └→ Firestore parks collection (park info + image URLs)

Review Submission
  └→ Firebase Storage (image upload)
      └→ Firestore reviews collection (review + image URLs)

Favorites & Visit History
  └→ Firestore favorites collection

Recently Viewed Parks
  └→ AsyncStorage (local storage)

Account Deletion
  ├→ Firestore favorites collection (delete)
  ├→ Firestore reviews collection (delete)
  ├→ AsyncStorage recentParks (delete)
  └→ Firebase Authentication (account deletion)
```

---

### 3. Data Sharing with Third Parties

#### 3.1 Google Firebase

**Shared Data**:
- All user data (authentication, Firestore, Storage)
- Technical information (crash reports)

**Purpose**: Application infrastructure
**Data Processing Location**: USA
**Privacy Policy**: https://firebase.google.com/support/privacy

#### 3.2 Google AdMob

**Shared Data**:
- Advertising ID
- Device information
- App usage information

**Purpose**: Ad delivery
**Data Processing Location**: USA
**Privacy Policy**: https://support.google.com/admob/answer/6128543

#### 3.3 Other Third-Party Services

No other third-party data sharing at this time.

---

### 4. User Rights Implementation Status

| Right | Implementation Status | Implementation Method |
|-------|----------------------|----------------------|
| Data Access Right | ✅ Implemented | Viewable from My Page in app |
| Data Correction Right | ✅ Implemented | Editable within app |
| Data Deletion Right | ✅ Implemented | Account deletion feature |
| Data Portability Right | ❌ Not Implemented | Planned for future |
| Processing Restriction Right | ⚠️ Partially Implemented | Partially realized through block feature |

---

### 5. Data Security Measures

#### 5.1 Encryption in Transit
- All communications encrypted with HTTPS/TLS 1.3

#### 5.2 Encryption at Rest
- Firebase Authentication: Passwords hashed with bcrypt
- Firestore: Automatic encryption by Google
- Storage: Automatic encryption by Google

#### 5.3 Access Control
- Fine-grained access control via Firestore Security Rules
- Image access control via Storage Rules
- User authentication required

#### 5.4 Auditing and Logging
- Error monitoring via Firebase Crashlytics
- Firestore security rules logging

---

### 6. Data Retention Summary

| Data Category | Retention Period | Deletion Method |
|--------------|-----------------|----------------|
| Account Information | While account is active | Immediate deletion upon account deletion |
| Profile Information | While account is active | Immediate deletion upon account deletion |
| Park Submissions | While account is active | Deleted upon account deletion (requires improvement) |
| Reviews | While account is active | Immediate deletion upon account deletion |
| Favorites & Visit History | While account is active | Immediate deletion upon account deletion |
| Image Files | While related data exists | Deleted upon account deletion (requires improvement) |
| Review Reports | 90 days after review completion | Auto-deletion (requires implementation) |
| Crash Logs | 90 days | Auto-deletion |

---

### 7. Areas Requiring Improvement

#### 7.1 Park Submission Deletion
**Current**: Park submissions may remain after account deletion
**Improvement**: Delete or anonymize creator's parks upon account deletion

#### 7.2 Complete Image Deletion
**Current**: Storage image deletion may be incomplete
**Improvement**: Ensure all images in Storage are deleted upon account deletion

#### 7.3 Auto-deletion of Review Reports
**Current**: Report data stored indefinitely
**Improvement**: Implement auto-deletion after 90 days via Cloud Functions

#### 7.4 Data Export Feature
**Current**: Users cannot export their data
**Improvement**: Implement data portability feature

---

### 8. Compliance Checklist

#### GDPR Compliance
- [x] Transparency of data collection (disclosed in privacy policy)
- [x] Consent obtained (during account creation)
- [x] Data access right (realized within app)
- [x] Right to deletion (account deletion feature)
- [ ] Data portability (not implemented)
- [x] Lawfulness of processing (based on user consent)

#### Japan Personal Information Protection Act Compliance
- [x] Notification of purpose of use (disclosed in privacy policy)
- [x] Proper acquisition (not acquired by illegal means)
- [x] Security management measures (encryption, access control)
- [x] Restriction on third-party provision (minimum necessary)
- [x] Response to disclosure requests (realized within app)

#### App Store Review Guidelines
- [x] Privacy policy published
- [x] Data collection disclosed
- [x] User consent obtained
- [x] Security measures implemented

---

**Contact for Data Privacy Inquiries**:
- **Email**: kamui00002@yahoo.co.jp
- **App Name**: ParkPedia

---

**Last Updated**: December 19, 2025
