# データ保持ポリシー / Data Retention Policy

**最終更新日 / Last Updated**: 2025年12月19日 / December 19, 2025

このドキュメントは、ParkPediaアプリケーションにおけるデータ保持と削除のポリシーを定義します。

---

## 日本語版

### 1. ポリシーの目的

このデータ保持ポリシーは、以下の目的で策定されています:

1. **法令遵守**: 個人情報保護法、GDPR等の法令要件を満たす
2. **プライバシー保護**: ユーザーのプライバシー権を尊重し、不要なデータを保持しない
3. **セキュリティ**: データ漏洩のリスクを最小化
4. **透明性**: データ保持期間をユーザーに明確に示す
5. **運用効率**: ストレージコストの最適化

---

### 2. データカテゴリ別保持ポリシー

#### 2.1 アカウント情報

| データ項目 | 保持期間 | 削除トリガー | 削除方法 | 例外 |
|-----------|---------|------------|---------|-----|
| メールアドレス | アカウント有効期間中 | アカウント削除 | 即時完全削除 | なし |
| UID | アカウント有効期間中 | アカウント削除 | 即時完全削除 | なし |
| パスワード (ハッシュ) | アカウント有効期間中 | アカウント削除 | 即時完全削除 | なし |
| アカウント作成日時 | アカウント有効期間中 | アカウント削除 | 即時完全削除 | なし |
| 最終ログイン日時 | アカウント有効期間中 | アカウント削除 | 即時完全削除 | なし |

**保持理由**: ユーザー認証とアカウント管理に必要
**法的根拠**: ユーザーとの契約履行のため

#### 2.2 プロフィール情報

| データ項目 | 保持期間 | 削除トリガー | 削除方法 | 例外 |
|-----------|---------|------------|---------|-----|
| 表示名 | アカウント有効期間中 | アカウント削除 | 即時完全削除 | なし |
| プロフィール写真URL | アカウント有効期間中 | アカウント削除 | 即時完全削除 | なし |
| 作成日時 | アカウント有効期間中 | アカウント削除 | 即時完全削除 | なし |

**保持理由**: ユーザー識別とコミュニティ機能の提供
**法的根拠**: ユーザーの同意

#### 2.3 公園投稿データ

| データ項目 | 保持期間 | 削除トリガー | 削除方法 | 例外 |
|-----------|---------|------------|---------|-----|
| 公園情報 | アカウント有効期間中 | アカウント削除または手動削除 | 完全削除または匿名化 | 法的要請がある場合 |
| 公園画像 | アカウント有効期間中 | アカウント削除または手動削除 | Storage から完全削除 | なし |
| 作成者UID | アカウント有効期間中 | アカウント削除 | 削除または匿名化 | なし |

**保持理由**: コミュニティデータベースの維持
**法的根拠**: ユーザーの同意
**注意事項**: アカウント削除時の処理は要改善（現在は残る可能性あり）

#### 2.4 レビューデータ

| データ項目 | 保持期間 | 削除トリガー | 削除方法 | 例外 |
|-----------|---------|------------|---------|-----|
| レビュー本文 | アカウント有効期間中 | アカウント削除または手動削除 | 即時完全削除 | なし |
| レビュー写真 | アカウント有効期間中 | アカウント削除または手動削除 | Storage から完全削除 | なし |
| 評価 | アカウント有効期間中 | アカウント削除または手動削除 | 即時完全削除 | なし |

**保持理由**: 公園の評価情報提供
**法的根拠**: ユーザーの同意

#### 2.5 お気に入り・訪問履歴

| データ項目 | 保持期間 | 削除トリガー | 削除方法 | 例外 |
|-----------|---------|------------|---------|-----|
| お気に入りリスト | アカウント有効期間中 | アカウント削除または手動削除 | 即時完全削除 | なし |
| 訪問履歴 | アカウント有効期間中 | アカウント削除または手動削除 | 即時完全削除 | なし |

**保持理由**: パーソナライズ機能の提供
**法的根拠**: ユーザーの同意

