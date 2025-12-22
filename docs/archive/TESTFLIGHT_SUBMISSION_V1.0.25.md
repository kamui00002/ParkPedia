# TestFlight 提出手順 (v1.0.25)

## バージョン情報

- **アプリバージョン**: 1.0.25
- **iOS ビルド番号**: 31
- **主な変更内容**:
  - React 18.3.1へのダウングレード（安定性向上）
  - AdMob広告の再有効化
  - Firebase Storage画像表示の改善
  - Firebase Crashlytics統合

---

## TestFlightへの提出手順

### ステップ 1: EAS Build でビルドを実行

ターミナルで以下のコマンドを実行してください：

```bash
eas build --platform ios --profile production
```

### ステップ 2: 対話的なプロンプトに回答

以下のプロンプトが表示されます。適切に回答してください：

1. **Do you want to log in to your Apple account?**
   - 回答: `Y` (Yes)
   - Apple Developer アカウントのメールアドレスを入力

2. **Apple ID Password:**
   - Apple Developer アカウントのパスワードを入力

3. **Two-factor authentication:**
   - 2ファクタ認証コードを入力（iPhoneやMacに表示されます）

4. **Select a team:**
   - 使用するApple Developer Teamを選択

5. **Would you like to automatically create and manage your credentials?**
   - 回答: `Y` (Yes) - 推奨
   - または `N` で手動管理

### ステップ 3: ビルド開始の確認

ビルドが正常に開始されると、以下のようなメッセージが表示されます：

```
✔ Build started, it may take a few minutes to complete.
You can monitor the build at: https://expo.dev/accounts/[your-account]/projects/parkpedia/builds/[build-id]
```

### ステップ 4: ビルドの監視

表示されたURLをブラウザで開いて、ビルドの進行状況を確認できます。

**ビルド時間**: 通常15〜30分程度かかります。

### ステップ 5: ビルド完了の確認

ビルドが完了すると、メールで通知が届きます。

**成功した場合:**
```
✔ Build finished successfully
✔ Uploaded to App Store Connect
```

**失敗した場合:**
- ビルドログを確認して、エラーの原因を特定
- 必要に応じて修正して再度ビルド

### ステップ 6: App Store Connect で確認

1. [App Store Connect](https://appstoreconnect.apple.com/) にアクセス
2. 「マイApp」→「ParkPedia」を選択
3. 「TestFlight」タブをクリック
4. ビルド番号「31」が表示されることを確認

### ステップ 7: TestFlight でテスト配信

1. App Store Connect の TestFlight タブで、ビルド番号「31」を選択
2. 「テスターグループ」を選択または作成
3. 「テスターを追加」でテスターのメールアドレスを追加
4. テスターに招待メールが送信されます

---

## トラブルシューティング

### エラー: "Apple account credentials are required"

**原因**: Apple Developerアカウントの認証情報が必要です。

**解決方法**:
```bash
# Apple アカウントでログイン
eas build --platform ios --profile production
# プロンプトに従ってApple IDとパスワードを入力
```

### エラー: "No valid certificate or provisioning profile found"

**原因**: 証明書またはプロビジョニングプロファイルが無効です。

**解決方法**:
```bash
# 認証情報をリセットして再生成
eas credentials
```

### エラー: "Build failed with exit code 65"

**原因**: Xcodeビルドエラーです。

**解決方法**:
1. ビルドログを詳細に確認
2. `GoogleService-Info.plist` が正しく配置されているか確認
3. `app.json` の設定が正しいか確認

### ビルドが長時間かかる場合

**正常です**: iOSビルドは通常15〜30分かかります。

**確認方法**:
- ビルドページで進行状況を確認
- "Building iOS app" ステータスが表示されていればOK

---

## 次のステップ（TestFlight提出後）

### 1. 内部テスト

1. TestFlightアプリをインストール
2. テストフライト招待を受け入れ
3. アプリをダウンロードして動作確認

**確認項目**:
- [ ] アプリが正常に起動する
- [ ] AdMobバナー広告が表示される
- [ ] Firebase Storage画像が表示される
- [ ] 公園の追加・編集・削除が正常に動作する
- [ ] レビューの投稿が正常に動作する
- [ ] 位置情報検索が正常に動作する

### 2. 外部テスト（オプション）

1. App Store Connect で「外部テスト」タブを選択
2. 新しいグループを作成
3. テスターを追加
4. Appleのレビューを申請（初回のみ）

### 3. App Store審査提出（準備完了時）

TestFlightでの十分なテストが完了したら：

1. App Store Connect で「App Store」タブを選択
2. 新しいバージョン「1.0.25」を作成
3. ビルド番号「31」を選択
4. スクリーンショット、説明文、プライバシーポリシーなどを更新
5. 審査に提出

---

## リリースノート（TestFlight用）

以下をTestFlightのリリースノートとして使用できます：

```
バージョン 1.0.25 (ビルド 31)

【修正内容】
- アプリの安定性を向上（React 18.3.1へのアップデート）
- AdMob広告を再有効化
- Firebase画像表示の改善
- クラッシュレポート機能の追加（Firebase Crashlytics）

【テスト重点項目】
- アプリの起動とホーム画面の表示
- 広告の表示
- 画像のアップロードと表示
- 公園情報の追加・編集・削除
- レビュー機能
```

---

## 重要な注意事項

### Firebase Storage Rules のデプロイ

画像表示を正常に動作させるには、Firebase Storage Rulesをデプロイする必要があります。

**手順**: `STORAGE_RULES_DEPLOY_GUIDE.md` を参照してください。

### AdMob 広告の確認

- **開発ビルド**: テスト広告IDが使用されます
- **TestFlight/本番**: 実際の広告IDが使用されます

### Firebase Crashlytics

- **ネイティブビルド**: Crashlyticsが正常に動作します
- **Expo Go**: Crashlyticsは動作しません

---

## 連絡先

問題が発生した場合は、ビルドログとエラーメッセージを確認してください。

**ビルドログの確認方法**:
```bash
eas build:view --build-id [build-id]
```

**または**:
- Expo Dashboard: https://expo.dev/accounts/[your-account]/projects/parkpedia/builds

---

## まとめ

1. ✅ バージョン1.0.25、ビルド番号31を確認
2. ▶️ `eas build --platform ios --profile production` を実行
3. ⏳ ビルド完了を待つ（15〜30分）
4. ✅ App Store Connect でビルドを確認
5. 📱 TestFlight でテスト配信
6. ✅ 内部テストで動作確認
7. 🚀 App Store審査に提出（準備完了時）

Good luck! 🍀
