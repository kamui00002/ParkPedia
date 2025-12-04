# 🤖 ParkPedia - 完全自動化実装ガイド

**作成日**: 2025年12月4日  
**目標**: 手動タスクの95%を自動化

---

## 📊 自動化の概要

### 現状

| カテゴリ | 手動タスク | 週間時間 | 月間時間 |
|----------|-----------|----------|----------|
| モニタリング | Firebase確認、AdMob確認 | 2時間 | 8時間 |
| レポート | 収益レポート作成 | 1時間 | 4時間 |
| メンテナンス | 依存関係更新、バックアップ確認 | 1時間 | 4時間 |
| コード品質 | Lint、Format、テスト | 2時間 | 8時間 |
| **合計** | | **6時間** | **24時間** |

### 自動化後

| カテゴリ | 自動化率 | 残り手動時間/月 |
|----------|----------|----------------|
| モニタリング | 100% | 0時間 |
| レポート | 95% | 0.2時間 |
| メンテナンス | 90% | 0.4時間 |
| コード品質 | 100% | 0時間 |
| **合計** | **95%** | **1.2時間** |

**削減**: 24時間 → 1.2時間 = **95%削減**

---

## 🚀 Phase 1: 基礎自動化（Week 1）

### ステップ1: ESLint & Prettier 設定（2時間）

#### 1.1 パッケージのインストール

```bash
cd /Users/yoshidometoru/Documents/GitHub/ParkPedia
npm install --save-dev eslint eslint-config-expo prettier
```

#### 1.2 設定ファイルの作成

**.eslintrc.js**:
```javascript
module.exports = {
  extends: ['expo', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

**.prettierrc.json**:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

#### 1.3 package.json にスクリプト追加

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "type-check": "tsc --noEmit"
  }
}
```

#### 1.4 実行テスト

```bash
npm run lint
npm run format:check
```

---

### ステップ2: GitHub Actions - PR時の自動チェック（1時間）

#### 2.1 ワークフローファイルの作成

`.github/workflows/pr-check.yml`:
```yaml
name: PR Quality Check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Check Prettier formatting
        run: npm run format:check
      
      - name: Type check
        run: npm run type-check
```

#### 2.2 コミット

```bash
git add .github/workflows/pr-check.yml
git commit -m "feat: add automated PR quality checks"
git push origin main
```

---

### ステップ3: Dependabot 設定（30分）

#### 3.1 設定ファイルの作成

`.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Tokyo"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "automated"
    groups:
      security-updates:
        patterns:
          - "*"
        update-types:
          - "security"
      react-native:
        patterns:
          - "react*"
          - "expo*"
          - "@react-navigation/*"
      firebase:
        patterns:
          - "firebase*"
```

#### 3.2 コミット

```bash
git add .github/dependabot.yml
git commit -m "feat: add Dependabot configuration"
git push origin main
```

---

## 🔍 Phase 2: モニタリング自動化（Week 2）

### ステップ4: Firebase使用量監視（3時間）

#### 4.1 監視スクリプトの作成

`scripts/check-firebase-usage.js`:
```javascript
#!/usr/bin/env node

const admin = require('firebase-admin');

// 環境変数からサービスアカウントキーを取得
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkUsage() {
  try {
    const collections = ['parks', 'reviews', 'favorites', 'reports', 'blockedUsers'];
    const counts = {};
    
    for (const collection of collections) {
      const snapshot = await db.collection(collection).count().get();
      counts[collection] = snapshot.data().count;
    }
    
    console.log('📊 Firestore Document Counts:');
    console.log(JSON.stringify(counts, null, 2));
    
    // 閾値チェック
    const THRESHOLD = 10000;
    let hasWarning = false;
    
    for (const [collection, count] of Object.entries(counts)) {
      if (count > THRESHOLD) {
        console.error(`⚠️ Warning: ${collection} has ${count} documents (threshold: ${THRESHOLD})`);
        hasWarning = true;
      }
    }
    
    if (hasWarning) {
      process.exit(1);
    }
    
    console.log('✅ All usage within normal limits');
  } catch (error) {
    console.error('❌ Error checking usage:', error);
    process.exit(1);
  }
}

checkUsage();
```

#### 4.2 GitHub Actions ワークフロー

`.github/workflows/firebase-monitoring.yml`:
```yaml
name: Firebase Usage Monitoring

on:
  schedule:
    - cron: '0 0 * * *'  # 毎日 JST 9:00 (UTC 0:00)
  workflow_dispatch:

jobs:
  monitor-usage:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Firebase Admin SDK
        run: npm install firebase-admin
      
      - name: Check Firestore Usage
        env:
          FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
        run: node scripts/check-firebase-usage.js
```

#### 4.3 Slack通知の追加（オプション）

Slack Webhook URLを取得後、GitHub Secretsに追加：

```yaml
      - name: Send Slack Notification
        if: failure()
        uses: slackapi/slack-github-action@v1.24.0
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "⚠️ Firebase usage threshold exceeded!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Firebase Usage Alert*\nUsage threshold has been exceeded."
                  }
                }
              ]
            }
```

---

### ステップ5: バックアップ確認の自動化（2時間）

