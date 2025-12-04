# 運用自動化プラン

**作成日**: 2025-12-04
**対象アプリ**: ParkPedia
**バージョン**: 1.0.7

---

## 目次

1. [日次タスク](#日次タスク)
2. [週次タスク](#週次タスク)
3. [月次タスク](#月次タスク)
4. [四半期タスク](#四半期タスク)
5. [n8n自動化ワークフロー](#n8n自動化ワークフロー)
6. [手動実施が必要なタスク](#手動実施が必要なタスク)
7. [実装ガイド](#実装ガイド)

---

## 日次タスク

### 🤖 自動化可能（n8n）

| タスク | 説明 | 自動化方法 | 優先度 |
|--------|------|-----------|--------|
| **Firebaseエラーログ監視** | Cloud Functions/Firestoreのエラーログを監視 | n8n + Firebase Admin SDK | 高 |
| **異常なアクセスパターン検知** | 短時間での大量リクエストを検知 | n8n + Firestore Analytics | 高 |
| **AdMob収益レポート取得** | 日次の広告収益を取得・記録 | n8n + AdMob API | 中 |
| **バックアップステータス確認** | Firebase自動バックアップの成功/失敗確認 | n8n + Firebase Admin API | 高 |

### 📝 手動実施推奨

| タスク | 説明 | 頻度 | 所要時間 |
|--------|------|------|---------|
| **レビュー通報の確認** | 新しい通報レビューの内容確認 | 営業日毎 | 5-10分 |
| **App Store Connect確認** | 新しいレビュー・問い合わせ確認 | 毎日 | 5分 |

---

## 週次タスク

### 🤖 自動化可能（n8n）

| タスク | 説明 | 自動化方法 | 優先度 |
|--------|------|-----------|--------|
| **依存パッケージ脆弱性スキャン** | `npm audit`の自動実行とレポート | n8n + GitHub Actions | 高 |
| **ユーザー統計レポート生成** | アクティブユーザー数、新規登録数など | n8n + Firestore Analytics | 中 |
| **ストレージ使用量確認** | Firebase Storageの使用量チェック | n8n + Firebase Admin API | 中 |
| **パフォーマンス指標収集** | アプリのクラッシュ率、レスポンス時間 | n8n + Firebase Performance | 中 |

### 📝 手動実施推奨

| タスク | 説明 | 頻度 | 所要時間 |
|--------|------|------|---------|
| **Firebase Consoleレビュー** | 異常なアクティビティの確認 | 毎週月曜 | 10-15分 |
| **コンテンツモデレーション** | 不適切な公園情報・レビューの確認 | 週1回 | 15-20分 |
| **GitHub Issues確認** | バグ報告・機能要望の確認 | 週1回 | 10分 |

---

## 月次タスク

### 🤖 自動化可能（n8n）

| タスク | 説明 | 自動化方法 | 優先度 |
|--------|------|-----------|--------|
| **包括的セキュリティスキャン** | npm audit + Snyk + OWASP依存関係チェック | n8n + GitHub Actions | 高 |
| **Firebase利用料金レポート** | 月次の利用料金と予測 | n8n + Firebase Billing API | 高 |
| **ユーザーエンゲージメントレポート** | MAU、DAU、リテンション率 | n8n + Firebase Analytics API | 中 |
| **データベース最適化提案** | 未使用インデックス、クエリ最適化 | n8n + カスタムスクリプト | 中 |
| **古いデータのアーカイブ** | 90日以上前の削除されたデータをアーカイブ | n8n + Firebase Functions | 低 |

### 📝 手動実施推奨

| タスク | 説明 | 頻度 | 所要時間 |
|--------|------|------|---------|
| **セキュリティパッチ適用** | 重要な依存関係の更新 | 月初 | 30-60分 |
| **Firebase Security Rulesレビュー** | ルールの見直しと改善 | 毎月 | 20-30分 |
| **AdMob設定確認** | 広告配信設定の最適化 | 毎月 | 15分 |
| **ユーザーサポート分析** | 問い合わせ傾向の分析 | 月末 | 30分 |

---

## 四半期タスク

### 🤖 一部自動化可能

| タスク | 説明 | 自動化方法 | 優先度 |
|--------|------|-----------|--------|
| **包括的パフォーマンス監査** | アプリ全体のパフォーマンス分析 | 半自動（Lighthouse CI） | 高 |
| **コスト最適化分析** | Firebase/AWS/AdMobのコスト最適化 | レポート自動生成 + 手動分析 | 高 |

### 📝 手動実施必須

| タスク | 説明 | 頻度 | 所要時間 |
|--------|------|------|---------|
| **セキュリティ監査** | 包括的なセキュリティレビュー | 四半期 | 2-4時間 |
| **機能ロードマップ見直し** | 次四半期の機能計画 | 四半期末 | 1-2時間 |
| **競合アプリ分析** | 類似アプリの調査と差別化戦略 | 四半期 | 1-2時間 |

---

## n8n自動化ワークフロー

### 前提条件

1. **n8nのインストール**
   ```bash
   # Dockerを使用（推奨）
   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -v ~/.n8n:/home/node/.n8n \
     n8nio/n8n
   ```

2. **必要な認証情報**
   - Firebase Admin SDK サービスアカウントキー
   - AdMob API認証情報
   - Slack Webhook URL（通知用）
   - GitHub Personal Access Token

---

## ワークフロー1: Firebase エラーログ監視（日次）

### 目的
Firebase Cloud FunctionsとFirestoreのエラーログを監視し、異常を検知したら即座に通知

### 実装

#### n8nワークフロー構成

```yaml
Workflow: Firebase Error Monitor
Trigger: Cron (毎日 9:00 JST)

Nodes:
  1. Schedule Trigger
     - Cron: "0 9 * * *" (毎日9時)

  2. Firebase Admin - Get Error Logs
     - Method: GET
     - Endpoint: /v1/projects/parkpedia-app/logs
     - Filter: severity >= ERROR
     - Time range: Last 24 hours

  3. Function - Parse Logs
     - JavaScript:
       ```javascript
       const errors = $input.all();
       const criticalErrors = errors.filter(e =>
         e.severity === 'ERROR' || e.severity === 'CRITICAL'
       );

       return {
         total: errors.length,
         critical: criticalErrors.length,
         errors: criticalErrors.slice(0, 10) // 上位10件
       };
       ```

  4. IF - Check Error Threshold
     - Condition: {{ $json.total > 10 }} OR {{ $json.critical > 0 }}

  5a. Slack Notification (IF True)
     - Webhook URL: {{ $credentials.slackWebhook }}
     - Message:
       ```
       🚨 Firebase エラー検知

       総エラー数: {{ $json.total }}
       重大エラー: {{ $json.critical }}

       詳細: Firebase Console
       ```

  5b. Email Notification (IF True)
     - To: your-email@example.com
     - Subject: "[ParkPedia] Firebase エラー検知"
     - Body: 詳細レポート

  6. Log to Notion/Airtable
     - 日次ログとして記録
```

#### 手動セットアップ手順

1. **Firebase Admin SDK設定**
   ```bash
   # サービスアカウントキーをダウンロード
   # Firebase Console > Project Settings > Service Accounts
   ```

2. **n8nでCredentials追加**
   - Settings > Credentials > Add Credential
   - Type: Google Service Account
   - JSON Key: [貼り付け]

3. **Slack Webhook設定**
   - Slack App作成: https://api.slack.com/apps
   - Incoming Webhooksを有効化
   - Webhook URLをn8nに登録

---

## ワークフロー2: 依存パッケージ脆弱性スキャン（週次）

### 目的
週次で依存パッケージの脆弱性をスキャンし、問題があれば通知

### 実装

#### n8nワークフロー構成

```yaml
Workflow: NPM Audit Automation
Trigger: Cron (毎週月曜 10:00 JST)

Nodes:
  1. Schedule Trigger
     - Cron: "0 10 * * 1" (毎週月曜10時)

  2. GitHub Action Trigger
     - Repository: kamui00002/ParkPedia
     - Workflow: npm-audit.yml
     - Ref: main
     - Method: workflow_dispatch

  3. Wait for Workflow Completion
     - Timeout: 5 minutes

  4. Get Workflow Results
     - GitHub API: GET /repos/kamui00002/ParkPedia/actions/runs

  5. Parse Audit Results
     - Extract: vulnerabilities count

  6. IF - Vulnerabilities Found
     - Condition: {{ $json.high > 0 || $json.critical > 0 }}

  7a. Create GitHub Issue (IF True)
     - Title: "🔴 Security: {{ $json.high + $json.critical }} High/Critical Vulnerabilities"
     - Body: Detailed report with fix commands
     - Labels: ["security", "dependencies"]

  7b. Slack Notification (IF True)
```

#### GitHub Actions ワークフロー (.github/workflows/npm-audit.yml)

```yaml
name: NPM Security Audit

on:
  workflow_dispatch:
  schedule:
    - cron: '0 10 * * 1'  # 毎週月曜 10:00 JST

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Run NPM Audit
        id: audit
        run: |
          npm audit --json > audit-results.json || true
          cat audit-results.json

      - name: Parse Results
        id: parse
        run: |
          CRITICAL=$(jq '.metadata.vulnerabilities.critical' audit-results.json)
          HIGH=$(jq '.metadata.vulnerabilities.high' audit-results.json)
          MODERATE=$(jq '.metadata.vulnerabilities.moderate' audit-results.json)

          echo "critical=$CRITICAL" >> $GITHUB_OUTPUT
          echo "high=$HIGH" >> $GITHUB_OUTPUT
          echo "moderate=$MODERATE" >> $GITHUB_OUTPUT

      - name: Create Issue if Vulnerabilities Found
        if: steps.parse.outputs.high > 0 || steps.parse.outputs.critical > 0
        uses: actions/github-script@v6
        with:
          script: |
            const title = `🔴 Security: ${context.payload.outputs.high + context.payload.outputs.critical} High/Critical Vulnerabilities`;
            const body = `## NPM Audit Results

            - Critical: ${context.payload.outputs.critical}
            - High: ${context.payload.outputs.high}
            - Moderate: ${context.payload.outputs.moderate}

            ### Action Required
            \`\`\`bash
            npm audit fix --force
            \`\`\`

            ### Details
            See workflow run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
            `;

            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: title,
              body: body,
              labels: ['security', 'dependencies']
            });

      - name: Upload Audit Results
        uses: actions/upload-artifact@v3
        with:
          name: audit-results
          path: audit-results.json
```

---

## ワークフロー3: AdMob収益レポート（日次）

### 目的
日次のAdMob収益を自動取得し、Googleスプレッドシートに記録

### 実装

#### n8nワークフロー構成

```yaml
Workflow: AdMob Daily Revenue Report
Trigger: Cron (毎日 10:00 JST)

Nodes:
  1. Schedule Trigger
     - Cron: "0 10 * * *"

  2. Google AdMob API - Get Report
     - Account: pub-5237930968754753
     - Metrics: ESTIMATED_EARNINGS, CLICKS, IMPRESSIONS
     - Date: Yesterday

  3. Function - Calculate Metrics
     - JavaScript:
       ```javascript
       const data = $json;
       const revenue = data.earnings;
       const ctr = (data.clicks / data.impressions) * 100;
       const ecpm = (data.earnings / data.impressions) * 1000;

       return {
         date: new Date().toISOString().split('T')[0],
         revenue: revenue.toFixed(2),
         impressions: data.impressions,
         clicks: data.clicks,
         ctr: ctr.toFixed(2),
         ecpm: ecpm.toFixed(2)
       };
       ```

  4. Google Sheets - Append Row
     - Spreadsheet: "ParkPedia Analytics"
     - Sheet: "AdMob Daily"
     - Values: [date, revenue, impressions, clicks, ctr, ecpm]

  5. IF - Low Revenue Alert
     - Condition: {{ $json.revenue < 100 }}

  6. Slack Notification (IF True)
     - Message: "⚠️ AdMob収益が低下しています"
```

#### 手動セットアップ

1. **AdMob API有効化**
   - Google Cloud Console
   - AdMob API を有効化
   - OAuth 2.0認証情報を作成

2. **Googleスプレッドシート作成**
   - 「ParkPedia Analytics」スプレッドシートを作成
   - 「AdMob Daily」シートに以下のヘッダー:
     | Date | Revenue | Impressions | Clicks | CTR | eCPM |

---

## ワークフロー4: Firebase利用料金監視（月次）

### 目的
月次のFirebase利用料金を取得し、予算超過を検知

### 実装

#### n8nワークフロー構成

```yaml
Workflow: Firebase Billing Monitor
Trigger: Cron (毎月1日 9:00 JST)

Nodes:
  1. Schedule Trigger
     - Cron: "0 9 1 * *" (毎月1日 9時)

  2. Google Cloud Billing API - Get Costs
     - Project: parkpedia-app
     - Period: Last month

  3. Function - Analyze Costs
     - Calculate total
     - Compare with budget (例: 10,000円)
     - Breakdown by service

  4. Google Sheets - Update Monthly Report

  5. IF - Budget Exceeded
     - Condition: {{ $json.total > 10000 }}

  6. Slack Alert (IF True)
     - Message: "🚨 Firebase予算超過！"
```

---

## ワークフロー5: ユーザー統計レポート（週次）

### 目的
週次のユーザー統計（新規登録、アクティブユーザーなど）を自動生成

### 実装

#### Firebase Functionsスクリプト

```javascript
// functions/weeklyUserStats.js
const admin = require('firebase-admin');
admin.initializeApp();

exports.weeklyUserStats = async () => {
  const db = admin.firestore();
  const now = new Date();
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  // 新規ユーザー数
  const newUsers = await db.collection('users')
    .where('createdAt', '>=', oneWeekAgo)
    .get();

  // 新規公園投稿数
  const newParks = await db.collection('parks')
    .where('createdAt', '>=', oneWeekAgo)
    .get();

  // 新規レビュー数
  const newReviews = await db.collection('reviews')
    .where('createdAt', '>=', oneWeekAgo)
    .get();

  // 総ユーザー数
  const totalUsers = await db.collection('users').count().get();

  return {
    period: {
      start: oneWeekAgo.toISOString(),
      end: now.toISOString()
    },
    newUsers: newUsers.size,
    newParks: newParks.size,
    newReviews: newReviews.size,
    totalUsers: totalUsers.data().count,
    growthRate: ((newUsers.size / totalUsers.data().count) * 100).toFixed(2)
  };
};
```

#### n8nワークフロー

```yaml
Workflow: Weekly User Stats
Trigger: Cron (毎週月曜 9:00)

Nodes:
  1. Schedule Trigger

  2. Firebase Function - Call weeklyUserStats

  3. Format Report

  4. Google Sheets - Update

  5. Slack Summary
```

---

## 手動実施が必要なタスク

### なぜ手動が必要か

以下のタスクは、人間の判断・分析が必要なため自動化に適していません：

#### 1. コンテンツモデレーション
- **理由**: 文脈理解と倫理的判断が必要
- **頻度**: 週1回
- **手順**:
  1. Firebase Console > Firestore > `reviews`コレクション
  2. `reports`コレクションで通報があったレビューを確認
  3. 不適切なコンテンツを削除またはフラグ付け

#### 2. セキュリティパッチ適用
- **理由**: 破壊的変更の可能性、テスト必須
- **頻度**: 月1回または緊急時
- **手順**:
  1. `npm audit`実行
  2. パッチノートを確認
  3. `npm update [package]`実行
  4. ローカルテスト
  5. TestFlightで動作確認
  6. 本番デプロイ

#### 3. ロードマップ策定
- **理由**: ビジネス戦略と密接に関連
- **頻度**: 四半期
- **手順**:
  1. ユーザーフィードバック分析
  2. 競合調査
  3. 技術的負債の評価
  4. 優先順位付け

---

## 実装ガイド

### ステップ1: n8nのセットアップ（推奨: Docker）

```bash
# 1. Dockerインストール（未インストールの場合）
# macOS
brew install --cask docker

# 2. n8nコンテナ起動
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e GENERIC_TIMEZONE="Asia/Tokyo" \
  -e TZ="Asia/Tokyo" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# 3. ブラウザでアクセス
# http://localhost:5678

# 4. 永続化して起動（推奨）
docker run -d --restart unless-stopped \
  --name n8n \
  -p 5678:5678 \
  -e GENERIC_TIMEZONE="Asia/Tokyo" \
  -e TZ="Asia/Tokyo" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### ステップ2: 認証情報の追加

#### Firebase Admin SDK

1. Firebase Console > Project Settings > Service Accounts
2. 「Generate New Private Key」をクリック
3. JSONファイルをダウンロード
4. n8n > Credentials > Add > Google Service Account
5. JSONの内容を貼り付け

#### Slack Webhook

1. https://api.slack.com/apps
2. 「Create New App」
3. 「Incoming Webhooks」を有効化
4. 「Add New Webhook to Workspace」
5. Webhook URLをコピー
6. n8n > Credentials > Add > Slack Webhook
7. URLを貼り付け

#### GitHub Personal Access Token

1. GitHub > Settings > Developer settings > Personal access tokens
2. 「Generate new token (classic)」
3. スコープ: `repo`, `workflow`
4. トークンをコピー
5. n8n > Credentials > Add > GitHub
6. トークンを貼り付け

### ステップ3: ワークフローのインポート

各ワークフローのJSON定義を別ファイルで提供します：

- `n8n-workflows/firebase-error-monitor.json`
- `n8n-workflows/npm-audit.json`
- `n8n-workflows/admob-revenue.json`
- `n8n-workflows/firebase-billing.json`
- `n8n-workflows/weekly-user-stats.json`

n8n UIで「Import from File」からインポート可能。

---

## コスト試算

### n8n運用コスト

| 項目 | 月額 | 年額 |
|------|------|------|
| n8n Cloud (Starter) | $20 | $240 |
| **または** Self-hosted (VPS) | $5-10 | $60-120 |
| Firebase Functions (追加実行) | $0-5 | $0-60 |
| **合計** | $5-25 | $60-300 |

### 時間削減効果

| タスク | 手動時間/月 | 自動化後 | 削減時間 |
|--------|------------|----------|---------|
| エラーログ確認 | 2時間 | 0.5時間 | 1.5時間 |
| 依存関係管理 | 1時間 | 0.2時間 | 0.8時間 |
| AdMobレポート | 1時間 | 0時間 | 1時間 |
| ユーザー統計 | 1.5時間 | 0.3時間 | 1.2時間 |
| **合計** | **5.5時間** | **1時間** | **4.5時間** |

**ROI**: 月4.5時間の節約 = 年間54時間

---

## 次のステップ

1. ✅ このドキュメントを確認
2. ⬜ n8nをセットアップ（Docker推奨）
3. ⬜ 認証情報を追加（Firebase, Slack, GitHub）
4. ⬜ ワークフロー1（エラーログ監視）をインポート・テスト
5. ⬜ GitHub Actionsワークフローを追加
6. ⬜ 1週間運用してフィードバック収集
7. ⬜ 残りのワークフローを順次追加

---

## サポート・質問

自動化実装でわからないことがあれば、以下を確認：

1. **n8n公式ドキュメント**: https://docs.n8n.io/
2. **Firebase Admin SDK**: https://firebase.google.com/docs/admin/setup
3. **このリポジトリのIssues**: 質問を投稿してください

---

**最終更新**: 2025-12-04