#### 2.6 ユーザーブロック情報

| データ項目 | 保持期間 | 削除トリガー | 削除方法 | 例外 |
|-----------|---------|------------|---------|-----|
| ブロックリスト | アカウント有効期間中 | アカウント削除またはブロック解除 | 即時完全削除 | なし |

**保持理由**: ユーザー保護機能の提供
**法的根拠**: ユーザーの同意

#### 2.7 レビュー報告データ

| データ項目 | 保持期間 | 削除トリガー | 削除方法 | 例外 |
|-----------|---------|------------|---------|-----|
| 報告情報 | 審査完了後90日 | 90日経過 | 自動削除 | 法的要請がある場合 |
| 報告者情報 | 審査完了後90日 | 90日経過 | 自動削除 | 法的要請がある場合 |

**保持理由**: コンテンツモデレーション、パターン分析
**法的根拠**: 正当な利益（コミュニティの安全維持）
**注意事項**: 自動削除機能は未実装（要実装）

#### 2.8 画像ファイル

| データ項目 | 保持期間 | 削除トリガー | 削除方法 | 例外 |
|-----------|---------|------------|---------|-----|
| 公園写真 | 公園データ存在期間中 | 公園削除またはアカウント削除 | Storage から完全削除 | なし |
| レビュー写真 | レビュー存在期間中 | レビュー削除またはアカウント削除 | Storage から完全削除 | なし |
| プロフィール写真 | アカウント有効期間中 | アカウント削除 | Storage から完全削除 | なし |

**保持理由**: ビジュアルコンテンツの提供
**法的根拠**: ユーザーの同意
**注意事項**: 削除処理の完全性を要改善

#### 2.9 ローカルストレージデータ

| データ項目 | 保持期間 | 削除トリガー | 削除方法 | 例外 |
|-----------|---------|------------|---------|-----|
| 最近見た公園 | デバイス上に永続 | アカウント削除またはアプリ削除 | ローカルストレージから削除 | なし |

**保持理由**: ユーザー体験の向上
**法的根拠**: ユーザーの同意

#### 2.10 技術情報・クラッシュログ

| データ項目 | 保持期間 | 削除トリガー | 削除方法 | 例外 |
|-----------|---------|------------|---------|-----|
| クラッシュログ | 90日 | 90日経過 | Firebase による自動削除 | なし |
| デバイス情報 | 90日 | 90日経過 | Firebase による自動削除 | なし |
| エラーログ | 90日 | 90日経過 | Firebase による自動削除 | なし |

**保持理由**: バグ修正、アプリの安定性向上
**法的根拠**: 正当な利益（サービス品質の維持）

#### 2.11 広告関連データ

| データ項目 | 保持期間 | 削除トリガー | 削除方法 | 例外 |
|-----------|---------|------------|---------|-----|
| 広告ID | Google AdMob ポリシーに準拠 | デバイス設定でリセット | ユーザー操作 | なし |
| 広告インプレッション | Google AdMob ポリシーに準拠 | - | Google による管理 | なし |

**保持理由**: 広告配信の最適化
**法的根拠**: ユーザーの同意（オプトアウト可能）

---

### 3. 非アクティブアカウントの取り扱い

#### 3.1 定義
**非アクティブアカウント**: 最終ログインから24ヶ月以上経過したアカウント

#### 3.2 ポリシー（将来実装予定）

| 期間 | アクション | 通知方法 |
|-----|----------|---------|
| 18ヶ月 | 第1回警告メール送信 | 登録メールアドレス |
| 21ヶ月 | 第2回警告メール送信 | 登録メールアドレス |
| 24ヶ月 | アカウント削除予告メール | 登録メールアドレス |
| 24ヶ月+30日 | アカウント自動削除 | - |

**注意**: 現時点では非アクティブアカウントの自動削除は実装されていません

---

### 4. データ削除プロセス

#### 4.1 ユーザー主導の削除

**アカウント削除時の処理フロー**:

