# クラッシュ原因分析レポート（わかりやすい解説）

## 📋 概要

このドキュメントは、ParkPediaアプリ v1.0.23〜v1.0.24で発生したクラッシュ問題について、**技術的な詳細**と**今後のための教訓**をわかりやすくまとめたものです。

---

## 🔴 何が起きたか（症状）

### v1.0.23 (ビルド 29)

AdMob広告を再導入した際、以下のエラーが発生してアプリが起動できなくなりました：

```
ERROR: Cannot call a class as a function
Code: AdBanner.js:16
const [adModuleAvailable, setAdModuleAvailable] = useState(false);
```

### v1.0.24 (ビルド 30)

Firebase Crashlyticsを導入した際、新たなエラーが発生：

```
ERROR: Native module RNFBAppModule not found
ERROR: Failed to log error to Crashlytics
```

---

## 🔍 原因の詳細説明

### 1. React 19との互換性問題（主な原因）

#### 何が問題だったか？

- **React 19.1.0**を使用していた
- **react-native-google-mobile-ads v16.0.0**が**React 19に未対応**だった
- そのため、Reactの基本機能である`useState`が正しく動作しなかった

#### なぜ`useState`が動作しなかったのか？

React 19では内部構造が大きく変更されましたが、AdMob SDKが古いReactの仕組みを前提としていたため、以下の問題が発生：

1. Reactモジュールのインポートが正しく解決されない
2. `useState`がクラスとして認識されてしまう（本来は関数）
3. 「クラスを関数として呼び出せない」エラーが発生

#### 例えで説明すると…

新しいスマートフォン（React 19）に古いアプリ（AdMob SDK）をインストールしようとしたら、OSのバージョンが合わなくて動かなかった、というようなイメージです。

---

### 2. Firebase Crashlyticsのネイティブモジュール問題

#### 何が問題だったか？

- Firebase Crashlyticsは**ネイティブモジュール**（iOSやAndroidのネイティブコードを使う）
- Expo Goアプリでは**ネイティブモジュールが動作しない**
- **prebuild**（ネイティブコードのビルド）が必要だったが、実行していなかった

#### なぜExpo Goで動作しないのか？

Expo Goは汎用的な開発アプリで、すべてのネイティブモジュールを含めることは不可能です。そのため、Crashlyticsのような特定のネイティブ機能は使えません。

#### 例えで説明すると…

レンタカー（Expo Go）には標準的な装備しかなく、特殊な装置（Crashlytics）を後付けできない。自分の車（Development Build）なら好きにカスタマイズできる、というイメージです。

---

### 3. 依存関係の破損

#### 何が問題だったか？

- React 19へのアップデート後、`node_modules`フォルダ内の依存関係が不整合を起こした
- 以下のモジュールが見つからないエラーが発生：
  - `react-native`
  - `base64-js`
  - `@babel/runtime`

#### なぜ破損したのか？

Reactのバージョンを変更すると、それに依存する多数のライブラリも影響を受けます。`node_modules`内のキャッシュが古いまま残っていたため、新旧のバージョンが混在してしまいました。

#### 例えで説明すると…

パズルのピース（ライブラリ）を新しいものに交換したのに、古いピースが混ざったまま組み立てようとして、うまくはまらなかった、というイメージです。

---

## ✅ 解決方法

### 実施した修正（v1.0.25）

#### 1. React 18.3.1へのダウングレード

```json
// package.json
"react": "18.3.1",        // 19.1.0 → 18.3.1
"react-native": "0.76.5", // 0.81.5 → 0.76.5
```

**理由**: React 18は安定版で、AdMob SDKと完全に互換性があるため。

#### 2. 依存関係の完全なクリーンアップ

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**理由**: 古い依存関係をすべて削除して、クリーンな状態から再インストール。

#### 3. Crashlyticsの一時的な無効化

```javascript
// App.js と ErrorBoundary.js でコメントアウト
// import crashlytics from '@react-native-firebase/crashlytics';
```

**理由**: Expo Goでは動作しないため、Development Buildで実装する際に再度有効化。

#### 4. AdMobの再有効化

```javascript
// adConfig.js
export const AD_ENABLED = true; // false → true
```

**理由**: React 18.3.1では正常に動作することを確認済み。

---

