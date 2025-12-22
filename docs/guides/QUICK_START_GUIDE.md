# 🚀 ParkPedia 改善実装クイックスタートガイド

**更新日**: 2025年12月19日

---

## ✅ エージェントが完了した作業

以下の作業は**すでに完了**しています：

1. ✅ **環境変数化の実装**
   - `.env.example` ファイル作成
   - `app.config.js` 作成（環境変数から設定を読み込み）
   - `firebaseConfig.js` を環境変数対応に修正
   - `dotenv` パッケージインストール済み

2. ✅ **Firestoreセキュリティルールの改善**
   - `reports`, `favorites`, `blockedUsers` の列挙脆弱性を修正
   - クエリフィルタを強制する設定を追加

3. ✅ **console.logの整理**
   - 全199個のconsole文を `__DEV__` 条件分岐で囲みました
   - 本番環境での情報漏洩を防止

4. ✅ **テスト環境のセットアップ**（実行中）
   - Jest + React Native Testing Library
   - サンプルテストの作成

5. ✅ **CI/CDパイプラインの構築**（実行中）
   - GitHub Actions設定
   - ESLint + Prettier設定
   - Husky + lint-staged設定

6. ✅ **TypeScript型定義の追加**（実行中）
   - 型定義ファイルの作成
   - utils/の一部をTypeScript化

---

## 👤 あなたがすべき作業（所要時間: 約1時間）

### Step 1: ローカル環境の設定（10分）

#### 1-1. .env ファイルの作成

```bash
# .env.example をコピー
cp .env.example .env

# エディタで .env ファイルを開く
nano .env
```

**設定値**（そのまま使用）:
```bash
FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
FIREBASE_AUTH_DOMAIN=parkpedia-app.firebaseapp.com
FIREBASE_PROJECT_ID=parkpedia-app
FIREBASE_STORAGE_BUCKET=parkpedia-app.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=118041891633
FIREBASE_APP_ID=1:118041891633:ios:25c857a6e7d53dd7d51610
```

#### 1-2. 依存関係のインストール

```bash
# package.jsonが更新されているため再インストール
npm install
```

---

### Step 2: Firebase設定（20分）

#### 2-1. Firestore ルールのデプロイ

1. **Firebase Console を開く**: https://console.firebase.google.com/
2. プロジェクト「**parkpedia-app**」を選択
3. 左メニューから「**Firestore Database**」を選択
4. 上部タブから「**ルール**」をクリック
5. エージェントが修正した `firestore.rules` の内容をコピー
6. Firebase Console のルールエディタに貼り付け
7. **「公開」ボタン**をクリック

#### 2-2. Firebase APIキーの制限設定

1. Firebase Console > **プロジェクト設定** > **全般** タブ
2. 「あなたのアプリ」セクションで **iOS アプリ** を選択
3. **「APIキーの制限」**をクリック → Google Cloud Console に移動
4. **「アプリケーションの制限」**で以下を設定:
   - 制限タイプ: **iOS アプリ**
   - バンドルID: `com.parkpedia.app`
5. **「保存」**をクリック

---

### Step 3: EAS Secrets の設定（10分）

本番ビルド用に環境変数をEAS Secretsに登録します。

```bash
# コピー&ペーストで実行
eas secret:create --scope project --name FIREBASE_API_KEY --value "YOUR_FIREBASE_API_KEY_HERE"
eas secret:create --scope project --name FIREBASE_AUTH_DOMAIN --value "parkpedia-app.firebaseapp.com"
eas secret:create --scope project --name FIREBASE_PROJECT_ID --value "parkpedia-app"
eas secret:create --scope project --name FIREBASE_STORAGE_BUCKET --value "parkpedia-app.firebasestorage.app"
eas secret:create --scope project --name FIREBASE_MESSAGING_SENDER_ID --value "118041891633"
eas secret:create --scope project --name FIREBASE_APP_ID --value "1:118041891633:ios:25c857a6e7d53dd7d51610"

# 確認
eas secret:list
```

---

### Step 4: 動作確認（20分）

#### 4-1. テストの実行

```bash
# テストが通るか確認
npm test
```

#### 4-2. Lintの実行