```
1. ユーザーが「アカウントを削除」ボタンをタップ
   ↓
2. 確認ダイアログ表示（警告メッセージ）
   ↓
3. ユーザーが確認
   ↓
4. データ削除開始
   ├→ Firestore favorites コレクション削除
   ├→ Firestore reviews コレクション削除
   ├→ Firestore users/{userId} ドキュメント削除
   ├→ AsyncStorage recentParks 削除
   └→ Firebase Authentication アカウント削除
   ↓
5. 完了通知
   ↓
6. ログイン画面へリダイレクト
```

**削除の完了時間**: 通常5秒以内
**削除の不可逆性**: 削除されたデータは復元不可能

#### 4.2 手動削除（個別データ）

| データ種別 | 削除方法 | 削除完了時間 |
|----------|---------|------------|
| レビュー | マイページから削除ボタン | 即時 |
| お気に入り | マイページから削除ボタン | 即時 |
| 公園投稿 | （未実装）将来対応予定 | - |
| プロフィール写真 | （未実装）将来対応予定 | - |

#### 4.3 自動削除（システム）

| データ種別 | 削除タイミング | 実装状況 |
|----------|-------------|---------|
| クラッシュログ | 90日後 | ✅ 実装済み（Firebase） |
| レビュー報告 | 審査完了90日後 | ❌ 未実装 |
| 非アクティブアカウント | 24ヶ月後 | ❌ 未実装 |

---

### 5. バックアップとアーカイブ

#### 5.1 バックアップポリシー

**データベースバックアップ**:
- Firebase の自動バックアップ機能を使用
- バックアップ保持期間: 7日間
- バックアップの暗号化: 有効

**画像バックアップ**:
- Firebase Storage の自動バックアップ機能を使用
- バックアップ保持期間: 30日間

#### 5.2 削除データのバックアップ

**原則**: 削除されたデータはバックアップからも削除
**例外**: 法的要請がある場合のみ、最大90日間保持可能

---

### 6. 法的要請によるデータ保持

#### 6.1 法的根拠

以下の場合、通常の保持期間を超えてデータを保持することがあります:

1. 裁判所命令
2. 法執行機関からの正式な要請
3. 法的訴訟の証拠保全
4. 規制当局の調査

#### 6.2 保持期間の延長

**延長期間**: 法的要請が解除されるまで、または最大5年間
**通知**: 法律で禁止されていない限り、ユーザーに通知

---

### 7. データポータビリティ

#### 7.1 現状

ユーザーが自分のデータをエクスポートする機能は未実装

#### 7.2 将来計画

**実装予定機能**:
- マイページからデータエクスポート機能
- JSON形式でのデータダウンロード
- 以下のデータを含む:
  - プロフィール情報
  - 投稿した公園
  - レビュー
  - お気に入りリスト

---

### 8. データ保持の監査

#### 8.1 定期監査

**頻度**: 6ヶ月ごと
**確認項目**:
- 保持期間の遵守状況
- 削除処理の正常性
- バックアップの適切性

#### 8.2 監査ログ

**記録項目**:
- データ削除イベント
- アカウント削除イベント
- データアクセスログ

**ログ保持期間**: 3年間

---

### 9. ユーザーへの通知義務

#### 9.1 ポリシー変更時

**通知方法**:
- アプリ内通知
- 登録メールアドレスへのメール（重要な変更の場合）

**通知タイミング**: 変更の30日前

#### 9.2 データ侵害時

**通知タイミング**: 侵害を知った時から72時間以内
**通知内容**:
- 侵害の内容
- 影響を受けるデータの範囲
- 講じた対策
- ユーザーが取るべき行動

---

### 10. データ最小化の原則

#### 10.1 収集の最小化

**原則**: 必要最小限のデータのみを収集
**実践**:
- プロフィール情報は任意
- 位置情報は公園登録時のみ
- 連絡先へのアクセスなし

#### 10.2 保持の最小化

**原則**: 必要な期間のみデータを保持
**実践**:
- クラッシュログ: 90日
- レビュー報告: 審査完了後90日（要実装）
- 非アクティブアカウント: 24ヶ月（要実装）

