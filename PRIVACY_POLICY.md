# プライバシーポリシー / Privacy Policy

**最終更新日 / Last Updated**: 2025年11月27日 / November 27, 2025

---

## 日本語版

### 1. はじめに

ParkPedia（以下「当アプリ」）をご利用いただきありがとうございます。本プライバシーポリシーは、当アプリがどのように個人情報を収集、使用、保護するかについて説明します。

当アプリを利用することで、本プライバシーポリシーに同意したものとみなされます。

### 2. 収集する情報

#### 2.1 アカウント情報
- メールアドレス
- パスワード（暗号化して保存）
- プロフィール情報（任意）
  - 表示名
  - プロフィール写真

#### 2.2 ユーザー生成コンテンツ
- 公園の投稿（公園名、住所、説明、写真）
- レビュー（評価、コメント）
- お気に入り、訪問履歴

#### 2.3 位置情報
- 公園の位置情報（緯度・経度）
- 注: 当アプリはユーザーの現在位置を自動的に収集しません

#### 2.4 技術情報
- デバイスの種類とOS
- アプリの使用状況（クラッシュレポートなど）

### 3. 情報の使用方法

収集した情報は以下の目的で使用されます：

- サービスの提供と機能の実現
- ユーザーエクスペリエンスの向上
- 不適切なコンテンツの監視と削除
- ユーザーサポートの提供
- セキュリティとポリシー違反の防止

### 4. 情報の共有

#### 4.1 公開情報
以下の情報は他のユーザーに表示されます：
- 公園の投稿（公園名、住所、説明、写真）
- レビュー（評価、コメント、投稿者の表示名）
- プロフィール情報（表示名、プロフィール写真）

#### 4.2 非公開情報
以下の情報は公開されません：
- メールアドレス
- パスワード
- お気に入りリスト、訪問履歴

#### 4.3 第三者への開示
当アプリは、以下の場合を除き、個人情報を第三者に開示しません：
- ユーザーの同意がある場合
- 法的義務がある場合
- サービス提供に必要な範囲（Firebase等のインフラストラクチャプロバイダー）

**第三者サービスとのデータ共有**:

1. **Google Firebase（米国）**
   - 共有データ: すべてのユーザーデータ（認証情報、投稿、レビュー、画像等）
   - 目的: アプリケーションインフラストラクチャの提供
   - プライバシーポリシー: https://firebase.google.com/support/privacy

2. **Google AdMob（米国）**
   - 共有データ: 広告ID、デバイス情報、アプリ使用情報
   - 目的: 広告配信
   - オプトアウト: デバイスの広告設定から可能
   - プライバシーポリシー: https://support.google.com/admob/answer/6128543

3. **Firebase Crashlytics（米国）**
   - 共有データ: クラッシュログ、デバイス情報、アプリバージョン
   - 目的: バグ修正とアプリの安定性向上
   - 保持期間: 90日間

### 5. データの保存とセキュリティ

#### 5.1 データの保存場所
- すべてのデータはGoogle Firebase（米国）に保存されます
- Firebase Authentication による安全な認証
- Firestore Security Rules によるアクセス制御
- データは暗号化して送信・保存されます

#### 5.2 セキュリティ対策
- **転送時の暗号化**: すべての通信はHTTPS/TLS 1.3で暗号化
- **保存時の暗号化**: パスワードはbcryptでハッシュ化、Firestoreデータは自動暗号化
- **アクセス制御**: ユーザー認証必須、細かいアクセス権限設定
- **監視**: Firebase Crashlyticsによるエラー監視

#### 5.3 データ保持期間

| データカテゴリ | 保持期間 |
|--------------|---------|
| アカウント情報 | アカウント有効期間中 |
| プロフィール情報 | アカウント有効期間中 |
| 公園投稿 | アカウント有効期間中または削除するまで |
| レビュー | アカウント有効期間中または削除するまで |
| お気に入り・訪問履歴 | アカウント有効期間中または削除するまで |
| 画像ファイル | 関連データが存在する間 |
| レビュー報告 | 審査完了後90日間 |
| クラッシュログ | 90日間 |

詳細は「データ保持ポリシー」（DATA_RETENTION_POLICY.md）をご覧ください。

### 6. ユーザーの権利

#### 6.1 アカウント削除
- マイページからいつでもアカウントを削除できます
- アカウント削除時、すべての個人データが削除されます
- 投稿した公園やレビューも削除されます

**アカウント削除の手順**:
1. アプリにログイン
2. 画面下部のタブから「マイページ」をタップ
3. 「アカウントを削除」ボタンをタップ
4. 確認ダイアログが表示されるので、内容を確認
5. 「削除」をタップして確定
6. データが完全に削除され、ログイン画面に戻ります

