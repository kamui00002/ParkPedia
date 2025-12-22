# ParkPedia 改善実装チェックリスト

**作成日**: 2025年12月19日
**目的**: CRITICAL・HIGH優先度の改善を効率的に実施

---

## 📋 実装の進め方

1. **Step 1**: エージェント自動実行タスク（このファイルの下部で実行開始）
2. **Step 2**: あなたが対応するタスク（外部サービス操作）
3. **Step 3**: 動作確認とデプロイ

---

## 🤖 エージェントが自動実行するタスク（あなたの作業不要）

### ✅ 自動実行済み・実行中

- [ ] **環境変数化の実装**
  - `.env.example` ファイルの作成
  - `firebaseConfig.js` を環境変数から読み込むように修正
  - `.gitignore` に `.env` を追加

- [ ] **Firestoreルールの改善**
  - `reports`, `favorites`, `blockedUsers` の list操作に厳格なクエリ制限を追加
  - クエリに userId フィルタを必須化

- [ ] **console.logの整理**
  - 全ての `console.log` を `__DEV__` で条件分岐
  - 本番環境でログが出力されないように修正

- [ ] **テスト環境のセットアップ**
  - Jest + React Native Testing Library のインストール
  - `jest.config.js` の作成
  - サンプルテスト（utils/, components/）の作成
  - テストスクリプトを `package.json` に追加

- [ ] **CI/CDパイプラインの構築**
  - `.github/workflows/ci.yml` の作成
  - ESLint + Prettier の設定
  - `.eslintrc.js` の作成
  - Pre-commit hooks (Husky + lint-staged) の設定

- [ ] **TypeScript型定義の追加（段階的）**
  - utils/ の型定義
  - components/ の型定義
  - 主要なインターフェース定義

---

## 👤 あなたが対応するタスク（外部サービス操作）

### 🚨 CRITICAL（すぐに対応）

#### 1. Firebase設定の環境変数化（ローカル）

```bash
# 1. エージェントが作成した .env.example をコピー
cp .env.example .env

# 2. .env ファイルを編集して実際の値を設定
# Firebase Console > プロジェクト設定 > 全般 から値をコピー
nano .env
```

**編集内容**:
```
FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
FIREBASE_AUTH_DOMAIN=parkpedia-app.firebaseapp.com
FIREBASE_PROJECT_ID=parkpedia-app
FIREBASE_STORAGE_BUCKET=parkpedia-app.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=118041891633
FIREBASE_APP_ID=1:118041891633:ios:25c857a6e7d53dd7d51610
```

#### 2. EAS Secrets の設定（本番ビルド用）

```bash
# Firebase設定をEAS Secretsに登録
eas secret:create --scope project --name FIREBASE_API_KEY --value "YOUR_FIREBASE_API_KEY_HERE"
eas secret:create --scope project --name FIREBASE_AUTH_DOMAIN --value "parkpedia-app.firebaseapp.com"
eas secret:create --scope project --name FIREBASE_PROJECT_ID --value "parkpedia-app"
eas secret:create --scope project --name FIREBASE_STORAGE_BUCKET --value "parkpedia-app.firebasestorage.app"
eas secret:create --scope project --name FIREBASE_MESSAGING_SENDER_ID --value "118041891633"
eas secret:create --scope project --name FIREBASE_APP_ID --value "1:118041891633:ios:25c857a6e7d53dd7d51610"

# 確認
eas secret:list
```

#### 3. Firebase APIキーの制限設定

**手順**:
1. Firebase Console を開く: https://console.firebase.google.com/
2. プロジェクト「parkpedia-app」を選択
3. **プロジェクト設定** > **全般** タブ
4. 「あなたのアプリ」セクションで iOS アプリを選択
5. **APIキーの制限** をクリック
6. Google Cloud Console に移動
7. **APIキーの制限** セクションで以下を設定:
   - **アプリケーションの制限**: iOS アプリ
   - **バンドルID**: `com.yoshidometoru.parkpedia`（app.jsonから確認）