---

### 11. 改善計画

#### 11.1 短期（3ヶ月以内）

- [ ] レビュー報告の自動削除機能実装
- [ ] 公園投稿の削除機能実装
- [ ] Storage画像の完全削除確認機能

#### 11.2 中期（6ヶ月以内）

- [ ] データエクスポート機能実装
- [ ] プロフィール写真削除機能実装
- [ ] 非アクティブアカウント警告システム

#### 11.3 長期（12ヶ月以内）

- [ ] 非アクティブアカウント自動削除機能
- [ ] データ保持監査の自動化
- [ ] GDPR完全準拠の実現

---

### 12. お問い合わせ

データ保持ポリシーに関するご質問は以下までご連絡ください:

**メール**: kamui00002@yahoo.co.jp
**件名**: 「データ保持ポリシーについて」

---

## English Version

### 1. Policy Purpose

This Data Retention Policy is established for the following purposes:

1. **Legal Compliance**: Meet legal requirements including Personal Information Protection Act and GDPR
2. **Privacy Protection**: Respect user privacy rights and avoid retaining unnecessary data
3. **Security**: Minimize data breach risks
4. **Transparency**: Clearly communicate data retention periods to users
5. **Operational Efficiency**: Optimize storage costs

---

### 2. Data Retention Policy by Category

#### 2.1 Account Information

| Data Item | Retention Period | Deletion Trigger | Deletion Method | Exceptions |
|-----------|-----------------|------------------|----------------|------------|
| Email Address | While account is active | Account deletion | Immediate complete deletion | None |
| UID | While account is active | Account deletion | Immediate complete deletion | None |
| Password (Hash) | While account is active | Account deletion | Immediate complete deletion | None |
| Account Creation Date | While account is active | Account deletion | Immediate complete deletion | None |
| Last Login Date | While account is active | Account deletion | Immediate complete deletion | None |

**Retention Reason**: Necessary for user authentication and account management
**Legal Basis**: Contract performance with user

#### 2.2 Profile Information

| Data Item | Retention Period | Deletion Trigger | Deletion Method | Exceptions |
|-----------|-----------------|------------------|----------------|------------|
| Display Name | While account is active | Account deletion | Immediate complete deletion | None |
| Profile Photo URL | While account is active | Account deletion | Immediate complete deletion | None |
| Creation Date | While account is active | Account deletion | Immediate complete deletion | None |

**Retention Reason**: User identification and community features
**Legal Basis**: User consent

#### 2.3 Park Submission Data

| Data Item | Retention Period | Deletion Trigger | Deletion Method | Exceptions |
|-----------|-----------------|------------------|----------------|------------|
| Park Information | While account is active | Account deletion or manual deletion | Complete deletion or anonymization | Legal request |
| Park Images | While account is active | Account deletion or manual deletion | Complete deletion from Storage | None |
| Creator UID | While account is active | Account deletion | Deletion or anonymization | None |

**Retention Reason**: Maintain community database
**Legal Basis**: User consent
**Note**: Account deletion processing requires improvement (may currently remain)

#### 2.4 Review Data

| Data Item | Retention Period | Deletion Trigger | Deletion Method | Exceptions |
|-----------|-----------------|------------------|----------------|------------|
| Review Text | While account is active | Account deletion or manual deletion | Immediate complete deletion | None |
| Review Photos | While account is active | Account deletion or manual deletion | Complete deletion from Storage | None |
| Rating | While account is active | Account deletion or manual deletion | Immediate complete deletion | None |

**Retention Reason**: Provide park rating information
**Legal Basis**: User consent

#### 2.5 Favorites & Visit History

| Data Item | Retention Period | Deletion Trigger | Deletion Method | Exceptions |
|-----------|-----------------|------------------|----------------|------------|
| Favorites List | While account is active | Account deletion or manual deletion | Immediate complete deletion | None |
| Visit History | While account is active | Account deletion or manual deletion | Immediate complete deletion | None |