## 📊 時系列での問題発生と解決

| バージョン | 状態 | 問題 | 原因 |
|-----------|------|------|------|
| v1.0.19 | ❌ クラッシュ | AdMob初期化エラー | Info.plistにGADIsAdManagerAppキーがない |
| v1.0.20〜v1.0.22 | ✅ 正常 | AdMob無効化で安定動作 | 広告は表示されないが起動は正常 |
| v1.0.23 | ❌ クラッシュ | useState エラー | React 19 + AdMob互換性問題 |
| v1.0.24 | ❌ クラッシュ | ネイティブモジュールエラー | Crashlytics + Expo Go非互換 |
| **v1.0.25** | **✅ 正常** | **すべて解決** | **React 18 + 依存関係クリーンアップ** |

---

## 🎓 今後のための教訓

### 1. **新しいバージョンは慎重に**

#### 問題
React 19は2024年12月にリリースされたばかりの最新版で、多くのライブラリがまだ対応していませんでした。

#### 教訓
- メジャーバージョンアップ（18→19など）は、すぐには適用しない
- 使用しているすべてのライブラリが対応しているか確認する
- 少なくとも3〜6ヶ月は様子を見てから導入する

#### 今後の対策
```bash
# ライブラリの互換性を事前にチェック
npm outdated
npm ls react  # Reactのバージョンを確認
```

---

### 2. **ネイティブモジュールの理解**

#### 問題
Firebase CrashlyticsはネイティブモジュールなのにExpo Goで実行しようとしました。

#### 教訓
- **Expo Go**: JavaScriptのみのコンポーネントのみ対応
- **Development Build**: ネイティブモジュールが必要な場合は必須
- ライブラリのドキュメントで「Native Module」と記載があれば、Expo Goでは動作しない

#### 今後の対策
```bash
# ネイティブモジュールを追加したら必ず prebuild
npx expo prebuild --clean
npx expo run:ios  # Development Buildで実行
```

---

### 3. **依存関係の管理**

#### 問題
`node_modules`の破損で複数のモジュールが見つからなくなりました。

#### 教訓
- バージョン変更時は必ず`node_modules`を削除して再インストール
- キャッシュのクリアも同時に行う
- `package-lock.json`も削除して最新の依存関係を取得

#### 今後の対策
```bash
# バージョン変更時のクリーンアップ手順
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npx expo start --clear
```

---

### 4. **段階的なテスト**

#### 問題
複数の変更（React 19アップデート + Crashlytics導入）を同時に行ったため、原因の特定が困難でした。

#### 教訓
- 大きな変更は1つずつ行う
- 変更後は必ず動作確認してからコミット
- 問題が発生したら、1つずつロールバックして原因を特定

#### 今後の対策
1. React 19にアップデート → 動作確認 → コミット
2. Crashlyticsを導入 → 動作確認 → コミット
3. AdMobを有効化 → 動作確認 → コミット

---

### 5. **互換性マトリックスの確認**

#### 問題
AdMob SDKがReact 19に対応しているか確認しませんでした。

#### 教訓
- ライブラリの公式ドキュメントで互換性を確認
- GitHubのIssuesで既知の問題を検索
- npmのバージョン履歴で最新の対応状況を確認

#### 今後の対策

新しいバージョンを導入する前に以下を確認：

1. **公式ドキュメント**
   - react-native-google-mobile-adsのREADME
   - 「Compatibility」または「Requirements」セクション

2. **GitHub Issues**
   - `react 19 compatibility` で検索
   - Closedイシューも確認（解決済みの問題）

3. **npmバージョン履歴**
   - 最新版のリリースノート
   - CHANGELOGでReact 19対応の記載があるか

4. **コミュニティフォーラム**
   - Stack Overflow
   - Reddit (r/reactnative)
   - Expo Forums

---

### 6. **エラーメッセージの正しい解釈**

#### 問題
「Cannot call a class as a function」というエラーメッセージだけでは、React 19の互換性問題とすぐには気づけませんでした。

#### 教訓
- エラーメッセージをGoogle検索する
- スタックトレース（エラーの発生経路）をすべて確認
- 最近の変更内容と照らし合わせる

#### 今後の対策

エラーが発生したら以下を実施：