**削除されるデータ**:
- アカウント情報（メールアドレス、パスワード）
- プロフィール情報（表示名、プロフィール写真）
- 投稿したレビュー（評価、コメント、写真）
- お気に入りリスト、「行ってみたい!」リスト、訪問履歴
- 最近見た公園の履歴
- ブロックリスト

**注意事項**:
- 削除されたデータは復元できません
- セキュリティのため、最近ログインしていない場合は再ログインが必要になることがあります
- 削除処理は通常5秒以内に完了します

#### 6.2 データへのアクセス
- 自分のデータの閲覧・編集がアプリ内で可能です
- マイページから投稿したレビューを確認できます
- お気に入りリストや訪問履歴を閲覧できます

#### 6.3 ユーザーブロック
- 不快なユーザーをブロックすることができます
- ブロックしたユーザーのレビューは表示されなくなります

### 7. 不適切なコンテンツの管理

#### 7.1 ゼロトレランスポリシー
- 不適切なコンテンツ（攻撃的、違法、有害なコンテンツ）を禁止します
- 違反コンテンツは24時間以内に削除します

#### 7.2 報告機能
- 不適切なレビューを報告できます
- 報告は24時間以内に審査されます

### 8. 広告

- 当アプリはGoogle AdMobを使用して広告を表示します
- 広告の表示には最小限の情報が使用されます
- パーソナライズド広告のオプトアウトが可能です

### 9. 子供のプライバシー

- 当アプリは13歳未満の子供を対象としていません
- 13歳未満の子供の個人情報を故意に収集しません

### 10. プライバシーポリシーの変更

- 本プライバシーポリシーは随時更新される場合があります
- 重要な変更がある場合は、アプリ内で通知します

### 11. お問い合わせ

プライバシーに関するご質問やご懸念がある場合は、以下までご連絡ください：

**メール**: kamui00002@yahoo.co.jp

---

## English Version

### 1. Introduction

Thank you for using ParkPedia (the "App"). This Privacy Policy explains how the App collects, uses, and protects your personal information.

By using the App, you agree to this Privacy Policy.

### 2. Information We Collect

#### 2.1 Account Information
- Email address
- Password (encrypted)
- Profile information (optional)
  - Display name
  - Profile photo

#### 2.2 User-Generated Content
- Park submissions (park name, address, description, photos)
- Reviews (ratings, comments)
- Favorites, visit history

#### 2.3 Location Information
- Park location (latitude, longitude)
- Note: The App does not automatically collect your current location

#### 2.4 Technical Information
- Device type and OS
- App usage (crash reports, etc.)

### 3. How We Use Information

We use collected information for:

- Providing and operating the service
- Improving user experience
- Monitoring and removing inappropriate content
- Providing user support
- Preventing security and policy violations

### 4. Information Sharing