**Retention Reason**: Provide personalization features
**Legal Basis**: User consent

#### 2.6 User Block Information

| Data Item | Retention Period | Deletion Trigger | Deletion Method | Exceptions |
|-----------|-----------------|------------------|----------------|------------|
| Block List | While account is active | Account deletion or unblock | Immediate complete deletion | None |

**Retention Reason**: Provide user protection features
**Legal Basis**: User consent

#### 2.7 Review Report Data

| Data Item | Retention Period | Deletion Trigger | Deletion Method | Exceptions |
|-----------|-----------------|------------------|----------------|------------|
| Report Information | 90 days after review completion | 90 days elapsed | Auto-deletion | Legal request |
| Reporter Information | 90 days after review completion | 90 days elapsed | Auto-deletion | Legal request |

**Retention Reason**: Content moderation, pattern analysis
**Legal Basis**: Legitimate interest (community safety)
**Note**: Auto-deletion feature not implemented (requires implementation)

#### 2.8 Image Files

| Data Item | Retention Period | Deletion Trigger | Deletion Method | Exceptions |
|-----------|-----------------|------------------|----------------|------------|
| Park Photos | While park data exists | Park deletion or account deletion | Complete deletion from Storage | None |
| Review Photos | While review exists | Review deletion or account deletion | Complete deletion from Storage | None |
| Profile Photos | While account is active | Account deletion | Complete deletion from Storage | None |

**Retention Reason**: Provide visual content
**Legal Basis**: User consent
**Note**: Deletion process completeness requires improvement

#### 2.9 Local Storage Data

| Data Item | Retention Period | Deletion Trigger | Deletion Method | Exceptions |
|-----------|-----------------|------------------|----------------|------------|
| Recently Viewed Parks | Persists on device | Account deletion or app uninstall | Delete from local storage | None |

**Retention Reason**: Improve user experience
**Legal Basis**: User consent

#### 2.10 Technical Information & Crash Logs

| Data Item | Retention Period | Deletion Trigger | Deletion Method | Exceptions |
|-----------|-----------------|------------------|----------------|------------|
| Crash Logs | 90 days | 90 days elapsed | Auto-deletion by Firebase | None |
| Device Information | 90 days | 90 days elapsed | Auto-deletion by Firebase | None |
| Error Logs | 90 days | 90 days elapsed | Auto-deletion by Firebase | None |

**Retention Reason**: Bug fixes, app stability improvement
**Legal Basis**: Legitimate interest (service quality maintenance)

#### 2.11 Advertising Data

| Data Item | Retention Period | Deletion Trigger | Deletion Method | Exceptions |
|-----------|-----------------|------------------|----------------|------------|
| Advertising ID | According to Google AdMob policy | Device settings reset | User action | None |
| Ad Impressions | According to Google AdMob policy | - | Managed by Google | None |

**Retention Reason**: Ad delivery optimization
**Legal Basis**: User consent (opt-out available)

---

### 3. Inactive Account Handling

#### 3.1 Definition
**Inactive Account**: Account with no login for 24+ months

#### 3.2 Policy (Future Implementation)

| Period | Action | Notification Method |
|--------|--------|---------------------|
| 18 months | First warning email | Registered email address |
| 21 months | Second warning email | Registered email address |
| 24 months | Account deletion notice email | Registered email address |
| 24 months + 30 days | Automatic account deletion | - |

**Note**: Automatic deletion of inactive accounts is not currently implemented

---

### 4. Data Deletion Process

#### 4.1 User-Initiated Deletion

**Account Deletion Process Flow**:

```
1. User taps "Delete Account" button
   ↓
2. Confirmation dialog displayed (warning message)
   ↓
3. User confirms
   ↓
4. Data deletion begins
   ├→ Delete Firestore favorites collection
   ├→ Delete Firestore reviews collection
   ├→ Delete Firestore users/{userId} document
   ├→ Delete AsyncStorage recentParks
   └→ Delete Firebase Authentication account
   ↓
5. Completion notification
   ↓
6. Redirect to login screen
```