1. **エラーメッセージをコピー**して検索
   - "Cannot call a class as a function react native"
   - "useState not a function react 19"

2. **スタックトレースを確認**
   - どのファイルのどの行で発生したか
   - どのコンポーネントから呼ばれたか

3. **最近の変更を振り返る**
   - 直前にReact 19にアップデートしていないか
   - 新しいライブラリを追加していないか

---

### 7. **Firebase Crashlyticsの正しい導入手順**

#### 問題
Expo GoでCrashlyticsを実行しようとしました。

#### 教訓
Crashlyticsは以下の手順で導入する必要があります：

1. パッケージをインストール
2. **prebuildを実行**（重要！）
3. **Development Buildで実行**
4. Firebase Consoleで確認

#### 今後の対策

```bash
# 正しいCrashlytics導入手順
npm install @react-native-firebase/app @react-native-firebase/crashlytics
npx expo prebuild --clean
npx expo run:ios  # Expo Goでは動作しない！
```

---

### 8. **バージョン管理のベストプラクティス**

#### 問題
バージョン番号の管理が複雑でした。

#### 教訓
- `package.json` と `app.json` のバージョンを必ず同期
- ビルド番号は自動インクリメント（手動だと忘れる）
- 変更内容はコミットメッセージに詳細に記載

#### 今後の対策

```json
// package.json
{
  "version": "1.0.25"
}

// app.json
{
  "expo": {
    "version": "1.0.25",
    "ios": {
      "buildNumber": "31"  // ビルドごとに +1
    }
  }
}
```

コミットメッセージのフォーマット：
```
fix: [問題の説明] (v[バージョン])

【主な変更】
- 変更内容1
- 変更内容2

【修正内容】
- 修正した問題1
- 修正した問題2
```

---

## 🔧 技術的な詳細（上級者向け）

### React 19の主な変更点

1. **Compiler (React Forget)**
   - 自動メモ化により再レンダリングを最適化
   - `useMemo`や`useCallback`が不要になる場合も

2. **Server Components**
   - サーバーサイドレンダリングの強化
   - React Nativeでは未対応

3. **Actions API**
   - フォーム送信の新しいAPI
   - `useTransition`と統合

4. **破壊的変更**
   - 一部のライフサイクルメソッドの削除
   - `useState`の内部実装変更（← 今回の問題に影響）

### なぜ`useState`が「クラス」として認識されたのか？

React 19では、Hooksの内部実装が変更されました。古いライブラリ（AdMob SDK）がReact 18以前の実装を前提としていたため、以下の問題が発生：

1. **モジュール解決の競合**
   - AdMob SDKが内部でReact 18を参照
   - アプリ本体はReact 19を使用
   - 2つのReactバージョンが混在（Reactの重複）

2. **Hooksの実装差異**
   - React 19の`useState`は新しい内部構造
   - React 18の`useState`を期待するAdMob SDK
   - 型の不一致により「クラスとして認識」されてしまった

### Metroバンドラーのモジュール解決

React Nativeでは、Metroバンドラーがモジュールの依存関係を解決します。以下の順序で探索：

1. `node_modules`直下
2. 親ディレクトリの`node_modules`
3. `../../../node_modules`（3階層上まで）

今回は、この探索過程でReact 19とReact 18が混在し、予期しないバージョンが読み込まれました。

---

## 📚 参考情報

### 公式ドキュメント