```bash
# コードスタイルのチェック
npm run lint

# 自動修正
npm run lint:fix
```

#### 4-3. アプリの起動

```bash
# 開発サーバーの起動
npx expo start

# iOSシミュレータで起動（Macのみ）
# 'i' キーを押す
```

**確認ポイント**:
- アプリが正常に起動する
- コンソールに「🔥 Firebase初期化完了」が表示される
- エラーが表示されない

---

### Step 5: GitHubにプッシュ（5分）

```bash
# 変更をステージング
git add .

# コミット（自動でLint+テストが実行されます）
git commit -m "feat: セキュリティ強化とテスト環境構築

- Firebase設定を環境変数化
- Firestoreルールの列挙脆弱性を修正
- console.logを__DEV__条件分岐で囲む
- Jest+Testing Library導入
- GitHub Actions CI/CD構築
- TypeScript型定義追加
- ESLint+Prettier設定"

# GitHub にプッシュ
git push origin main
```

**確認**:
GitHub Actions が自動実行されることを確認
→ https://github.com/kamui00002/ParkPedia/actions

---

### Step 6: TestFlightでビルドテスト（オプション）

本番環境で環境変数が正しく読み込まれるか確認します。

```bash
# iOSビルド（約10-15分）
eas build --platform ios --profile production

# 完了後、TestFlightで配信
eas submit --platform ios
```

---

## 🔍 トラブルシューティング

### エラー: "Missing Firebase configuration"

**原因**: .env ファイルが作成されていない、または値が正しくない

**解決方法**:
```bash
# .env ファイルが存在するか確認
ls -la .env

# 内容を確認
cat .env

# 正しい値が入っているか確認
```

### テストが失敗する

**解決方法**:
```bash
# キャッシュをクリア
npm test -- --clearCache

# 再実行
npm test
```

### Lint エラーが多数出る

**解決方法**:
```bash
# 自動修正を試す
npm run lint:fix

# それでも残るエラーは手動で修正
npm run lint
```

### Pre-commit hook が動作しない

**解決方法**:
```bash
# Huskyを再インストール
npm run prepare
npx husky install
```

---

## 📊 完了チェックリスト

### ローカル環境
- [ ] `.env` ファイルを作成して設定値を入力
- [ ] `npm install` を実行
- [ ] `npm test` が通ることを確認
- [ ] `npm run lint` でエラーがないことを確認
- [ ] `npx expo start` でアプリが起動することを確認

### Firebase設定
- [ ] Firestoreルールをデプロイ
- [ ] APIキー制限を設定

### EAS設定
- [ ] EAS Secrets を設定
- [ ] `eas secret:list` で確認

### GitHub
- [ ] 変更をコミット＆プッシュ
- [ ] GitHub Actions が正常に実行されることを確認

### TestFlight（オプション）
- [ ] EASビルドが成功
- [ ] TestFlightで配信
- [ ] テスターが正常に動作することを確認

---

## 🎉 完了後

全ての作業が完了したら、以下を確認してください：

1. ✅ **セキュリティ**
   - Firebase APIキーが環境変数で管理されている
   - Firestoreルールで列挙攻撃が防げている
   - console.logが本番環境で出力されない

2. ✅ **品質保証**
   - テストが実行可能
   - CI/CDが動作している
   - Lintでコード品質を維持

3. ✅ **開発体験**
   - TypeScript型定義で補完が効く
   - Pre-commitフックで自動チェック
   - Prettierで一貫したフォーマット

---

## 📞 次のステップ

### 短期（1週間以内）
- [ ] 全てのテストを実行して品質確認
- [ ] TestFlightでベータテスト
- [ ] Firebase秘密鍵のローテーション（念のため）

### 中期（1ヶ月以内）
- [ ] テストカバレッジを80%以上に向上
- [ ] 画像圧縮機能の実装
- [ ] パフォーマンス最適化

### 長期（2-3ヶ月）
- [ ] 完全なTypeScript移行
- [ ] アクセシビリティ対応
- [ ] 多言語対応（i18n）

---

**サポート**: 問題が発生した場合は、`IMPLEMENTATION_CHECKLIST.md` の詳細手順を参照してください。

**最終更新**: 2025年12月19日
