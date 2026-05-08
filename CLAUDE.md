# ParkPedia 開発ガイド ⭐️

Claude Code が ParkPedia を触るときの**最短導線**。詳細は `docs/` 配下参照。

## プロジェクト概要

| 項目 | 値 |
|---|---|
| アプリ | 公園情報を共有する React Native アプリ (Expo) |
| Bundle ID | `com.parkpedia.app` |
| Firebase Project | `parkpedia-app` |
| 主要 SDK | Firebase (Auth / Firestore / Storage), AdMob ☁️ |
| 起動/構成/リンク集 | @README.md |

## 技術スタック (実態)

| カテゴリ | バージョン / 値 |
|---|---|
| Expo SDK / React / RN | ~54.0.29 / 19.1.0 / 0.81.5 |
| TypeScript | strict: **false**, allowJs: true (JS 主体で TS 段階移行) |
| Test | Jest 30 + Detox (E2E) |
| Lint / Format | ESLint + Prettier + **Husky** (pre-commit) |
| Security Scan | **gitleaks** (`npm run security:scan` / `security:protect`) |
| Firebase | JS SDK + `@react-native-firebase/*` (App Check / Crashlytics native bridge) |

## ドキュメント導線

| ドキュメント | 用途 | マーク |
|---|---|---|
| @docs/DEVELOPMENT_KNOWLEDGE_BASE.md | 運用・審査・トラブルシュート集約 | ⭐️ |
| @docs/CRITICAL_SECURITY_ADDITIONS.md | セキュリティ必須事項 | ⭐️ |
| @docs/DATA_RETENTION_POLICY.md | データ保持ポリシー | ☁️ |
| @docs/PRIVACY_DATA_INVENTORY.md | プライバシー一覧 | ☁️ |
| @docs/GITLEAKS_SETUP.md | Secret スキャン | ☀️ |
| @docs/guides/, @docs/reports/, @docs/ARCHIVE.md | 手順書 / レポート / 過去メモ |

## ファイル構造 (概要)

`screens/` (画面 1 ファイル) / `components/__tests__/` (コロケーション) / `utils/` / `constants/` / `firebaseConfig.js` / `adConfig.js` (`AD_ENABLED` フラグ) / `app.config.js` / `tsconfig.json` (path alias `@components/*` `@screens/*` `@utils/*` `@types/*` 定義済) / `docs/`

## コーディング規約 (要点、詳細は @docs/DEVELOPMENT_KNOWLEDGE_BASE.md)

- **Function Component + Hooks のみ** (class 禁止)
- ナビゲーション間の再 fetch は **`useFocusEffect`** (`useEffect` だと初回のみ)
- Auth / Firestore / Storage は **JS SDK で完結**、App Check / Crashlytics のみ native bridge (AppDelegate 経由初期化)
- TS 戦略: 段階移行中、新規は `.ts/.tsx`、既存 `.js` は無理に変換しない (Karpathy 流 surgical changes)
- Error: `utils/errorHandler.js` 統一 entry-point

## Firebase ルール運用

`firestore.rules` / `storage.rules` を Firebase Console の各機能のルール画面に貼り付け公開 ☁️

落とし穴 (Firestore `list` で `resource.data` 不可、JS SDK は Bundle ID 制限不可、`@react-native-firebase/*` は dev build 必須等) の詳細: @docs/DEVELOPMENT_KNOWLEDGE_BASE.md

## ファイルマーキング規則

⭐️ プロジェクト固有 / ☀️ 自動化 / ☁️ 外部連携 (Firebase / AdMob / App Store)

---

## 📊 Analytics 実装状況 (2026-05-08)

| 項目 | 状態 |
|---|---|
| `@react-native-firebase/analytics ^23.7.0` | ✅ package.json 追加済 (5/7 夜) |
| `analytics().logAppOpen()` | ✅ App.js 実装済 (Crashlytics と同 pattern、Expo Go skip 付き) |
| AdMob ↔ Firebase リンク | ⏳ 5/8 P1-1 で実施予定 |
| カスタムイベント (view_item, search 等) | ⏳ 設計済、5/9-5/12 実装予定 |

詳細実装ロードマップ: [[2026-05-07 ParkPedia Analytics ログイベント設計]]

## 💰 広告戦略 (2026-05-08)

- 現状: AdMob バナー広告のみ (`AdBanner` + `AD_ENABLED` フラグ)
- SKAN: **50 networks 登録済** (`app.config.js` line 39-91、Google/Meta/Unity/AppLovin 等)
- 次: そらもよう Reward 結果 (1 ヶ月) 待ってネイティブ広告 (PDF C 項) を試すか判断
- 見送り中: メディエーション (AppLovin MAX) は表示数増えてから

---

## 関連 (Obsidian)

### セキュリティ・運用
- [[2026-05-05 セッションで増えた重要事項 — 初学者向け解説]] (Firebase JS vs native key 制限、defuddle 等)
- [[2026-05-06 インシデント — firebase functions secrets access で OpenAI 鍵が Discord transcript 露出]]
- [[2026-04-01 [Security] サプライチェーン攻撃から身を守る最低限の設定]] (`.npmrc` 適用済)

### 5/8 追加 (Analytics + 広告)
- [[2026-05-07 ParkPedia Analytics ログイベント設計]]
- [[2026-05-07 広告 SDK 整備チートシート (ATT + AdMob + Facebook SDK)]]
- [[2026-05-07 SKAdNetwork ID リファレンス (50 networks)]]
- [[2026-05-07 AdMob × Firebase 連携後に見るべき指標 5 つ]]
- [[2026-05-07 [Tips] AdMob 収益化分析 — 3 アプリ評価と行動計画]]