- [React 19リリースノート](https://react.dev/blog/2024/12/05/react-19)
- [react-native-google-mobile-ads](https://docs.page/invertase/react-native-google-mobile-ads)
- [Firebase Crashlytics for React Native](https://rnfirebase.io/crashlytics/usage)
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)

### トラブルシューティングリソース

- [React Native Upgrade Helper](https://react-native-community.github.io/upgrade-helper/)
- [Expo SDK Compatibility](https://docs.expo.dev/versions/latest/)
- [npm Compatibility Matrix](https://www.npmjs.com/)

### コミュニティ

- [React Native Community Discord](https://discord.gg/react-native)
- [Expo Discord](https://discord.gg/expo)
- [Stack Overflow - React Native](https://stackoverflow.com/questions/tagged/react-native)

---

## 📝 チェックリスト：今後の開発で確認すべきこと

### 新しいライブラリを追加する前

- [ ] 公式ドキュメントでReact/React Nativeのバージョン互換性を確認
- [ ] GitHubのIssuesで既知の問題を検索
- [ ] ネイティブモジュールかどうか確認（Expo Go対応の可否）
- [ ] 最終更新日を確認（メンテナンスされているか）
- [ ] ライセンスを確認

### バージョンアップ前

- [ ] CHANGELOGで破壊的変更（Breaking Changes）を確認
- [ ] すべての依存ライブラリが新しいバージョンに対応しているか確認
- [ ] テスト環境で動作確認
- [ ] `node_modules`を削除して再インストール
- [ ] Development Buildで動作確認

### コミット前

- [ ] ローカルでアプリが正常に起動するか確認
- [ ] 主要な機能が動作するか確認
- [ ] エラーログに異常がないか確認
- [ ] バージョン番号を更新（`package.json`と`app.json`）
- [ ] コミットメッセージに変更内容を詳細に記載

### TestFlight/App Store提出前

- [ ] TestFlightで内部テスト完了
- [ ] 複数のiOSデバイスで動作確認
- [ ] リリースノートを作成
- [ ] スクリーンショットを最新版に更新
- [ ] プライバシーポリシーを確認（新機能追加時）

---

## 🎯 まとめ

### 今回のクラッシュの本質的な原因

1. **React 19への性急なアップデート**
   - エコシステムが追いついていなかった
   - 互換性の確認不足

2. **複数の変更を同時に実施**
   - React 19 + Crashlytics導入を同時に行った
   - 問題の切り分けが困難に

3. **ネイティブモジュールの理解不足**
   - Expo Goの制約を理解していなかった
   - prebuildの必要性を認識していなかった

### 解決の鍵となったこと

1. **React 18.3.1へのダウングレード**
   - 安定版を選択することの重要性
   - 最新版が必ずしも最適ではない

2. **完全なクリーンアップ**
   - キャッシュの問題を根本から解決
   - 新鮮な状態で再構築

3. **段階的なアプローチ**
   - 1つずつ問題を解決
   - 原因を明確に特定

### 今後に活かすべきこと

✅ **安定性 > 最新性**
- 安定版を優先的に選択
- 新しいバージョンは慎重に評価

✅ **互換性の事前確認**
- ライブラリの対応状況を確認
- コミュニティの反応を見る

✅ **段階的な変更**
- 1つずつ変更して動作確認
- 問題発生時の切り戻しを容易に

✅ **ドキュメントの理解**
- 公式ドキュメントを熟読
- 制約事項を把握する

✅ **テストの徹底**
- Development Buildでの動作確認
- 複数環境でのテスト

---

## 🚀 今後の推奨アクション

### 短期（1週間以内）

1. ✅ **v1.0.25をTestFlightで十分にテスト**
   - 複数のiOSデバイスで確認
   - 主要な機能をすべて検証

2. ✅ **Firebase Storage Rulesをデプロイ**
   - 画像表示の正常化
   - 詳細は`STORAGE_RULES_DEPLOY_GUIDE.md`参照

3. ✅ **App Store審査に提出**
   - 返信文を`APP_STORE_CRASH_RESPONSE.md`から使用
   - v1.0.25を提出

### 中期（1ヶ月以内）

1. **Firebase Crashlyticsを正しく実装**
   - Development Buildで動作確認
   - クラッシュレポートの収集を開始

2. **依存関係の定期的な更新**
   - セキュリティアップデートを適用
   - 互換性を確認しながら更新

3. **自動テストの導入検討**
   - Jest/Detoxでのテスト
   - CI/CDパイプライン構築

### 長期（3ヶ月以内）

1. **React 19への再チャレンジ**
   - AdMob SDKがReact 19に対応したら検討
   - エコシステムの成熟を待つ

2. **パフォーマンス最適化**
   - React 19のCompiler活用
   - バンドルサイズの削減

3. **監視体制の強化**
   - Crashlyticsでの継続監視
   - ユーザーフィードバックの収集

---

**このドキュメントは、同じ問題を二度と起こさないための記録です。**
**技術的な挑戦は続けながらも、安定性を最優先に開発を進めましょう。**

---

**作成日**: 2025年（バージョン1.0.25リリース時）
**更新日**: -
**作成者**: ParkPedia Development Team with Claude Code
