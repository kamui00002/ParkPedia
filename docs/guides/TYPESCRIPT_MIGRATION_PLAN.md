# TypeScript Strict Mode Migration Plan

ParkPediaプロジェクトのTypeScript strict mode段階的移行計画

## 現状

現在の`tsconfig.json`は全てのstrict設定が無効化されています:
```json
"strict": false,
"noImplicitAny": false,
"strictNullChecks": false,
// ... その他のstrict設定もfalse
```

これにより型安全性が低く、ランタイムエラーのリスクが高まっています。

## 移行の目標

段階的にstrict modeを有効化し、完全な型安全性を確保する。

## フェーズ別計画

### Phase 1: noImplicitAny の有効化（優先度: 高）

**目的**: 暗黙的な`any`型を排除し、全ての変数・関数に明示的な型を付ける

**設定変更**:
```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": true,  // ← 有効化
    "strictNullChecks": false,
    "strictFunctionTypes": false,
    "strictBindCallApply": false,
    "strictPropertyInitialization": false,
    "noImplicitThis": false,
    "alwaysStrict": false
  }
}
```

**主な影響**:
- パラメータや変数に型注釈が必要になる
- ESLintの`@typescript-eslint/no-explicit-any`と相まって、型安全性が向上

**修正が必要な箇所の例**:
```typescript
// 修正前
function handleSubmit(data) {
  // data is implicitly 'any'
}

// 修正後
interface FormData {
  name: string;
  email: string;
}

function handleSubmit(data: FormData) {
  // 明示的な型定義
}
```

**推定作業量**: 2-3日
**優先ファイル**:
- `screens/*.js` → `*.tsx`へ移行
- `components/*.js` → `*.tsx`へ移行
- `utils/*.js` → `*.ts`へ移行
- `types/*.ts`の整備

**完了条件**:
- [ ] 全ての`.js`ファイルを`.tsx`または`.ts`に変換
- [ ] `tsc --noEmit`でエラーがゼロ
- [ ] ESLintでno-explicit-anyエラーがゼロ

---

### Phase 2: strictNullChecks の有効化（優先度: 中）

**目的**: `null`と`undefined`の扱いを厳密にし、nullポインタ例外を防ぐ

**設定変更**:
```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": true,
    "strictNullChecks": true,  // ← 有効化
    "strictFunctionTypes": false,
    "strictBindCallApply": false,
    "strictPropertyInitialization": false,
    "noImplicitThis": false,
    "alwaysStrict": false
  }
}
```

**主な影響**:
- `undefined`の可能性がある変数へのアクセス前にnullチェックが必須
- Optional chaining (`?.`) や Nullish coalescing (`??`) の活用が推奨される

**修正が必要な箇所の例**:
```typescript
// 修正前
function getUserName(user) {
  return user.name; // userがnullableだとエラー
}

// 修正後
interface User {
  name: string;
}

function getUserName(user: User | null): string | null {
  return user?.name ?? null;
}
```

**推定作業量**: 3-4日
**優先ファイル**:
- Firebaseデータ取得処理（nullの可能性が高い）
- ナビゲーション関連（route paramsがundefinedの可能性）
- AsyncStorageアクセス

**完了条件**:
- [ ] `tsc --noEmit`でstrictNullChecks関連エラーがゼロ
- [ ] Optional chainingとNullish coalescingを適切に使用
- [ ] Null/undefined処理のテストケース追加

---

### Phase 3: 完全strict化（優先度: 中〜低）

**目的**: TypeScriptの全てのstrict設定を有効化し、最高レベルの型安全性を実現

**設定変更**:
```json
{
  "compilerOptions": {
    "strict": true,  // ← 全てのstrict設定を一括で有効化
    // 以下は自動的にtrueになる
    // "noImplicitAny": true,
    // "strictNullChecks": true,
    // "strictFunctionTypes": true,
    // "strictBindCallApply": true,
    // "strictPropertyInitialization": true,
    // "noImplicitThis": true,
    // "alwaysStrict": true
  }
}
```

**主な影響**:
- 関数の引数・戻り値の厳密な型チェック
- クラスプロパティの初期化が必須
- `this`の型推論が厳密に

**修正が必要な箇所の例**:
```typescript
// strictFunctionTypes
interface Handler {
  handle(value: string | number): void;
}

// 修正前（緩い）
const handler: Handler = {
  handle(value: string) {} // エラー: 引数の型が広すぎる
};

// 修正後
const handler: Handler = {
  handle(value: string | number) {
    if (typeof value === 'string') {
      // string処理
    } else {
      // number処理
    }
  }
};

// strictPropertyInitialization
class Component {
  // 修正前
  private data; // エラー: 初期化されていない

  // 修正後
  private data: string = '';
  // または
  private data!: string; // definite assignment assertion（慎重に使用）
}
```

**推定作業量**: 2-3日
**優先ファイル**:
- クラスコンポーネント（strictPropertyInitialization）
- コールバック関数（strictFunctionTypes）
- イベントハンドラ（strictBindCallApply）

**完了条件**:
- [ ] `tsc --noEmit`で全てのstrict関連エラーがゼロ
- [ ] クラスプロパティが全て初期化済み
- [ ] 全ての関数で`this`の型が明確

---

## 移行スケジュール

| Phase | 期間 | 開始予定 | 完了予定 |
|-------|------|----------|----------|
| Phase 1: noImplicitAny | 2-3日 | TBD | TBD |
| Phase 2: strictNullChecks | 3-4日 | Phase 1完了後 | TBD |
| Phase 3: 完全strict化 | 2-3日 | Phase 2完了後 | TBD |

**合計推定期間**: 7-10日（実装時間のみ）

---

## 各フェーズの進め方

### 1. 設定変更
`tsconfig.json`を更新し、該当するstrict設定を有効化

### 2. エラー検出
```bash
npm run typecheck
```
でエラー一覧を取得

### 3. ファイル単位で修正
優先度の高いファイルから順次修正:
1. ユーティリティ関数（依存が少ない）
2. 型定義ファイル
3. コンポーネント
4. 画面（スクリーン）

### 4. テスト実行
```bash
npm run test
npm run lint
```
で既存機能が壊れていないか確認

### 5. コミット
小さな単位で頻繁にコミット:
```bash
git commit -m "refactor: enable noImplicitAny for utils folder"
```

---

## リスクと対策

### リスク1: 既存のJavaScriptファイルが多い
**対策**: `.js` → `.tsx`/`.ts`への変換ツールを活用（手動レビュー必須）

### リスク2: サードパーティライブラリの型定義不足
**対策**:
- `@types/`パッケージのインストール
- 独自の型定義ファイル（`.d.ts`）作成

### リスク3: 既存コードの大規模修正による新規バグ
**対策**:
- 各フェーズ後に入念なテスト
- 段階的なロールアウト（develop → staging → production）

---

## 完了判定基準

全フェーズ完了時:
- [ ] `tsconfig.json`の`"strict": true`
- [ ] `npm run typecheck`でエラーゼロ
- [ ] `npm run lint`でTypeScript関連エラーゼロ
- [ ] `npm run test`で全テストパス
- [ ] CIパイプラインでtype checkが自動実行される
- [ ] コードレビューで型安全性が確認される

---

## 参考リンク

- [TypeScript Handbook - Strict Mode](https://www.typescriptlang.org/docs/handbook/2/basic-types.html#strictness)
- [TypeScript Deep Dive - Strict Mode](https://basarat.gitbook.io/typescript/intro-1/strictness)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**最終更新**: 2025-12-19
**ステータス**: Phase 0（計画段階）