**Deletion Completion Time**: Usually within 5 seconds
**Deletion Irreversibility**: Deleted data cannot be recovered

#### 4.2 Manual Deletion (Individual Data)

| Data Type | Deletion Method | Completion Time |
|-----------|----------------|-----------------|
| Reviews | Delete button from My Page | Immediate |
| Favorites | Delete button from My Page | Immediate |
| Park Submissions | (Not implemented) Future support planned | - |
| Profile Photo | (Not implemented) Future support planned | - |

#### 4.3 Automatic Deletion (System)

| Data Type | Deletion Timing | Implementation Status |
|-----------|----------------|----------------------|
| Crash Logs | After 90 days | ✅ Implemented (Firebase) |
| Review Reports | 90 days after review completion | ❌ Not Implemented |
| Inactive Accounts | After 24 months | ❌ Not Implemented |

---

### 5. Backup and Archive

#### 5.1 Backup Policy

**Database Backup**:
- Uses Firebase automatic backup feature
- Backup retention period: 7 days
- Backup encryption: Enabled

**Image Backup**:
- Uses Firebase Storage automatic backup feature
- Backup retention period: 30 days

#### 5.2 Deleted Data Backup

**Principle**: Deleted data is also removed from backups
**Exception**: Only in case of legal request, can be retained for up to 90 days

---

### 6. Data Retention Due to Legal Requests

#### 6.1 Legal Basis

Data may be retained beyond normal retention periods in the following cases:

1. Court order
2. Formal request from law enforcement
3. Evidence preservation for legal proceedings
4. Regulatory authority investigation

#### 6.2 Retention Period Extension

**Extension Period**: Until legal request is lifted, or maximum 5 years
**Notification**: Users will be notified unless prohibited by law

---

### 7. Data Portability

#### 7.1 Current Status

User data export feature not implemented

#### 7.2 Future Plans

**Planned Features**:
- Data export feature from My Page
- JSON format data download
- Includes the following data:
  - Profile information
  - Posted parks
  - Reviews
  - Favorites list

---

### 8. Data Retention Audit

#### 8.1 Regular Audits

**Frequency**: Every 6 months
**Verification Items**:
- Compliance with retention periods
- Normality of deletion processes
- Appropriateness of backups

#### 8.2 Audit Logs

**Recorded Items**:
- Data deletion events
- Account deletion events
- Data access logs

**Log Retention Period**: 3 years

---

### 9. User Notification Obligations

#### 9.1 Policy Changes

**Notification Method**:
- In-app notification
- Email to registered address (for significant changes)

**Notification Timing**: 30 days before change

#### 9.2 Data Breaches

**Notification Timing**: Within 72 hours of becoming aware
**Notification Content**:
- Nature of breach
- Scope of affected data
- Measures taken
- Actions users should take

---

### 10. Data Minimization Principle

#### 10.1 Collection Minimization

**Principle**: Collect only minimum necessary data
**Practice**:
- Profile information is optional
- Location information only for park registration
- No contact access

#### 10.2 Retention Minimization

**Principle**: Retain data only for necessary period
**Practice**:
- Crash logs: 90 days
- Review reports: 90 days after review completion (requires implementation)
- Inactive accounts: 24 months (requires implementation)

---

### 11. Improvement Plan

#### 11.1 Short-term (Within 3 months)

- [ ] Implement auto-deletion of review reports
- [ ] Implement park submission deletion feature
- [ ] Implement Storage image complete deletion verification

#### 11.2 Mid-term (Within 6 months)

- [ ] Implement data export feature
- [ ] Implement profile photo deletion feature
- [ ] Implement inactive account warning system

#### 11.3 Long-term (Within 12 months)

- [ ] Implement inactive account auto-deletion
- [ ] Automate data retention audits
- [ ] Achieve full GDPR compliance

---

### 12. Contact

For questions about the Data Retention Policy, please contact:

**Email**: kamui00002@yahoo.co.jp
**Subject**: "About Data Retention Policy"

---

**Last Updated**: December 19, 2025