#### 4.1 Public Information
The following information is visible to other users:
- Park submissions (park name, address, description, photos)
- Reviews (ratings, comments, poster's display name)
- Profile information (display name, profile photo)

#### 4.2 Private Information
The following information is NOT public:
- Email address
- Password
- Favorites list, visit history

#### 4.3 Third-Party Disclosure
We do not disclose personal information to third parties except:
- With user consent
- When legally required
- To service providers necessary for operation (Firebase, etc.)

**Data Sharing with Third-Party Services**:

1. **Google Firebase (USA)**
   - Shared Data: All user data (authentication, posts, reviews, images, etc.)
   - Purpose: Application infrastructure provision
   - Privacy Policy: https://firebase.google.com/support/privacy

2. **Google AdMob (USA)**
   - Shared Data: Advertising ID, device information, app usage information
   - Purpose: Ad delivery
   - Opt-out: Available through device ad settings
   - Privacy Policy: https://support.google.com/admob/answer/6128543

3. **Firebase Crashlytics (USA)**
   - Shared Data: Crash logs, device information, app version
   - Purpose: Bug fixes and app stability improvement
   - Retention Period: 90 days

### 5. Data Storage and Security

#### 5.1 Data Storage Location
- All data is stored on Google Firebase (USA)
- Secure authentication via Firebase Authentication
- Access control via Firestore Security Rules
- Data is encrypted in transit and at rest

#### 5.2 Security Measures
- **Encryption in Transit**: All communications encrypted with HTTPS/TLS 1.3
- **Encryption at Rest**: Passwords hashed with bcrypt, Firestore data automatically encrypted
- **Access Control**: User authentication required, fine-grained permission settings
- **Monitoring**: Error monitoring via Firebase Crashlytics

#### 5.3 Data Retention Periods

| Data Category | Retention Period |
|--------------|-----------------|
| Account Information | While account is active |
| Profile Information | While account is active |
| Park Submissions | While account is active or until deleted |
| Reviews | While account is active or until deleted |
| Favorites & Visit History | While account is active or until deleted |
| Image Files | While related data exists |
| Review Reports | 90 days after review completion |
| Crash Logs | 90 days |

For details, see "Data Retention Policy" (DATA_RETENTION_POLICY.md).

### 6. User Rights

#### 6.1 Account Deletion
- You can delete your account anytime from the My Page
- All personal data is deleted upon account deletion
- Parks and reviews you posted will also be deleted

**Account Deletion Steps**:
1. Log in to the app
2. Tap "My Page" from the bottom tab bar
3. Tap the "Delete Account" button
4. Review the confirmation dialog
5. Tap "Delete" to confirm
6. Your data will be completely deleted and you'll return to the login screen

**Data to be Deleted**:
- Account information (email address, password)
- Profile information (display name, profile photo)
- Posted reviews (ratings, comments, photos)
- Favorites list, "Want to Visit!" list, visit history
- Recently viewed parks history
- Block list

**Important Notes**:
- Deleted data cannot be recovered
- For security reasons, you may need to re-login if you haven't logged in recently
- Deletion process usually completes within 5 seconds

#### 6.2 Data Access
- You can view and edit your data within the App
- View your posted reviews from My Page
- Access your favorites list and visit history

#### 6.3 User Blocking
- You can block users you find objectionable
- Reviews from blocked users will not be displayed

### 7. Inappropriate Content Management

#### 7.1 Zero Tolerance Policy
- Inappropriate content (offensive, illegal, harmful) is prohibited
- Violations are removed within 24 hours

#### 7.2 Reporting Feature
- You can report inappropriate reviews
- Reports are reviewed within 24 hours

### 8. Advertising

- The App uses Google AdMob to display ads
- Minimal information is used for ad display
- You can opt out of personalized ads

### 9. Children's Privacy

- The App is not intended for children under 13
- We do not knowingly collect personal information from children under 13

### 10. Changes to Privacy Policy

- This Privacy Policy may be updated from time to time
- Important changes will be notified within the App

### 11. Contact Us

If you have questions or concerns about privacy, please contact:

**Email**: kamui00002@yahoo.co.jp

---

## Firebase データ処理の詳細 / Firebase Data Processing Details

### データの保存場所 / Data Storage Location
- すべてのユーザーデータはGoogle Firebase（米国）に保存されます
- All user data is stored on Google Firebase (USA)

### 使用するFirebaseサービス / Firebase Services Used
- **Firebase Authentication**: ユーザー認証 / User authentication
- **Cloud Firestore**: データベース / Database
- **Firebase Storage**: 画像保存 / Image storage

### データ保持期間 / Data Retention
- アカウントが有効な間、データは保持されます
- Data is retained while the account is active
- アカウント削除時、すべてのデータは削除されます
- All data is deleted upon account deletion

詳細なデータ保持ポリシーは「DATA_RETENTION_POLICY.md」をご参照ください。
For detailed data retention policy, please refer to "DATA_RETENTION_POLICY.md".

---

## 準拠法 / Governing Law

本プライバシーポリシーは日本法に準拠し、解釈されます。

This Privacy Policy is governed by and construed in accordance with the laws of Japan.

---

**連絡先 / Contact Information**:
- **アプリ名 / App Name**: ParkPedia
- **メール / Email**: kamui00002@yahoo.co.jp
- **ウェブサイト / Website**: https://kamui00002.github.io/ParkPedia/privacy-policy.html

---

**重要な注意 / Important Note**:

このプライバシーポリシーをウェブサイトで公開し、App Store ConnectにそのURLを提供する必要があります。

This Privacy Policy must be hosted on a website and the URL must be provided to App Store Connect.

**推奨ホスティング方法 / Recommended Hosting Methods**:
1. GitHub Pagesで公開 / Publish on GitHub Pages
2. 独自ドメインのウェブサイト / Your own website domain
3. Firebase Hosting / Firebase Hosting

**GitHub Pagesでの公開手順 / Publishing on GitHub Pages**:
1. GitHubリポジトリの設定で「Pages」を有効化
2. このファイルを`docs/privacy-policy.md`に配置
3. GitHub Pagesの設定で`/docs`フォルダを選択
4. URLは`https://<username>.github.io/<repository>/privacy-policy`になります

---

**最終更新日 / Last Updated**: 2025年11月27日 / November 27, 2025