8. **保存**

#### 4. Firestoreセキュリティルールのデプロイ

**手順**:
1. Firebase Console を開く
2. **Firestore Database** > **ルール** タブ
3. エージェントが修正した `firestore.rules` の内容をコピー
4. Firebase Console のルールエディタに貼り付け
5. **公開** をクリック

#### 5. Git履歴の確認（すでに削除済みの可能性が高い）

```bash
# 機密情報がGit履歴に残っていないか確認
git log --all --full-history --oneline -- serviceAccountKey.json
git log --all --full-history --oneline -- credentials.json

# 何も出力されなければOK（すでに削除済み）
# もし出力があれば、以下で履歴から完全削除
# git filter-repo --path serviceAccountKey.json --invert-paths
# git filter-repo --path credentials.json --invert-paths
# git push --force
```

---

### ⚠️ HIGH（1週間以内に対応）

#### 6. Firebase秘密鍵のローテーション（念のため）

**手順**:
1. Firebase Console > **プロジェクト設定** > **サービスアカウント** タブ
2. **新しい秘密鍵を生成** をクリック
3. JSON ファイルをダウンロード
4. 安全な場所に保管（GitHub Secretsなど）
5. **古い秘密鍵は削除しない**（現在使用していない可能性が高いため確認後に削除）

#### 7. iOS証明書の状態確認

**手順**:
1. Apple Developer Account にログイン: https://developer.apple.com/account/
2. **Certificates, Identifiers & Profiles** を開く
3. **Certificates** で Distribution Certificate の有効期限を確認
4. 期限切れまたは不審な証明書があれば再発行

---

## 🧪 動作確認手順

### ローカル環境での確認

```bash
# 1. 依存関係のインストール
npm install

# 2. テストの実行
npm test

# 3. Lintの実行
npm run lint

# 4. アプリの起動（開発サーバー）
npx expo start

# 5. 環境変数が正しく読み込まれているか確認
# アプリ起動時にコンソールで以下が表示されるはず：
# 🔥 Firebase初期化完了
# 🆔 プロジェクトID: parkpedia-app
```

### CI/CDの動作確認

```bash
# 1. 変更をコミット
git add .
git commit -m "feat: 環境変数化とテスト環境の構築"

# 2. GitHub にプッシュ
git push origin main

# 3. GitHub Actions が自動実行されることを確認
# https://github.com/kamui00002/ParkPedia/actions
```

---

## 📊 進捗チェック

### エージェント自動実行（完了予定時刻: 約30分）

- [ ] 環境変数化の実装
- [ ] Firestoreルールの改善
- [ ] console.logの整理
- [ ] テスト環境のセットアップ
- [ ] CI/CDパイプラインの構築
- [ ] TypeScript型定義の追加

### あなたの対応（所要時間: 約1-2時間）

- [ ] `.env` ファイルの作成と設定
- [ ] EAS Secrets の設定
- [ ] Firebase APIキーの制限設定
- [ ] Firestoreルールのデプロイ
- [ ] Git履歴の確認
- [ ] Firebase秘密鍵のローテーション（オプション）
- [ ] iOS証明書の状態確認（オプション）

---

## 🎯 次のステップ

1. **このチェックリストを保存**
2. **エージェントの自動実行が完了するのを待つ**（約30分）
3. **上記「あなたが対応するタスク」を実施**
4. **動作確認を実施**
5. **完了したらTestFlightでビルドテスト**

---

## 📞 トラブルシューティング

### エラーが発生した場合

**環境変数が読み込まれない**
```bash
# .env ファイルが正しい場所にあるか確認
ls -la .env

# .gitignore に .env が含まれているか確認
grep ".env" .gitignore
```

**テストが失敗する**
```bash
# キャッシュをクリアして再実行
npm test -- --clearCache
npm test
```

**Lintエラーが出る**
```bash
# 自動修正を試す
npm run lint -- --fix
```

---

**最終更新**: 2025年12月19日
**次回レビュー**: 実装完了後