`.github/workflows/backup-check.yml`:
```yaml
name: Firestore Backup Verification

on:
  schedule:
    - cron: '0 1 * * *'  # 毎日 JST 10:00 (UTC 1:00)
  workflow_dispatch:

jobs:
  verify-backup:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup gcloud CLI
        uses: google-github-actions/setup-gcloud@v2
        with:
          service_account_key: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}
          project_id: parkpedia-app
      
      - name: Check Latest Backup
        run: |
          YESTERDAY=$(date -u -d '1 day ago' +%Y-%m-%d)
          
          echo "🔍 Checking for backups from $YESTERDAY..."
          
          gsutil ls gs://parkpedia-app.appspot.com/firestore-backups/ | grep $YESTERDAY || exit 1
          
          BACKUP_SIZE=$(gsutil du -sh gs://parkpedia-app.appspot.com/firestore-backups/$YESTERDAY* | awk '{print $1}')
          echo "📦 Backup size: $BACKUP_SIZE"
          echo "✅ Backup verified for $YESTERDAY"
```

---

## 📊 Phase 3: レポート自動化（Week 3）

### ステップ6: AdMob週次レポート（4時間）

#### 6.1 レポート生成スクリプト

`scripts/generate-admob-report.js`:
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function generateAdMobReport() {
  // AdMob API を使用してデータ取得
  // 注: 実際にはAdMob APIの認証とクエリが必要
  
  const endDate = new Date();
  const startDate = new Date(endDate - 7 * 24 * 60 * 60 * 1000);
  
  const report = {
    period: 'weekly',
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    generated_at: new Date().toISOString(),
    metrics: {
      impressions: 0,  // API から取得
      clicks: 0,
      revenue: 0,
      ecpm: 0,
      fill_rate: 0,
    },
  };
  
  // レポートをファイルに保存
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const timestamp = endDate.toISOString().split('T')[0];
  const reportPath = path.join(reportsDir, `admob-weekly-${timestamp}.json`);
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Slack用サマリー
  const slackSummary = {
    text: `📊 AdMob Weekly Report - ${timestamp}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*AdMob Weekly Report (${report.startDate} - ${report.endDate})*\n- Impressions: ${report.metrics.impressions}\n- Revenue: $${report.metrics.revenue}\n- eCPM: $${report.metrics.ecpm}`,
        },
      },
    ],
  };
  
  const summaryPath = path.join(reportsDir, 'admob-weekly-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(slackSummary, null, 2));
  
  console.log('✅ AdMob report generated:', reportPath);
}

generateAdMobReport().catch(console.error);
```

#### 6.2 GitHub Actions ワークフロー

`.github/workflows/admob-weekly-report.yml`:
```yaml
name: AdMob Weekly Report

on:
  schedule:
    - cron: '0 0 * * 1'  # 毎週月曜 JST 9:00
  workflow_dispatch:

jobs:
  generate-report:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Generate AdMob Report
        env:
          ADMOB_API_KEY: ${{ secrets.ADMOB_API_KEY }}
        run: node scripts/generate-admob-report.js
      
      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: admob-report-${{ github.run_number }}
          path: reports/admob-weekly-*.json
          retention-days: 90
```

---

## 🔒 Phase 4: セキュリティ自動化（Week 4）

### ステップ7: CodeQL セキュリティスキャン（1時間）

`.github/workflows/codeql.yml`:
```yaml
name: CodeQL Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # 毎週日曜

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      matrix:
        language: ['javascript']

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: security-and-quality

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

---

## 📝 必要なGitHub Secrets

以下をGitHub リポジトリの Settings → Secrets and variables → Actions で設定：

```
FIREBASE_SERVICE_ACCOUNT      # Firebase Admin SDK用
FIREBASE_TOKEN               # Firebase CLI用
GCP_SERVICE_ACCOUNT_KEY      # Google Cloud用
EXPO_TOKEN                   # EAS Build用
SLACK_WEBHOOK_URL           # Slack通知用
ADMOB_API_KEY               # AdMobレポート用
```

### Secretsの設定手順

1. GitHub リポジトリを開く
2. Settings → Secrets and variables → Actions
3. 「New repository secret」をクリック
4. Name と Value を入力
5. 「Add secret」をクリック

---

## 📋 実装チェックリスト

### Week 1: 基礎

- [ ] ESLint/Prettier インストール
- [ ] 設定ファイル作成
- [ ] package.json スクリプト追加
- [ ] PR自動チェック設定
- [ ] Dependabot 設定
- [ ] 動作確認

### Week 2: モニタリング

- [ ] Firebase使用量監視スクリプト作成
- [ ] バックアップ確認ワークフロー作成
- [ ] GitHub Secrets 設定
- [ ] Slack Webhook 設定（オプション）
- [ ] 動作確認

### Week 3: レポート

- [ ] AdMob レポートスクリプト作成
- [ ] 週次レポートワークフロー作成
- [ ] 月次レポートワークフロー作成（オプション）
- [ ] 動作確認

### Week 4: セキュリティ

- [ ] CodeQL 設定
- [ ] Firestoreルールテスト設定
- [ ] セキュリティスキャン確認

---

## 🎯 期待される効果

### 時間削減

- **手動作業**: 24時間/月 → 1.2時間/月
- **削減率**: 95%

### 品質向上

- コードの一貫性が保たれる
- セキュリティ脆弱性の早期発見
- バグの早期発見

### コスト削減

- 人的ミスの削減
- インシデント対応時間の削減
- モニタリングコストの最小化

---

**すべての自動化が完了すると、開発に集中できる時間が大幅に増えます！**
